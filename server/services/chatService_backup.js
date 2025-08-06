require("dotenv").config();
const db = require("../db/pool.js");
const dbUtils = require("../utils/dbUtils.js");
const s3Service = require("./s3Service.js");
const { uploadToS3 } = require("./s3Service.js");
require("dotenv").config({ path: "./.env" });
const cloudfrontService = require("./cloudfrontService");

function formatMessage(senderIdOrName, senderTypeOrText, textOrTimestamp, timestamp) {
  // Handle different calling patterns:
  // 1. formatMessage(senderId, senderType, text, timestamp) - 4 params
  // 2. formatMessage(senderName, text, timestamp) - 3 params
  
  if (arguments.length === 4) {
    // 4-parameter version: formatMessage(senderId, senderType, text, timestamp)
    return {
      sender: {
        id: senderIdOrName,
        type: senderTypeOrText,
        name: senderIdOrName, // For now, use ID as name
        avatar: null,
      },
      text: textOrTimestamp,
      timestamp: timestamp,
    };
  } else {
    // 3-parameter version: formatMessage(senderName, text, timestamp)
    return {
      sender: {
        id: senderIdOrName,
        type: 'user',
        name: senderIdOrName,
        avatar: null,
      },
      text: senderTypeOrText,
      timestamp: textOrTimestamp,
    };
  }
}

async function verifyChatMembership(req, res, next) {
  const userId = await dbUtils.getUserDbId(req.user);
  const query = `SELECT EXISTS (SELECT 1 FROM chat_participant WHERE chat_id = $1 AND participant_id = $2 AND left_at IS NULL)`;
  const result = await db.query(query, [req.params.chatId, userId]);
  result.rows[0].exists
    ? next()
    : res
        .status(404)
        .json({ error: "Chat not found or user not a participant" });
}

// Helper function for checking membership without middleware
async function checkChatMembership(userObj, chatId) {
  const userId = await dbUtils.getUserDbId(userObj);
  const query = `SELECT EXISTS (SELECT 1 FROM chat_participant WHERE chat_id = $1 AND participant_id = $2 AND left_at IS NULL)`;
  const result = await db.query(query, [chatId, userId]);
  return result.rows[0].exists;
}

// Helper function to convert Cognito ID to database ID
async function cognitoIdToDbId(cognitoId) {
  // Try to find provider first
  let dbResult = await db.query('SELECT id FROM providers WHERE cognito_sub = $1', [cognitoId]);
  
  if (dbResult.rows.length === 0) {
    // If not a provider, try patient
    dbResult = await db.query('SELECT id FROM patients WHERE cognito_sub = $1', [cognitoId]);
  }
  
  return dbResult.rows.length > 0 ? dbResult.rows[0].id : null;
}

// async function saveMessageToDb(socket, data) {
//   const query = `INSERT INTO messages (
//     chat_id,
//     sender_id,
//     sender_type,
//     text_type,
//     text,
//     sent_at
//   ) VALUES ($1, $2, $3, $4, $5, $6)`;

//   await db.query(query, data);
// }

async function getMessagesByChatId(chat_id) {
  const query = `
    SELECT *
    FROM messages
    WHERE chat_id = $1 AND deleted_at IS NULL
    ORDER BY sent_at ASC;
  `;
  const { rows } = await db.query(query, [chat_id]);
  console.log('getMessagesByChatId: Retrieved messages:', rows.map(r => ({ id: r.id, text_type: r.text_type, text: r.text.substring(0, 50) + '...' })));
  
  rows.forEach((text, i) => {
    if (text.text_type !== "string") {
      text.text = cloudfrontService.getPrivateKeySignedUrl({
        objectName: text.text,
      });
    }
  });
  return rows;
}

async function createOrGetChat(participantIds) {
  const numParticipants = participantIds.length;

  const matchingChat = await db.query(
    `
    SELECT chat_id, array_agg(participant_id ORDER BY participant_id ASC) AS participant_ids
    FROM chat_participant
    GROUP BY chat_id
    HAVING COUNT(*) = $1 AND array_agg(participant_id) @> $2::uuid[] AND array_agg(participant_id) <@ $2::uuid[];
  `,
    [numParticipants, participantIds]
  );

  if (matchingChat.rows.length > 0) {
    const chatId = matchingChat.rows[0].chat_id;
    db.query(
      `
    UPDATE chat_participant
    SET left_at = NULL, is_muted = FALSE
    WHERE chat_id = $1 AND participant_id = ANY ($2::uuid[]);
    `,
      [chatId, participantIds]
    );

    return chatId;
  }

  const chatInsert = await db.query(
    `INSERT INTO chats DEFAULT VALUES
    RETURNING id`
  );

  const chatId = chatInsert.rows[0].id;

  const values = participantIds.map((_, i) => `($1, $${i + 2})`).join(", ");

  await db.query(
    `
    INSERT INTO chat_participant (chat_id, participant_id)
    VALUES ${values}
  `,
    [chatId, ...participantIds]
  );

  return chatId;
}

// async function removeChatMemberShip(chatId, participants) {
//   await db.query(
//     `DELETE FROM chat_participant WHERE chat_id = $1 AND participant_id = ANY ($2::uuid[])`,
//     [chatId, participants]
//   );
// }

async function getChatIdByParticipants(participant1Id, participant2Id) {
  const result = await db.query(
    `SELECT cp1.chat_id
     FROM chat_participant cp1
     INNER JOIN chat_participant cp2 ON cp1.chat_id = cp2.chat_id
     WHERE cp1.participant_id = $1 
     AND cp2.participant_id = $2
     AND cp1.left_at IS NULL 
     AND cp2.left_at IS NULL
     LIMIT 1`,
    [participant1Id, participant2Id]
  );
  
  return result.rows.length > 0 ? result.rows[0].chat_id : null;
}

async function getChatIds(userDbId) {
  console.log("getChatIds: userDbId:", userDbId);
  
  // Get all chats where the user is a participant and hasn't left, with participant info
  const result = await db.query(
    `SELECT DISTINCT
       cp.chat_id,
       cp.left_at,
       (SELECT text FROM messages WHERE chat_id = cp.chat_id ORDER BY sent_at DESC LIMIT 1) as last_message_text,
       (SELECT sent_at FROM messages WHERE chat_id = cp.chat_id ORDER BY sent_at DESC LIMIT 1) as last_message_time,
       array_agg(DISTINCT other_cp.participant_id) FILTER (WHERE other_cp.participant_id != cp.participant_id) as other_participants
     FROM chat_participant cp 
     LEFT JOIN chat_participant other_cp ON cp.chat_id = other_cp.chat_id AND other_cp.left_at IS NULL
     WHERE cp.participant_id = $1 
     AND cp.left_at IS NULL
     GROUP BY cp.chat_id, cp.left_at
     ORDER BY last_message_time DESC NULLS LAST`,
    [userDbId]
  );
  
  // Convert participant database IDs back to Cognito IDs for frontend
  const chatsWithCognitoIds = await Promise.all(
    result.rows.map(async (row) => {
      const cognitoIds = [];
      
      if (row.other_participants) {
        for (const participantDbId of row.other_participants) {
          // Try to find in providers first
          let cognitoResult = await db.query('SELECT cognito_sub FROM providers WHERE id = $1', [participantDbId]);
          
          if (cognitoResult.rows.length === 0) {
            // If not a provider, try patients
            cognitoResult = await db.query('SELECT cognito_sub FROM patients WHERE id = $1', [participantDbId]);
          }
          
          if (cognitoResult.rows.length > 0) {
            cognitoIds.push(cognitoResult.rows[0].cognito_sub);
          }
        }
      }
      
      return {
        chat_id: row.chat_id,
        otherParticipants: cognitoIds,
        lastMessage: row.last_message_text ? {
          text: row.last_message_text,
          timestamp: row.last_message_time
        } : null
      };
    })
  );
  
  return chatsWithCognitoIds;
}

// async function updateChatMessageFiles(fileUrl) {
//   await db.query("UPDATE messages SET text = $1", [fileUrl]);
// }

async function uploadFileToS3(req, res, key) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await uploadToS3({
      fileBuffer: file.buffer,
      key: key,
      mimeType: file.mimetype,
      bucketName: process.env.S3_CHAT_BUCKET_NAME,
    });
  } catch (err) {
    console.error("File upload failed:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
}

async function saveMessageToDb(req, { chatId, textType, sentAt, text }) {
  const query = `INSERT INTO messages (
    chat_id,
    sender_id,
    sender_type,
    text_type,
    text,
    sent_at
  ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

  const result = await db.query(query, [
    chatId,
    await dbUtils.getUserDbId(req.user),
    req.user["cognito:groups"][0],
    textType,
    text,
    sentAt,
  ]);

  return result.rows[0];
}

async function deleteMessageById({ messageId }) {
  const result = await db.query(`SELECT * FROM messages WHERE id = $1`, [
    messageId,
  ]);
  if (result.rows[0].text_type !== "string") {
    await s3Service.deleteFromS3({
      key: result.rows[0].text,
      bucketName: process.env.S3_CHAT_BUCKET_NAME,
    });
    await cloudfrontService.createInvalidation(result.rows[0].text);
  }
  await db.query("DELETE FROM messages WHERE id = $1", [messageId]);
}

async function deleteChat({ chatId }) {
  await db.query("DELETE FROM chats WHERE id = $1", [chatId]);
}

async function verifyMessageOwnership(req, res, next) {
  console.log('verifyMessageOwnership: req.params:', req.params);
  console.log('verifyMessageOwnership: messageId:', req.params.messageId);
  
  const userId = await dbUtils.getUserDbId(req.user);
  console.log('verifyMessageOwnership: userId:', userId);
  
  if (!req.params.messageId) {
    return res.status(400).json({ error: "Message ID is required" });
  }
  
  const query = `SELECT EXISTS (SELECT 1 FROM messages WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL)`;
  const result = await db.query(query, [req.params.messageId, userId]);
  result.rows[0].exists
    ? next()
    : res.status(404).json({ error: "Message not found or user not sender" });
}

async function leaveChat({ leftAt, chatId, participants }) {
  await db.query(
    `UPDATE chat_participant SET left_at = $1 WHERE chat_id = $2 AND participant_id = ANY ($2::uuid[])`,
    [leftAt, chatId, participants]
  );
}

async function updateParticipantById({ chatId, userId, updates }) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE chat_participant
    SET ${setClause}
    WHERE chat_id = $${keys.length + 1} AND participant_id = $${keys.length + 2}
  `;

  await db.query(query, [...values, chatId, userId]);
}

async function updateMessageById({ messageId, updates }) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE messages
    SET ${setClause}
    WHERE id = $${keys.length + 1}
  `;

  await db.query(query, [...values, messageId]);
}

module.exports = {
  uploadFileToS3,
  formatMessage,
  saveMessageToDb,
  verifyChatMembership,
  checkChatMembership,
  cognitoIdToDbId,
  getMessagesByChatId,
  createOrGetChat,
  deleteChat,
  getChatIds,
  getChatIdByParticipants,
  deleteMessageById,
  verifyMessageOwnership,
  leaveChat,
  updateParticipantById,
  updateMessageById,
};

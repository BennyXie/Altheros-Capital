require("dotenv").config();
const db = require("../db/pool.js");
const dbUtils = require("../utils/dbUtils.js");
const s3Service = require("./s3Service.js");
const { uploadToS3 } = require("./s3Service.js");
require("dotenv").config({ path: "./.env" });
const cloudfrontService = require("./cloudfrontService");

function formatMessage(sender, text, timestamp) {
  return {
    sender: {
      id: senderId,
      type: senderType,
      name: name,
      avatar: avatar,
    },
    text,
    timestamp,
  };
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
    SELECT sender_id, sender_type, text, sent_at
    FROM messages
    WHERE chat_id = $1 AND deleted_at IS NULL
    ORDER BY sent_at ASC;
  `;
  const { rows } = await db.query(query, [chat_id]);
  rows.forEach((text, i) => {
    if (text.text_type !== "string") {
      text.text = cloudfrontService.getPrivateKeySignedUrl({
        objectName: text.text,
      });
    }
  });
  return rows;
}

async function createOrGetChat(participantIds, order = "ASC") {
  const numParticipants = participantIds.length;

  order = order === "ASC" || order === "DESC" ? order : "ASC";

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
<<<<<<< HEAD
    return matchingChat.rows[0].chat_id;
  } else {
    const chatInsert = await db.query(
      `INSERT INTO chats DEFAULT VALUES
=======
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
>>>>>>> d72b35a (added soft delete)
    RETURNING id`
    );

    const chatId = chatInsert.rows[0].id;

  const values = participantIds.map((_, i) => `($1, $${i + 2})`).join(", ");

    await db.query(
      `
    INSERT INTO chat_participant (chat_id, participant_id)
    VALUES ${valuePlaceholders.join(", ")}
  `,
    [chatId, ...participantIds]
  );

    console.log("createOrGetChat: Returning chatId:", chatId);
    return chatId;
  }
}

<<<<<<< HEAD
async function removeChatMemberShip(chatId) {
  // Delete all messages for the given chatId
  await db.query(`DELETE FROM messages WHERE chat_id = $1`, [chatId]);

  // Delete all participants for the given chatId
  await db.query(`DELETE FROM chat_participant WHERE chat_id = $1`, [chatId]);

  // Delete the chat entry itself
  await db.query(`DELETE FROM chats WHERE id = $1`, [chatId]);
}

async function getChatParticipants(chatId) {
  const query = `SELECT participant_id FROM chat_participant WHERE chat_id = $1`;
  const result = await db.query(query, [chatId]);
  return result.rows.map((row) => row.participant_id);
}

async function getChatDetails(chatId, userObject) {
  try {
    // Get participant IDs
    const participantIds = await getChatParticipants(chatId);
    console.log("getChatDetails: participantIds:", participantIds);

    // Get details for each participant
    const participantDetails = [];

    for (const participantId of participantIds) {
      console.log("getChatDetails: Processing participantId:", participantId);
      // Check if participant is a patient
      const patientQuery = `SELECT first_name, last_name, cognito_sub FROM patients WHERE cognito_sub = $1`;
      const patientResult = await db.query(patientQuery, [participantId]);
      console.log("getChatDetails: Patient query result:", patientResult.rows);

      if (patientResult.rows.length > 0) {
        const patient = patientResult.rows[0];
        participantDetails.push({
          id: participantId,
          cognito_sub: patient.cognito_sub,
          name: `${patient.first_name} ${patient.last_name}`.trim(),
          type: "patient",
          avatar: null,
        });
        console.log("getChatDetails: Added patient participant");
      } else {
        // Check if participant is a provider
        const providerQuery = `SELECT first_name, last_name, cognito_sub, headshot_url FROM providers WHERE cognito_sub = $1`;
        const providerResult = await db.query(providerQuery, [participantId]);
        console.log(
          "getChatDetails: Provider query result:",
          providerResult.rows
        );

        if (providerResult.rows.length > 0) {
          const provider = providerResult.rows[0];
          let headshot_url = provider.headshot_url;
          console.log(
            "getChatDetails: Original provider headshot_url:",
            headshot_url
          );

          // Generate presigned URL for S3 headshots
          if (
            headshot_url &&
            (headshot_url.includes("s3.amazonaws.com") ||
              (process.env.S3_BUCKET_NAME &&
                headshot_url.includes(process.env.S3_BUCKET_NAME)))
          ) {
            console.log(
              "getChatDetails: Detected S3 URL, generating presigned URL"
            );
            try {
              let key = headshot_url;
              if (key.startsWith("http")) {
                const urlParts = new URL(key);
                key = urlParts.pathname.substring(1); // Remove leading slash
              }
              console.log("getChatDetails: S3 key:", key);

              const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
              });
              headshot_url = await getSignedUrl(s3, command, {
                expiresIn: 600,
              }); // 10 minutes
              console.log(
                "getChatDetails: Generated presigned URL:",
                headshot_url
              );
            } catch (error) {
              console.error(
                `Error generating presigned URL for provider headshot:`,
                error
              );
              headshot_url = null; // Use null if error generating URL
            }
          } else {
            console.log("getChatDetails: Not an S3 URL, using original URL");
          }

          participantDetails.push({
            id: participantId,
            cognito_sub: provider.cognito_sub,
            name: `${provider.first_name} ${provider.last_name}`.trim(),
            type: "provider",
            avatar: headshot_url,
          });
          console.log("getChatDetails: Added provider participant:", {
            name: `${provider.first_name} ${provider.last_name}`.trim(),
            avatar: headshot_url,
          });
        }
      }
    }

    // Find the other participant (not the current user)
    const currentUserDbId = await dbUtils.getUserDbId(userObject);
    const otherParticipant = participantDetails.find(
      (p) => p.cognito_sub !== currentUserDbId
    );

    console.log(
      "getChatDetails: Final result - otherParticipant:",
      otherParticipant
    );

    return {
      chatId,
      participants: participantDetails,
      otherParticipant,
    };
  } catch (error) {
    console.error("Error getting chat details:", error);
    throw error;
  }
}
=======
// async function removeChatMemberShip(chatId, participants) {
//   await db.query(
//     `DELETE FROM chat_participant WHERE chat_id = $1 AND participant_id = ANY ($2::uuid[])`,
//     [chatId, participants]
//   );
// }
>>>>>>> d72b35a (added soft delete)

async function getChatIds(userDbId) {
  console.log("getChatIds: userDbId:", userDbId);
  const chatIdsResult = await db.query(
    `SELECT chat_id FROM chat_participant WHERE participant_id = $1`,
    [userDbId]
  );
  return result.rows;
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
  const userId = await dbUtils.getUserDbId(req.user);
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
  getMessagesByChatId,
  createOrGetChat,
  deleteChat,
  getChatIds,
  deleteMessageById,
  verifyMessageOwnership,
  leaveChat,
  updateParticipantById,
  updateMessageById,
};

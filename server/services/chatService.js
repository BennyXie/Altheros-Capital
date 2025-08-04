require("dotenv").config();
const db = require("../db/pool.js");
const dbUtils = require("../utils/dbUtils.js");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function getSenderDetails(senderId, senderType) {
  let query;
  let result;
  let name = "Unknown";
  let avatar = null;

  if (senderType === 'patients') {
    query = `SELECT first_name, last_name FROM patients WHERE cognito_sub = $1`;
    result = await db.query(query, [senderId]);
    if (result.rows.length > 0) {
      const { first_name, last_name } = result.rows[0];
      name = `${first_name} ${last_name}`.trim();
      // Patients might not have avatars, so leave as null or default
    }
  } else if (senderType === 'providers') {
    query = `SELECT first_name, last_name, headshot_url FROM providers WHERE cognito_sub = $1`;
    result = await db.query(query, [senderId]);
    if (result.rows.length > 0) {
      const { first_name, last_name, headshot_url } = result.rows[0];
      name = `${first_name} ${last_name}`.trim();
      avatar = headshot_url; // Providers have headshots
    }
  }
  return { name, avatar };
}

async function formatMessage(senderId, senderType, text, timestamp) {
  const { name, avatar } = await getSenderDetails(senderId, senderType);
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

async function verifyChatMembership(decoded, chatId) {
  const userId = await dbUtils.getUserDbId(decoded);
  const query = `SELECT EXISTS (SELECT 1 FROM chat_participant WHERE chat_id = $1 AND participant_id = $2)`;
  const result = await db.query(query, [chatId, userId]);
  return result.rows[0].exists;
}

async function saveMessageToDb(data) {
  const query = `INSERT INTO messages (
    chat_id,
    sender_id,
    sender_type,
    text_type,
    text,
    sent_at
  ) VALUES ($1, $2, $3, $4, $5, $6)`;

  await db.query(query, [
    data.chat_id,
    data.sender_id,
    data.sender_type,
    data.text_type,
    data.text,
    data.sent_at,
  ]);
}

async function getMessagesByChatId(chat_id) {
  const query = `
    SELECT sender_id, sender_type, text, sent_at
    FROM messages
    WHERE chat_id = $1
    ORDER BY sent_at ASC;
  `;

  const { rows } = await db.query(query, [chat_id]);

  // Format messages to include sender details
  const formattedMessages = await Promise.all(rows.map(async (msg) => {
    const { name, avatar } = await getSenderDetails(msg.sender_id, msg.sender_type);
    return {
      sender: {
        id: msg.sender_id,
        type: msg.sender_type,
        name: name,
        avatar: avatar,
      },
      text: msg.text,
      timestamp: msg.sent_at,
    };
  }));

  return formattedMessages;
}

async function createOrGetChat(participantIds) {
  const sortedParticipants = participantIds.sort();
  const numParticipants = sortedParticipants.length;

  console.log("createOrGetChat: Looking for chat with participants:", sortedParticipants);

  const matchingChat = await db.query(
    `
    SELECT chat_id, array_agg(participant_id ORDER BY participant_id ASC) AS participant_ids
    FROM chat_participant
    GROUP BY chat_id
    HAVING COUNT(*) = $1 AND array_agg(participant_id ORDER BY participant_id ASC) = $2::uuid[];
  `,
    [numParticipants, sortedParticipants]
  );

  console.log("createOrGetChat: matchingChat.rows.length:", matchingChat.rows.length);

  if (matchingChat.rows.length > 0) {
    return matchingChat.rows[0].chat_id;
  } else {

  const chatInsert = await db.query(
    `INSERT INTO chats DEFAULT VALUES
    RETURNING id`
  );

  const chatId = chatInsert.rows[0].id;

  const participantInsertValues = [];
  const valuePlaceholders = [];
  let paramIndex = 1; // Start from $1 for all parameters

  for (const participantId of sortedParticipants) {
    valuePlaceholders.push(`($${paramIndex}::uuid, $${paramIndex + 1}::uuid)`);
    participantInsertValues.push(chatId); // chat_id for this row
    participantInsertValues.push(participantId); // participant_id for this row
    paramIndex += 2;
  }

  console.log("createOrGetChat: sortedParticipants:", sortedParticipants);
  console.log("createOrGetChat: participantInsertValues before query:", participantInsertValues);
  console.log("createOrGetChat: valuePlaceholders before query:", valuePlaceholders.join(', '));

  await db.query(
    `
    INSERT INTO chat_participant (chat_id, participant_id)
    VALUES ${valuePlaceholders.join(', ')}
  `,
    participantInsertValues // Pass all values in a single array
  );

  console.log("createOrGetChat: Returning chatId:", chatId);
  return chatId;
}
}

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
  return result.rows.map(row => row.participant_id);
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
          type: 'patient',
          avatar: null
        });
        console.log("getChatDetails: Added patient participant");
      } else {
        // Check if participant is a provider
        const providerQuery = `SELECT first_name, last_name, cognito_sub, headshot_url FROM providers WHERE cognito_sub = $1`;
        const providerResult = await db.query(providerQuery, [participantId]);
        console.log("getChatDetails: Provider query result:", providerResult.rows);
        
        if (providerResult.rows.length > 0) {
          const provider = providerResult.rows[0];
          let headshot_url = provider.headshot_url;
          console.log("getChatDetails: Original provider headshot_url:", headshot_url);
          
          // Generate presigned URL for S3 headshots
          if (headshot_url && (headshot_url.includes('s3.amazonaws.com') || (process.env.S3_BUCKET_NAME && headshot_url.includes(process.env.S3_BUCKET_NAME)))) {
            console.log("getChatDetails: Detected S3 URL, generating presigned URL");
            try {
              let key = headshot_url;
              if (key.startsWith('http')) {
                const urlParts = new URL(key);
                key = urlParts.pathname.substring(1); // Remove leading slash
              }
              console.log("getChatDetails: S3 key:", key);

              const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
              });
              headshot_url = await getSignedUrl(s3, command, { expiresIn: 600 }); // 10 minutes
              console.log("getChatDetails: Generated presigned URL:", headshot_url);
            } catch (error) {
              console.error(`Error generating presigned URL for provider headshot:`, error);
              headshot_url = null; // Use null if error generating URL
            }
          } else {
            console.log("getChatDetails: Not an S3 URL, using original URL");
          }
          
          participantDetails.push({
            id: participantId,
            cognito_sub: provider.cognito_sub,
            name: `${provider.first_name} ${provider.last_name}`.trim(),
            type: 'provider',
            avatar: headshot_url
          });
          console.log("getChatDetails: Added provider participant:", {
            name: `${provider.first_name} ${provider.last_name}`.trim(),
            avatar: headshot_url
          });
        }
      }
    }
    
    // Find the other participant (not the current user)
    const currentUserDbId = await dbUtils.getUserDbId(userObject);
    const otherParticipant = participantDetails.find(p => p.cognito_sub !== currentUserDbId);
    
    console.log("getChatDetails: Final result - otherParticipant:", otherParticipant);
    
    return {
      chatId,
      participants: participantDetails,
      otherParticipant
    };
  } catch (error) {
    console.error('Error getting chat details:', error);
    throw error;
  }
}

async function getChatIds(userDbId) {
  console.log("getChatIds: userDbId:", userDbId);
  const chatIdsResult = await db.query(
    `SELECT chat_id FROM chat_participant WHERE participant_id = $1`,
    [userDbId]
  );
  console.log("getChatIds: chatIdsResult.rows:", chatIdsResult.rows);

  const chatRooms = await Promise.all(chatIdsResult.rows.map(async (chatRow) => {
    const chatId = chatRow.chat_id;

    // Get all participants for this chat
    const participantsResult = await db.query(
      `SELECT participant_id FROM chat_participant WHERE chat_id = $1`,
      [chatId]
    );
    const participantIds = participantsResult.rows.map(row => row.participant_id);

    // Find the other user
    const otherUserId = participantIds.find(id => id !== userDbId);
    console.log("getChatIds: otherUserId:", otherUserId);

    let otherUser = { name: "Unknown", avatar: null };
    if (otherUserId) {
      // Determine if the other user is a patient or provider
      let otherUserRole = null;
      const patientCheck = await db.query(`SELECT 1 FROM patients WHERE cognito_sub = $1`, [otherUserId]);
      if (patientCheck.rows.length > 0) {
        otherUserRole = 'patients';
      } else {
        const providerCheck = await db.query(`SELECT 1 FROM providers WHERE cognito_sub = $1`, [otherUserId]);
        if (providerCheck.rows.length > 0) {
          otherUserRole = 'providers';
        }
      }

      console.log("getChatIds: otherUserRole:", otherUserRole);
      if (otherUserRole) {
        otherUser = await getSenderDetails(otherUserId, otherUserRole);
      }
    }
    console.log("getChatIds: otherUser:", otherUser);

    // Get the last message for the chat
    const lastMessageResult = await db.query(
      `SELECT text, sent_at FROM messages WHERE chat_id = $1 ORDER BY sent_at DESC LIMIT 1`,
      [chatId]
    );
    const lastMessage = lastMessageResult.rows.length > 0 ? lastMessageResult.rows[0] : null;
    console.log("getChatIds: lastMessage:", lastMessage);

    return {
      id: chatId,
      otherUser: {
        id: otherUserId,
        name: otherUser.name,
        avatar: otherUser.avatar,
      },
      lastMessage: lastMessage ? {
        text: lastMessage.text,
        timestamp: lastMessage.sent_at,
      } : null,
    };
  }));

  console.log("getChatIds: Final chatRooms:", chatRooms);
  return chatRooms;
}

async function getChatIdByParticipants(participant1Id, participant2Id) {
  const participantIds = [participant1Id, participant2Id];
  const chatId = await createOrGetChat(participantIds);
  return chatId;
}

module.exports = {
  formatMessage,
  saveMessageToDb,
  verifyChatMembership,
  getMessagesByChatId,
  createOrGetChat,
  removeChatMemberShip,
  getChatIds,
  getChatIdByParticipants,
  getSenderDetails, // Export the new function
  getChatParticipants, // Export the getChatParticipants function
  getChatDetails, // Export the new getChatDetails function
};

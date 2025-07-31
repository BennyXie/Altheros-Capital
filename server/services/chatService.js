const db = require("../db/pool.js");
const dbUtils = require("../utils/dbUtils.js");
const parseUtils = require("../utils/parseUtils");

async function getSenderDetails(senderId, senderType) {
  let query;
  let result;
  let name = "Unknown";
  let avatar = null;

  if (senderType === 'patients') {
    query = `SELECT first_name, last_name FROM patients WHERE id = $1`;
    result = await db.query(query, [senderId]);
    if (result.rows.length > 0) {
      const { first_name, last_name } = result.rows[0];
      name = `${first_name} ${last_name}`.trim();
      // Patients might not have avatars, so leave as null or default
    }
  } else if (senderType === 'providers') {
    query = `SELECT first_name, last_name, headshot_url FROM providers WHERE id = $1`;
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

async function createOrGetChat(participantIds, order = "ASC") {
  const sortedParticipants = participantIds.sort(
    parseUtils.compareUUIDs(order)
  );
  const numParticipants = sortedParticipants.length;

  order = order === "ASC" || order === "DESC" ? order : "ASC";

  const matchingChat = await db.query(
    `
    SELECT chat_id, array_agg(participant_id ORDER BY participant_id ${order}) AS participant_ids
    FROM chat_participant
    GROUP BY chat_id
    HAVING COUNT(*) = $1 AND array_agg(participant_id ORDER BY participant_id ${order}) = $2::uuid[];
  `,
    [numParticipants, sortedParticipants]
  );

  if (matchingChat.rows.length > 0) {
    return matchingChat.rows[0].chat_id;
  }

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
}

async function removeChatMemberShip(chatId, participants) {
  await db.query(
    `DELETE FROM chat_participant WHERE chat_id = $1 AND participant_id = ANY ($2::uuid[])`,
    [chatId, participants]
  );
}

async function getChatIds(userDbId) {
  const result = await db.query(
    `SELECT chat_id FROM chat_participant WHERE participant_id = $1`,
    [userDbId]
  );
  return result.rows;
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
};

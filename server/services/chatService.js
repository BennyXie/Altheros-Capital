const db = require("../db/pool.js");
const dbUtils = require("../utils/dbUtils.js");
const parseUtils = require("../utils/parseUtils");

function formatMessage(sender, text, timestamp) {
  return {
    sender,
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

async function saveMessageToDb(socket, data) {
  const query = `INSERT INTO messages (
    chat_id,
    sender_id,
    sender_type,
    text_type,
    text,
    sent_at
  ) VALUES ($1, $2, $3, $4, $5, $6)`;

  await db.query(query, data);
}

async function getMessagesByChatId(chat_id) {
  const query = `
    SELECT *
    FROM messages
    WHERE chat_id = $1
    ORDER BY sent_at ASC;
  `;

  const { rows } = await db.query(query, [chat_id]);
  return rows;
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

  if (matchingChat.length > 0) {
    return matchingChat.rows[0].chat_id;
  }

  const chatInsert = await db.query(
    `INSERT INTO chats DEFAULT VALUES
    RETURNING id`
  );

  const chatId = chatInsert.rows[0].id;

  const values = sortedParticipants.map((_, i) => `($1, $${i + 2})`).join(", ");

  await db.query(
    `
    INSERT INTO chat_participant (chat_id, participant_id)
    VALUES ${values}
  `,
    [chatId, ...sortedParticipants]
  );

  return chatId;
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

module.exports = {
  formatMessage,
  saveMessageToDb,
  verifyChatMembership,
  getMessagesByChatId,
  createOrGetChat,
  removeChatMemberShip,
  getChatIds,
};

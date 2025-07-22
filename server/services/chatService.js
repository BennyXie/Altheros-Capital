const db = require("../db/pool.js");
const authUtils = require("../utils/authUtils.js");
const parseUtils = require("../utils/parseUtils");

function formatMessage(sender, text, timestamp) {
  return {
    sender,
    text,
    timestamp,
  };
}

async function verifyChatMembership(decoded, chatId) {
  const userId = await authUtils.getUserDbId(decoded);
  const query = `SELECT EXISTS (SELECT 1 FROM chat_participant WHERE chat_id = $chatId AND participant_id = $(userId))`;
  const result = await db.query(query, { chatId: chatId, userId: userId });
  return result.row[0];
}

async function saveMessageToDb(socket, data) {
  const query = `INSERT INTO messages (
    chat_id,
    sender_id,
    sender_type,
    text_type,
    text,
    sent_at
  ) VALUES ($(chat_id), $(sender_id), $(sender_type), $(text_type), $(text), $(sent_at))`;

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

  order = order != "ASC" || "DESC" ? "ASC" : order;

  const matchingChat = await db.query(
    `
    SELECT chat_id, array_agg(participant_id ORDER BY participant_id ${order}) AS participant_ids
    FROM chat_participant
    GROUP BY chat_id
    HAVING COUNT(*) = $(numParticipants) AND array_agg(participant_id ORDER BY participant_id ${order}) = $(participants)::uuid[];
  `,
    {
      numParticipants: numParticipants,
      participants: sortedParticipants,
    }
  );

  if (matchingChat.length > 0) {
    return matchingChat[0].chat_id;
  }

  const chatInsert = await db.query(
    `INSERT INTO chats DEFAULT VALUES
    RETURNING id`
  );

  const chatId = chatInsert[0].id;

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
    `DELETE FROM chat_participant WHERE chat_id = $1 AND participant_id = ANY ($2)`,
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

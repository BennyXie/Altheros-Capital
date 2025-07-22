const chatService = require("../services/chatService");
const dbUtils = require("../utils/dbUtils.js");

/**
 * Called when frontend emits join_chat event
 * Front end must emit:
 * socket.emit("join_chat", {
 *    chatId: "roomID", // unique ID of room
 *    timestamp: "timstamp" //ISO string
 * })
 */
function handleJoin(socket, chatId, username, timestamp) {
  socket.join(chatId);

  const message = chatService.formatMessage(
    username,
    `${username} has joined the chat`,
    timestamp
  );
  socket.server.to(chatId).emit("receive_message", message);
  console.log(`${username} joined room ${chatId}`);
}

/**
 * Called when frontend emits "send_message" event
 * Front end must emit:
 * socket.emit("send_message", {
 * chatId: "room-abc123",         // same ID used in join_chat
 * text: "Hello, world!",         // message text
 * timestamp: "2025-07-03T23:59:59Z" // timestamp as ISO string
 * });
 */
function handleMessage(socket, data, io) {
  const { chatId, text, timestamp, senderId, senderType, textType } = data;
  const sender = socket.user.name;

  if (!text || !chatId || !sender) return;

  chatService.saveMessageToDb(socket, {
    chat_id: chatId,
    sender_id: senderId,
    sender_type: senderType,
    text: text,
    text_type: textType,
    sent_at: timestamp,
  });

  const message = chatService.formatMessage(sender, text, timestamp);

  // Send message to recipient
  io.to(chatId).emit("receive_message", message);
}

/**
 * frontend doesn't need to do anything, runs auto
 */
function handleDisconnect(socket, io) {
  const name = socket.user?.name;

  // for (const room of socket.rooms) {
  //   if (room === socket.id) continue; // Skip internal room

  //   const message = chatService.formatMessage(
  //     name,
  //     `${name} has left the chat`,
  //     timestamp
  //   );

  const message = chatService.formatMessage(
    name,
    `${name} has left the chat`,
    new Date().toISOString()
  );

  for (const room of socket.rooms) {
    io.to(room).emit("receive_message", message);
  }

  console.log(`${name} disconnected`);
}

async function createOrGetChat(req, res) {
  const { participants } = req.body;
  const chat = await chatService.createOrGetChat(participants);
  res.json(chat);
}

async function getChatMessages(req, res) {
  const { chatId } = req.params;
  const payload = req.user;
  if (chatService.verifyChatMembership(payload)) {
    messages = await chatService.getMessagesByChatId(chatId);
    res.json(messages);
  } else {
    throw new Error(`User is not part of chat ${chatId}`);
  }
}

async function deleteChat(req, res) {
  const { chatId } = req.params;
  const userDbId = dbUtils.getUserDbId(req.user);
  await chatService.removeChatMemberShip(chatId, [userDbId]);
  res.status(204).send();
}

async function getChatIds(req, res) {
  const userDbId = dbUtils.getUserDbId(req.user);
  const chatIds = await chatService.getChatIds(userDbId);
  res.json(chatIds);
}

module.exports = {
  handleJoin,
  handleMessage,
  handleDisconnect,
  createOrGetChat,
  deleteChat,
  getChatMessages,
  getChatIds,
};

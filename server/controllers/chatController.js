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
async function handleJoin(socket, providerId, timestamp) {
  const patientId = socket.user.sub;
  const patientName = socket.user.name;
  try {
    const chatId = await chatService.getChatIdByParticipants(patientId, providerId);
    if (!chatId) {
      console.error(`chatController: handleJoin - Chat not found for patient ${patientId} and provider ${providerId}`);
      return;
    }
    socket.join(chatId);

    const message = await chatService.formatMessage(
      patientId,
      socket.user.role,
      `${patientName} has joined the chat`,
      timestamp
    );
    socket.server.to(chatId).emit("receive_message", message);
    console.log(`${patientName} joined room ${chatId}`);
  } catch (error) {
    console.error("chatController: Error in handleJoin:", error);
  }
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
async function handleMessage(socket, data, io) {
  const { text, timestamp } = data;
  const senderId = socket.user.sub;
  const senderType = socket.user.role;
  const senderName = socket.user.name;

  if (!text || !senderId || !senderType) return;

  // Get the chatId from the rooms the socket is in
  // Assuming the socket joins only one chat room at a time
  const chatId = Array.from(socket.rooms).find(room => room !== socket.id);

  if (!chatId) {
    console.error("chatController: handleMessage - No chat room found for socket.");
    return;
  }

  chatService.saveMessageToDb({
    chat_id: chatId,
    sender_id: senderId,
    sender_type: senderType,
    text: text,
    text_type: 'text', // Assuming text type for now
    sent_at: timestamp,
  });

  const message = await chatService.formatMessage(senderId, senderType, text, timestamp);

  // Send message to recipient
  io.to(chatId).emit("receive_message", message);
}

/**
 * frontend doesn't need to do anything, runs auto
 */
async function handleDisconnect(socket, io) {
  const name = socket.user?.name;

  // for (const room of socket.rooms) {
  //   if (room === socket.id) continue; // Skip internal room

  //   const message = chatService.formatMessage(
  //     name,
  //     `${name} has left the chat`,
  //     timestamp
  //   );

  const message = await chatService.formatMessage(socket.user.sub, socket.user.role, `${name} has left the chat`, new Date().toISOString());

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
  const { providerId } = req.params;
  const patientId = await dbUtils.getUserDbId(req.user);
  console.log("chatController: getChatMessages - patientId:", patientId);
  console.log("chatController: getChatMessages - providerId:", providerId);

  if (!patientId) {
    return res.status(400).json({ error: "Patient ID not found or invalid." });
  }

  try {
    const chatId = await chatService.getChatIdByParticipants(patientId, providerId);
    if (!chatId) {
      return res.status(404).json({ error: "Chat not found for these participants." });
    }

    const messages = await chatService.getMessagesByChatId(chatId);
    res.json(messages);
  } catch (error) {
    console.error("Error in getChatMessages:", error);
    res.status(500).json({ error: "Failed to retrieve chat messages." });
  }
}

async function deleteChat(req, res) {
  const { chatId } = req.params;
  const userDbId = dbUtils.getUserDbId(req.user);
  await chatService.removeChatMemberShip(chatId, [userDbId]);
  res.status(204).send();
}

async function getChatIds(req, res) {
  const userDbId = await dbUtils.getUserDbId(req.user);
  try {
    const chatIds = await chatService.getChatIds(userDbId);
    res.json(chatIds);
  } catch (error) {
    console.error("Error in getChatIds (chatController):", error);
    res.status(500).json({ error: "Failed to retrieve chat rooms." });
  }
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

const chatService = require("../services/chatService");

// function getEmailById(map, id) {
//   for (let [email, userId] of map.entries()) {
//     if (userId === id) {
//       return email;
//     }
//   }
//   return null;
// }

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
  // Added recipientEmail
  const { chatId, text, timestamp } = data;
  // Get user email from socket instead
  const sender = socket.user.name;

  if (!text || !chatId ) return;

  const message = chatService.formatMessage(sender, text, timestamp);

  // Send message to recipient
  io.to(chatId).emit("receive_message", message);
}

/**
 * frontend doesn't need to do anything, runs auto
 */
function handleDisconnect(socket, io) {
  const name = socket.user?.name;
  const timestamp = new Date().toISOString();

  for (const room of socket.rooms) {
    if (room === socket.id) continue; // Skip internal room

    const message = chatService.formatMessage(
    name,
    `${name} has left the chat`,
    timestamp
    );

    socket.to(room).emit("receive_message", message);
    console.log(`${name} left room ${room}`);
  }
}

module.exports = {
  handleJoin,
  handleMessage,
  handleDisconnect,
};

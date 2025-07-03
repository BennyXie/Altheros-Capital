const chatService = require("../services/chatService");

function getEmailById(map, id) {
  for (let [email, userId] of map.entries()) {
    if (userId === id) {
      return email;
    }
  }
  return null;
}

function handleJoin(socket, room, username) {
  socket.join(room);
  const { timestamp } = socket.data;

  const message = chatService.formatMessage(
    username,
    `${username} has joined the chat`,
    timestamp
  );
  socket.server.to(room).emit("something", message);
  console.log(`${username} joined room ${room}`);
}

function handleMessage(socket, data, connectedUsers, userDisplayNames, io) {
  const { text, timestamp } = data;
  const userEmail = getEmailById(connectedUsers, socket.id);
  const sender = userDisplayNames[userEmail];

  if (!text || !sender) return;

  const message = chatService.formatMessage(sender, text, timestamp);

  io.to(room).emit("something", message);
}

function handleDisconnect(socket, room, username) {
  socket.leave(room);
  const { timestamp } = socket.data;

  const message = chatService.formatMessage(
    username,
    `${username} has left the chat`,
    timestamp
  );
  socket.server.to(room).emit("something", message);
  console.log(`${username} left room ${room}`);
}

module.exports = {
  handleJoin,
  handleMessage,
  handleDisconnect,
};

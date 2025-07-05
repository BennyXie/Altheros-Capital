const chatService = require("../services/chatService");

function getEmailById(map, id) {
  for (let [email, userId] of map.entries()) {
    if (userId === id) {
      return email;
    }
  }
  return;
}

// function handleJoin(socket, room, username) {
//   socket.join(room);
//   const { timestamp } = socket.data;

//   const message = chatService.formatMessage(
//     username,
//     `${username} has joined the chat`,
//     timestamp
//   );
//   socket.server.to(room).emit("something", message);
//   console.log(`${username} joined room ${room}`);
// }

function handleMessage(socket, data, connectedUsers, userDisplayNames, io) {
  // Added recipientEmail
  const { text, timestamp, recipientEmail } = data;
  // Get user email from socket instead
  const userEmail = socket.user.email;
  const sender = userDisplayNames.get(userEmail);

  if (!text || !recipientEmail || !connectedUsers.has(recipientEmail)) return;

  const message = chatService.formatMessage(sender, text, timestamp);

  // Send message to recipient
  const recipientSocketId = connectedUsers.get(recipientEmail);
  io.to(recipientSocketId).emit("receive_message", message);

  // Echos back messsge to sender
  socket.emit("receive_message", message);
}

// function handleDisconnect(socket, room, username) {
//   socket.leave(room);
//   const { timestamp } = socket.data;

//   const message = chatService.formatMessage(
//     username,
//     `${username} has left the chat`,
//     timestamp
//   );
//   socket.server.to(room).emit("something", message);
//   console.log(`${username} left room ${room}`);
// }

module.exports = {
  // handleJoin,
  handleMessage,
  // handleDisconnect,
};

const { Server } = require("socket.io");
const verifyJwt = require("../utils/verifyJwt");
const chatController = require("../controllers/chatController.js");

// Mapping of user email -> socket ID to direct route
const connectedUsers = new Map();

// Mapping of user email -> full name for frontend UI
const userDisplayNames = new Map();

/**
 * Initiailizes and configures Socket.IO w authentication and message handling
 * Runs once server starts and sets up real-time infra
 */
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // TODO: Replace w frontend domain in prod
      methods: ["GET", "POST"],
    },
  });

  /**
   * Middleware to verify JWT on connection
   * If successful, attaches user email and full nameto socket object
   */
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Auth token is missing"));
    }

    try {
      const decoded = await verifyJwt(token);

      // Attach user info to socket
      socket.user = {
        email: decoded.email,
        name: `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim() || decoded.email,
        sub: decoded.sub, // Add sub to socket.user
        role: decoded['cognito:groups'] && decoded['cognito:groups'][0] // Add role to socket.user
      };

      next(); // Go to connection
    } catch (err) {
      console.error("Token verification failed:", err);
      next(new Error("Invalid token"));
    }
  });

  /**
   * Event: Handles new user socket connection after successful auth
   */
  io.on("connection", (socket) => {
    const { email, name } = socket.user;

    // Track user in mem
    connectedUsers.set(email, socket.id);
    userDisplayNames.set(email, name);

    console.log(`${name} connected (socket ID: ${socket.id})`);

    /**
     * Code to Join a chat room
     * Front end needs to emit:
     * socket.emit("join_chat, { chatId, timestamp }")
     */
    socket.on("join_chat", ({ providerId, timestamp }) => {
      chatController.handleJoin(socket, providerId, name, timestamp);
    });

    /**
     * Event: When user sends message, send to controller
     */
    socket.on("send_message", (data) => {
      chatController.handleMessage(socket, data, io);
    });

    /**
     * Event: When user disconnects, remove from memory maps
     */
    socket.on("disconnect", (reason) => {
      console.log(reason);
      connectedUsers.delete(email);
      userDisplayNames.delete(email);
      chatController.handleDisconnect(socket, io);
    });
  });

  return io;
}

module.exports = { initializeSocket, connectedUsers, userDisplayNames };

// imports
// define where to load environment variables
require('dotenv').config({ path: './.env' });
const express = require("express");
const http = require("http");
const cors = require("cors");
const db = require("./db/pool")
const authRoutes = require("./routes/authRoutes");
const aiRoutes   = require("./routes/aiRoutes")
const { initializeSocket } = require('./services/socketService');
const headshotRoutes = require("./routes/headshotRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// using express
const app = express();

// enable socket.io 
const server = http.createServer(app);

// define port, stored in server/.env
const PORT = process.env.PORT || 8080;

// initializing the app
app.use(cors());
app.use(express.json());

// All authRoutes start with /api/auth
app.use("/api/auth", authRoutes);

// AI routes
app.use("/ai", aiRoutes);

// General webhook routes
app.use("/api/webhooks", webhookRoutes);

app.use("/api/providers", headshotRoutes);

// WebSocket installation
initializeSocket(server);


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

// imports
// define where to load environment variables
require('dotenv').config({ path: './server/.env' });
const express = require("express");
const http = require("http");
const cors = require("cors");
const db = require("./db/pool")
const authRoutes = require("./routes/authRoutes");
const aiRoutes   = require("./routes/aiRoutes")
const calendlyRoutes = require("./routes/calendlyRoute");
const { initializeSocket } = require('./services/socketService');

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

// All calendlyRoutes start with /calendly
app.use("/calendly", calendlyRoutes);

// WebSocket installation
initializeSocket(server);


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

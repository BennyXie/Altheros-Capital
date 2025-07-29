// imports
// define where to load environment variables
require('dotenv').config({ path: __dirname + '/.env' });
const express = require("express");
const http = require("http"); // Added for socket.io
const cors = require("cors");
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointments");
const providersRoutes = require("./routes/providerRoutes");
const aiRoutes = require("./routes/aiRoutes");
const calendlyRoutes = require("./routes/calendlyRoute");
const chatRoutes = require("./routes/chatRoutes");
const headshotRoutes = require("./routes/headshotRoutes");
const db = require("./db/pool"); // Added from coworker's branch
const { initializeSocket } = require("./services/socketService"); // Added for socket.io
const AWS = require('aws-sdk');
const resumeRoute = require("./routes/resumeRoute");
const profileRoutes = require("./routes/profileRoutes");
const publicRoutes = require("./routes/publicRoutes");

console.log("Before app.use(profileRoutes) - Type of profileRoutes:", typeof profileRoutes);
console.log("Before app.use(profileRoutes) - profileRoutes:", profileRoutes);

// using express
const app = express();
// enable socket.io
const server = http.createServer(app); // Added for socket.io

// define port, stored in server/.env
const PORT = process.env.PORT || 8080;

// Initializing the app

app.use(cors());

// Conditionally apply express.json() to skip headshot upload route
app.use((req, res, next) => {
  if (req.path.startsWith('/api/headshot')) {
    next(); // Skip express.json() for headshot routes
  } else {
    express.json()(req, res, next); // Apply express.json() for other routes
  }
});

// Auth routes
app.use("/api/auth", authRoutes);
// app.use("/api/appointments", appointmentRoutes);
app.use("/api/providers", providersRoutes);

// AI routes
app.use("/ai", aiRoutes);
// Calendly routes
app.use("/calendly", calendlyRoutes);
// Chat routes
app.use("/chat", chatRoutes);
// Headshot routes
app.use("/api/headshot", headshotRoutes);
// Profile routes
app.use("/api/profile", profileRoutes);
// Schedule routes
app.use("/api/schedule", require("./routes/scheduleRoutes"));
// Languages routes
app.use("/api/languages", require("./routes/languagesRoutes"));
// Symptoms routes
app.use("/api/symptoms", require("./routes/symptomsRoute"));
// Me route
app.use("/api/me", require("./routes/me.js"));
app.use("/api/resume", resumeRoute);
app.use("/public", publicRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// // Protected route example
// app.get("/api/protected-hello", authenticateToken, (req, res) => {
//     const userSub = req.user.sub; // User's unique ID
//     const username = req.user['cognito:username']; // User's username
//     const userRole = req.user['custom:role']; // Access custom role from the token claims

//     res.json({
//         message: `Hello ${username}! You accessed a protected route.`,
//         yourSub: userSub,
//         yourRole: userRole || 'No role assigned yet'
//     });
// });


module.exports = app;

// WebSocket installation
initializeSocket(server); // Initialize socket.io after app is created

// Start server after fetching JWKS
if (typeof setUp === "function" && require.main === module) {
  setUp().then(() => {
      server.listen(PORT, () => { // Use server.listen for socket.io
          console.log(`Server running on port ${PORT}`);
      });
  }).catch(err => {
      console.error("Server startup failed:", err);
      process.exit(1);
  });
} else if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
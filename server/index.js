// imports
// define where to load environment variables
require('dotenv').config({ path: './server/.env' });
const express = require("express");
const cors = require("cors");
const db = require("./db/pool")
const authRoutes = require("./routes/authRoutes");
const aiRoutes   = require("./routes/aiRoutes")
const aiRoutes   = require("./routes/aiRoutes")

// using express
const app = express();

// define port, stored in server/.env
const PORT = process.env.PORT || 8080;

// initializing the app
app.use(cors());
app.use(express.json());

// All authRoutes start with /api/auth
app.use("/api/auth", authRoutes);
app.use("/ai", aiRoutes);    

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
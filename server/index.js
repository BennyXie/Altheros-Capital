// imports
// define where to load environment variables
require('dotenv').config({ path: './server/.env' });
const express = require("express");
const cors = require("cors");
const db = require("./db")

// using express
const app = express();

// define port, stored in server/.env
const PORT = process.env.PORT || 5050;

// initializing the app
app.use(cors());
app.use(express.json());

app.get("/helloWorld", (req, res) => {
    res.json({ message: "Hello from Benny!"});
});

// testing DB access (lists out tables)
app.get("/test-db", async(req, res) => {
    try {
        const result = await db.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
            `);
        res.json({tables: result.rows.map(row => row.table_name) });
    } catch (err) {
        console.error("DB error: ", err);
        res.status(500).send("Database query failed");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
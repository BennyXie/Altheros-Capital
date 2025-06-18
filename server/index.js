// imports
// define where to load environment variables
require('dotenv').config({ path: './server/.env' });
const express = require("express");
const cors = require("cors");

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
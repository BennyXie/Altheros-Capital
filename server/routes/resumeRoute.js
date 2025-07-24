const express = require("express");
const router = express.Router();

const {resumeHandler} = require("../controllers/resumeController");

router.post(
    "/parse",
    resumeHandler
);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getCalendlyEvents } = require("../controllers/calendlyController");

router.post("/events", getCalendlyEvents);

module.exports = router;

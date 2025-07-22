const express = require("express");
const router = express.Router();
const { getSchedule, updateSchedule } = require("../controllers/scheduleController");
const verifyToken = require("../middleware/verifyToken");

// Route to get provider schedule
router.get("/:providerId", verifyToken, getSchedule);

// Route to update provider schedule
router.put("/:providerId", verifyToken, updateSchedule);

module.exports = router;
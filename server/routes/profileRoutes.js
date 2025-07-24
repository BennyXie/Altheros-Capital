const express = require("express");
const router = express.Router();
const { completePatientProfile, completeProviderProfile, checkProfileStatus } = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");

// Route to complete patient profile
router.post("/patient", verifyToken, completePatientProfile);

// Route to complete provider profile
router.post("/provider", verifyToken, completeProviderProfile);

// Route to check profile completion status
router.get("/status", verifyToken, checkProfileStatus);

module.exports = router;

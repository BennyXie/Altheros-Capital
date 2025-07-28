const express = require("express");
const router = express.Router();
const { completePatientProfile, updatePatientProfile, completeProviderProfile, checkProfileStatus, getPatientProfile } = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");

// Route to complete patient profile
router.post("/patient", verifyToken, completePatientProfile);

// Route to update patient profile
router.put("/patient", verifyToken, updatePatientProfile);

// Route to get patient profile
router.get("/patient", verifyToken, getPatientProfile);

// Route to complete provider profile
router.post("/provider", verifyToken, completeProviderProfile);

// Route to check profile completion status
router.get("/status", verifyToken, checkProfileStatus);

module.exports = router;

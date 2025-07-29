const express = require("express");
const router = express.Router();
const { completePatientProfile, updatePatientProfile, completeProviderProfile, updateProviderProfile, checkProfileStatus, getPatientProfile, getProviderProfile } = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");

// Route to complete patient profile
router.post("/patient", verifyToken, completePatientProfile);

// Route to update patient profile
router.put("/patient", verifyToken, updatePatientProfile);

// Route to get patient profile
router.get("/patient", verifyToken, getPatientProfile);

// Route to complete provider profile
router.post("/provider", verifyToken, completeProviderProfile);

// Route to update provider profile
router.put("/provider", verifyToken, updateProviderProfile);

// Route to get provider profile
router.get("/provider", verifyToken, getProviderProfile);

// Route to check profile completion status
router.get("/status", verifyToken, checkProfileStatus);

module.exports = router;

const express = require("express");
const router = express.Router();
const { completePatientProfile, updatePatientProfile, completeProviderProfile, updateProviderProfile, checkProfileStatus, getPatientProfile, getProviderProfile, deleteUserProfile } = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");

// Route to complete patient profile
router.post("/patient", express.json(), verifyToken, completePatientProfile);

// Route to update patient profile
router.put("/patient", express.json(), verifyToken, updatePatientProfile);

// Route to get patient profile
router.get("/patient", verifyToken, getPatientProfile);

// Route to complete provider profile
router.post("/provider", express.json(), verifyToken, completeProviderProfile);

// Route to update provider profile
router.put("/provider", express.json(), verifyToken, updateProviderProfile);

// Route to get provider profile
router.get("/provider", verifyToken, getProviderProfile);

// Route to check profile completion status
router.get("/status", verifyToken, checkProfileStatus);

// Route to delete user profile data
router.delete("/", verifyToken, deleteUserProfile);

module.exports = router;

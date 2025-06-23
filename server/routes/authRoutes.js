const express = require("express");
const router = express.Router();
const { testCognito } = require("../controllers/authController");

router.get("/test-cognito", testCognito);

module.exports = router;
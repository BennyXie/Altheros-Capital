const express = require("express");
const router = express.Router();
// import verifyToken from '../middleware/verifyAIToken.js'; // optional auth
const { postAI } = require('../controllers/aiController.js');

router.post(
  '/research',   // final URL becomes /ai/research
  /* verifyAIToken,*/ // uncomment to require a valid token
  postAI   // controller that does the real work
);

module.exports = router;
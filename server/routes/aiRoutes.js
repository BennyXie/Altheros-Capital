const express = require("express");
const router = express.Router();
// import verifyToken from '../middleware/verifyToken.js'; // optional auth
const { postAI } = require('../controllers/aiController.js');

router.post(
  '/research',   // final URL becomes /ai/research
  /* verifyToken,*/ // uncomment to require a valid token
  postAI   // controller that does the real work
);

module.exports = router;
const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const chatController = require("../controllers/chatController");
const verifyToken = require("../middleware/verifyToken");

router.get(
  "/:chatId/messages",
  verifyToken,
  asyncHandler(chatController.getChatMessages)
);

router.post("/", verifyToken, asyncHandler(chatController.createOrGetChat));

router.delete("/:chatId", verifyToken, asyncHandler(chatController.deleteChat));

router.get("/", verifyToken, asyncHandler(chatController.getChatIds));

module.exports = router;

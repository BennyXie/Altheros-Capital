const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const chatController = require("../controllers/chatController");
const verifyToken = require("../middleware/verifyToken");

router.get(
  "/messages/:providerId",
  verifyToken,
  asyncHandler(chatController.getChatMessages)
);

router.get(
  "/room/:chatId/messages",
  verifyToken,
  asyncHandler(chatController.getChatMessagesByChatId)
);

router.post("/", verifyToken, asyncHandler(chatController.createOrGetChat));

router.delete("/:chatId", verifyToken, asyncHandler(chatController.deleteChat));

router.get("/rooms", verifyToken, asyncHandler(chatController.getChatIds));

router.get("/room/:chatId/details", verifyToken, asyncHandler(chatController.getChatDetails));

module.exports = router;

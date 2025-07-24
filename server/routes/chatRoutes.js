const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const chatController = require("../controllers/chatController");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const chatService = require("../services/chatService");

const upload = multer({
  limits: { fileSize: 1e8 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "application/msword"];
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image, PDF, Word, and video files are allowed"));
    }
  },
});

router.post(
  "/:chatId/message",
  verifyToken,
  chatService.verifyChatMembership,
  upload.single("file"),
  asyncHandler(chatController.createMessage)
);

// router.delete(
//   "/:chatId/message",
//   verifyToken,
//   chatService.verifyChatMembership,
//   upload.single("file"),
//   asyncHandler(chatController.deleteMessage)
// );

router.get(
  "/messages/:providerId",
  verifyToken,
  chatService.verifyChatMembership,
  asyncHandler(chatController.getChatMessages)
);

router.get(
  "/room/:chatId/messages",
  verifyToken,
  asyncHandler(chatController.getChatMessagesByChatId)
);

router.post("/", verifyToken, asyncHandler(chatController.createOrGetChat));

router.delete(
  "/:chatId",
  verifyToken,
  chatService.verifyChatMembership,
  asyncHandler(chatController.deleteChat)
);

router.get("/rooms", verifyToken, asyncHandler(chatController.getChatIds));

router.get("/room/:chatId/details", verifyToken, asyncHandler(chatController.getChatDetails));

module.exports = router;

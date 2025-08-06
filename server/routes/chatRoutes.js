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
    if (
      allowedTypes.includes(file.mimetype) ||
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image, PDF, Word, and video files are allowed"));
    }
  },
});

// post endpoints

router.post(
  "/:chatId/message",
  verifyToken,
  chatService.verifyChatMembership,
  upload.single("file"),
  asyncHandler(chatController.createMessage)
);

router.post("/", verifyToken, asyncHandler(chatController.createOrGetChat));

// get endpoints

router.get("/", verifyToken, asyncHandler(chatController.getChatIds));

router.get(
  "/:chatId/messages",
  verifyToken,
  chatService.verifyChatMembership,
  asyncHandler(chatController.getChatMessagesByChatId)
);

// delete endpoints

/* router.delete(
  "/:chatId",
  verifyToken,
  chatService.verifyChatMembership,
  asyncHandler(chatController.deleteChat)
);

router.delete(
  "/:chatId/message/:messageId",
  verifyToken,
  chatService.verifyChatMembership,
  chatService.verifyMessageOwnership,
  asyncHandler(chatController.deleteMessage)
); */

// patch endpoints

router.patch(
  "/:chatId/participants/me",
  verifyToken,
  chatService.verifyChatMembership,
  asyncHandler(chatController.updateParticipantState)
);

router.patch(
  "/message/:messageId",
  verifyToken,
  chatService.verifyMessageOwnership,
  asyncHandler(chatController.updateMessage)
);

module.exports = router;

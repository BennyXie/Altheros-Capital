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
  asyncHandler(chatController.getChatMessages)
);

// delete endpoints

router.delete(
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
);

<<<<<<< HEAD
router.get(
  "/messages/:providerId",
=======
// patch endpoints

router.patch(
  "/:chatId/participants/me",
>>>>>>> d72b35a (added soft delete)
  verifyToken,
  chatService.verifyChatMembership,
  asyncHandler(chatController.updateParticipantState)
);

<<<<<<< HEAD
router.get(
  "/room/:chatId/messages",
  verifyToken,
  asyncHandler(chatController.getChatMessagesByChatId)
);

router.post("/", verifyToken, asyncHandler(chatController.createOrGetChat));

router.delete(
  "/:chatId",
=======
router.patch(
  "/:chatId/message/:messageId",
>>>>>>> d72b35a (added soft delete)
  verifyToken,
  chatService.verifyChatMembership,
  chatService.verifyMessageOwnership,
  asyncHandler(chatController.updateMessage)
);

<<<<<<< HEAD
router.get("/rooms", verifyToken, asyncHandler(chatController.getChatIds));

router.get("/room/:chatId/details", verifyToken, asyncHandler(chatController.getChatDetails));

=======
>>>>>>> d72b35a (added soft delete)
module.exports = router;

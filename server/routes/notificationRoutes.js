const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const verifyToken = require("../middleware/verifyToken");

// Get notifications for authenticated user
router.get("/", verifyToken, asyncHandler(notificationController.getNotifications));

// Get unread notification count
router.get("/unread-count", verifyToken, asyncHandler(notificationController.getUnreadCount));

// Mark notification as read
router.patch("/:notificationId/read", verifyToken, asyncHandler(notificationController.markAsRead));

// Mark all notifications as read
router.patch("/mark-all-read", verifyToken, asyncHandler(notificationController.markAllAsRead));

// Delete notification
router.delete("/:notificationId", verifyToken, asyncHandler(notificationController.deleteNotification));

// Create test notification (for development)
router.post("/test", verifyToken, asyncHandler(notificationController.createTestNotification));

module.exports = router;

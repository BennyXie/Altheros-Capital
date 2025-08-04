const notificationService = require("../services/notificationService");
const dbUtils = require("../utils/dbUtils");

/**
 * Get notifications for the authenticated user
 */
async function getNotifications(req, res) {
  try {
    const userId = await dbUtils.getUserDbId(req.user);
    const { limit = 20, offset = 0 } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * Get unread notification count for the authenticated user
 */
async function getUnreadCount(req, res) {
  try {
    const userId = await dbUtils.getUserDbId(req.user);
    
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}

/**
 * Mark a notification as read
 */
async function markAsRead(req, res) {
  try {
    const userId = await dbUtils.getUserDbId(req.user);
    const { notificationId } = req.params;
    
    const success = await notificationService.markAsRead(notificationId, userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

/**
 * Mark all notifications as read for the authenticated user
 */
async function markAllAsRead(req, res) {
  try {
    const userId = await dbUtils.getUserDbId(req.user);
    const count = await notificationService.markAllAsRead(userId);
    
    res.json({ markedCount: count });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

/**
 * Delete a notification
 */
async function deleteNotification(req, res) {
  try {
    const userId = await dbUtils.getUserDbId(req.user);
    const { notificationId } = req.params;
    
    const success = await notificationService.deleteNotification(notificationId, userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}

/**
 * Create a test notification (for development/testing)
 */
async function createTestNotification(req, res) {
  try {
    const userId = await dbUtils.getUserDbId(req.user);
    const { title, message, type = 'info', action_url } = req.body;
    
    const notification = await notificationService.createNotification({
      user_id: userId,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      type,
      action_url
    });
    
    res.json(notification);
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: 'Failed to create test notification' });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createTestNotification
};

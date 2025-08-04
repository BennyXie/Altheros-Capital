const db = require("../db/pool.js");

/**
 * Service for handling notifications
 */

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @param {string} notification.user_id - ID of the user receiving the notification
 * @param {string} notification.title - Title of the notification
 * @param {string} notification.message - Message content
 * @param {string} notification.type - Type of notification (info, warning, error, success)
 * @param {string} notification.action_url - Optional URL for action button
 * @returns {Object} Created notification
 */
async function createNotification(notification) {
  const { user_id, title, message, type = 'info', action_url = null } = notification;
  
  const query = `
    INSERT INTO notifications (user_id, title, message, type, action_url, created_at, is_read)
    VALUES ($1, $2, $3, $4, $5, NOW(), false)
    RETURNING *
  `;
  
  const result = await db.query(query, [user_id, title, message, type, action_url]);
  return result.rows[0];
}

/**
 * Get notifications for a user (using messages as notifications)
 * @param {string} userId - User ID
 * @param {number} limit - Number of notifications to return
 * @param {number} offset - Offset for pagination
 * @returns {Array} Array of notifications
 */
async function getUserNotifications(userId, limit = 20, offset = 0) {
  const query = `
    SELECT 
      m.chat_id,
      m.sender_id,
      m.sender_type,
      m.text,
      m.sent_at,
      cp.participant_id as recipient_id
    FROM messages m
    JOIN chat_participant cp ON m.chat_id = cp.chat_id
    WHERE cp.participant_id = $1 
      AND m.sender_id != $1
    ORDER BY m.sent_at DESC 
    LIMIT $2 OFFSET $3
  `;
  
  const result = await db.query(query, [userId, limit, offset]);
  
  // Format as notifications with chat room links
  return result.rows.map(row => ({
    id: `${row.chat_id}_${row.sent_at}`,
    type: 'message',
    title: 'New Message',
    message: row.text.length > 50 ? row.text.substring(0, 50) + '...' : row.text,
    chat_id: row.chat_id,
    sender_id: row.sender_id,
    sender_type: row.sender_type,
    created_at: row.sent_at,
    is_read: false, // We'll implement read tracking later if needed
    link: `/chat/${row.chat_id}` // Link to the chat room using chat ID
  }));
}

/**
 * Get unread notification count for a user (using messages as notifications)
 * @param {string} userId - User ID
 * @returns {number} Count of unread notifications
 */
async function getUnreadCount(userId) {
  const query = `
    SELECT COUNT(*) as count 
    FROM messages m
    JOIN chat_participant cp ON m.chat_id = cp.chat_id
    WHERE cp.participant_id = $1 
      AND m.sender_id != $1
      AND m.sent_at > NOW() - INTERVAL '24 hours'
  `;
  
  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].count);
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security)
 * @returns {boolean} Success status
 */
async function markAsRead(notificationId, userId) {
  const query = `
    UPDATE notifications 
    SET is_read = true, read_at = NOW() 
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  
  const result = await db.query(query, [notificationId, userId]);
  return result.rowCount > 0;
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {number} Number of notifications marked as read
 */
async function markAllAsRead(userId) {
  const query = `
    UPDATE notifications 
    SET is_read = true, read_at = NOW() 
    WHERE user_id = $1 AND is_read = false
    RETURNING *
  `;
  
  const result = await db.query(query, [userId]);
  return result.rowCount;
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security)
 * @returns {boolean} Success status
 */
async function deleteNotification(notificationId, userId) {
  const query = `
    DELETE FROM notifications 
    WHERE id = $1 AND user_id = $2
  `;
  
  const result = await db.query(query, [notificationId, userId]);
  return result.rowCount > 0;
}

/**
 * Create a notification and emit it via websocket
 * @param {Object} notification - Notification data
 * @param {Object} io - Socket.IO instance
 * @param {Map} connectedUsers - Map of connected users
 */
async function createAndEmitNotification(notification, io, connectedUsers) {
  const createdNotification = await createNotification(notification);
  
  // Find user's socket ID by email
  const userEmail = await getUserEmailById(notification.user_id);
  const socketId = connectedUsers.get(userEmail);
  
  if (socketId) {
    // Emit to specific user
    io.to(socketId).emit('new_notification', createdNotification);
  }
  
  return createdNotification;
}

/**
 * Helper function to get user email by ID
 * @param {string} userId - User ID
 * @returns {string} User email
 */
async function getUserEmailById(userId) {
  const query = `
    SELECT email FROM users WHERE id = $1
  `;
  
  const result = await db.query(query, [userId]);
  return result.rows[0]?.email;
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createAndEmitNotification,
  getUserEmailById
};

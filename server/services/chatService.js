const db = require("../db/pool.js");
const dbUtils = require("../utils/dbUtils");
const cloudfrontService = require("./cloudfrontService");
const s3Service = require("./s3Service");
const { v4: uuidv4 } = require('uuid');

/**
 * Chat Service - Handles database operations for chat functionality
 * Separated from websocket logic for better architecture
 */

// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================

/**
 * Middleware to verify if user is a participant in the chat
 */
async function verifyChatMembership(req, res, next) {
  try {
    const userDbId = await dbUtils.getUserDbId(req.user);
    const { chatId } = req.params;
    
    // For participant state updates, allow access even if user has left (for rejoining)
    const isParticipantUpdate = req.route.path.includes('/participants/me');
    
    const query = isParticipantUpdate ? `
      SELECT EXISTS (
        SELECT 1 FROM chat_participant 
        WHERE chat_id = $1 AND participant_id = $2
      )
    ` : `
      SELECT EXISTS (
        SELECT 1 FROM chat_participant 
        WHERE chat_id = $1 AND participant_id = $2 AND left_at IS NULL
      )
    `;
    
    const result = await db.query(query, [chatId, userDbId]);
    
    if (result.rows[0].exists) {
      next();
    } else {
      res.status(404).json({ error: "Chat not found or user not a participant" });
    }
  } catch (error) {
    console.error('Error verifying chat membership:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Helper function for checking membership without middleware
 */
async function checkChatMembership(userObj, chatId) {
  try {
    const userDbId = await dbUtils.getUserDbId(userObj);
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM chat_participant 
        WHERE chat_id = $1 AND participant_id = $2 AND left_at IS NULL
      )
    `;
    
    const result = await db.query(query, [chatId, userDbId]);
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking chat membership:', error);
    return false;
  }
}

/**
 * Middleware to verify if user owns the message
 */
async function verifyMessageOwnership(req, res, next) {
  try {
    const userDbId = await dbUtils.getUserDbId(req.user);
    const { messageId } = req.params;
    
    console.log('verifyMessageOwnership: messageId:', messageId);
    console.log('verifyMessageOwnership: userDbId:', userDbId);
    
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM messages 
        WHERE id = $1 AND sender_id = $2
      )
    `;
    
    const result = await db.query(query, [messageId, userDbId]);
    
    console.log('verifyMessageOwnership: query result:', result.rows[0]);
    
    if (result.rows[0].exists) {
      next();
    } else {
      console.log('verifyMessageOwnership: Message not found or user not sender');
      res.status(404).json({ error: "Message not found or user not sender" });
    }
  } catch (error) {
    console.error('Error verifying message ownership:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ============================================
// CHAT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Create a new chat or get existing chat with the same participants
 * Works with existing database schema
 */
async function createOrGetChat(participantDbIds) {
  try {
    console.log('createOrGetChat: participantDbIds:', participantDbIds);
    
    const numParticipants = participantDbIds.length;
    
    // Check if chat already exists with these exact participants
    const matchingChat = await db.query(`
      SELECT cp.chat_id
      FROM chat_participant cp
      WHERE cp.chat_id IN (
        SELECT chat_id 
        FROM chat_participant 
        GROUP BY chat_id 
        HAVING COUNT(DISTINCT participant_id) = $1
        AND COUNT(DISTINCT participant_id) = COUNT(CASE WHEN participant_id = ANY($2::uuid[]) THEN 1 END)
      )
      AND cp.participant_id = ANY($2::uuid[])
      GROUP BY cp.chat_id
      HAVING COUNT(*) = $1
    `, [numParticipants, participantDbIds]);
    
    if (matchingChat.rows.length > 0) {
      const chatId = matchingChat.rows[0].chat_id;
      console.log('createOrGetChat: Found existing chat:', chatId);
      
      // Rejoin participants who may have left (soft leave)
      await db.query(`
        UPDATE chat_participant
        SET left_at = NULL, is_muted = FALSE
        WHERE chat_id = $1 AND participant_id = ANY($2::uuid[])
      `, [chatId, participantDbIds]);
      
      return { chatId };
    }
    
    // Create new chat - let database generate UUID
    const chatInsert = await db.query(
      `INSERT INTO chats DEFAULT VALUES RETURNING id`
    );
    
    const chatId = chatInsert.rows[0].id;
    
    // Add participants using existing schema
    const values = participantDbIds.map((_, i) => `($1, $${i + 2})`).join(", ");
    
    await db.query(`
      INSERT INTO chat_participant (chat_id, participant_id)
      VALUES ${values}
    `, [chatId, ...participantDbIds]);
    
    console.log('createOrGetChat: Created new chat:', chatId);
    return { chatId };
    
  } catch (error) {
    console.error('Error in createOrGetChat:', error);
    throw error;
  }
}

/**
 * Get all chat IDs for a user with participant info and last message
 */
async function getChatIds(userDbId) {
  try {
    console.log("getChatIds: userDbId:", userDbId);
    
    const query = `
      SELECT DISTINCT
        cp.chat_id,
        cp.left_at,
        (SELECT text FROM messages 
         WHERE chat_id = cp.chat_id AND deleted_at IS NULL 
         ORDER BY sent_at DESC LIMIT 1) as last_message_text,
        (SELECT sent_at FROM messages 
         WHERE chat_id = cp.chat_id AND deleted_at IS NULL 
         ORDER BY sent_at DESC LIMIT 1) as last_message_time,
        COALESCE(array_agg(DISTINCT other_cp.participant_id) FILTER (
          WHERE other_cp.participant_id != cp.participant_id AND other_cp.left_at IS NULL
        ), ARRAY[]::uuid[]) as other_participants
      FROM chat_participant cp 
      LEFT JOIN chat_participant other_cp ON cp.chat_id = other_cp.chat_id
      WHERE cp.participant_id = $1 AND cp.left_at IS NULL
      GROUP BY cp.chat_id, cp.left_at
      ORDER BY last_message_time DESC NULLS LAST
    `;
    
    const result = await db.query(query, [userDbId]);
    
    // Convert participant database IDs back to Cognito IDs for frontend
    const chatsWithCognitoIds = await Promise.all(
      result.rows.map(async (row) => {
        const cognitoIds = [];
        
        if (row.other_participants && row.other_participants.length > 0) {
          for (const participantDbId of row.other_participants) {
            // Try to find in providers first
            let cognitoResult = await db.query('SELECT cognito_sub FROM providers WHERE id = $1', [participantDbId]);
            
            if (cognitoResult.rows.length === 0) {
              // If not a provider, try patients
              cognitoResult = await db.query('SELECT cognito_sub FROM patients WHERE id = $1', [participantDbId]);
            }
            
            if (cognitoResult.rows.length > 0) {
              cognitoIds.push(cognitoResult.rows[0].cognito_sub);
            }
          }
        }
        
        return {
          chat_id: row.chat_id,
          left_at: row.left_at,
          lastMessage: row.last_message_text ? {
            text: row.last_message_text,
            timestamp: row.last_message_time
          } : null,
          otherParticipants: cognitoIds || []
        };
      })
    );
    
    return chatsWithCognitoIds;
    
  } catch (error) {
    console.error('Error in getChatIds:', error);
    throw error;
  }
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================

/**
 * Get all messages for a chat with signed URLs for non-string content
 */
async function getMessagesByChatId(chatId) {
  try {
    const query = `
      SELECT 
        m.id,
        m.chat_id,
        m.sender_id,
        m.sender_type,
        m.text_type,
        m.text,
        m.sent_at,
        m.deleted_at,
        CASE 
          WHEN m.sender_type = 'provider' THEN p.first_name || ' ' || p.last_name
          WHEN m.sender_type = 'patient' THEN pt.first_name || ' ' || pt.last_name
          ELSE 'Unknown User'
        END as sender_name,
        CASE 
          WHEN m.sender_type = 'provider' THEN p.cognito_sub
          WHEN m.sender_type = 'patient' THEN pt.cognito_sub
          ELSE NULL
        END as sender_cognito_id
      FROM messages m
      LEFT JOIN providers p ON m.sender_id = p.id AND m.sender_type = 'provider'
      LEFT JOIN patients pt ON m.sender_id = pt.id AND m.sender_type = 'patient'
      WHERE m.chat_id = $1 AND m.deleted_at IS NULL
      ORDER BY m.sent_at ASC
    `;
    
    const { rows } = await db.query(query, [chatId]);
    
    // Process messages to generate signed URLs for non-string content
    rows.forEach((message) => {
      if (message.text_type !== "string") {
        // Generate signed CloudFront URL for file access
        message.text = cloudfrontService.getPrivateKeySignedUrl({
          objectName: message.text,
        });
      }
    });
    
    return rows;
    
  } catch (error) {
    console.error('Error in getMessagesByChatId:', error);
    throw error;
  }
}

/**
 * Save a message to the database
 */
async function saveMessageToDb(req, { chatId, textType, sentAt, text }) {
  try {
    const query = `
      INSERT INTO messages (
        chat_id,
        sender_id,
        sender_type,
        text_type,
        text,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const senderDbId = await dbUtils.getUserDbId(req.user);
    const senderType = req.user["cognito:groups"][0]; // Keep original format: 'providers' or 'patients'
    
    const result = await db.query(query, [
      chatId,
      senderDbId,
      senderType,
      textType,
      text,
      sentAt,
    ]);
    
    // Add the sender's Cognito ID to the response for frontend compatibility
    const message = result.rows[0];
    message.sender_cognito_id = req.user.sub;
    
    return message;
    
  } catch (error) {
    console.error('Error in saveMessageToDb:', error);
    throw error;
  }
}

/**
 * Soft delete a message (mark as deleted)
 */
async function deleteMessageById({ messageId }) {
  try {
    const query = `
      UPDATE messages 
      SET deleted_at = NOW()
      WHERE id = $1
    `;
    
    await db.query(query, [messageId]);
    
  } catch (error) {
    console.error('Error in deleteMessageById:', error);
    throw error;
  }
}

/**
 * Update a message
 */
async function updateMessageById({ messageId, updates }) {
  try {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    
    const query = `
      UPDATE messages
      SET ${setClause}
      WHERE id = $${keys.length + 1}
    `;
    
    await db.query(query, [...values, messageId]);
    
  } catch (error) {
    console.error('Error in updateMessageById:', error);
    throw error;
  }
}

// ============================================
// PARTICIPANT MANAGEMENT FUNCTIONS  
// ============================================

/**
 * Update participant state (leave/rejoin, mute/unmute)
 */
async function updateParticipantById({ chatId, userId, updates }) {
  try {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    
    const query = `
      UPDATE chat_participant
      SET ${setClause}
      WHERE chat_id = $${keys.length + 1} AND participant_id = $${keys.length + 2}
    `;
    
    await db.query(query, [...values, chatId, userId]);
    
  } catch (error) {
    console.error('Error in updateParticipantById:', error);
    throw error;
  }
}

// ============================================
// FILE UPLOAD FUNCTIONS
// ============================================

/**
 * Upload file to S3 and return the key for database storage
 */
async function uploadFileToS3(req, res, key) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    // Upload to S3 chat bucket
    const uploadResult = await s3Service.uploadFile(file, key, process.env.S3_CHAT_BUCKET_NAME);
    
    return uploadResult.Key; // Return S3 key for database storage
    
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Cognito ID to Database ID
 */
async function cognitoIdToDbId(cognitoId) {
  try {
    // Try providers first
    let dbResult = await db.query('SELECT id FROM providers WHERE cognito_sub = $1', [cognitoId]);
    
    if (dbResult.rows.length === 0) {
      // If not a provider, try patients
      dbResult = await db.query('SELECT id FROM patients WHERE cognito_sub = $1', [cognitoId]);
    }
    
    if (dbResult.rows.length > 0) {
      return dbResult.rows[0].id;
    }
    
    throw new Error(`User not found with Cognito ID: ${cognitoId}`);
    
  } catch (error) {
    console.error('Error in cognitoIdToDbId:', error);
    throw error;
  }
}

/**
 * Format message for websocket transmission
 */
async function formatMessage(senderId, senderType, text, timestamp) {
  try {
    return {
      senderId,
      senderType,
      text,
      timestamp,
      id: uuidv4() // Generate temporary ID for websocket message
    };
  } catch (error) {
    console.error('Error in formatMessage:', error);
    throw error;
  }
}

/**
 * Delete entire chat (hard delete - use with caution)
 */
async function deleteChat({ chatId }) {
  try {
    // This will cascade delete messages and participants due to foreign key constraints
    await db.query('DELETE FROM chats WHERE id = $1', [chatId]);
    
  } catch (error) {
    console.error('Error in deleteChat:', error);
    throw error;
  }
}

/**
 * Legacy function - get chat by participants (kept for backward compatibility)
 */
async function getChatIdByParticipants(participant1Id, participant2Id) {
  try {
    // Convert Cognito IDs to database IDs
    const participant1DbId = await cognitoIdToDbId(participant1Id);
    const participant2DbId = await cognitoIdToDbId(participant2Id);

    const query = `
      SELECT chat_id
      FROM chat_participant
      WHERE participant_id IN ($1, $2) AND left_at IS NULL
      GROUP BY chat_id
      HAVING COUNT(*) = 2
    `;

    const result = await db.query(query, [participant1DbId, participant2DbId]);
    return result.rows.length > 0 ? result.rows[0].chat_id : null;
  } catch (error) {
    console.error('Error in getChatIdByParticipants:', error);
    return null;
  }
}

module.exports = {
  // Authentication & Authorization
  verifyChatMembership,
  checkChatMembership,
  verifyMessageOwnership,
  
  // Chat Management
  createOrGetChat,
  getChatIds,
  deleteChat,
  getChatIdByParticipants, // Legacy support
  
  // Message Functions
  getMessagesByChatId,
  saveMessageToDb,
  deleteMessageById,
  updateMessageById,
  
  // Participant Management
  updateParticipantById,
  
  // File Upload
  uploadFileToS3,
  
  // Helper Functions
  cognitoIdToDbId,
  formatMessage,
};

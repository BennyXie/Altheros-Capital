const chatService = require("../services/chatService");
const s3Service = require("../services/s3Service");
const dbUtils = require("../utils/dbUtils");
const db = require("../db/pool.js");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config({ path: "./.env" });

/**
 * Chat Controller - Handles HTTP endpoints for chat functionality
 * Separated from websocket logic as per requirements
 */

// ============================================
// HTTP ENDPOINT HANDLERS
// ============================================

/**
 * POST /api/chat
 * Create or get existing chat with participants
 * Body: { participants: [cognitoId1, cognitoId2, ...] }
 */
async function createOrGetChat(req, res) {
  try {
    const { participants } = req.body;
    
    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: "No participants provided" });
    }
    
    console.log('createOrGetChat: Original participants (Cognito IDs):', participants);
    
    // Convert Cognito IDs to database UUIDs
    const participantDbIds = [];
    
    for (const cognitoId of participants) {
      try {
        // Try to find provider first
        let dbResult = await db.query('SELECT id FROM providers WHERE cognito_sub = $1', [cognitoId]);
        
        if (dbResult.rows.length === 0) {
          // If not a provider, try patient
          dbResult = await db.query('SELECT id FROM patients WHERE cognito_sub = $1', [cognitoId]);
        }
        
        if (dbResult.rows.length > 0) {
          participantDbIds.push(dbResult.rows[0].id);
          console.log(`createOrGetChat: Converted ${cognitoId} -> ${dbResult.rows[0].id}`);
        } else {
          console.error(`createOrGetChat: Could not find user with Cognito ID: ${cognitoId}`);
          return res.status(404).json({ error: `User not found: ${cognitoId}` });
        }
      } catch (error) {
        console.error(`createOrGetChat: Error looking up user ${cognitoId}:`, error);
        return res.status(500).json({ error: `Error looking up user: ${cognitoId}` });
      }
    }
    
    // Add the current user's database ID
    const currentUserDbId = await dbUtils.getUserDbId(req.user);
    participantDbIds.push(currentUserDbId);
    
    console.log('createOrGetChat: Final participant DB IDs:', participantDbIds);
    
    // Remove duplicates
    const uniqueParticipantIds = [...new Set(participantDbIds)];
    
    const chat = await chatService.createOrGetChat(uniqueParticipantIds);
    
    res.status(201).json(chat);
    
  } catch (error) {
    console.error('Error in createOrGetChat:', error);
    res.status(500).json({ error: "Failed to create or get chat", details: error.message });
  }
}

/**
 * GET /api/chat
 * Get all chats for the current user
 */
async function getChatIds(req, res) {
  try {
    const userDbId = await dbUtils.getUserDbId(req.user);
    const chatIds = await chatService.getChatIds(userDbId);
    res.status(200).json(chatIds);
  } catch (error) {
    console.error('Error in getChatIds:', error);
    res.status(500).json({ error: "Failed to get chat IDs", details: error.message });
  }
}

/**
 * GET /api/chat/:chatId/messages
 * Get all messages for a specific chat
 * Includes signed CloudFront URLs for file content
 */
async function getChatMessagesByChatId(req, res) {
  try {
    const { chatId } = req.params;
    const messages = await chatService.getMessagesByChatId(chatId);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getChatMessagesByChatId:', error);
    res.status(500).json({ error: "Failed to get chat messages", details: error.message });
  }
}

/**
 * POST /api/chat/:chatId/message
 * Create a new message in a chat
 * Supports both text and file messages
 */
async function createMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const file = req.file;
    
    let textType = "string";
    let text = message;
    
    // Handle file upload
    if (file) {
      console.log('createMessage: File uploaded:', file.originalname, file.mimetype);
      
      // Generate unique S3 key
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const key = `chat/${chatId}/${timestamp}-${uuidv4()}${extension}`;
      
      try {
        // Upload to S3 chat bucket
        await s3Service.uploadToS3({
          fileBuffer: file.buffer,
          key: key,
          mimeType: file.mimetype,
          bucketName: process.env.S3_CHAT_BUCKET_NAME,
        });
        
        // Determine file type
        if (file.mimetype.startsWith('image/')) {
          textType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          textType = 'video';
        } else if (file.mimetype === 'application/pdf') {
          textType = 'pdf';
        } else {
          textType = 'document';
        }
        
        text = key; // Store S3 key in database
        
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        return res.status(500).json({ error: "File upload failed", details: uploadError.message });
      }
    }
    
    // Save message to database
    const messageObj = await chatService.saveMessageToDb(req, {
      chatId: chatId,
      textType: textType,
      text: text,
      sentAt: req.body.sentAt || new Date().toISOString(),
    });
    
    // For file messages, replace S3 key with signed URL in response
    if (textType !== "string") {
      messageObj.text = chatService.getSignedUrl ? 
        chatService.getSignedUrl(text) : 
        `${process.env.S3_CHAT_BUCKET_CDN_DOMAIN}/${text}`;
    }
    
    res.status(201).json(messageObj);
    
  } catch (error) {
    console.error('Error in createMessage:', error);
    res.status(500).json({ error: "Failed to create message", details: error.message });
  }
}

/**
 * PATCH /api/chat/:chatId/participants/me
 * Update current user's participation state (leave/rejoin, mute/unmute)
 */
async function updateParticipantState(req, res) {
  try {
    const { chatId } = req.params;
    const userId = await dbUtils.getUserDbId(req.user);
    const { leftAt, left_at, isMuted, is_muted } = req.body;

    const allowedUpdates = {
      left_at: leftAt || left_at,
      is_muted: isMuted || is_muted,
    };

    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    await chatService.updateParticipantById({ chatId, userId, updates });

    res.status(204).send();
    
  } catch (error) {
    console.error('Error in updateParticipantState:', error);
    res.status(500).json({ error: "Failed to update participant state", details: error.message });
  }
}

/**
 * PATCH /api/chat/message/:messageId
 * Update a message (currently supports soft delete)
 */
async function updateMessage(req, res) {
  try {
    const { messageId } = req.params;
    const { deletedAt } = req.body;

    const allowedUpdates = {
      deleted_at: deletedAt,
    };

    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    await chatService.updateMessageById({ messageId, updates });

    res.status(204).send();
    
  } catch (error) {
    console.error('Error in updateMessage:', error);
    res.status(500).json({ error: "Failed to update message", details: error.message });
  }
}

/**
 * DELETE /api/chat/message/:messageId
 * Soft delete a message
 */
async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    await chatService.deleteMessageById({ messageId });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({ error: "Failed to delete message", details: error.message });
  }
}

/**
 * DELETE /api/chat/:chatId
 * Hard delete a chat (use with caution)
 */
async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;
    await chatService.deleteChat({ chatId });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteChat:', error);
    res.status(500).json({ error: "Failed to delete chat", details: error.message });
  }
}

// ============================================
// WEBSOCKET EVENT HANDLERS (SEPARATED)
// ============================================

/**
 * Handle websocket join_chat event
 * Frontend emits: socket.emit("join_chat", { chatId: "uuid", timestamp: "ISO string" })
 * Or: socket.emit("join_chat", { providerId: "cognitoId", timestamp: "ISO string" })
 */
async function handleJoin(socket, data, timestamp) {
  try {
    const patientId = socket.user.sub;
    const patientName = socket.user.name;
    const { providerId, chatId } = data;

    let finalChatId;

    if (chatId) {
      // Direct chat room join by chatId
      console.log(`handleJoin: User ${patientId} trying to join chat room ${chatId}`);
      finalChatId = chatId;

      // Verify user is a member of this chat
      const isMember = await chatService.checkChatMembership(socket.user, chatId);
      
      if (!isMember) {
        console.error(`handleJoin: User ${patientId} is not a member of chat ${chatId}`);
        return;
      }
    } else if (providerId) {
      // Join/create chat with provider by cognitoId
      console.log(`handleJoin: Patient ${patientId} trying to join chat with provider ${providerId}`);
      
      finalChatId = await chatService.getChatIdByParticipants(patientId, providerId);
      
      if (!finalChatId) {
        console.error(`handleJoin: Chat not found for patient ${patientId} and provider ${providerId}`);
        return;
      }
    } else {
      console.error("handleJoin: Neither chatId nor providerId provided");
      return;
    }

    // Join the socket room
    socket.join(finalChatId);

    // Send join message to room
    const message = await chatService.formatMessage(
      patientId,
      socket.user.role,
      `${patientName} has joined the chat`,
      timestamp
    );
    
    socket.server.to(finalChatId).emit("receive_message", message);
    console.log(`${patientName} joined room ${finalChatId}`);
    
  } catch (error) {
    console.error("Error in handleJoin:", error);
  }
}

/**
 * Handle websocket send_message event
 * Frontend emits: socket.emit("send_message", { chatId: "uuid", text: "message", timestamp: "ISO string" })
 */
async function handleMessage(socket, data, io) {
  try {
    const { chatId, text, timestamp } = data;
    const senderId = socket.user.sub;
    const senderName = socket.user.name;

    // Verify membership
    const isMember = await chatService.checkChatMembership(socket.user, chatId);
    if (!isMember) {
      console.error(`handleMessage: User ${senderId} is not a member of chat ${chatId}`);
      return;
    }

    // Format message for broadcast
    const message = await chatService.formatMessage(senderId, socket.user.role, text, timestamp);

    // Broadcast to room
    io.to(chatId).emit("receive_message", {
      ...message,
      senderName,
      chatId
    });

    console.log(`Message sent in room ${chatId} by ${senderName}: ${text}`);
    
  } catch (error) {
    console.error("Error in handleMessage:", error);
  }
}

/**
 * Handle websocket disconnect event
 */
async function handleDisconnect(socket, io) {
  try {
    const name = socket.user?.name || 'Unknown user';
    console.log(`${name} disconnected`);
    
    // Clean up any room-specific state if needed
    // Note: socket.io automatically removes the socket from all rooms on disconnect
    
  } catch (error) {
    console.error("Error in handleDisconnect:", error);
  }
}

module.exports = {
  // HTTP Endpoints
  createOrGetChat,
  getChatIds,
  getChatMessagesByChatId,
  createMessage,
  updateParticipantState,
  updateMessage,
  deleteMessage,
  deleteChat,
  
  // WebSocket Handlers
  handleJoin,
  handleMessage,
  handleDisconnect,
};

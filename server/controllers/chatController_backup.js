const chatService = require("../services/chatService");
const s3Service = require("../services/s3Service");
const dbUtils = require("../utils/dbUtils");
const db = require("../db/pool.js");
const path = require("path");
require("dotenv").config({ path: "./.env" });

/**
 * Called when frontend emits join_chat event
 * Front end can emit:
 * socket.emit("join_chat", {
 *    providerId: "providerUUID", // for joining chat with specific provider
 *    chatId: "chatUUID", // for joining existing chat room
 *    timestamp: "timstamp" //ISO string
 * })
 */
async function handleJoin(socket, data, timestamp) {
  const patientId = socket.user.sub;
  const patientName = socket.user.name;
  const { providerId, chatId } = data;

  try {
    let finalChatId;

    if (chatId) {
      // Direct chat room join
      console.log(
        `handleJoin: Patient ${patientId} trying to join chat room ${chatId}`
      );
      console.log(`handleJoin: socket.user:`, socket.user);
      finalChatId = chatId;

      // Verify user is a member of this chat
      const isMember = await chatService.checkChatMembership(socket.user, chatId);
      
      if (!isMember) {
        console.error(
          `chatController: handleJoin - Patient ${patientId} is not a member of chat ${chatId}`
        );
        return;
      }
    } else if (providerId) {
      // Join/create chat with provider
      console.log(
        `handleJoin: Patient ${patientId} trying to join chat with provider ${providerId}`
      );
      finalChatId = await chatService.getChatIdByParticipants(
        patientId,
        providerId
      );
      if (!finalChatId) {
        console.error(
          `chatController: handleJoin - Chat not found for patient ${patientId} and provider ${providerId}`
        );
        return;
      }
    } else {
      console.error(
        "chatController: handleJoin - Neither chatId nor providerId provided"
      );
      return;
    }

    socket.join(finalChatId);

    const message = await chatService.formatMessage(
      patientId,
      socket.user.role,
      `${patientName} has joined the chat`,
      timestamp
    );
    socket.server.to(finalChatId).emit("receive_message", message);
    console.log(`${patientName} joined room ${finalChatId}`);
  } catch (error) {
    console.error("chatController: Error in handleJoin:", error);
  }
}

/**
 * Called when frontend emits "send_message" event
 * Front end must emit:
 * socket.emit("send_message", {
 * chatId: "room-abc123",         // same ID used in join_chat
 * text: "Hello, world!",         // message text
 * timestamp: "2025-07-03T23:59:59Z" // timestamp as ISO string
 * });
 */
async function handleMessage(socket, data, io) {
  const { chatId, textType, text, timestamp } = data;
  const sender = socket.user.name;

  const message =
    textType != "string"
      ? chatService.formatMessage(
          sender,
          await s3Service.getFromS3(text, process.env.S3_CHAT_BUCKET_NAME),
          timestamp
        )
      : chatService.formatMessage(sender, text, timestamp);

  // Send message to recipient
  io.to(chatId).emit("receive_message", message);

  // Emit notification to participants (except sender)
  const participants = await chatService.getChatParticipants(chatId);
  participants.forEach((participantId) => {
    if (participantId !== senderId) {
      io.to(participantId).emit("new_notification", {
        id: `${chatId}_${timestamp}`,
        type: "message",
        title: "New Message",
        message: text.length > 50 ? text.substring(0, 50) + "..." : text,
        chat_id: chatId,
        sender_id: senderId,
        sender_type: senderType,
        created_at: timestamp,
        is_read: false,
        link: `/chat/${senderId}`,
      });
    }
  });
}

/**
 * frontend doesn't need to do anything, runs auto
 */
async function handleDisconnect(socket, io) {
  const name = socket.user?.name;

  // for (const room of socket.rooms) {
  //   if (room === socket.id) continue; // Skip internal room

  //   const message = chatService.formatMessage(
  //     name,
  //     `${name} has left the chat`,
  //     timestamp
  //   );

  const message = await chatService.formatMessage(
    socket.user.sub,
    socket.user.role,
    `${name} has left the chat`,
    new Date().toISOString()
  );

  for (const room of socket.rooms) {
    io.to(room).emit("receive_message", message);
  }

  console.log(`${name} disconnected`);
}

async function createOrGetChat(req, res) {
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
  
  const chat = await chatService.createOrGetChat([...new Set(participantDbIds)]);
  res.status(201).json(chat);
}

// async function getChatMessages(req, res) {
//   const { providerId } = req.params;
//   const patientId = await dbUtils.getUserDbId(req.user);
//   console.log("chatController: getChatMessages - patientId:", patientId);
//   console.log("chatController: getChatMessages - providerId:", providerId);

//   if (!patientId) {
//     return res.status(400).json({ error: "Patient ID not found or invalid." });
//   }

//   try {
//     const chatId = await chatService.getChatIdByParticipants(patientId, providerId);
//     if (!chatId) {
//       return res.status(404).json({ error: "Chat not found for these participants." });
//     }

//     const messages = await chatService.getMessagesByChatId(chatId);
//     res.json(messages);
//   } catch (error) {
//     console.error("Error in getChatMessages:", error);
//     res.status(500).json({ error: "Failed to retrieve chat messages." });
//   }
// }

async function getChatMessagesByChatId(req, res) {
  const { chatId } = req.params;
  const messages = await chatService.getMessagesByChatId(chatId);
  res.status(200).json(messages);
}

async function deleteChat(req, res) {
  const { chatId } = req.params;
  await chatService.deleteChat(chatId);
  res.status(204).send();
}

async function getChatIds(req, res) {
  const userDbId = await dbUtils.getUserDbId(req.user);
  const chatIds = await chatService.getChatIds(userDbId);
  res.status(200).json(chatIds);
}

async function createMessage(req, res) {
  const { message } = req.body;
  const file = req.file;
  if (!file && !message) {
    return res.status(400).json({ error: "No file nor message provided" });
  } else if (file) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    req.textType = file.mimetype;
    const key = `users/${req.user.sub}/chats/${req.params.chatId}/${name}.${
      file.mimetype.split("/")[1]
    }`;
    req.text = key;
    await chatService.uploadFileToS3(req, res, key);
  } else {
    req.textType = "string";
    req.text = message;
  }

  const messageObj = await chatService.saveMessageToDb(req, {
    chatId: req.params.chatId,
    textType: req.textType,
    text: req.text,
    sentAt: req.body.sentAt,
  });

  res.status(201).json(messageObj);
}

async function deleteMessage(req, res) {
  const { messageId } = req.params;
  await chatService.deleteMessageById({
    messageId: messageId,
  });
  res.status(204).send();
}

async function updateParticipantState(req, res) {
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
}

async function updateMessage(req, res) {
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
}

module.exports = {
  handleJoin,
  handleMessage,
  handleDisconnect,
  createOrGetChat,
  deleteChat,
  // getChatMessages,
  getChatMessagesByChatId,
  getChatIds,
  createMessage,
  deleteMessage,
  updateMessage,
  updateParticipantState,
};

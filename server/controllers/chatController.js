const chatService = require("../services/chatService");
const dbUtils = require("../utils/dbUtils.js");
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
      console.log(`handleJoin: Patient ${patientId} trying to join chat room ${chatId}`);
      console.log(`handleJoin: socket.user:`, socket.user);
      finalChatId = chatId;
      
      // Verify user is a member of this chat - pass socket.user directly
      const isMember = await chatService.verifyChatMembership(socket.user, chatId);
      if (!isMember) {
        console.error(`chatController: handleJoin - Patient ${patientId} is not a member of chat ${chatId}`);
        return;
      }
    } else if (providerId) {
      // Join/create chat with provider
      console.log(`handleJoin: Patient ${patientId} trying to join chat with provider ${providerId}`);
      finalChatId = await chatService.getChatIdByParticipants(patientId, providerId);
      if (!finalChatId) {
        console.error(`chatController: handleJoin - Chat not found for patient ${patientId} and provider ${providerId}`);
        return;
      }
    } else {
      console.error('chatController: handleJoin - Neither chatId nor providerId provided');
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
function handleMessage(socket, data, io) {
  const { chatId, textType, text, timestamp } = data;
  const sender = socket.user.name;

  const message =
    textType != "string"
      ? chatService.formatMessage(
          sender,
          dbUtils.getFromS3(text, process.env.S3_CHAT_BUCKET_NAME),
          timestamp
        )
      : chatService.formatMessage(sender, text, timestamp);

  // Send message to recipient
  io.to(chatId).emit("receive_message", message);

  // Emit notification to participants (except sender)
  const participants = await chatService.getChatParticipants(chatId);
  participants.forEach(participantId => {
    if (participantId !== senderId) {
      io.to(participantId).emit("new_notification", {
        id: `${chatId}_${timestamp}`,
        type: 'message',
        title: 'New Message',
        message: text.length > 50 ? text.substring(0, 50) + '...' : text,
        chat_id: chatId,
        sender_id: senderId,
        sender_type: senderType,
        created_at: timestamp,
        is_read: false,
        link: `/chat/${senderId}`
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

  const message = await chatService.formatMessage(socket.user.sub, socket.user.role, `${name} has left the chat`, new Date().toISOString());

  for (const room of socket.rooms) {
    io.to(room).emit("receive_message", message);
  }

  console.log(`${name} disconnected`);
}

async function createOrGetChat(req, res) {
  const { participants } = req.body;
  // participants.push(dbUtils.getUserDbId(req.user));
  const chat = await chatService.createOrGetChat([...new Set(participants)]);
  res.json(chat);
}

async function getChatMessages(req, res) {
  const { providerId } = req.params;
  const patientId = await dbUtils.getUserDbId(req.user);
  console.log("chatController: getChatMessages - patientId:", patientId);
  console.log("chatController: getChatMessages - providerId:", providerId);

  if (!patientId) {
    return res.status(400).json({ error: "Patient ID not found or invalid." });
  }

  try {
    const chatId = await chatService.getChatIdByParticipants(patientId, providerId);
    if (!chatId) {
      return res.status(404).json({ error: "Chat not found for these participants." });
    }

    const messages = await chatService.getMessagesByChatId(chatId);
    res.json(messages);
  } catch (error) {
    console.error("Error in getChatMessages:", error);
    res.status(500).json({ error: "Failed to retrieve chat messages." });
  }
}

async function getChatMessagesByChatId(req, res) {
  const { chatId } = req.params;
  const messages = await chatService.getMessagesByChatId(chatId);
  res.json(messages);
}

async function deleteChat(req, res) {
  const { chatId } = req.params;
  const userDbId = await dbUtils.getUserDbId(req.user);
  await chatService.removeChatMemberShip(chatId, [userDbId]);
  res.status(204).send();
}

async function getChatIds(req, res) {
  const userDbId = dbUtils.getUserDbId(req.user);
  const chatIds = await chatService.getChatIds(userDbId);
  res.json(chatIds);
}

async function createMessage(req, res) {
  const { message } = req.body;
  const file = req.file;
  if (!file && !message) {
    return res.status(400).json({ error: "No file nor message provided" });
  } else if (file) {
    await chatService.uploadFileToS3(req, res);
    req.textType = file.mimetype;
    req.text = `${req.user.sub}/${req.params.chatId}/${file.originalname}.${
      file.mimetype.split("/")[1]
    }`;
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

  res.status(200).json(messageObj);
}

async function deleteMessage(req, res) {
  const { messageId } = req.params;
  const { deletedAt } = req.body;
  await chatService.deleteMessageById({
    deletedAt: deletedAt,
    messageId: messageId,
  });
  res.status(204).send();
}

module.exports = {
  handleJoin,
  handleMessage,
  handleDisconnect,
  createOrGetChat,
  deleteChat,
  getChatMessages,
  getChatMessagesByChatId,
  getChatIds,
  createMessage,
  deleteMessage,
};

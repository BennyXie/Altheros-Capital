import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextInput, Button, Group, Text, ScrollArea, Avatar } from '@mantine/core';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import styles from './ChatRoomPage.module.css';

const ChatRoomPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch messages
        console.log("ChatRoomPage: chatId before API call:", chatId);
        const messagesResponse = await apiClient.get(`/api/chat/room/${chatId}/messages`);
        setMessages(messagesResponse);

        // Fetch chat details (includes provider info)
        const chatDetailsResponse = await apiClient.getChatDetails(chatId);
        setChatDetails(chatDetailsResponse);
        console.log("ChatRoomPage: Chat details fetched:", chatDetailsResponse);
        console.log("ChatRoomPage: Other participant:", chatDetailsResponse?.otherParticipant);
        console.log("ChatRoomPage: Other participant avatar:", chatDetailsResponse?.otherParticipant?.avatar);
        
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: {
        token: user.idToken,
      },
    });

    socketRef.current.emit('join_chat', { 
      chatId,
      timestamp: new Date().toISOString()
    });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, user.idToken, user.sub]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        chatId,
        text: newMessage,
        senderId: user.sub,
        senderType: user.role,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className={styles.container}
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Text>Loading chat...</Text>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={styles.container}
    >
      {/* Chat Header with Provider Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Paper shadow="sm" p="lg" mb="lg" className={styles.chatHeader}>
          <Group>
            <Avatar 
              size="lg" 
              radius="xl" 
              src={chatDetails?.otherParticipant?.avatar || null}
              className={styles.providerAvatar}
            />
            <div>
              <Text weight={600} size="lg" className={styles.providerName}>
                {chatDetails?.otherParticipant ? 
                  `Chat with ${chatDetails.otherParticipant.name}` : 
                  'Chat with Provider'
                }
              </Text>
              <Text size="sm" className={styles.providerStatus}>
                {chatDetails?.otherParticipant?.type === 'provider' ? 
                  'Healthcare Provider' : 
                  'Online'
                }
              </Text>
            </div>
          </Group>
        </Paper>
      </motion.div>

      {/* Messages Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ flexGrow: 1 }}
      >
        <ScrollArea style={{ height: '100%' }} className={styles.messagesContainer}>
          <div className={styles.messagesWrapper}>
            {messages.map((msg, index) => {
              // Check various possible sender ID properties and compare with current user
              const messageSenderId = msg.sender_id || msg.senderId || msg.sender?.id || msg.sender?.sub;
              const currentUserId = user.sub;
              const isOwnMessage = messageSenderId === currentUserId;
              
              console.log('Message sender ID:', messageSenderId);
              console.log('Current user ID:', currentUserId);
              console.log('Is own message:', isOwnMessage);
              console.log('Full message object:', msg);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={`${styles.messageRow} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}
                >
                  <div className={styles.messageBubble}>
                    <Text size="sm" className={styles.messageText}>
                      {msg.text}
                    </Text>
                    <Text size="xs" className={styles.messageTime}>
                      {new Date(msg.sent_at || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Paper shadow="sm" p="md" className={styles.inputContainer}>
          <Group>
            <TextInput
              placeholder="Type a message..."
              className={styles.messageInput}
              value={newMessage}
              onChange={(e) => setNewMessage(e.currentTarget.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              size="md"
            />
            <Button 
              onClick={handleSendMessage}
              className={styles.sendButton}
              size="md"
            >
              Send
            </Button>
          </Group>
        </Paper>
      </motion.div>
    </motion.div>
  );
};

export default ChatRoomPage;

import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextInput, Button, Group, Text, ScrollArea, Avatar, ActionIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import styles from './ChatRoomPage.module.css';
import { IconTrash } from '@tabler/icons-react';

const ChatRoomPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const otherParticipant = messages.length > 0 ? messages.find(m => m.sender_id !== user.sub)?.sender : null;
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the new apiService method to get messages
        const messagesResponse = await apiService.getChatMessages(chatId);
        setMessages(messagesResponse.filter(msg => !msg.deleted_at));
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Connect to websocket for real-time updates
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: {
        token: user.idToken,
      },
    });

    // Join the chat room via websocket
    socketRef.current.emit('join_chat', { 
      chatId,
      timestamp: new Date().toISOString()
    });

    // Listen for new messages
    socketRef.current.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, user.idToken, user.sub]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || file) {
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('sentAt', new Date().toISOString());
      if (file) {
        formData.append('file', file);
      }

      try {
        // Use the new apiService method to send message
        const response = await apiService.sendMessage(chatId, formData);
        
        // Add the newly sent message to the local state immediately
        setMessages((prevMessages) => [...prevMessages, response]);
        setNewMessage('');
        setFile(null);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Use the new apiService method to delete message (soft delete)
      await apiService.deleteMessage(messageId, { deleted_at: new Date().toISOString() });
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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
              src={otherParticipant?.avatar || null}
              className={styles.providerAvatar}
            />
            <div>
              <Text weight={600} size="lg" className={styles.providerName}>
                {otherParticipant ? 
                  `Chat with ${otherParticipant.name}` : 
                  'Chat with Provider'
                }
              </Text>
              <Text size="sm" className={styles.providerStatus}>
                {otherParticipant?.type === 'provider' ? 
                  'Healthcare Provider' : 
                  'Online'
                }
              </Text>
            </div>
          </Group>
        </Paper>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ flexGrow: 1 }}
      >
        <ScrollArea style={{ height: '100%' }} className={styles.messagesContainer}>
          <div className={styles.messagesWrapper}>
            {messages.map((msg, index) => {
              const messageSenderId = msg.sender_id || msg.senderId || msg.sender?.id || msg.sender?.sub;
              const currentUserId = user.sub;
              const isOwnMessage = messageSenderId === currentUserId;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={`${styles.messageRow} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}
                >
                  <div className={styles.messageBubble}>
                    {msg.text_type === 'string' ? (
                      <Text size="sm" className={styles.messageText}>
                        {msg.text}
                      </Text>
                    ) : (
                      <img src={msg.text} alt="uploaded content" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                    )}
                    <Text size="xs" className={styles.messageTime}>
                      {new Date(msg.sent_at || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </div>
                  {isOwnMessage && (
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteMessage(msg.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>

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
            <input type="file" onChange={handleFileChange} />
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

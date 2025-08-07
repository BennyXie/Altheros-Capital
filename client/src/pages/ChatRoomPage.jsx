import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextInput, Button, Group, Text, ScrollArea, Avatar, ActionIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import styles from './ChatRoomPage.module.css';
import { IconTrash, IconUserCircle } from '@tabler/icons-react';

const ChatRoomPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingMessages, setDeletingMessages] = useState(new Set());
  const [imageError, setImageError] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get chat details including participants
        const chatDetails = await apiService.getChatDetails(chatId);
        console.log('ChatRoomPage: Fetched chat details:', chatDetails);
        
        if (chatDetails.otherParticipant) {
          const participant = chatDetails.otherParticipant;
          
          // Validate headshot URL if it's a provider
          let headshotUrl = null;
          if (participant.participant_type === 'provider' && participant.provider_headshot) {
            const isValidImageUrl = participant.provider_headshot && (
              participant.provider_headshot.startsWith('https://') && 
              !participant.provider_headshot.includes('example.com') &&
              !participant.provider_headshot.includes('mycdn.com') &&
              !participant.provider_headshot.includes('cdn.example.com') &&
              (
                participant.provider_headshot.includes('amazonaws.com') || 
                participant.provider_headshot.includes('cloudfront.net') || 
                participant.provider_headshot.includes('.s3.') || 
                /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(participant.provider_headshot)
              )
            );
            
            if (isValidImageUrl) {
              headshotUrl = participant.provider_headshot;
            }
          }
          
          setOtherParticipant({
            id: participant.participant_cognito_id,
            name: participant.participant_name,
            type: participant.participant_type,
            headshot: headshotUrl,
            title: participant.participant_type === 'provider' ? 
              (participant.provider_specialty ? 
                (Array.isArray(participant.provider_specialty) ? participant.provider_specialty.join(', ') : participant.provider_specialty) : 
                'Healthcare Provider'
              ) : 'Patient'
          });
        }
        
        // Get messages
        const messagesResponse = await apiService.getChatMessages(chatId);
        const validMessages = messagesResponse.filter(msg => !msg.deleted_at);
        setMessages(validMessages);
        
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

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Join the chat room via websocket
    socketRef.current.emit('join_chat', { 
      chatId,
      timestamp: new Date().toISOString()
    });

    console.log('Emitted join_chat for chatId:', chatId);

    // Listen for new messages
    socketRef.current.on('receive_message', (message) => {
      console.log('Received websocket message:', message);
      
      // Only add the message if it doesn't already exist (prevent duplicates)
      setMessages((prevMessages) => {
        const messageId = message.id || message.messageId;
        const exists = prevMessages.some(msg => 
          (msg.id || msg.messageId) === messageId
        );
        
        if (!exists) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
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
        await apiService.sendMessage(chatId, formData);
        
        // Clear the input immediately - the message will appear via websocket
        setNewMessage('');
        setFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    console.log('handleDeleteMessage called with messageId:', messageId);
    
    if (!messageId) {
      console.error('Cannot delete message: messageId is undefined');
      return;
    }
    
    // Prevent multiple simultaneous delete attempts for the same message
    if (deletingMessages.has(messageId)) {
      console.log('Delete already in progress for message:', messageId);
      return;
    }
    
    try {
      // Add to deleting set
      setDeletingMessages(prev => new Set(prev).add(messageId));
      
      // Use the new apiService method to delete message (soft delete)
      await apiService.deleteMessage(messageId, { deleted_at: new Date().toISOString() });
      
      // Remove the message from local state
      setMessages((prevMessages) => 
        prevMessages.filter((msg) => {
          const msgId = msg.id || msg.messageId;
          return msgId !== messageId;
        })
      );
      
      console.log('Message deleted successfully:', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      
      // Show user-friendly error message based on error type
      if (error.message?.includes('Message not found')) {
        console.log('Message was already deleted or does not exist');
        // Remove from local state anyway since it doesn't exist on server
        setMessages((prevMessages) => 
          prevMessages.filter((msg) => {
            const msgId = msg.id || msg.messageId;
            return msgId !== messageId;
          })
        );
      } else {
        // For other errors, you might want to show a toast notification
        console.log('Failed to delete message. Please try again.');
      }
    } finally {
      // Remove from deleting set
      setDeletingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log('File selected:', selectedFile?.name);
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
            {otherParticipant?.headshot && !imageError ? (
              <Avatar 
                size="lg" 
                radius="xl" 
                src={otherParticipant.headshot}
                className={styles.providerAvatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <Avatar 
                size="lg" 
                radius="xl" 
                className={styles.providerAvatar}
              >
                <IconUserCircle size={32} />
              </Avatar>
            )}
            <div style={{ flex: 1 }}>
              <Text weight={600} size="lg" className={styles.providerName}>
                {otherParticipant ? 
                  `Chat with ${otherParticipant.name}` : 
                  'Chat with Provider'
                }
              </Text>
              <Text size="sm" className={styles.providerStatus}>
                {otherParticipant?.type === 'provider' ? 
                  (otherParticipant.title || 'Healthcare Provider') : 
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
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <ScrollArea className={styles.messagesContainer}>
          <div className={styles.messagesWrapper}>
            {messages.map((msg, index) => {
              const messageSenderId = msg.sender_cognito_id || msg.senderId || msg.sender?.id || msg.sender?.sub;
              const currentUserId = user.sub;
              const isOwnMessage = messageSenderId === currentUserId;
              
              // Get consistent message ID
              const messageId = msg.id || msg.messageId;
              
              // Check if this is a valid message with required data
              if (!msg.text && !msg.text_type) {
                console.warn('Invalid message data:', msg);
                return null;
              }
              
              // Handle messages with missing or invalid text_type
              const textType = msg.text_type || 'string';
              
              return (
                <motion.div
                  key={messageId || `msg-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={`${styles.messageRow} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}
                >
                  <div className={styles.messageBubble}>
                    {textType === 'string' ? (
                      <Text size="sm" className={styles.messageText}>
                        {msg.text || '[Empty message]'}
                      </Text>
                    ) : textType === 'image' ? (
                      <div>
                        <img 
                          src={msg.text} 
                          alt="Shared image" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', msg.text);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <Text 
                          size="sm" 
                          className={styles.messageText}
                          style={{ display: 'none', fontStyle: 'italic' }}
                        >
                          📷 Image (unable to display)
                        </Text>
                      </div>
                    ) : textType === 'document' || textType === 'pdf' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text size="sm" className={styles.messageText}>
                          📄 Document shared
                        </Text>
                        {msg.text && (
                          <a 
                            href={msg.text} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: isOwnMessage ? 'white' : 'var(--mint-primary)',
                              textDecoration: 'underline'
                            }}
                          >
                            View
                          </a>
                        )}
                      </div>
                    ) : textType === 'video' ? (
                      <div>
                        <video 
                          src={msg.text}
                          controls
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            console.error('Video failed to load:', msg.text);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        >
                          Your browser does not support video playback.
                        </video>
                        <Text 
                          size="sm" 
                          className={styles.messageText}
                          style={{ display: 'none', fontStyle: 'italic' }}
                        >
                          🎥 Video (unable to display)
                        </Text>
                      </div>
                    ) : (
                      <Text size="sm" className={styles.messageText} style={{ fontStyle: 'italic' }}>
                        📎 File shared (type: {textType})
                        {!msg.text && ' - File unavailable'}
                      </Text>
                    )}
                    <Text size="xs" className={styles.messageTime}>
                      {new Date(msg.sent_at || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </div>
                  {isOwnMessage && messageId && (
                    <ActionIcon 
                      size="sm" 
                      variant="subtle" 
                      color="red" 
                      onClick={() => handleDeleteMessage(messageId)}
                      style={{ marginLeft: '8px' }}
                      title="Delete message"
                      disabled={deletingMessages.has(messageId)}
                      loading={deletingMessages.has(messageId)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </motion.div>
              );
            }).filter(Boolean)}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
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
            <input 
              type="file" 
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="file-input"
            />
            <Button 
              variant="light"
              size="md"
              onClick={() => document.getElementById('file-input').click()}
            >
              📎 {file ? file.name : 'Attach'}
            </Button>
            {file && (
              <Button 
                variant="subtle"
                size="sm"
                color="red"
                onClick={() => {
                  setFile(null);
                  document.getElementById('file-input').value = '';
                }}
              >
                ✕ Remove
              </Button>
            )}
            <Button 
              onClick={handleSendMessage}
              className={styles.sendButton}
              size="md"
              disabled={!newMessage.trim() && !file}
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

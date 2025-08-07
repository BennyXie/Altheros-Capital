import React, { useState, useEffect } from 'react';
import { Container, Title, Card, Text, Group, Avatar, Button, Loader, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import styles from './ChatSelectionPage.module.css';

const ChatSelectionPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      // Get chat IDs with participant information
      const response = await apiService.getChatIds();
      console.log('ChatSelectionPage: Raw chat response:', response);
      
      // Process chat rooms and get participant details from recent messages
      const chatRoomsWithDetails = await Promise.all(
        response.map(async (chat) => {
          try {
            // Get recent messages to find participant information
            let participantDetails = [];
            
            try {
              const messages = await apiService.getChatMessages(chat.chat_id);
              const currentUserId = user.sub;
              
              // Find unique participants from messages (excluding current user)
              const participantMap = new Map();
              
              messages.forEach(msg => {
                const senderId = msg.sender_cognito_id || msg.senderId;
                if (senderId && senderId !== currentUserId && !participantMap.has(senderId)) {
                  participantMap.set(senderId, {
                    id: senderId,
                    name: msg.sender_name || `User ${senderId.substring(0, 8)}`,
                    avatar: null, // We could add avatar support later
                    type: msg.sender_type === 'provider' ? 'provider' : 'patient',
                    profile: null
                  });
                }
              });
              
              participantDetails = Array.from(participantMap.values());
            } catch (messageError) {
              console.error('Error fetching messages for chat:', chat.chat_id, messageError);
              // Fallback to using otherParticipants from chat response
              participantDetails = (chat.otherParticipants || []).map(participantId => ({
                id: participantId,
                name: `User ${participantId.substring(0, 8)}`,
                avatar: null,
                type: 'user',
                profile: null
              }));
            }
            
            return {
              id: chat.chat_id,
              participants: participantDetails,
              otherUser: participantDetails.length > 0 ? participantDetails[0] : { 
                name: 'Unknown User', 
                avatar: null,
                type: 'user',
                id: 'unknown'
              },
              lastMessage: chat.lastMessage
            };
          } catch (error) {
            console.error('Error processing chat:', chat.chat_id, error);
            return {
              id: chat.chat_id,
              participants: [],
              otherUser: { 
                name: 'Chat Room', 
                avatar: null,
                type: 'user',
                id: 'error'
              },
              lastMessage: chat.lastMessage
            };
          }
        })
      );
      
      console.log('ChatSelectionPage: Processed chat rooms:', chatRoomsWithDetails);
      setChatRooms(chatRoomsWithDetails);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const handleLeaveChat = async (chatId, event) => {
    event.preventDefault(); // Prevent navigation when clicking Leave button
    event.stopPropagation();
    
    try {
      // Use the new apiService method to update participant state (leave chat)
      await apiService.updateParticipantState(chatId, { leftAt: new Date().toISOString() });
      
      // Refetch chat rooms to ensure consistency with server
      await fetchChatRooms();
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  if (loading) {
    return (
      <Container className={styles.container}>
        <Stack align="center" justify="center" style={{ minHeight: '400px' }}>
          <Loader size="lg" />
          <Text>Loading your chats...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Container className={styles.container}>
        <Title order={1} className={styles.title}>Your Chats</Title>
        {chatRooms.length === 0 ? (
          <Card withBorder radius="md" p="xl">
            <Stack align="center">
              <Text size="lg" c="dimmed">No active chats</Text>
              <Text size="sm" c="dimmed">Start a conversation with a provider to see your chats here.</Text>
            </Stack>
          </Card>
        ) : (
          <div className={styles.chatList}>
            {chatRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  withBorder 
                  radius="md" 
                  p="lg" 
                  className={styles.chatCard}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleChatClick(room.id)}
                >
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={room.otherUser.avatar} radius="xl" size="md" />
                      <div>
                        <Text fw={500}>{room.otherUser.name}</Text>
                        <Text size="sm" c="dimmed">
                          {room.lastMessage && room.lastMessage.text ? 
                            (room.lastMessage.text.length > 50 ? 
                              room.lastMessage.text.substring(0, 50) + '...' : 
                              room.lastMessage.text
                            ) : 
                            'No messages yet'
                          }
                        </Text>
                        {room.lastMessage && (
                          <Text size="xs" c="dimmed">
                            {new Date(room.lastMessage.timestamp).toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    </Group>
                    <Button 
                      color="red" 
                      variant="light"
                      size="sm"
                      onClick={(e) => handleLeaveChat(room.id, e)}
                    >
                      Leave
                    </Button>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default ChatSelectionPage;

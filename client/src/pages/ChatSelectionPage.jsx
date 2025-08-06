import React, { useState, useEffect } from 'react';
import { Container, Title, Card, Text, Group, Avatar, Button, Loader, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
      
      // Process chat rooms and fetch participant details
      const chatRoomsWithDetails = await Promise.all(
        response.map(async (chat) => {
          try {
            // For each other participant, fetch their profile information
            const participantDetails = await Promise.all(
              (chat.otherParticipants || []).map(async (participantId) => {
                  try {
                    // Try to fetch provider profile first, then patient profile
                    let profile = null;
                    let userType = 'user';
                    
                    try {
                      const headers = await apiService.getAuthHeaders();
                      const providerResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/public/provider/${participantId}`, {
                        headers
                      });
                      if (providerResponse.ok) {
                        profile = await providerResponse.json();
                        userType = 'provider';
                      }
                    } catch (err) {
                      // Silently continue to patient lookup
                    }                    if (!profile) {
                      try {
                        const headers = await apiService.getAuthHeaders();
                        const patientResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/public/patient/${participantId}`, {
                          headers
                        });
                        if (patientResponse.ok) {
                          profile = await patientResponse.json();
                          userType = 'patient';
                        }
                      } catch (err) {
                        // Silently continue to fallback
                      }
                    }
                    
                    // If still no profile found, return a fallback user
                    if (!profile) {
                      return {
                        id: participantId,
                        name: `Unknown User`,
                        avatar: null,
                        type: 'user',
                        profile: null
                      };
                    }                  return {
                    id: participantId,
                    name: profile ? `${profile.first_name} ${profile.last_name}` : `User ${participantId.substring(0, 8)}`,
                    avatar: profile?.headshot_url || null,
                    type: userType,
                    profile
                  };
                } catch (error) {
                  console.error('Error fetching participant details:', participantId, error);
                  return {
                    id: participantId,
                    name: `User ${participantId.substring(0, 8)}`,
                    avatar: null,
                    type: 'user'
                  };
                }
              })
            );
            
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
  }, []);

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

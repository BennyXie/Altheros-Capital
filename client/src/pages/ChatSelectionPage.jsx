import React, { useState, useEffect } from 'react';
import { Container, Title, Card, Text, Group, Avatar, Button } from '@mantine/core';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import styles from './ChatSelectionPage.module.css';

const ChatSelectionPage = () => {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await apiClient.get('/chat/rooms');
        setChatRooms(response);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      }
    };

    fetchChatRooms();
  }, []);

  const handleDeleteChat = async (chatId) => {
    try {
      await apiClient.delete(`/chat/${chatId}`);
      setChatRooms((prevChatRooms) => prevChatRooms.filter((room) => room.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Container className={styles.container}>
        <Title order={1} className={styles.title}>Chat Rooms</Title>
        <div className={styles.chatList}>
          {chatRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card withBorder radius="md" p="lg" className={styles.chatCard} component={Link} to={`/chat/${room.id}`}>
                <Group position="apart">
                  <Group>
                    <Avatar src={room.otherUser.avatar} radius="xl" />
                    <div>
                      <Text weight={500}>{room.otherUser.name}</Text>
                      <Text size="sm" color="dimmed">
                        {room.lastMessage ? room.lastMessage.text : 'No messages yet'}
                      </Text>
                    </div>
                  </Group>
                  <Button color="red" onClick={(e) => {
                    e.preventDefault(); // Prevent Link navigation
                    handleDeleteChat(room.id);
                  }}>Delete</Button>
                </Group>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.div>
  );
};

export default ChatSelectionPage;

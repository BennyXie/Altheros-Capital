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
        const response = await apiClient.get('/api/chat');
        setChatRooms(response.filter(room => !room.left_at));
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      }
    };

    fetchChatRooms();
  }, []);

  const handleLeaveChat = async (chatId) => {
    try {
      await apiClient.patch(`/api/chat/${chatId}/participants/me`, { left_at: new Date().toISOString() });
      setChatRooms((prevChatRooms) => prevChatRooms.filter((room) => room.id !== chatId));
    } catch (error) {
      console.error('Error leaving chat:', error);
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
              <Card withBorder radius="md" p="lg" className={styles.chatCard}>
                <Group position="apart">
                  <Link to={`/chat/${room.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <Avatar src={room.otherUser.avatar} radius="xl" />
                    <div style={{ marginLeft: '1rem' }}>
                      <Text weight={500}>{room.otherUser.name}</Text>
                      <Text size="sm" color="dimmed">
                        {room.lastMessage ? room.lastMessage.text : 'No messages yet'}
                      </Text>
                    </div>
                  </Link>
                  <Button color="red" onClick={() => handleLeaveChat(room.id)}>Leave</Button>
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

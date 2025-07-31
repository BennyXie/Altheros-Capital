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
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get(`/chat/${chatId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: {
        token: user.jwtToken,
      },
    });

    socketRef.current.emit('join_chat', { chatId });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, user.jwtToken]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        chatId,
        text: newMessage,
        sender: user.attributes.sub,
      };
      socketRef.current.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.container}>
      <ScrollArea style={{ flexGrow: 1 }}>
        <Paper shadow="xs" p="md" className={styles.messageContainer}>
          {messages.map((msg, index) => (
            <Group key={index} my="sm" grow>
              <Avatar src={msg.sender.avatar} radius="xl" />
              <div>
                <Text size="sm">{msg.sender.name}</Text>
                <Text size="md" p="xs" style={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}>
                  {msg.text}
                </Text>
              </div>
            </Group>
          ))}
        </Paper>
      </ScrollArea>
      <Group className={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          className={styles.messageInput}
          value={newMessage}
          onChange={(e) => setNewMessage(e.currentTarget.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </Group>
    </motion.div>
  );
};

export default ChatRoomPage;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Button,
  Badge,
  ActionIcon,
  Loader,
  ScrollArea,
  Menu
} from '@mantine/core';
import {
  IconBell,
  IconBellRinging,
  IconCheck,
  IconTrash,
  IconDots,
  IconCheckupList,
  IconX
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { notifications as mantineNotifications } from '@mantine/notifications';
import apiClient from '../utils/apiClient';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotificationsPage Component
 * 
 * Page for displaying and managing user notifications
 */
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      mantineNotifications.show({
        title: 'Error',
        message: 'Failed to load notifications',
        color: 'red',
        icon: <IconX size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [notificationId]: true }));
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      mantineNotifications.show({
        title: 'Success',
        message: 'Notification marked as read',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      mantineNotifications.show({
        title: 'Error',
        message: 'Failed to mark notification as read',
        color: 'red',
        icon: <IconX size={16} />
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/api/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
      
      mantineNotifications.show({
        title: 'Success',
        message: 'All notifications marked as read',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      mantineNotifications.show({
        title: 'Error',
        message: 'Failed to mark all notifications as read',
        color: 'red',
        icon: <IconX size={16} />
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [notificationId]: true }));
      await apiClient.delete(`/api/notifications/${notificationId}`);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      mantineNotifications.show({
        title: 'Success',
        message: 'Notification deleted',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      mantineNotifications.show({
        title: 'Error',
        message: 'Failed to delete notification',
        color: 'red',
        icon: <IconX size={16} />
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  // Get notification type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  // Get notification type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <IconCheck size={16} />;
      case 'warning': return <IconBellRinging size={16} />;
      case 'error': return <IconX size={16} />;
      default: return <IconBell size={16} />;
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  return (
    <Container size="md" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={1}>
                <Group gap="sm" align="center">
                  <IconBell size={32} />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge size="lg" color="red" variant="filled">
                      {unreadCount}
                    </Badge>
                  )}
                </Group>
              </Title>
              <Text c="dimmed" size="lg" mt={5}>
                Stay updated with your health journey
              </Text>
            </div>
            
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                variant="light"
                leftSection={<IconCheckupList size={16} />}
                onClick={markAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </Group>

          {/* Loading State */}
          {loading && (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Group justify="center">
                <Loader size="lg" />
                <Text>Loading notifications...</Text>
              </Group>
            </Card>
          )}

          {/* Empty State */}
          {!loading && notifications.length === 0 && (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Stack align="center" gap="md">
                <IconBell size={64} color="gray" />
                <div style={{ textAlign: 'center' }}>
                  <Title order={3} c="dimmed">No notifications yet</Title>
                  <Text c="dimmed">
                    You'll see important updates and alerts here
                  </Text>
                </div>
              </Stack>
            </Card>
          )}

          {/* Notifications List */}
          {!loading && notifications.length > 0 && (
            <ScrollArea.Autosize maxHeight="70vh">
              <Stack gap="md">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{
                        backgroundColor: notification.is_read ? 'white' : '#f8f9fa',
                        borderLeft: notification.is_read 
                          ? '4px solid #e9ecef' 
                          : `4px solid var(--mantine-color-${getTypeColor(notification.type)}-6)`
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Group align="flex-start" style={{ flex: 1 }}>
                          <Badge
                            color={getTypeColor(notification.type)}
                            variant="light"
                            leftSection={getTypeIcon(notification.type)}
                          >
                            {notification.type}
                          </Badge>
                          
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group justify="space-between" align="center">
                              <Title order={4}>{notification.title}</Title>
                              {!notification.is_read && (
                                <Badge size="xs" color="red" variant="filled">
                                  New
                                </Badge>
                              )}
                            </Group>
                            
                            <Text size="sm" c="dimmed">
                              {notification.message}
                            </Text>
                            
                            <Group gap="xs">
                              <Text size="xs" c="dimmed">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </Text>
                              {notification.is_read && notification.read_at && (
                                <>
                                  <Text size="xs" c="dimmed">•</Text>
                                  <Text size="xs" c="dimmed">
                                    Read {formatDistanceToNow(new Date(notification.read_at), { addSuffix: true })}
                                  </Text>
                                </>
                              )}
                            </Group>
                            
                            {notification.action_url && (
                              <Button
                                size="xs"
                                variant="light"
                                component="a"
                                href={notification.action_url}
                              >
                                Take Action
                              </Button>
                            )}
                          </Stack>
                        </Group>
                        
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          
                          <Menu.Dropdown>
                            {!notification.is_read && (
                              <Menu.Item
                                leftSection={<IconCheck size={16} />}
                                onClick={() => markAsRead(notification.id)}
                                disabled={actionLoading[notification.id]}
                              >
                                Mark as Read
                              </Menu.Item>
                            )}
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => deleteNotification(notification.id)}
                              disabled={actionLoading[notification.id]}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </Stack>
      </motion.div>
    </Container>
  );
};

export default NotificationsPage;

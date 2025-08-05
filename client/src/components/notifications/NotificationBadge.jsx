import React from 'react';
import { 
  ActionIcon, 
  Indicator, 
  Menu, 
  Stack, 
  Text, 
  Group, 
  Badge, 
  Button, 
  Divider,
  ScrollArea
} from '@mantine/core';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

/**
 * NotificationBadge Component
 * 
 * Bell icon with notification count badge and dropdown preview
 */
const NotificationBadge = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  
  // Get latest 5 notifications for preview
  const recentNotifications = (notifications || []).slice(0, 5);

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <Menu 
      shadow="md" 
      width={360} 
      position="bottom-end"
      offset={5}
    >
      <Menu.Target>
        <Indicator 
          inline 
          label={unreadCount > 0 ? unreadCount : null} 
          size={16}
          color="red"
          disabled={unreadCount === 0}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            color="gray"
            style={{
              '&:hover': {
                backgroundColor: 'var(--mantine-color-gray-1)'
              }
            }}
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 2, repeatDelay: 3 }}
            >
              <IconBell size={20} />
            </motion.div>
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Group justify="space-between" align="center">
            <Text fw={500} size="sm">
              Notifications
              {unreadCount > 0 && (
                <Badge size="xs" color="red" variant="filled" ml="xs">
                  {unreadCount}
                </Badge>
              )}
            </Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="subtle"
                onClick={handleMarkAllAsRead}
                leftSection={<IconCheck size={12} />}
              >
                Mark all read
              </Button>
            )}
          </Group>
        </div>

        <ScrollArea.Autosize mah={400} type="never">
          {recentNotifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <IconBell size={32} color="var(--mantine-color-gray-5)" />
              <Text size="sm" c="dimmed" mt="sm">
                No notifications yet
              </Text>
            </div>
          ) : (
            <Stack gap={0}>
              {recentNotifications.map((notification, index) => (
                <Menu.Item
                  key={notification.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < recentNotifications.length - 1 
                      ? '1px solid var(--mantine-color-gray-2)' 
                      : 'none',
                    backgroundColor: notification.is_read 
                      ? 'transparent' 
                      : 'var(--mantine-color-blue-0)',
                    minHeight: 'auto'
                  }}
                >
                  <Group align="flex-start" justify="space-between" gap="xs">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group justify="space-between" align="center">
                        <Text size="sm" fw={500} lineClamp={1}>
                          {notification.title}
                        </Text>
                        {!notification.is_read && (
                          <Badge size="xs" color="red" variant="filled">
                            New
                          </Badge>
                        )}
                      </Group>
                      
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.message}
                      </Text>
                      
                      <Group gap="xs" align="center">
                        <Badge 
                          size="xs" 
                          color={getNotificationColor(notification.type)}
                          variant="dot"
                        >
                          {notification.type}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Text>
                      </Group>
                    </Stack>
                    
                    {!notification.is_read && (
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="blue"
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                      >
                        <IconCheck size={12} />
                      </ActionIcon>
                    )}
                  </Group>
                </Menu.Item>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {recentNotifications.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '8px' }}>
              <Button
                component={Link}
                to="/notifications"
                variant="subtle"
                size="sm"
                fullWidth
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default NotificationBadge;

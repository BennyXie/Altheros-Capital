/**
 * Provider Dashboard Page Component
 * 
 * Main dashboard for healthcare providers
 */

import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Grid, Card, Stack, Button, Group, Avatar, Badge, Progress, Loader } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconUser, IconBell, IconSettings, IconStethoscope, IconCalendar, IconUsers, IconMessageCircle, IconClipboardList } from '@tabler/icons-react';
import apiClient from '../utils/apiClient';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';

/**
 * Provider Dashboard Page Component
 * 
 * Main dashboard for healthcare providers
 */
const ProviderDashboard = () => {
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState({ isProfileComplete: false, hasDatabaseEntry: false });
  const [isLoadingProfileStatus, setIsLoadingProfileStatus] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setIsLoadingProfileStatus(false);
        return;
      }

      try {
        const response = await apiClient.get('/api/profile/status');
        setProfileStatus(response);
      } catch (error) {
        console.error("Error checking provider profile status:", error);
        notifications.show({
          title: 'Profile Status Error',
          message: 'Failed to load provider profile status.',
          color: 'red',
        });
        setProfileStatus({ isProfileComplete: false, hasDatabaseEntry: false }); // Assume incomplete on error
      } finally {
        setIsLoadingProfileStatus(false);
      }
    };

    checkProfile();
  }, [user]);

  if (isLoadingProfileStatus) {
    return (
      <Container size="xl" py={40} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  

  const profileActionText = profileStatus.hasDatabaseEntry ? 'Update Profile' : 'Complete Profile';
  const profileActionPath = profileStatus.hasDatabaseEntry ? '/provider-update-profile' : '/provider-complete-profile';

  return (
    <Container size="xl" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="lg">
          {/* Welcome Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={1}>Welcome to Your Provider Dashboard</Title>
              <Text c="dimmed" size="lg" mt={5}>
                Manage your practice with Altheros Capital
              </Text>
            </div>
            <Avatar size="lg" radius="xl" color="blue">
              <IconStethoscope size={24} />
            </Avatar>
          </Group>

          {/* Dashboard Cards Grid */}
          <Grid>
            {/* Complete Account Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">{profileActionText}</Text>
                      {!profileStatus.hasDatabaseEntry && <Badge color="orange" variant="light">Action Needed</Badge>}
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <Text size="sm" c="dimmed">
                        {profileStatus.hasDatabaseEntry
                          ? 'Your profile is complete. You can update it at any time.'
                          : 'Complete your provider setup to be visible to patients and access all features.'}
                      </Text>
                    </div>
                    
                    <Stack gap="xs">
                      <Progress value={profileStatus.hasDatabaseEntry ? 100 : 25} color={profileStatus.hasDatabaseEntry ? "green" : "orange"} size="sm" />
                      <Text size="xs" c="dimmed">{profileStatus.hasDatabaseEntry ? '100% Complete' : '25% Complete'}</Text>
                      
                      <Button 
                        component={Link}
                        to={profileActionPath}
                        variant="filled"
                        color="blue"
                        leftSection={<IconUser size={16} />}
                        size="sm"
                      >
                        {profileActionText}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
            {/* Schedule Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Schedule</Text>
                      <IconCalendar size={20} color="green" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      View and manage your appointment schedule.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="green"
                        leftSection={<IconCalendar size={16} />}
                        size="sm"
                        component={Link}
                        to="/appointments"
                      >
                        View Schedule
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Patient List Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Patient List</Text>
                      <IconUsers size={20} color="blue" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      View and manage your active patients.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="blue"
                        leftSection={<IconUsers size={16} />}
                        disabled
                        size="sm"
                      >
                        Patient List
                      </Button>
                      <Text size="xs" c="dimmed">Coming soon</Text>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Medical Records Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Medical Records</Text>
                      <IconClipboardList size={20} color="violet" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Access and manage patient medical records.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="violet"
                        leftSection={<IconClipboardList size={16} />}
                        disabled
                        size="sm"
                      >
                        Medical Records
                      </Button>
                      <Text size="xs" c="dimmed">Coming soon</Text>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Notifications Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Notifications</Text>
                      <IconBell size={20} color="yellow" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Stay updated with important notifications and alerts.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="yellow"
                        leftSection={<IconBell size={16} />}
                        disabled
                        size="sm"
                      >
                        View Notifications
                      </Button>
                      <Text size="xs" c="dimmed">Coming soon</Text>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Chats Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Chats</Text>
                      <IconMessageCircle size={20} color="teal" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Communicate with your patients.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="teal"
                        leftSection={<IconMessageCircle size={16} />}
                        component={Link}
                        to="/chats"
                        size="sm"
                      >
                        View Chats
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Settings Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Account Settings</Text>
                      <IconSettings size={20} color="gray" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Manage your account preferences and practice settings.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="gray"
                        leftSection={<IconSettings size={16} />}
                        disabled
                        size="sm"
                      >
                        View Settings
                      </Button>
                      <Text size="xs" c="dimmed">Coming soon</Text>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
          </Grid>

          {/* Quick Actions */}
          <Card shadow="sm" padding="lg" radius="md" withBorder mt={20}>
            <Group justify="space-between" align="center">
              <div>
                <Text fw={500} size="lg">Quick Actions</Text>
                <Text size="sm" c="dimmed">
                  Get started with the most important tasks
                </Text>
              </div>
              <Group>
                <Button 
                  component={Link}
                  to={profileActionPath}
                  variant="filled"
                  color="blue"
                >
                  {profileActionText}
                </Button>
                <Button 
                  component={Link}
                  to="/"
                  variant="outline"
                  color="gray"
                >
                  Back to Home
                </Button>
              </Group>
            </Group>
          </Card>
        </Stack>
      </motion.div>
    </Container>
  );
};

export default ProviderDashboard;

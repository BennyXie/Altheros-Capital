import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Grid, Card, Stack, Button, Group, Avatar, Badge, Progress, Loader } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconUser, IconBell, IconSettings, IconHeart, IconCalendar, IconClipboardList } from '@tabler/icons-react';
import apiClient from '../utils/apiClient';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';

/**
 * User Dashboard Page Component
 * 
 * Main dashboard page for logged-in users
 */
const DashboardPage = () => {
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
        console.error("Error checking patient profile status:", error);
        notifications.show({
          title: 'Profile Status Error',
          message: 'Failed to load patient profile status.',
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
  const profileActionPath = profileStatus.hasDatabaseEntry ? '/update-profile' : '/complete-profile';


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
              <Title order={1}>Welcome to Your Dashboard</Title>
              <Text c="dimmed" size="lg" mt={5}>
                Manage your health journey with Altheros Capital
              </Text>
            </div>
            <Avatar size="lg" radius="xl" color="blue">
              <IconUser size={24} />
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
                          : 'Complete your account setup to unlock all features and get personalized healthcare recommendations.'}
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

            {/* Health Overview Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Health Overview</Text>
                      <IconHeart size={20} color="red" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Track your health metrics and view your wellness journey.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="red"
                        leftSection={<IconHeart size={16} />}
                        disabled
                        size="sm"
                      >
                        View Health Data
                      </Button>
                      <Text size="xs" c="dimmed">Complete profile to unlock</Text>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Appointments Card */}
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">Appointments</Text>
                      <IconCalendar size={20} color="green" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Schedule and manage your healthcare appointments.
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
                        Manage Appointments
                      </Button>
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
                      <IconClipboardList size={20} color="blue" />
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="md" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text size="sm" c="dimmed">
                      Access and manage your medical records securely.
                    </Text>
                    
                    <Stack gap="xs">
                      <Button 
                        variant="light"
                        color="blue"
                        leftSection={<IconClipboardList size={16} />}
                        disabled
                        size="sm"
                      >
                        View Records
                      </Button>
                      <Text size="xs" c="dimmed">Complete profile to unlock</Text>
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
                      Stay updated with important health reminders and alerts.
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
                      <Text size="xs" c="dimmed">Complete profile to unlock</Text>
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
                      Manage your account preferences and privacy settings.
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
                      <Text size="xs" c="dimmed">Complete profile to unlock</Text>
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

export default DashboardPage;


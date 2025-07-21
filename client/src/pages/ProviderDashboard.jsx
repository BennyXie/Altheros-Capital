/**
 * Provider Dashboard Page Component
 * 
 * Main dashboard for healthcare providers
 */

import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Stack, Card, Group, SimpleGrid, Button, Loader } from '@mantine/core';
import { IconStethoscope, IconCalendar, IconUsers, IconChartLine } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ProviderCompleteProfilePage from './ProviderCompleteProfilePage';
import apiClient from '../utils/apiClient';
import { notifications } from '@mantine/notifications';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Assume complete until checked
  const [isLoadingProfileStatus, setIsLoadingProfileStatus] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setIsLoadingProfileStatus(false);
        return;
      }

      try {
        const response = await apiClient.get('/api/profile/status');
        setIsProfileComplete(response.data.isProfileComplete);
      } catch (error) {
        console.error("Error checking profile status:", error);
        notifications.show({
          title: 'Profile Status Error',
          message: 'Failed to load profile status.',
          color: 'red',
        });
        setIsProfileComplete(false); // Assume incomplete on error
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

  if (!isProfileComplete) {
    return <ProviderCompleteProfilePage />;
  }

  const statsCards = [
    {
      title: 'Today\'s Appointments',
      value: '8',
      icon: <IconCalendar size={24} />,
      color: 'blue'
    },
    {
      title: 'Active Patients',
      value: '124',
      icon: <IconUsers size={24} />,
      color: 'green'
    },
    {
      title: 'This Week',
      value: '42',
      icon: <IconStethoscope size={24} />,
      color: 'orange'
    },
    {
      title: 'Rating',
      value: '4.8',
      icon: <IconChartLine size={24} />,
      color: 'violet'
    }
  ];

  return (
    <Container size="xl" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="xl">
          {/* Header */}
          <div>
            <Title order={1} mb="xs">
              Provider Dashboard
            </Title>
            <Text c="dimmed" size="lg">
              Welcome back, Dr. {user?.attributes?.given_name || 'Provider'}
            </Text>
          </div>

          {/* Stats Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="apart" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      {stat.title}
                    </Text>
                    <div style={{ color: `var(--mantine-color-${stat.color}-6)` }}>
                      {stat.icon}
                    </div>
                  </Group>
                  <Text size="xl" fw={700}>
                    {stat.value}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          {/* Quick Actions */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Quick Actions</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              <Button 
                leftSection={<IconCalendar size={16} />}
                variant="light"
                fullWidth
              >
                View Schedule
              </Button>
              <Button 
                leftSection={<IconUsers size={16} />}
                variant="light"
                fullWidth
              >
                Patient List
              </Button>
              <Button 
                leftSection={<IconStethoscope size={16} />}
                variant="light"
                fullWidth
              >
                Medical Records
              </Button>
            </SimpleGrid>
          </Card>

          {/* Recent Activity */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Recent Activity</Title>
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                • New appointment scheduled with John Doe for tomorrow at 2:00 PM
              </Text>
              <Text size="sm" c="dimmed">
                • Patient Mary Smith completed health assessment
              </Text>
              <Text size="sm" c="dimmed">
                • Prescription refill request from Robert Johnson
              </Text>
            </Stack>
          </Card>
        </Stack>
      </motion.div>
    </Container>
  );
};

export default ProviderDashboard;

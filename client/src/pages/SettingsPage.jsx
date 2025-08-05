import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Alert,
  Modal,
  Divider,
  Card
} from '@mantine/core';
import { IconSettings, IconTrash, IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../services/apiService';

const SettingsPage = () => {
  const { user, checkUserSession, profileStatus } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteProfile = async () => {
    if (!user) {
      notifications.show({
        title: 'Error',
        message: 'User not found. Please log in again.',
        color: 'red',
      });
      return;
    }

    // Check if there's actually a profile to delete
    if (!profileStatus?.hasDatabaseEntry) {
      notifications.show({
        title: 'No Profile Found',
        message: 'No profile data found in database to delete.',
        color: 'blue',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await apiService.deleteUserProfile();
      
      notifications.show({
        title: 'Profile Deleted',
        message: 'Your profile data has been successfully deleted from our database.',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      // Refresh the auth context to update profile status
      await checkUserSession();
      
    } catch (error) {
      console.error('Profile deletion error:', error);
      
      // Handle the case where no profile exists in DB (which is expected for Cognito-only users)
      if (error.message?.includes('no profile found') || error.message?.includes('not found')) {
        notifications.show({
          title: 'No Profile Found',
          message: 'No profile data found in database to delete.',
          color: 'blue',
        });
      } else {
        notifications.show({
          title: 'Deletion Failed',
          message: error.message || 'Failed to delete profile. Please try again.',
          color: 'red',
        });
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <Container size="md" py={50}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="xl">
          <div>
            <Group align="center" gap="sm" mb="sm">
              <IconSettings size={24} />
              <Title order={1}>Settings</Title>
            </Group>
            <Text c="dimmed" size="lg">
              Manage your account settings and data
            </Text>
          </div>

          {/* Account Information Card */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Account Information</Title>
              <Text size="sm" c="dimmed">
                Your account is managed through AWS Cognito authentication
              </Text>
              
              {user && (
                <Stack gap="xs">
                  <Text size="sm">
                    <strong>Email:</strong> {user.email}
                  </Text>
                  <Text size="sm">
                    <strong>Name:</strong> {user.given_name} {user.family_name}
                  </Text>
                  {user['cognito:groups']?.[0] && (
                    <Text size="sm">
                      <strong>Role:</strong> {user['cognito:groups'][0]}
                    </Text>
                  )}
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Data Management Card */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Data Management</Title>
              <Text size="sm" c="dimmed">
                Manage your profile data stored in our database
              </Text>

              <Divider />

              {profileStatus?.hasDatabaseEntry === null ? (
                <Text size="sm" c="dimmed">Loading profile status...</Text>
              ) : (
                <Alert 
                  icon={<IconAlertTriangle size={16} />} 
                  title="Delete Profile Data" 
                  color={profileStatus?.hasDatabaseEntry ? "red" : "gray"}
                  variant="light"
                >
                  <Text size="sm" mb="md">
                    {profileStatus?.hasDatabaseEntry ? (
                      <>
                        This will permanently delete your profile information from our database, 
                        including medical history, preferences, and any stored data. 
                        Your Cognito authentication account will remain active.
                      </>
                    ) : (
                      <>
                        No profile data found in our database. You only have a Cognito authentication 
                        account with no additional profile information stored.
                      </>
                    )}
                  </Text>
                  
                  <Button
                    color="red"
                    variant="filled"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => profileStatus?.hasDatabaseEntry && setDeleteModalOpen(true)}
                    size="sm"
                    disabled={!profileStatus?.hasDatabaseEntry}
                  >
                    {profileStatus?.hasDatabaseEntry ? "Delete Profile Data" : "No Profile Data to Delete"}
                  </Button>
                </Alert>
              )}
            </Stack>
          </Card>

          {/* Confirmation Modal - Only render when there's a database profile */}
          {profileStatus?.hasDatabaseEntry && (
            <Modal
              opened={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              title="Confirm Profile Deletion"
              centered
            >
              <Stack gap="md">
                <Alert color="red" icon={<IconAlertTriangle size={16} />}>
                  <Text size="sm" fw={500} mb="xs">
                    This action cannot be undone!
                  </Text>
                  <Text size="sm">
                    This will permanently delete all your profile data from our database, 
                    including medical information, preferences, chat history, and any other 
                    stored data. Your authentication account will remain active.
                  </Text>
                </Alert>

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="light"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="red"
                    loading={isDeleting}
                    onClick={handleDeleteProfile}
                    leftSection={!isDeleting && <IconTrash size={16} />}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Profile Data'}
                  </Button>
                </Group>
              </Stack>
            </Modal>
          )}
        </Stack>
      </motion.div>
    </Container>
  );
};

export default SettingsPage;

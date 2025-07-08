/**
 * User Management Testing Component
 * 
 * Provides testing utilities for user management operations
 * including user deletion from both Cognito and the database
 */

import React, { useState } from 'react';
import { 
  Card, 
  Stack, 
  Text, 
  Button, 
  TextInput, 
  Group, 
  Alert, 
  Divider,
  Notification,
  Badge
} from '@mantine/core';
import { 
  IconTrash, 
  IconUserX, 
  IconDatabase, 
  IconCheck, 
  IconX, 
  IconAlertTriangle 
} from '@tabler/icons-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const UserManagementTest = () => {
  const { isAuthenticated } = useAuth();
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [isDeletingCurrent, setIsDeletingCurrent] = useState(false);
  const [currentUserStatus, setCurrentUserStatus] = useState(null);

  const handleDeleteUser = async () => {
    if (!deleteEmail.trim()) {
      setDeleteStatus({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    setIsDeleting(true);
    setDeleteStatus(null);

    try {
      // Delete user from backend (both Cognito and database)
      const response = await apiService.deleteUser(deleteEmail);
      
      setDeleteStatus({ 
        type: 'success', 
        message: `User ${deleteEmail} deleted successfully from both Cognito and database`,
        details: response
      });
      setDeleteEmail('');
      
      console.log('Delete response:', response);
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteStatus({ 
        type: 'error', 
        message: `Failed to delete user: ${error.message}` 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCurrentUser = async () => {
    if (!isAuthenticated) {
      setCurrentUserStatus({ 
        type: 'error', 
        message: 'No user is currently authenticated' 
      });
      return;
    }

    setIsDeletingCurrent(true);
    setCurrentUserStatus(null);

    try {
      // Note: With OAuth, user deletion should be handled through the server
      // The client cannot directly delete users from Cognito
      setCurrentUserStatus({ 
        type: 'info', 
        message: 'With OAuth authentication, user deletion must be handled server-side. Please use the email deletion feature above.' 
      });
      
      // Reload the page to reset the app state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error deleting current user:', error);
      setCurrentUserStatus({ 
        type: 'error', 
        message: `Failed to delete current user: ${error.message}` 
      });
    } finally {
      setIsDeletingCurrent(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group>
          <IconUserX size={24} />
          <Text size="lg" fw={500}>User Management Testing</Text>
          <Badge color="red" variant="outline">Testing Only</Badge>
        </Group>

        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Warning"
          color="yellow"
        >
          <Text size="sm">
            These operations permanently delete user data. Use only for testing purposes.
          </Text>
        </Alert>

        <Divider />

        {/* Delete User by Email */}
        <Stack gap="sm">
          <Group>
            <IconDatabase size={20} />
            <Text size="md" fw={500}>Delete User by Email</Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            Delete any user from both AWS Cognito and the database by email address.
          </Text>

          <Group align="flex-end">
            <TextInput
              label="Email address"
              placeholder="user@example.com"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              style={{ flex: 1 }}
              disabled={isDeleting}
              error={deleteStatus?.type === 'error' ? deleteStatus.message : null}
            />
            <Button
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={handleDeleteUser}
              loading={isDeleting}
              disabled={!deleteEmail.trim()}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </Group>

          {deleteStatus && deleteStatus.type === 'success' && (
            <Notification
              icon={<IconCheck size={16} />}
              color="green"
              title="Success"
              withCloseButton={false}
            >
              {deleteStatus.message}
            </Notification>
          )}
        </Stack>

        <Divider />

        {/* Delete Current User */}
        <Stack gap="sm">
          <Group>
            <IconUserX size={20} />
            <Text size="md" fw={500}>Delete Current User</Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            Delete the currently authenticated user from Cognito and log out.
          </Text>

          <Button
            color="red"
            variant="outline"
            leftSection={<IconUserX size={14} />}
            onClick={handleDeleteCurrentUser}
            loading={isDeletingCurrent}
            disabled={!isAuthenticated}
          >
            {isDeletingCurrent ? 'Deleting...' : 'Delete Current User'}
          </Button>

          {currentUserStatus && (
            <Notification
              icon={currentUserStatus.type === 'success' ? <IconCheck size={16} /> : <IconX size={16} />}
              color={currentUserStatus.type === 'success' ? 'green' : 'red'}
              title={currentUserStatus.type === 'success' ? 'Success' : 'Error'}
              withCloseButton={false}
            >
              {currentUserStatus.message}
            </Notification>
          )}

          {!isAuthenticated && (
            <Text size="xs" c="dimmed">
              No user is currently authenticated.
            </Text>
          )}
        </Stack>

        <Divider />

        <Text size="xs" c="dimmed">
          <strong>Note:</strong> This component is for testing purposes only. 
          Remove from production builds.
        </Text>
      </Stack>
    </Card>
  );
};

export default UserManagementTest;

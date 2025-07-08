/**
 * Development Configuration Notice
 * 
 * Shows when Cognito environment variables are not configured
 */

import React, { useState } from 'react';
import { Alert, Button, Stack, Text, Code, Group, TextInput, Notification } from '@mantine/core';
import { IconAlertTriangle, IconExternalLink, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import apiService from '../services/apiService';

const CognitoConfigNotice = () => {
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);

  const openSetupGuide = () => {
    // In a real app, this might open documentation
    console.log('See COGNITO_SETUP.md for configuration instructions');
  };

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
        message: `User ${deleteEmail} deleted successfully from both Cognito and database` 
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

  return (
    <div>
      <Alert
        icon={<IconAlertTriangle size={16} />}
        title="Cognito Configuration Required"
        color="yellow"
        style={{ margin: '1rem' }}
      >
        <Stack gap="sm">
          <Text size="sm">
            Authentication is not configured. To enable user registration and login,
            please set up your AWS Cognito environment variables:
          </Text>

          <Code block style={{ fontSize: '0.75rem' }}>
            {`REACT_APP_COGNITO_USER_POOL_ID=your_user_pool_id
REACT_APP_COGNITO_CLIENT_ID=your_client_id
REACT_APP_COGNITO_REGION=your_region`}
          </Code>

          <Text size="xs" c="dimmed">
            Add these to your <Code>.env.local</Code> file and restart the development server.
          </Text>

          <Button
            size="xs"
            variant="light"
            leftSection={<IconExternalLink size={14} />}
            onClick={openSetupGuide}
          >
            View Setup Guide
          </Button>
        </Stack>
      </Alert>

      {/* Testing Section */}
      <Alert
        icon={<IconTrash size={16} />}
        title="Testing: Delete User"
        color="red"
        style={{ margin: '1rem' }}
      >
        <Stack gap="sm">
          <Text size="sm">
            <strong>⚠️ TESTING ONLY:</strong> Delete a user from both Cognito and the database.
          </Text>

          <Group align="flex-end">
            <TextInput
              label="Email address"
              placeholder="user@example.com"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              style={{ flex: 1 }}
              disabled={isDeleting}
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

          {deleteStatus && (
            <Notification
              icon={deleteStatus.type === 'success' ? <IconCheck size={16} /> : <IconX size={16} />}
              color={deleteStatus.type === 'success' ? 'green' : 'red'}
              title={deleteStatus.type === 'success' ? 'Success' : 'Error'}
              withCloseButton={false}
              style={{ marginTop: '0.5rem' }}
            >
              {deleteStatus.message}
            </Notification>
          )}

          <Text size="xs" c="dimmed">
            This will permanently delete the user from both AWS Cognito and your database.
          </Text>
        </Stack>
      </Alert>
    </div>
  );
};

export default CognitoConfigNotice;

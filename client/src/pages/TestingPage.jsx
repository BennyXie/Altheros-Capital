/**
 * Testing Page for User Management
 * 
 * A dedicated page for testing user deletion functionality
 * during development. This should be removed in production.
 */

import React from 'react';
import { Container, Title, Text, Stack, Alert } from '@mantine/core';
import { IconFlask, IconAlertTriangle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import UserManagementTest from '../components/UserManagementTest';

const TestingPage = () => {
  return (
    <Container size="md" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="lg">
          {/* Page Header */}
          <div style={{ textAlign: 'center' }}>
            <Title order={1} mb="sm">
              <IconFlask size={32} style={{ marginRight: '10px' }} />
              Testing Environment
            </Title>
            <Text c="dimmed" size="lg">
              User Management Testing Tools
            </Text>
          </div>

          {/* Warning Alert */}
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Development Environment Only"
            color="orange"
          >
            <Text size="sm">
              This page contains testing tools for user management operations. 
              It should only be accessible in development environments and must be 
              removed before deploying to production.
            </Text>
          </Alert>

          {/* User Management Testing Component */}
          <UserManagementTest />

          {/* Development Notes */}
          <Alert
            title="How to Use These Tools"
            color="blue"
            variant="light"
          >
            <Stack gap="xs">
              <Text size="sm">
                <strong>Delete User by Email:</strong> Enter any user's email address to delete them 
                from both AWS Cognito and your database. This is useful for cleaning up test users.
              </Text>
              <Text size="sm">
                <strong>Delete Current User:</strong> If you're logged in, this will delete your 
                current user account and log you out. Use this to test the user deletion flow.
              </Text>
              <Text size="sm">
                <strong>Note:</strong> All deletions are permanent and cannot be undone. 
                Only use with test data.
              </Text>
            </Stack>
          </Alert>
        </Stack>
      </motion.div>
    </Container>
  );
};

export default TestingPage;

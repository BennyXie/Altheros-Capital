/**
 * Development Configuration Notice
 * 
 * Shows when Cognito environment variables are not configured
 */

import React from 'react';
import { Alert, Button, Stack, Text, Code } from '@mantine/core';
import { IconAlertTriangle, IconExternalLink } from '@tabler/icons-react';

const CognitoConfigNotice = () => {
  const openSetupGuide = () => {
    // In a real app, this might open documentation
    console.log('See COGNITO_SETUP.md for configuration instructions');
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
    </div>
  );
};

export default CognitoConfigNotice;

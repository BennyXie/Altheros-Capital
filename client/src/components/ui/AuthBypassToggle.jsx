/**
 * Auth Bypass Toggle Component
 * 
 * Development utility component that allows frontend developers to toggle
 * authentication bypass mode without manually editing .env files.
 * This component should only be visible in development mode.
 */

import React, { useState, useEffect } from 'react';
import { Switch, Group, Text, Card, Alert, Button } from '@mantine/core';
import { IconShield, IconShieldOff, IconInfoCircle, IconRefresh } from '@tabler/icons-react';

const AuthBypassToggle = () => {
  const [bypassEnabled, setBypassEnabled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Only show in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Check current bypass status from environment
    setBypassEnabled(process.env.REACT_APP_BYPASS_AUTH === 'true');
  }, []);

  if (!isDevelopment) {
    return null; // Don't render in production
  }

  const handleToggle = (checked) => {
    setBypassEnabled(checked);
    setShowInstructions(true);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 1000,
        maxWidth: 350
      }}
    >
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="sm">
          Development Auth Toggle
        </Text>
        {bypassEnabled ? (
          <IconShieldOff size={16} color="orange" />
        ) : (
          <IconShield size={16} color="green" />
        )}
      </Group>

      <Group gap="xs" mb="md">
        <Switch
          checked={bypassEnabled}
          onChange={(event) => handleToggle(event.currentTarget.checked)}
          label={bypassEnabled ? "Auth Bypassed" : "Auth Protected"}
          color={bypassEnabled ? "orange" : "green"}
        />
      </Group>

      <Text size="xs" c="dimmed" mb="sm">
        Current: REACT_APP_BYPASS_AUTH={process.env.REACT_APP_BYPASS_AUTH || 'false'}
      </Text>

      {showInstructions && (
        <Alert 
          variant="light" 
          color="blue" 
          icon={<IconInfoCircle size={16} />}
          mb="sm"
        >
          <Text size="xs">
            To apply changes:
            <br />
            1. Update .env: REACT_APP_BYPASS_AUTH={bypassEnabled ? 'true' : 'false'}
            <br />
            2. Restart the development server
          </Text>
        </Alert>
      )}

      <Group gap="xs">
        <Button 
          size="xs" 
          variant="light" 
          leftSection={<IconRefresh size={12} />}
          onClick={refreshPage}
        >
          Refresh
        </Button>
      </Group>
    </Card>
  );
};

export default AuthBypassToggle;

import React, { useEffect } from 'react';
import { Container, Title, Button, Text, Stack } from '@mantine/core';
import AuthService from '../services/authService';

const ClearAuthPage = () => {
  const handleClearAuth = async () => {
    try {
      await AuthService.clearAllAuthState();
    } catch (error) {
      console.error('Error clearing auth state:', error);
      // Force reload anyway
      window.location.href = '/';
    }
  };

  return (
    <Container size="sm" py="xl">
      <Stack align="center" spacing="xl">
        <Title order={2}>Clear Authentication State</Title>
        <Text align="center" color="dimmed">
          This will clear all cached authentication data and redirect you to the home page.
          Use this when you need to start fresh with a new account.
        </Text>
        <Button 
          size="lg" 
          color="red" 
          onClick={handleClearAuth}
        >
          Clear All Auth Data & Restart
        </Button>
        <Text size="sm" color="red" align="center">
          Warning: This will sign you out and clear all authentication cache.
        </Text>
      </Stack>
    </Container>
  );
};

export default ClearAuthPage;

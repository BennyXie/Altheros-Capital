/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to login page.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Container size="sm" py={100}>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Checking authentication...</Text>
        </Stack>
      </Container>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;

/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to login page.
 * Can be bypassed in development mode for frontend testing.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Check if authentication bypass is enabled for development
  const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';

  // If auth bypass is enabled, show development notice and render children
  if (bypassAuth) {
    return (
      <>
        <Alert 
          variant="light" 
          color="orange" 
          title="Development Mode" 
          icon={<IconInfoCircle />}
          mb="md"
          style={{ 
            position: 'sticky', 
            top: 60, 
            zIndex: 100,
            margin: '0 1rem 1rem 1rem' 
          }}
        >
          Authentication is bypassed for frontend development. Set REACT_APP_BYPASS_AUTH=false to enable protection.
        </Alert>
        {children}
      </>
    );
  }

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/prelogin" state={{ from: location }} replace />;
  }

  const userRole = user.attributes?.['custom:role'];

  if (requiredRole && userRole !== requiredRole) {
    const redirectPath = userRole === 'provider' ? '/provider-dashboard' : '/user-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
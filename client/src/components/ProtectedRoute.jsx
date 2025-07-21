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
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Use Cognito custom:role attribute if available, fallback to user.role
  const userRoleRaw = user?.attributes?.['custom:role'] || user?.role;
  if (!userRoleRaw) {
    // This case should ideally not be hit if AuthContext is working correctly
    // but acts as a safeguard against race conditions.
    console.warn('ProtectedRoute: User or userRole not available yet. Waiting...');
    return (
      <Container size="sm" py={100}>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Loading user profile...</Text>
        </Stack>
      </Container>
    );
  }

  // Normalize roles to singular, lowercase for comparison
  const normalizeRole = (role) => {
    if (typeof role === 'string') {
      let r = role.trim().toLowerCase();
      if (r.endsWith('s')) r = r.slice(0, -1);
      return r;
    }
    return role;
  };
  const userRole = normalizeRole(userRoleRaw);
  const required = normalizeRole(requiredRole);


  console.log('ProtectedRoute: user:', user);
  console.log('ProtectedRoute: userRole:', userRole);
  console.log('ProtectedRoute: requiredRole:', required);

  if (required && userRole !== required) {
    const redirectPath = userRole === 'provider' ? '/provider-dashboard' : '/user-dashboard';
    console.log('ProtectedRoute: Mismatch! Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
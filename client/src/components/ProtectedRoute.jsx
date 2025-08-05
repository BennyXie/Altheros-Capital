import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user, profileStatus } = useAuth();
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

  const userRoleRaw = user?.role || user?.['cognito:groups']?.[0];
  console.log('ProtectedRoute: userRoleRaw:', userRoleRaw);
  console.log('ProtectedRoute: user.role:', user?.role);
  console.log('ProtectedRoute: user cognito:groups:', user?.['cognito:groups']);
  
  // If user is authenticated but has no role assigned, redirect to auth callback for role assignment
  if (!userRoleRaw && profileStatus?.needsRoleAssignment) {
    console.log('ProtectedRoute: User needs role assignment, redirecting to auth callback');
    return <Navigate to="/auth/callback" replace />;
  }
  
  if (!userRoleRaw) {
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

  const normalizeRole = (role) => {
    if (typeof role === 'string') {
      let r = role.trim().toLowerCase();
      if (r.endsWith('s')) r = r.slice(0, -1);
      console.log('ProtectedRoute: normalizeRole input:', role, 'output:', r);
      return r;
    }
    console.log('ProtectedRoute: normalizeRole non-string input:', role);
    return role;
  };
  const userRole = normalizeRole(userRoleRaw);
  const required = normalizeRole(requiredRole);

  if (required && userRole !== required) {
    const redirectPath = userRole === 'provider' ? '/provider-dashboard' : '/user-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If profile is incomplete AND there is a database entry, redirect to update profile
  if (profileStatus.isProfileComplete === false && profileStatus.hasDatabaseEntry === true) {
    const redirectPath = userRole === 'provider' ? '/provider-update-profile' : '/update-profile';
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If profile is incomplete AND there is NO database entry, redirect to complete profile
  if (profileStatus.isProfileComplete === false && profileStatus.hasDatabaseEntry === false) {
    const redirectPath = userRole === 'provider' ? '/provider-complete-profile' : '/complete-profile';
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
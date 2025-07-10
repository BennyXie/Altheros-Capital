/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes requiring authentication and role-based access.
 * Redirects unauthenticated users to login page and users with wrong roles to appropriate pages.
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Get user role from backend or token
  useEffect(() => {
    const getUserRole = async () => {
      if (!user || !isAuthenticated) {
        setRoleLoading(false);
        return;
      }

      try {
        // First check if role is in user attributes
        const roleFromAttributes = user.attributes?.['custom:role'];
        
        if (roleFromAttributes) {
          setUserRole(roleFromAttributes);
          setRoleLoading(false);
          return;
        }

        // If not in attributes, fetch from backend
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${await user.getAccessToken?.() || ''}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role || 'patient');
        } else {
          // Default to patient if we can't determine role
          setUserRole('patient');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('patient'); // Default to patient role
      } finally {
        setRoleLoading(false);
      }
    };

    getUserRole();
  }, [user, isAuthenticated]);

  // Show loading spinner while checking authentication and role
  if (isLoading || roleLoading) {
    return (
      <Container size="sm" py={100}>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Checking authentication and permissions...</Text>
        </Stack>
      </Container>
    );
  }

  // If not authenticated, redirect to role selection page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  const hasRequiredRole = () => {
    if (!requiredRole && allowedRoles.length === 0) {
      return true; // No role restrictions
    }

    if (requiredRole && userRole === requiredRole) {
      return true;
    }

    if (allowedRoles.length > 0 && allowedRoles.includes(userRole)) {
      return true;
    }

    return false;
  };

  // If user doesn't have required role, show access denied or redirect
  if (!hasRequiredRole()) {
    const redirectPath = userRole === 'provider' ? '/provider-dashboard' : '/dashboard';
    
    return (
      <Container size="sm" py={100}>
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Access Denied"
          color="red"
          mb="md"
        >
          <Stack gap="sm">
            <Text size="sm">
              You don't have permission to access this page. You are currently logged in as a {userRole}.
            </Text>
            <Text size="sm">
              <Navigate to={redirectPath} replace />
              Redirecting to your dashboard...
            </Text>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // If authenticated and has required role, render the protected component
  return children;
};

export default ProtectedRoute;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService.js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (loading) {
        // Still loading, do nothing yet
        return;
      }

      if (!isAuthenticated) {
        // Not authenticated after loading, redirect to home
        console.error('AuthCallback: Not authenticated after loading. Redirecting to home.');
        navigate('/', { replace: true });
        return;
      }

      // If authenticated, proceed with role-based redirection
      try {
        console.log('AuthCallback: Authenticated. User object:', user);
        console.log('AuthCallback: User role from context:', user?.role);
        // 1. If user is authenticated and already has a role, redirect to their dashboard
        if (user && user.role) {
          console.log('AuthCallback: User has existing role:', user.role, '. Redirecting to dashboard.');
          const redirectPath = AuthService.getRoleBasedRedirectPath(user.role);
          navigate(redirectPath, { replace: true });
          return;
        }

        // 2. If authenticated but no role yet (e.g., new user or role not set in custom:role attribute)
        console.log('AuthCallback: Authenticated but no role. Attempting to set role.');
        const state = searchParams.get('state');
        let role = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole();

        // Default to 'patient' if no role is found (e.g., direct login without pre-selection)
        if (!role) {
          role = 'patient';
          console.log('AuthCallback: No role found, defaulting to patient.');
        }

        // Set the user's role in Cognito (add to group)
        console.log('AuthCallback: Setting user role to:', role);
        await AuthService.setUserRole(role);
        AuthService.clearPendingUserRole(); // Clear pending role from local storage

        const redirectPath = AuthService.getRoleBasedRedirectPath(role);
        console.log('AuthCallback: Role set. Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });

      } catch (error) {
        console.error('Authentication callback error:', error);
        setError(error.message);
        // On error, redirect to home or a generic error page, not prelogin
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [isAuthenticated, user, loading, navigate, searchParams]);

  if (error) {
    return (
      <Container size="sm" py={100}>
        <Alert
          icon={<IconX size={16} />}
          title="Authentication Error"
          color="red"
        >
          <Stack gap="sm">
            <Text size="sm">{error}</Text>
            <Text size="sm" c="dimmed">
              Redirecting you back to login...
            </Text>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py={100}>
      <Stack align="center" gap="lg">
        <Loader size="lg" />
        <Text size="lg" fw={500}>Processing your authentication...</Text>
        <Text size="sm" c="dimmed" ta="center">
          Please wait while we set up your account and redirect you to the appropriate dashboard.
        </Text>
      </Stack>
    </Container>
  );
};

export default AuthCallback;
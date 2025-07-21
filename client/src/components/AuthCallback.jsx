import React, { useEffect, useState, useRef } from 'react';
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
  const hasProcessedCallback = useRef(false);

  // Effect for initial role assignment and token refresh signal
  useEffect(() => {
    const handleInitialProcessing = async () => {
      if (loading || hasProcessedCallback.current) {
        return;
      }

      if (!isAuthenticated) {
        console.error('AuthCallback: Not authenticated after loading. Redirecting to home.');
        navigate('/', { replace: true });
        return;
      }

      // Prevent multiple executions for the initial role assignment
      hasProcessedCallback.current = true;

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

        // After successfully setting the role, reauthenticate to get an updated ID token
        await AuthService.reauthenticateUser();

      } catch (error) {
        console.error('Authentication callback error:', error);
        setError(error.message);
        navigate('/', { replace: true });
      }
    };

    handleInitialProcessing();
  }, [isAuthenticated, user, loading, navigate, searchParams]);

   // Added setNeedsTokenRefresh to dependencies

  return (
    <Container size="sm" py={100}>
      {error ? (
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
      ) : (
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text size="lg" fw={500}>Processing your authentication...</Text>
          <Text size="sm" c="dimmed" ta="center">
            Please wait while we set up your account and redirect you to the appropriate dashboard.
          </Text>
        </Stack>
      )}
    </Container>
  );
}

export default AuthCallback;
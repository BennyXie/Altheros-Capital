import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService.js';
import apiService from '../services/apiService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState(null);
  const [roleAssignmentAttempted, setRoleAssignmentAttempted] = useState(false);

  useEffect(() => {
    const handleAuthProcessing = async () => {
      if (loading) {
        return;
      }

      if (!isAuthenticated) {
        console.log('AuthCallback: Not authenticated. Checking for pending role to initiate login.');
        const pendingRole = AuthService.getPendingUserRole();

        if (pendingRole) {
          console.log(`AuthCallback: Found pending role '${pendingRole}'. Initiating login flow.`);
          try {
            AuthService.clearPendingUserRole();
            await AuthService.loginWithRole(pendingRole);
            return;
          } catch (err) {
            console.error('AuthCallback: Error initiating login after sign-up:', err);
            setError('Failed to log in after sign-up. Please try again.');
            navigate('/', { replace: true });
            return;
          }
        } else {
          console.error('AuthCallback: Not authenticated and no pending role. Redirecting to home.');
          navigate('/', { replace: true });
          return;
        }
      }

      if (user && user.role) {
        const { isProfileComplete } = await apiService.checkProfileStatus();
        if (isProfileComplete) {
          const redirectPath = AuthService.getRoleBasedRedirectPath(user.role);
          navigate(redirectPath, { replace: true });
        } else {
          const redirectPath = user.role === 'provider' ? '/provider-complete-profile' : '/user-complete-profile';
          navigate(redirectPath, { replace: true });
        }
        return;
      }

      if (!user?.role && !roleAssignmentAttempted) {
        console.log('AuthCallback: Authenticated but no role. Attempting to set role.');
        setRoleAssignmentAttempted(true);

        try {
          const state = searchParams.get('state');
          let role = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole();

          if (!role) {
            role = 'patient';
            console.log('AuthCallback: No role found, defaulting to patient.');
          }

          console.log('AuthCallback: Setting user role to:', role);
          await AuthService.setUserRole(role);
          AuthService.clearPendingUserRole();

          await AuthService.reauthenticateUser();

        } catch (err) {
          console.error('Authentication callback error during role assignment:', err);
          setError(err.message);
          navigate('/', { replace: true });
        }
      } else if (!user?.role && roleAssignmentAttempted) {
        console.error('AuthCallback: Role assignment attempted but user still has no role after reauthentication.');
        setError('Failed to assign user role. Please try again.');
        navigate('/', { replace: true });
      }
    };

    handleAuthProcessing();
  }, [isAuthenticated, user, loading, navigate, searchParams, roleAssignmentAttempted, setError]);

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
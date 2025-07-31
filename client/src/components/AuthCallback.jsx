import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService.js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading, checkUserSession } = useAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Initializing authentication...');

  console.log('AuthCallback: Component rendered');
  console.log('AuthCallback: isAuthenticated:', isAuthenticated);
  console.log('AuthCallback: loading:', loading);
  console.log('AuthCallback: user:', user);

  const pollForRole = useCallback(async () => {
    setStatus('Finalizing account setup...');
    try {
      const updatedUser = await checkUserSession({ forceRefresh: true });
      const userGroups = updatedUser?.['cognito:groups'] || [];

      if (userGroups.length > 0) {
        const role = userGroups[0];
        const redirectPath = AuthService.getRoleBasedRedirectPath(role);
        console.log(`AuthCallback: Role '${role}' confirmed. Redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
        return true; // Role found, polling stops
      }
      return false; // Role not yet found
    } catch (e) {
      console.error('Polling error:', e);
      setError('An error occurred while verifying your account details. Please try logging in.');
      return true; // Stop polling on error
    }
  }, [checkUserSession, navigate]);

  useEffect(() => {
    const handleAuthentication = async () => {
      if (loading) {
        return; // Wait for the initial auth check to complete
      }

      // Step 1: Handle the case where the user is NOT authenticated yet.
      // This is common right after a new user signs up via Cognito's hosted UI.
      if (!isAuthenticated) {
        const pendingRole = AuthService.getPendingUserRole();
        if (pendingRole) {
          setStatus('New account detected. Establishing session...');
          // This will redirect the user to Cognito and back here, but this time they will be authenticated.
          await AuthService.loginWithRole(pendingRole);
        } else {
          // If there's no pending role, they might have landed here by mistake.
          navigate('/login', { replace: true });
        }
        return;
      }

      // Step 2: User is authenticated. Check if they already have a role.
      const userGroups = user?.['cognito:groups'] || [];
      if (userGroups.length > 0) {
        const role = userGroups[0];
        const redirectPath = AuthService.getRoleBasedRedirectPath(role);
        navigate(redirectPath, { replace: true });
        return;
      }

      // Step 3: User is authenticated but has no role. Assign it and start polling.
      setStatus('Assigning account role...');
      try {
        const state = searchParams.get('state');
        let role = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole();
        if (!role) role = 'patient'; // Default fallback

        await AuthService.setUserRole(role);
        AuthService.clearPendingUserRole();

        // Start polling for the updated role in the token
        const intervalId = setInterval(async () => {
          const roleFound = await pollForRole();
          if (roleFound) {
            clearInterval(intervalId);
          }
        }, 3000); // Poll every 3 seconds

        // Failsafe timeout
        setTimeout(() => {
          clearInterval(intervalId);
          if (!error) { // Only set error if one hasn't been set by polling
             setError('Account setup is taking longer than expected. Please try logging in again.');
          }
        }, 45000); // 45-second timeout

      } catch (err) {
        setError(err.message);
      }
    };

    handleAuthentication();

  }, [user, isAuthenticated, loading, navigate, searchParams, pollForRole, error, checkUserSession]);

  return (
    <Container size="sm" py={100}>
      {error ? (
        <Alert icon={<IconX size={16} />} title="Authentication Error" color="red">
          <Text>{error}</Text>
        </Alert>
      ) : (
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text size="lg" fw={500}>{status}</Text>
          <Text size="sm" c="dimmed" ta="center">
            Please wait, this will happen automatically.
          </Text>
        </Stack>
      )}
    </Container>
  );
};

export default AuthCallback;

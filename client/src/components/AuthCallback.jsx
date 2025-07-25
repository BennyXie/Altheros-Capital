import React, { useEffect, useState } from 'react';
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
  const [hasAttemptedRoleAssignment, setHasAttemptedRoleAssignment] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      if (loading || hasAttemptedRoleAssignment) {
        return; // Wait for loading to finish, and only run once
      }

      if (!isAuthenticated || !user) {
        // If not authenticated, something is wrong. Let AuthContext handle it or redirect.
        console.log('AuthCallback: Waiting for user authentication...');
        return;
      }

      // User is authenticated, now check for role.
      const userGroups = user['cognito:groups'] || [];

      if (userGroups.length > 0) {
        // User already has a role, redirect to the correct dashboard.
        const role = userGroups[0];
        const redirectPath = AuthService.getRoleBasedRedirectPath(role);
        console.log(`AuthCallback: User has role '${role}'. Redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
        return;
      }

      // User is authenticated but has no role. This is a new signup.
      console.log('AuthCallback: New user detected. Assigning role...');
      setHasAttemptedRoleAssignment(true); // Prevent re-running this logic

      try {
        const state = searchParams.get('state');
        let role = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole();

        if (!role) {
          console.warn('AuthCallback: No role found in state or storage. Defaulting to patient.');
          role = 'patient';
        }

        // 1. Add user to the group
        await AuthService.setUserRole(role);
        AuthService.clearPendingUserRole();

        // 2. Force a re-authentication to get the new token with the group claim
        console.log('AuthCallback: Role assigned. Re-authenticating to refresh token...');
        await AuthService.reauthenticateUser();

      } catch (err) {
        console.error('AuthCallback: Error during role assignment process:', err);
        setError('An error occurred while setting up your account. Please try logging in again.');
        // Optionally, sign the user out here before redirecting
        // await AuthService.signOut(); 
        // navigate('/login');
      }
    };

    processAuth();

  }, [user, isAuthenticated, loading, navigate, searchParams, hasAttemptedRoleAssignment]);

  return (
    <Container size="sm" py={100}>
      {error ? (
        <Alert icon={<IconX size={16} />} title="Setup Error" color="red">
          <Text>{error}</Text>
        </Alert>
      ) : (
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text size="lg" fw={500}>Finalizing your setup...</Text>
          <Text size="sm" c="dimmed" ta="center">
            Please wait, we're preparing your dashboard.
          </Text>
        </Stack>
      )}
    </Container>
  );
};

export default AuthCallback;
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
  const [roleAssignmentAttempted, setRoleAssignmentAttempted] = useState(false);

  // Effect for initial role assignment and token refresh signal
  useEffect(() => {
    const handleAuthProcessing = async () => {
      if (loading) {
        return;
      }

      // Case 1: User is not authenticated. This can happen after a fresh sign-up
      // or if the session expired/is invalid.
      if (!isAuthenticated) {
        console.log('AuthCallback: Not authenticated. Checking for pending role to initiate login.');
        const pendingRole = AuthService.getPendingUserRole();

        if (pendingRole) {
          console.log(`AuthCallback: Found pending role '${pendingRole}'. Initiating login flow.`);
          try {
            // Clear the pending role immediately to prevent infinite loops if login fails
            AuthService.clearPendingUserRole();
            // Initiate a login flow. Cognito will redirect back here after successful login.
            await AuthService.loginWithRole(pendingRole);
            // The component will re-render after the redirect, and isAuthenticated should be true then.
            return;
          } catch (err) {
            console.error('AuthCallback: Error initiating login after sign-up:', err);
            setError('Failed to log in after sign-up. Please try again.');
            navigate('/', { replace: true });
            return;
          }
        } else {
          // If not authenticated and no pending role, redirect to home (e.g., direct access to /auth/callback)
          console.error('AuthCallback: Not authenticated and no pending role. Redirecting to home.');
          navigate('/', { replace: true });
          return;
        }
      }

      // Case 2: User is authenticated. Now check for role assignment.
      // If user is authenticated and already has a role, redirect to their dashboard
      if (user && user.role) {
        console.log('AuthCallback: User has existing role:', user.role, '. Redirecting to dashboard.');
        const redirectPath = AuthService.getRoleBasedRedirectPath(user.role);
        navigate(redirectPath, { replace: true });
        return;
      }

      // Case 3: User is authenticated but no role yet, and we haven't attempted role assignment in this session
      if (!user?.role && !roleAssignmentAttempted) {
        console.log('AuthCallback: Authenticated but no role. Attempting to set role.');
        setRoleAssignmentAttempted(true); // Mark that we are attempting role assignment

        try {
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

        } catch (err) {
          console.error('Authentication callback error during role assignment:', err);
          setError(err.message);
          navigate('/', { replace: true });
        }
      } else if (!user?.role && roleAssignmentAttempted) {
        // This case means we attempted role assignment, reauthenticated, but still no role.
        // This indicates an issue with role assignment or token refresh.
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
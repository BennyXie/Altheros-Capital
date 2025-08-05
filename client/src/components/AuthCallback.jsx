import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const hasRedirectedRef = useRef(false);
  const processingRef = useRef(false);

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
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          navigate(redirectPath, { replace: true });
        }
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
      if (loading || processingRef.current || hasRedirectedRef.current) {
        return; // Wait for the initial auth check to complete, if already processing, or if already redirected
      }

      processingRef.current = true;
      setIsProcessing(true);

      try {
        // Step 1: Handle the case where the user is NOT authenticated yet.
        // This is common right after a new user signs up via Cognito's hosted UI.
        if (!isAuthenticated) {
          const pendingRole = AuthService.getPendingUserRole();
          const hasCallbackParams = searchParams.get('code') || searchParams.get('state');
          
          // If we have callback params, we're likely returning from Cognito
          // Give the auth context time to update before redirecting again
          if (hasCallbackParams) {
            setStatus('Processing authentication...');
            // Wait a bit for the auth context to update
            setTimeout(async () => {
              // Re-check authentication after a delay
              await checkUserSession({ forceRefresh: true });
              setIsProcessing(false);
            }, 2000);
            return;
          }
          
          if (pendingRole) {
            setStatus('New account detected. Establishing session...');
            // This will redirect the user to Cognito and back here, but this time they will be authenticated.
            await AuthService.loginWithRole(pendingRole);
          } else {
            // If there's no pending role, they might have landed here by mistake.
            navigate('/login', { replace: true });
          }
          setIsProcessing(false);
          processingRef.current = false;
          return;
        }

        // Step 2: User is authenticated. Check if they already have a role.
        const userGroups = user?.['cognito:groups'] || [];
        console.log('AuthCallback: User groups:', userGroups);
        
        if (userGroups.length > 0) {
          const role = userGroups[0];
          console.log('AuthCallback: User has role:', role);
          const redirectPath = AuthService.getRoleBasedRedirectPath(role);
          console.log('AuthCallback: Redirecting to:', redirectPath);
          
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            setIsProcessing(false);
            processingRef.current = false;
            navigate(redirectPath, { replace: true });
          }
          return;
        }

        console.log('AuthCallback: User is authenticated but has no role, proceeding with assignment...');

        // Step 3: User is authenticated but has no role. Assign it and start polling.
        setStatus('Assigning account role...');
        const state = searchParams.get('state');
        console.log('AuthCallback: State parameter from URL:', state);
        
        let role = AuthService.extractRoleFromState(state);
        console.log('AuthCallback: Role extracted from state:', role);
        
        if (!role) {
          role = AuthService.getPendingUserRole();
          console.log('AuthCallback: Role from localStorage:', role);
        }
        
        // If no role is found, default to 'patient' for fallback
        if (!role) {
          console.log('AuthCallback: No role found in state or localStorage, defaulting to patient');
          role = 'patient';
        }

        console.log('AuthCallback: Final role to assign:', role);
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
        console.error('AuthCallback: Error in handleAuthentication:', err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    };

    handleAuthentication();

  }, [user, isAuthenticated, loading, navigate, searchParams, pollForRole, error, checkUserSession]); // Removed hasRedirected from dependencies since we're using ref

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

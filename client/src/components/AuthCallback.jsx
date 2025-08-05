import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService.js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading, checkUserSession, profileStatus } = useAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Initializing authentication...');
  const processingRef = useRef(false);

  const getRedirectPath = useCallback((role, isProfileComplete) => {
    if (!role) return '/login';
    if (role === 'patient') {
      return isProfileComplete ? '/user-dashboard' : '/complete-profile/patient';
    }
    if (role === 'provider') {
      return isProfileComplete ? '/provider-dashboard' : '/complete-profile/provider';
    }
    return '/login';
  }, []);

  const handleAuthentication = useCallback(async () => {
    if (processingRef.current || loading) return;

    processingRef.current = true;

    try {
      if (!isAuthenticated) {
        setStatus('Processing authentication...');
        return;
      }

      if (user) {
        // If user has a role, check profile and redirect
        if (user.role) {
          setStatus('Verifying profile...');
          const redirectPath = getRedirectPath(profileStatus.role, profileStatus.isProfileComplete);
          navigate(redirectPath, { replace: true });
        } 
        // If user has no role, assign it
        else if (profileStatus.needsRoleAssignment) {
          setStatus('Assigning account role...');
          const state = searchParams.get('state');
          const roleToAssign = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole() || 'patient';
          
          await AuthService.setUserRole(roleToAssign);
          AuthService.clearPendingUserRole();
          
          setStatus('Finalizing account setup...');
          await checkUserSession({ forceRefresh: true });
        } else {
          // This case handles when the user is authenticated but the profile check is still pending
          setStatus('Checking account status...');
        }
      }
    } catch (err) {
      console.error('AuthCallback Error:', err);
      setError(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      processingRef.current = false;
    }
  }, [
    isAuthenticated, 
    user, 
    loading, 
    profileStatus, 
    searchParams, 
    navigate, 
    checkUserSession, 
    getRedirectPath
  ]);

  useEffect(() => {
    handleAuthentication();
  }, [handleAuthentication]);

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

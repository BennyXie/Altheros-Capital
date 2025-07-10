/**
 * Authentication Callback Handler
 * 
 * Handles the callback from Cognito after successful authentication
 * and processes role-based redirects
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔧 AuthCallback: Starting callback processing');
        console.log('🔧 AuthCallback: isAuthenticated:', isAuthenticated);
        console.log('🔧 AuthCallback: user:', !!user);
        
        // Wait a moment for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!isAuthenticated || !user) {
          throw new Error('Authentication failed');
        }

        // Get role from URL state parameter or local storage
        const state = searchParams.get('state');
        let role = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole();

        console.log('🔧 AuthCallback: Extracted role:', role);

        if (!role) {
          // Default to patient if no role specified
          role = 'patient';
          console.log('🔧 AuthCallback: Defaulting to patient role');
        }

        // Set the role in the backend
        await AuthService.setUserRole(role);

        // Clear any pending role data
        AuthService.clearPendingUserRole();

        // Get appropriate redirect path based on role
        const redirectPath = AuthService.getRoleBasedRedirectPath(role);
        console.log('🔧 AuthCallback: Redirecting to:', redirectPath);

        // Navigate to the appropriate page
        navigate(redirectPath, { replace: true });

      } catch (error) {
        console.error('🔧 AuthCallback: Authentication callback error:', error);
        setError(error.message);
        
        // Redirect to role selection after a delay
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [isAuthenticated, user, navigate, searchParams]);

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

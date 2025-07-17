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
      if (loading) return;

      try {
        if (!isAuthenticated || !user) {
          throw new Error('Authentication failed');
        }

        const roleFromAttributes = user.attributes?.['custom:role'];
        if (roleFromAttributes) {
          const redirectPath = AuthService.getRoleBasedRedirectPath(roleFromAttributes);
          navigate(redirectPath, { replace: true });
          return;
        }

        const state = searchParams.get('state');
        let role = AuthService.extractRoleFromState(state) || AuthService.getPendingUserRole();

        if (!role) {
          role = 'patient';
        }

        await AuthService.setUserRole(role);
        AuthService.clearPendingUserRole();

        const redirectPath = AuthService.getRoleBasedRedirectPath(role);
        navigate(redirectPath, { replace: true });

      } catch (error) {
        console.error('Authentication callback error:', error);
        setError(error.message);
        
        setTimeout(() => {
          navigate('/prelogin', { replace: true });
        }, 3000);
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
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [profileStatus, setProfileStatus] = useState({ isProfileComplete: null, hasDatabaseEntry: null });
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const { isProfileComplete, hasDatabaseEntry } = await apiService.checkProfileStatus();
          setProfileStatus({ isProfileComplete, hasDatabaseEntry });
          console.log('ProtectedRoute: Profile Status after API call:', { isProfileComplete, hasDatabaseEntry });
        } catch (error) {
          console.error("Error checking profile status:", error);
          setProfileStatus({ isProfileComplete: false, hasDatabaseEntry: false }); // Assume profile is incomplete on error
        } finally {
          setIsCheckingProfile(false);
        }
      }
    };

    if (!isLoading) {
      checkProfile();
    }
  }, [user, isLoading]);

  if (isLoading || isCheckingProfile) {
    return (
      <Container size="sm" py={100}>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Checking authentication...</Text>
        </Stack>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const userRoleRaw = user?.attributes?.['custom:role'] || user?.role;
  if (!userRoleRaw) {
    console.warn('ProtectedRoute: User or userRole not available yet. Waiting...');
    return (
      <Container size="sm" py={100}>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Loading user profile...</Text>
        </Stack>
      </Container>
    );
  }

  const normalizeRole = (role) => {
    if (typeof role === 'string') {
      let r = role.trim().toLowerCase();
      if (r.endsWith('s')) r = r.slice(0, -1);
      return r;
    }
    return role;
  };
  const userRole = normalizeRole(userRoleRaw);
  const required = normalizeRole(requiredRole);

  if (required && userRole !== required) {
    const redirectPath = userRole === 'provider' ? '/provider-dashboard' : '/user-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If profile is incomplete AND there is a database entry, redirect to update profile
  if (profileStatus.isProfileComplete === false && profileStatus.hasDatabaseEntry === true) {
    const redirectPath = userRole === 'provider' ? '/provider-update-profile' : '/update-profile';
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If profile is incomplete AND there is NO database entry, redirect to complete profile
  if (profileStatus.isProfileComplete === false && profileStatus.hasDatabaseEntry === false) {
    const redirectPath = userRole === 'provider' ? '/provider-complete-profile' : '/complete-profile';
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
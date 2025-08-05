import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import apiService from '../services/apiService'; // Import apiService
import AuthService from '../services/authService'; // Import AuthService


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState({ isProfileComplete: null, hasDatabaseEntry: null }); // Add profileStatus state
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  const checkUser = useCallback(async (options = {}) => {
    try {
      console.log(`AuthContext: Checking user session... (Force refresh: ${!!options.forceRefresh})`);
      const { tokens } = await fetchAuthSession({ forceRefresh: options.forceRefresh || false });
      console.log('AuthContext: Fetched tokens:', tokens);
      if (tokens && tokens.idToken) {
        const idTokenPayload = tokens.idToken.payload;
        console.log('AuthContext: ID Token Payload:', idTokenPayload);
        const roles = idTokenPayload['cognito:groups'] || [];
        console.log('AuthContext: Roles from ID Token:', roles);

        setUser({
          ...idTokenPayload,
          username: idTokenPayload['cognito:username'],
          given_name: idTokenPayload.given_name,
          family_name: idTokenPayload.family_name,
          email: idTokenPayload.email,
          role: roles[0], // Attach the first role to the user object
          accessToken: tokens.accessToken.toString(), // Store the access token
          idToken: tokens.idToken.toString(), // Store the ID token for socket auth
        });
        console.log('AuthContext: User set in state.');

        // If user has no roles, set needsRoleAssignment immediately
        if (roles.length === 0) {
          console.log('AuthContext: User has no roles, needs role assignment');
          setProfileStatus({ 
            isProfileComplete: false, 
            hasDatabaseEntry: false,
            needsRoleAssignment: true 
          });
          setHasCheckedProfile(true);
        } else if (!hasCheckedProfile || options.forceRefresh) {
          // Fetch profile status after user is set (only if user has roles and we haven't checked yet, or if force refresh)
          const status = await apiService.checkProfileStatus();
          setProfileStatus(status);
          setHasCheckedProfile(true);
          console.log('AuthContext: Profile Status from API:', status);

          // If user is authenticated but has no role assigned, handle it
          if (status.needsRoleAssignment) {
            console.log('AuthContext: User needs role assignment, will redirect to auth callback flow');
            // Set a flag to indicate role assignment is needed
            setProfileStatus({ ...status, needsRoleAssignment: true });
          }
        }

      } else {
        console.log('AuthContext: No tokens found, user not authenticated.');
        setUser(null); // Ensure user is null if not authenticated
        setProfileStatus({ isProfileComplete: false, hasDatabaseEntry: false }); // Reset profile status
        setHasCheckedProfile(false); // Reset the check flag
      }
    } catch (e) {
      console.error('AuthContext: Error checking user:', e);
      setUser(null);
      setProfileStatus({ isProfileComplete: false, hasDatabaseEntry: false }); // Reset profile status on error
      setHasCheckedProfile(false); // Reset the check flag
    }
    setLoading(false);
    console.log('AuthContext: Loading complete.');
  }, [hasCheckedProfile]);

  useEffect(() => {
    const hubListener = (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          setHasCheckedProfile(false); // Reset check flag when signing in
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          setProfileStatus({ isProfileComplete: false, hasDatabaseEntry: false }); // Reset profile status on sign out
          setHasCheckedProfile(false); // Reset the check flag
          break;
        default:
          break;
      }
    };

    const unsubscribe = Hub.listen('auth', hubListener);
    checkUser();

    return () => {
      unsubscribe();
    };
  }, [checkUser]); // Added checkUser dependency

  const handleLogout = async () => {
    try {
      await signOut({ global: true });
      setUser(null);
      setProfileStatus({ isProfileComplete: false, hasDatabaseEntry: false }); // Reset profile status on logout
      setHasCheckedProfile(false); // Reset the check flag
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogin = (role) => {
    return AuthService.loginWithRole(role);
  };

  const handleSignup = (role) => {
    return AuthService.signupWithRole(role);
  };

  const value = useMemo(() => {
    const getUserAttributes = () => {
      return user ? user.attributes : null;
    };

    return {
      user,
      isAuthenticated: !!user,
      loading,
      profileStatus, // Expose profileStatus
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
      getUserAttributes,
      checkUserSession: checkUser, // Expose checkUser function
    };
  }, [user, loading, profileStatus, checkUser]); // Add checkUser to dependency array

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
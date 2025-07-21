import React, { createContext, useState, useEffect, useContext } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Define checkUser outside useEffect so it can be exposed
  const checkUser = async () => {
    try {
      console.log('AuthContext: Checking user session...');
      const { tokens } = await fetchAuthSession();
      console.log('AuthContext: Fetched tokens:', tokens);
      if (tokens && tokens.idToken) {
        const currentUser = await getCurrentUser();
        const idTokenPayload = tokens.idToken.payload;
        console.log('AuthContext: ID Token Payload:', idTokenPayload);
        const roles = idTokenPayload['cognito:groups'] || [];
        console.log('AuthContext: Roles from ID Token:', roles);

        let userAttributes = {};
        try {
          userAttributes = await fetchUserAttributes();
          console.log('AuthContext: Fetched User Attributes:', userAttributes);
        } catch (e) {
          console.warn('AuthContext: Could not fetch all user attributes, falling back to ID token claims:', e);
          // Fallback to ID token claims for basic attributes if fetchUserAttributes fails
          userAttributes.given_name = idTokenPayload.given_name;
          userAttributes.email = idTokenPayload.email;
          // Add other necessary attributes from idTokenPayload if needed
        }
        setUser({ 
          ...currentUser, 
          attributes: userAttributes,
          role: roles[0] // Attach the first role to the user object
        });
        console.log('AuthContext: User set in state.');
      } else {
        console.log('AuthContext: No tokens found, user not authenticated.');
        setUser(null); // Ensure user is null if not authenticated
      }
    } catch (e) {
      console.error('AuthContext: Error checking user:', e);
      setUser(null);
    }
    setLoading(false);
    console.log('AuthContext: Loading complete.');
  };

  useEffect(() => {
    const hubListener = (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
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
  }, []); // Removed needsTokenRefresh from dependency array

  const handleLogout = async () => {
    try {
      await signOut({ global: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserAttributes = () => {
    return user ? user.attributes : null;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    logout: handleLogout,
    getUserAttributes,
    checkUserSession: checkUser, // Expose checkUser function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
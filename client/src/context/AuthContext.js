import React, { createContext, useState, useEffect, useContext } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('AuthContext: Checking user session...');
        const { tokens } = await fetchAuthSession();
        console.log('AuthContext: Fetched tokens:', tokens);
        if (tokens && tokens.idToken) {
          const currentUser = await getCurrentUser();
          const idTokenPayload = tokens.idToken.payload;
          const roles = idTokenPayload['cognito:groups'] || [];

          let userAttributes = {};
          try {
            userAttributes = await fetchUserAttributes();
          } catch (e) {
            console.warn('AuthContext: Could not fetch all user attributes, possibly due to missing scopes:', e);
            // Fallback to ID token claims for basic attributes
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
        }
      } catch (e) {
        console.error('AuthContext: Error checking user:', e);
        setUser(null);
      }
      setLoading(false);
      console.log('AuthContext: Loading complete.');
    };

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
  }, []);

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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
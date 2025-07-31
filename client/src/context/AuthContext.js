import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const checkUser = async (options = {}) => {
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

  const value = useMemo(() => {
    const getUserAttributes = () => {
      return user ? user.attributes : null;
    };

    return {
      user,
      isAuthenticated: !!user,
      loading,
      logout: handleLogout,
      getUserAttributes,
      checkUserSession: checkUser, // Expose checkUser function
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
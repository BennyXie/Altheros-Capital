import React, { createContext, useState, useEffect, useContext } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (tokens) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (e) {
        // No user is signed in
      }
      setLoading(false);
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
      await signOut();
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
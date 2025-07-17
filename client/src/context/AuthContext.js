import React, { createContext, useState, useEffect, useContext } from 'react';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';


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

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
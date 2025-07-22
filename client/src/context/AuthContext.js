/**
 * Authentication Context and Provider
 * 
 * Provides Amplify-based authentication state management throughout the application.
 * Handles OAuth login, logout, user session management, and automatic token handling.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchAuthSession, signOut, signInWithRedirect, getCurrentUser } from 'aws-amplify/auth';

// Auth action types
const AUTH_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
};

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create auth context
const AuthContext = createContext();

// Mock user data for development bypass mode
const mockUser = {
  userId: 'dev-user-123',
  username: 'dev-user',
  attributes: {
    email: 'dev@example.com',
    given_name: 'Development',
    family_name: 'User',
    name: 'Development User',
    sub: 'dev-user-123'
  },
  signInDetails: {
    loginId: 'dev@example.com'
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      // Check if auth bypass is enabled for development
      const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';
      
      if (bypassAuth) {
        console.log('Auth bypass enabled - using mock user');
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: mockUser });
        return;
      }
      
      // Check if user is authenticated normally
      const user = await getCurrentUser();
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
    } catch (error) {
      console.log('No authenticated user found');
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
    }
  };

  // Login function (redirect to Cognito Hosted UI)
  const login = async () => {
    try {
      await signInWithRedirect();
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Signup function (redirect to Cognito Hosted UI)
  const signup = async () => {
    try {
      await signInWithRedirect();
    } catch (error) {
      console.error('Signup error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Get current user's JWT token (for API calls)
  const getAccessToken = async () => {
    // Return mock token when auth is bypassed
    const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      return 'mock-access-token-for-development';
    }
    
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  // Get current user's ID token (contains user attributes)
  const getIdToken = async () => {
    // Return mock token when auth is bypassed
    const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      return 'mock-id-token-for-development';
    }
    
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  // Get user attributes (for display purposes)
  const getUserAttributes = () => {
    if (!state.user) return null;
    
    // In Amplify v6, attributes are nested under user.attributes
    return {
      email: state.user.attributes?.email || state.user.signInDetails?.loginId,
      given_name: state.user.attributes?.given_name || state.user.attributes?.['custom:given_name'],
      family_name: state.user.attributes?.family_name || state.user.attributes?.['custom:family_name'],
      name: state.user.attributes?.name,
      ...state.user.attributes
    };
  };

  // Get user attributes from JWT ID token (alternative method)
  const getUserAttributesFromToken = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      
      if (idToken) {
        // Parse JWT payload to get user claims
        const payload = idToken.payload;
        console.log('JWT ID Token Payload:', payload); // Debug log
        return {
          email: payload.email,
          given_name: payload.given_name,
          family_name: payload.family_name,
          name: payload.name,
          sub: payload.sub,
          ...payload
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user attributes from token:', error);
      return null;
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    signup,
    logout,
    getAccessToken,
    getIdToken,
    getUserAttributes,
    getUserAttributesFromToken,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

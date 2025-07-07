/**
 * Authentication Context and Provider
 * 
 * Provides authentication state management throughout the application.
 * Handles login, logout, user session management, and protected routes.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cognitoService from '../services/cognitoService';

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
};

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: null,
  idToken: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: action.payload.accessToken,
        idToken: action.payload.idToken,
      };
    
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        accessToken: null,
        idToken: null,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        accessToken: null,
        idToken: null,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: action.payload.accessToken,
        idToken: action.payload.idToken,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
};

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        // Check if Cognito is configured
        if (!cognitoService.isConfigured()) {
          console.warn('Cognito not configured - running in development mode');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }
        
        // Check if user has stored tokens and validate session
        if (cognitoService.isAuthenticated()) {
          const currentUser = await cognitoService.getCurrentUser();
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: {
              user: currentUser.user,
              accessToken: currentUser.accessToken,
              idToken: currentUser.idToken,
            },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthState();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Check if Cognito is configured
      if (!cognitoService.isConfigured()) {
        throw new Error('Authentication is not configured. Please set up your environment variables.');
      }

      const result = await cognitoService.signIn(email, password);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: result.user,
          accessToken: result.accessToken,
          idToken: result.idToken,
        },
      });
      
      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // Signup function
  const signup = async (email, password, givenName, familyName) => {
    dispatch({ type: AUTH_ACTIONS.SIGNUP_START });
    
    try {
      // Check if Cognito is configured
      if (!cognitoService.isConfigured()) {
        throw new Error('Authentication is not configured. Please set up your environment variables.');
      }

      const result = await cognitoService.signUp(email, password, givenName, familyName);
      
      dispatch({ type: AUTH_ACTIONS.SIGNUP_SUCCESS });
      
      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: error.message || 'Signup failed',
      });
      throw error;
    }
  };

  // Confirm signup function
  const confirmSignup = async (email, verificationCode) => {
    try {
      const result = await cognitoService.confirmSignUp(email, verificationCode);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    cognitoService.signOut();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const result = await cognitoService.forgotPassword(email);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Confirm forgot password function
  const confirmForgotPassword = async (email, verificationCode, newPassword) => {
    try {
      const result = await cognitoService.confirmForgotPassword(email, verificationCode, newPassword);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Resend confirmation code
  const resendConfirmationCode = async (email) => {
    try {
      const result = await cognitoService.resendConfirmationCode(email);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    accessToken: state.accessToken,
    idToken: state.idToken,
    login,
    signup,
    confirmSignup,
    logout,
    forgotPassword,
    confirmForgotPassword,
    resendConfirmationCode,
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

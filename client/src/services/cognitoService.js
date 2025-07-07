/**
 * Amazon Cognito Authentication Service
 * 
 * This service handles all Cognito authentication operations including:
 * - User signup and confirmation
 * - User signin and token management  
 * - Password reset functionality
 * - Token refresh and validation
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// Cognito configuration - these should be added to your .env file
const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};

// Validate environment variables
const validateCognitoConfig = () => {
  if (!poolData.UserPoolId || !poolData.ClientId) {
    console.warn('⚠️  Cognito configuration missing! Please set up your environment variables:');
    console.warn('   REACT_APP_COGNITO_USER_POOL_ID');
    console.warn('   REACT_APP_COGNITO_CLIENT_ID');
    console.warn('   See COGNITO_SETUP.md for detailed instructions.');
    return false;
  }
  return true;
};

const isCognitoConfigured = validateCognitoConfig();
const userPool = isCognitoConfigured ? new CognitoUserPool(poolData) : null;

class CognitoAuthService {
  /**
   * Check if Cognito is properly configured
   * @returns {boolean} - True if Cognito is configured
   */
  isConfigured() {
    return isCognitoConfigured && userPool !== null;
  }

  /**
   * Sign up a new user with Cognito
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} givenName - User's first name
   * @param {string} familyName - User's last name
   * @returns {Promise} - Promise that resolves with user data or rejects with error
   */
  signUp(email, password, givenName, familyName) {
    return new Promise((resolve, reject) => {
      if (!this.isConfigured()) {
        reject(new Error('Cognito is not configured. Please set up your environment variables.'));
        return;
      }

      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'given_name',
          Value: givenName,
        }),
        new CognitoUserAttribute({
          Name: 'family_name',
          Value: familyName,
        }),
      ];

      userPool.signUp(
        email,
        password,
        attributeList,
        null,
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        }
      );
    });
  }

  /**
   * Confirm user registration with verification code
   * @param {string} email - User email
   * @param {string} verificationCode - Code sent to user's email
   * @returns {Promise} - Promise that resolves on success
   */
  confirmSignUp(email, verificationCode) {
    return new Promise((resolve, reject) => {
      if (!this.isConfigured()) {
        reject(new Error('Cognito is not configured. Please set up your environment variables.'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise that resolves with session tokens
   */
  signIn(email, password) {
    return new Promise((resolve, reject) => {
      if (!this.isConfigured()) {
        reject(new Error('Cognito is not configured. Please set up your environment variables.'));
        return;
      }

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('refreshToken', refreshToken);

          resolve({
            accessToken,
            idToken,
            refreshToken,
            user: result.getIdToken().payload,
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {
          // Handle new password required scenario
          reject(new Error('New password required'));
        },
      });
    });
  }

  /**
   * Sign out current user
   */
  signOut() {
    if (this.isConfigured()) {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
      }
    }
    
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Get current authenticated user
   * @returns {Promise} - Promise that resolves with user session
   */
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      if (!this.isConfigured()) {
        reject(new Error('Cognito is not configured. Please set up your environment variables.'));
        return;
      }

      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user found'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session.isValid()) {
          reject(new Error('Session is not valid'));
          return;
        }

        resolve({
          user: session.getIdToken().payload,
          session,
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
        });
      });
    });
  }

  /**
   * Initiate forgot password flow
   * @param {string} email - User email
   * @returns {Promise} - Promise that resolves when reset code is sent
   */
  forgotPassword(email) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve('Password reset code sent');
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Confirm forgot password with new password and verification code
   * @param {string} email - User email
   * @param {string} verificationCode - Verification code from email
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise that resolves on success
   */
  confirmForgotPassword(email, verificationCode, newPassword) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve('Password successfully reset');
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Resend verification code for user registration
   * @param {string} email - User email
   * @returns {Promise} - Promise that resolves when code is resent
   */
  resendConfirmationCode(email) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Get stored access token
   * @returns {string|null} - Access token or null if not found
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored ID token
   * @returns {string|null} - ID token or null if not found
   */
  getIdToken() {
    return localStorage.getItem('idToken');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has valid tokens
   */
  isAuthenticated() {
    if (!this.isConfigured()) {
      return false;
    }
    
    const accessToken = this.getAccessToken();
    const idToken = this.getIdToken();
    return !!(accessToken && idToken);
  }
}

export default new CognitoAuthService();

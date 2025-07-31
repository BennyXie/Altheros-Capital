/**
 * Enhanced Authentication Service
 * 
 * Handles role-based authentication with Cognito state parameter manipulation
 * to enforce route protection based on user roles (patient/provider)
 */

import { 
  signInWithRedirect, 
  fetchAuthSession
} from 'aws-amplify/auth';

class AuthService {
  
  /**
   * Login with role-based redirect
   * @param {string} role - User role ('patient' or 'provider')
   */
  static async loginWithRole(role) {
    try {
      // Store role in local storage for callback handling
      localStorage.setItem('pendingUserRole', role);
      
      // Use Cognito state parameter to pass role information
      await signInWithRedirect({
        provider: 'Cognito',
        customState: JSON.stringify({ role }),
      });
    } catch (error) {
      console.error('Login with role error:', error);
      throw error;
    }
  }

  /**
   * Signup with role-based redirect
   * @param {string} role - User role ('patient' or 'provider')
   */
  static async signupWithRole(role) {
    try {
      // Store role in local storage for callback handling
      localStorage.setItem('pendingUserRole', role);
      
      await signInWithRedirect({
        provider: 'Cognito',
        customState: JSON.stringify({ role }),
        options: {
          redirectSignIn: process.env.REACT_APP_COGNITO_REDIRECT_URI,
          redirectSignOut: process.env.REACT_APP_COGNITO_LOGOUT_URI,
          responseType: 'code',
          scopes: ['email', 'openid', 'phone', 'profile'],
        }
      });

    } catch (error) {
      console.error('Signup with role error:', error);
      throw error;
    }
  }

  /**
   * Get the role from local storage after authentication
   * @returns {string|null} - User role or null if not found
   */
  static getPendingUserRole() {
    return localStorage.getItem('pendingUserRole');
  }

  /**
   * Clear the pending user role
   */
  static clearPendingUserRole() {
    localStorage.removeItem('pendingUserRole');
  }

  /**
   * Set user role in Cognito user attributes by calling the backend
   * @param {string} role - User role to set
   */
  static async setUserRole(role) {
    try {
      console.log('🔧 Setting user role:', role);
      
      const token = await this.getAccessToken();
      console.log('🔧 Access token obtained:', !!token);
      
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/auth/add-to-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      console.log('🔧 Role assignment response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔧 Role assignment failed:', errorData);
        throw new Error(`Failed to set user role: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log('🔧 Role assignment successful:', result);
      return result;
    } catch (error) {
      console.error('🔧 Error setting user role:', error);
      throw error;
    }
  }

  /**
   * Get access token from current session
   * @returns {string|null} - Access token or null
   */
  static async getAccessToken() {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  

  /**
   * Extract role from Cognito callback state
   * @param {string} state - Cognito state parameter
   * @returns {string|null} - Extracted role or null
   */
  static extractRoleFromState(state) {
    try {
      if (!state) return null;
      // The state from Cognito can be a simple string or a JSON string.
      // We need to handle both cases.
      if (state.startsWith('{') && state.endsWith('}')) {
        const parsedState = JSON.parse(state);
        return parsedState.role || null;
      }
      const match = state.match(/"role":"(.*?)"/);
      return match ? match[1] : state;
    } catch (error) {
      console.error('AuthService: Error extracting role from state:', error);
      return null;
    }
  }

  /**
   * Determine redirect path based on user role
   * @param {string} role - User role
   * @returns {string} - Redirect path
   */
  static getRoleBasedRedirectPath(role) {
    let normalizedRole = role?.trim().toLowerCase().replace(/s$/, '');
    const roleRedirects = {
      patient: "/user-dashboard",
      provider: "/provider-dashboard",
    };
    return roleRedirects[normalizedRole] || "/user-dashboard";
  }
}

export default AuthService;
/**
 * Enhanced Authentication Service
 * 
 * Handles role-based authentication with Cognito state parameter manipulation
 * to enforce route protection based on user roles (patient/provider)
 */

import { signInWithRedirect } from 'aws-amplify/auth';

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
        options: {
          // This will be used to determine redirect after authentication
          preferPrivateSession: false
        }
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
      
      // Use Cognito state parameter to pass role information
      await signInWithRedirect({
        provider: 'Cognito',
        customState: JSON.stringify({ role }),
        options: {
          preferPrivateSession: false
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
   * Set user role in Cognito user attributes
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

      // This would be called after successful authentication
      // to set the role as a custom attribute in Cognito
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
      const { fetchAuthSession } = await import('aws-amplify/auth');
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
      const decodedState = JSON.parse(decodeURIComponent(state));
      return decodedState.role || null;
    } catch (error) {
      console.error('Error extracting role from state:', error);
      return null;
    }
  }

  /**
   * Determine redirect path based on user role
   * @param {string} role - User role
   * @returns {string} - Redirect path
   */
  static getRoleBasedRedirectPath(role) {
    const roleRedirects = {
      'patient': '/complete-profile',
      'provider': '/provider-complete-profile'
    };

    return roleRedirects[role] || '/dashboard';
  }

  /**
   * Handle post-authentication role assignment
   * @param {Object} user - Authenticated user object
   * @returns {Promise<string>} - Redirect path based on role
   */
  static async handlePostAuthRole(user) {
    try {
      // First, try to get role from URL state or local storage
      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get('state');
      let role = this.extractRoleFromState(state) || this.getPendingUserRole();

      if (!role) {
        // Fallback: try to get role from user attributes if already set
        role = user.attributes?.['custom:role'] || 'patient';
      }

      // Set the role in the backend
      await this.setUserRole(role);

      // Clear pending role from local storage
      this.clearPendingUserRole();

      // Return appropriate redirect path
      return this.getRoleBasedRedirectPath(role);
    } catch (error) {
      console.error('Error handling post-auth role:', error);
      // Default to patient role and dashboard
      return '/dashboard';
    }
  }
}

export default AuthService;

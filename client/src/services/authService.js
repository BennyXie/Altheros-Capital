/**
 * Enhanced Authentication Service
 * 
 * Handles role-based authentication with Cognito state parameter manipulation
 * to enforce route protection based on user roles (patient/provider)
 */

import { 
  signInWithRedirect, 
  fetchAuthSession,
  signOut
} from 'aws-amplify/auth';

class AuthService {
  
  /**
   * Login with role-based redirect
   * @param {string} role - User role ('patient' or 'provider')
   */
  static async loginWithRole(role) {
    try {
      // Check if user is already authenticated to avoid UserAlreadyAuthenticatedException
      try {
        const session = await fetchAuthSession();
        if (session.tokens && session.tokens.idToken) {
          console.log('AuthService: User already authenticated, skipping redirect');
          return; // User is already authenticated, no need to redirect
        }
      } catch (sessionError) {
        console.log('AuthService: No existing session, proceeding with login');
      }

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
      console.log('AuthService: signupWithRole called with role:', role);
      // Store role in local storage for callback handling
      localStorage.setItem('pendingUserRole', role);
      console.log('AuthService: Stored role in localStorage:', role);
      
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
    const role = localStorage.getItem('pendingUserRole');
    console.log('AuthService: getPendingUserRole returning:', role);
    return role;
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
   * Extract role from state parameter passed through authentication flow
   * @param {string} state - Cognito state parameter
   * @returns {string|null} - Extracted role or null
   */
  static extractRoleFromState(state) {
    try {
      console.log('AuthService: extractRoleFromState called with state:', state);
      if (!state) return null;
      
      // The state from Cognito can be a simple string or a JSON string.
      // We need to handle both cases.
      if (state.startsWith('{') && state.endsWith('}')) {
        console.log('AuthService: State appears to be JSON, parsing...');
        const parsedState = JSON.parse(state);
        console.log('AuthService: Parsed state:', parsedState);
        return parsedState.role || null;
      }
      
      // Check if the state contains hex-encoded JSON data
      console.log('AuthService: State is not JSON, checking for hex-encoded data...');
      const hexMatch = state.match(/([0-9a-fA-F]{40,})$/); // Look for longer hex strings (20+ bytes)
      if (hexMatch) {
        try {
          console.log('AuthService: Found potential hex data:', hexMatch[1]);
          // Convert hex to string using a more robust method
          const hexString = hexMatch[1];
          let decodedString = '';
          // Use manual conversion since Buffer might not be available in browser
          for (let i = 0; i < hexString.length; i += 2) {
            const byte = parseInt(hexString.substr(i, 2), 16);
            if (isNaN(byte)) break; // Stop if we hit invalid hex
            decodedString += String.fromCharCode(byte);
          }
          console.log('AuthService: Decoded hex string:', decodedString);
          
          // Try to parse as JSON
          if (decodedString.startsWith('{') && decodedString.endsWith('}')) {
            const parsedData = JSON.parse(decodedString);
            console.log('AuthService: Parsed decoded data:', parsedData);
            if (parsedData.role) {
              console.log('AuthService: Extracted role from hex-encoded data:', parsedData.role);
              return parsedData.role;
            }
          }
        } catch (decodeError) {
          console.log('AuthService: Failed to decode hex data:', decodeError);
        }
      }
      
      // Fallback: try regex match on original state
      console.log('AuthService: Trying regex match on original state...');
      const match = state.match(/"role":"(.*?)"/);
      const result = match ? match[1] : null;
      console.log('AuthService: Regex match result:', result);
      
      // If no match found and state doesn't look like encoded data, return null
      if (!result && (state === 'patient' || state === 'provider')) {
        console.log('AuthService: State appears to be a direct role value:', state);
        return state;
      }
      
      // If we still don't have a result, check localStorage as fallback
      if (!result) {
        console.log('AuthService: No role found in state, checking localStorage fallback...');
        const pendingRole = localStorage.getItem('pendingUserRole');
        if (pendingRole) {
          console.log('AuthService: Found role in localStorage fallback:', pendingRole);
          return pendingRole;
        }
      }
      
      return result;
    } catch (error) {
      console.error('AuthService: Error extracting role from state:', error);
      return null;
    }
  }  /**
   * Determine redirect path based on user role
   * @param {string} role - User role
   * @returns {string} - Redirect path
   */
  static getRoleBasedRedirectPath(role) {
    console.log('AuthService: getRoleBasedRedirectPath called with role:', role);
    let normalizedRole = role?.trim().toLowerCase();
    
    // Handle both singular and plural forms
    if (normalizedRole === 'patients' || normalizedRole === 'patient') {
      return "/user-dashboard";
    } else if (normalizedRole === 'providers' || normalizedRole === 'provider') {
      return "/provider-dashboard";
    }
    
    // Default fallback
    console.log('AuthService: Unknown role, defaulting to user-dashboard');
    return "/user-dashboard";
  }

  /**
   * Completely clear all authentication state and cache
   * Use this when user accounts have been deleted or when you need a fresh start
   */
  static async clearAllAuthState() {
    try {
      console.log('AuthService: Clearing all authentication state...');
      
      // 1. Sign out from Amplify
      try {
        await signOut({ global: true });
        console.log('AuthService: Successfully signed out from Amplify');
      } catch (signOutError) {
        console.log('AuthService: Sign out error (expected if no session):', signOutError.message);
      }
      
      // 2. Clear localStorage
      localStorage.removeItem('pendingUserRole');
      localStorage.removeItem('amplify-signin-with-hostedUI');
      localStorage.removeItem('amplify-redirected-from-hosted-ui');
      
      // Clear any other Amplify-related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('amplify') || key.startsWith('aws') || key.startsWith('cognito')) {
          localStorage.removeItem(key);
          console.log(`AuthService: Cleared localStorage item: ${key}`);
        }
      });
      
      // 3. Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('amplify') || key.startsWith('aws') || key.startsWith('cognito')) {
          sessionStorage.removeItem(key);
          console.log(`AuthService: Cleared sessionStorage item: ${key}`);
        }
      });
      
      // 4. Clear any cookies (for completeness)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('AuthService: All authentication state cleared');
      
      // 5. Force reload to ensure clean state
      window.location.href = '/';
      
    } catch (error) {
      console.error('AuthService: Error clearing authentication state:', error);
      // Even if there's an error, try to redirect to home
      window.location.href = '/';
    }
  }
}

export default AuthService;
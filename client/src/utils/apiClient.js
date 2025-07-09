/**
 * API Client with Amplify Authentication
 * 
 * Automatically includes Cognito JWT tokens in API requests
 * and handles token refresh transparently
 */

import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL;

class ApiClient {
  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} - Fetch response
   */
  async request(endpoint, options = {}) {
    try {
      // Get the current JWT token from Amplify
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No access token available');
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      // Make the request
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      
      // If authentication failed, user might need to re-login
      if (error.name === 'NotAuthorizedException') {
        console.log('User not authenticated, redirecting to login...');
        window.location.href = '/auth';
      }
      
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @returns {Promise<any>} - Parsed JSON response
   */
  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      method: 'GET',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise<any>} - Parsed JSON response
   */
  async post(endpoint, data = null, options = {}) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise<any>} - Parsed JSON response
   */
  async put(endpoint, data = null, options = {}) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @returns {Promise<any>} - Parsed JSON response
   */
  async delete(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

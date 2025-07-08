/**
 * API Service for Backend Communication
 * 
 * Handles communication with your Node.js/Express backend
 * for user registration and authentication-related operations.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ApiService {
  /**
   * Get authorization headers with current user token
   * @returns {Object} - Headers object with authorization
   */
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Make API request with error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} - Promise that resolves with response data
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Test Cognito signup with backend
   * @param {Object} userData - User data for signup
   * @returns {Promise} - Promise that resolves with response
   */
  async testCognitoSignup(userData) {
    return this.makeRequest('/api/auth/test-cognito', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Complete user profile after Cognito signup
   * @param {Object} profileData - Complete profile data
   * @returns {Promise} - Promise that resolves with response
   */
  async completeUserProfile(profileData) {
    return this.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Get user profile data
   * @returns {Promise} - Promise that resolves with user profile
   */
  async getUserProfile() {
    return this.makeRequest('/api/auth/profile');
  }

  /**
   * Access protected route (example)
   * @returns {Promise} - Promise that resolves with protected data
   */
  async getProtectedData() {
    return this.makeRequest('/api/auth/protected');
  }

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise} - Promise that resolves with updated profile
   */
  async updateUserProfile(updates) {
    return this.makeRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete user from both Cognito and database (for testing purposes)
   * @param {string} email - User email to delete
   * @returns {Promise} - Promise that resolves when user is deleted
   */
  async deleteUser(email) {
    return this.makeRequest('/api/auth/delete-user', {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    });
  }
}

const apiService = new ApiService();
export default apiService;

/**
 * API Service for Backend Communication
 * 
 * Handles communication with your Node.js/Express backend
 * for user registration and authentication-related operations.
 */

import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ApiService {
  /**
   * Get authorization headers with current user token
   * @returns {Object} - Headers object with authorization
   */
  async getAuthHeaders() {
    try {
      let { tokens } = await fetchAuthSession();
      let idToken = tokens?.idToken?.toString();

      // If idToken is missing, force a refresh of the session
      if (!idToken) {
        console.log('ApiService: idToken missing, forcing session refresh.');
        ({ tokens } = await fetchAuthSession({ forceRefresh: true }));
        idToken = tokens?.idToken?.toString();
      }

      console.log('ApiService: Fetched tokens:', tokens);
      console.log('ApiService: Extracted idToken:', idToken);
      return {
        'Content-Type': 'application/json',
        ...(idToken && { 'Authorization': `Bearer ${idToken}` })
      };
    } catch (error) {
      console.error('Error fetching auth session:', error);
      return { 'Content-Type': 'application/json' };
    }
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
        headers: await this.getAuthHeaders(),
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
    const { role, ...dataToSend } = profileData;
    let endpoint = '';

    if (role === 'patient') {
      endpoint = '/api/profile/patient';
    } else if (role === 'provider') {
      endpoint = '/api/profile/provider';
    } else {
      throw new Error('Invalid role specified for profile completion');
    }

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
  }

  async updateUserProfile(profileData) {
    const { role, ...dataToSend } = profileData;
    let endpoint = '';

    if (role === 'patient') {
      endpoint = '/api/profile/patient';
    } else if (role === 'provider') {
      endpoint = '/api/profile/provider';
    } else {
      throw new Error('Invalid role specified for profile update');
    }

    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(dataToSend),
    });
  }

  async checkProfileStatus() {
    return this.makeRequest('/api/profile/status');
  }

  async deleteUserProfile() {
    return this.makeRequest('/api/profile', {
      method: 'DELETE',
    });
  }

  /**
   * Get user profile data
   * @returns {Promise} - Promise that resolves with user profile
   */
  async getUserProfile() {
    return this.makeRequest('/api/auth/profile');
  }

  async getProviderProfile() {
    return this.makeRequest('/api/profile/provider');
  }

  async getPatientProfile() {
    return this.makeRequest('/api/profile/patient');
  }

  /**
   * Access protected route (example)
   * @returns {Promise} - Promise that resolves with protected data
   */
  async getProtectedData() {
    return this.makeRequest('/api/auth/protected');
  }

  

  async getSchedule(providerId) {
    return this.makeRequest(`/api/schedule/${providerId}`);
  }

  async updateSchedule(providerId, scheduleData) {
    return this.makeRequest(`/api/schedule/${providerId}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  /**
   * Create or get existing chat between participants
   * @param {Array} participants - Array of participant IDs [patientId, providerId]
   * @returns {Promise} - Promise that resolves with chat data
   */
  async createOrGetChat(participants) {
    return this.makeRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ participants }),
    });
  }
}

const apiService = new ApiService();
export default apiService;

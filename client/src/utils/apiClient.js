import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL;

class ApiClient {
  async request(endpoint, options = {}, authRequired = true) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (authRequired) {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        if (!token) {
          throw new Error('No access token available');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error.name === 'NotAuthorizedException') {
        console.log('User not authenticated, redirecting to login...');
        window.location.href = '/auth';
      }
      
      throw error;
    }
  }

  async get(endpoint, options = {}, authRequired = true) {
    const response = await this.request(endpoint, {
      method: 'GET',
      ...options,
    }, authRequired);

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  async post(endpoint, data = null, options = {}, authRequired = true) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    }, authRequired);

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  async put(endpoint, data = null, options = {}, authRequired = true) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    }, authRequired);

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint, options = {}, authRequired = true) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
      ...options,
    }, authRequired);

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }
}

const apiClient = new ApiClient();
export default apiClient;
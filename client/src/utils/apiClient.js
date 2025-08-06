import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL;

class ApiClient {
  async request(endpoint, options = {}, authRequired = true) {
    try {
      const finalOptions = { ...options };
      let headers = finalOptions.headers || {};

      if (finalOptions.body instanceof FormData) {
        delete headers['Content-Type'];
      } else if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      finalOptions.headers = headers;

      if (authRequired) {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        if (!token) {
          throw new Error('No access token available');
        }
        finalOptions.headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);

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
    let requestBody = null;
    let requestHeaders = { ...options.headers };

    if (data instanceof FormData) {
      requestBody = data;
      // When sending FormData, the browser automatically sets the Content-Type header
      // to multipart/form-data with the correct boundary. Do not set it manually.
      delete requestHeaders['Content-Type']; 
    } else if (data !== null) {
      requestBody = JSON.stringify(data);
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await this.request(endpoint, {
      method: 'POST',
      body: requestBody,
      headers: requestHeaders,
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

    // Only parse JSON if there is content
    if (response.status !== 204) {
      return response.json();
    }
    return null;
  }

  
}

const apiClient = new ApiClient();
export default apiClient;
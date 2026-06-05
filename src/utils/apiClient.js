import { API_BASE_URL } from '../config/api';

// Guard: strip a trailing "/api" from the base URL so endpoint paths like
// "/api/auth/login" are never double-prefixed to ".../api/api/auth/login".
function sanitizeBaseURL(url) {
  if (!url) return '';
  return url.replace(/\/api\/?$/, '');
}

class ApiClient {
  constructor() {
    this.baseURL = sanitizeBaseURL(API_BASE_URL);
  }

  getAuthToken() {
    return localStorage.getItem('sne_token');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', body, includeAuth = true, ...otherOptions } = options;

    const config = {
      method,
      headers: this.getHeaders(includeAuth),
      ...otherOptions,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        // FastAPI returns { detail: "..." } for HTTPException,
        // and our custom handler returns { message: "..." }.
        const message =
          data.detail || data.message || `Request failed (${response.status})`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

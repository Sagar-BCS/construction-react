import axios from 'axios';
import { environment } from '../config/environment';

/**
 * Axios Instance + Interceptors
 * ------------------------------
 * Creates a pre-configured Axios instance with:
 * 1. Base URL from environment config
 * 2. Request interceptor: auto-attaches JWT token to every request
 * 3. Response interceptor: handles 401 (unauthorized) globally
 */

// Create Axios instance with default config
const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────
// Runs BEFORE every request is sent
// Attaches the JWT token from localStorage to the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Remove quotes if stored as JSON string
      const cleanToken = token.replace(/"/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    // Request error (e.g., network issue before request is sent)
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ───────────────────────────────────────────
// Runs AFTER every response is received
// Handles 401 Unauthorized globally (token expired / invalid)
api.interceptors.response.use(
  (response) => {
    // Any 2xx status — just pass the response through
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on login page (prevent infinite loop)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

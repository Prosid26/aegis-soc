// src/lib/api.ts
// API client and authentication utilities

import axios from 'axios';

// Create API client instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      // Optionally redirect to login or refresh token
      console.error('Unauthorized - redirecting to login');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication utilities
const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  // Set authentication data
  setAuthData: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  // Clear authentication data
  clearAuthData: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Get user from token (if JWT)
  getUserFromToken: (): any => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  },
};

export { apiClient, authUtils };
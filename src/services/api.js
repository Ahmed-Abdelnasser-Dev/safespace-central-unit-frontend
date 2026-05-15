/**
 * API Service
 * Centralized API client with authentication and error handling
 */

import axios from 'axios';
import { API_URL } from '../lib/apiConfig';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required: backend uses HttpOnly cookies for auth tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        }, { withCredentials: true });

        // Extract from wrapper
        const tokens = data.data;
        sessionStorage.setItem('accessToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Authentication APIs
// ============================================================================

export const authAPI = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise} { accessToken, refreshToken } or { mustChangePassword, userId } or { mfaRequired, userId }
   */
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data; // Extract from wrapper
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {Promise} { accessToken, refreshToken }
   */
  refresh: async (refreshToken) => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data.data; // Extract from wrapper
  },

  /**
   * Logout
   * @param {string} refreshToken
   */
  logout: async (refreshToken) => {
    await api.post('/auth/logout', { refreshToken });
  },

  /**
   * Verify MFA code (ignored for now as per requirements)
   * @param {string} userId
   * @param {string} code
   * @returns {Promise} { accessToken, refreshToken }
   */
  verifyMFA: async (userId, code) => {
    const { data } = await api.post('/auth/mfa/verify', { userId, code });
    return data.data; // Extract from wrapper
  },

  /**
   * Change password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    await api.post('/auth/change-password', { userId, currentPassword, newPassword });
  },
};

// ============================================================================
// User Management APIs
// ============================================================================

export const userAPI = {
  /**
   * Get current user profile
   * @returns {Promise} User object
   */
  getMe: async () => {
    const { data } = await api.get('/users/me');
    return data.data; // Extract from wrapper
  },

  /**
   * Update current user profile
   * @param {Object} updates - firstName, lastName, phone
   * @returns {Promise} Updated user object
   */
  updateMe: async (updates) => {
    const { data } = await api.patch('/users/me', updates);
    return data.data; // Extract from wrapper
  },

  /**
   * Update profile photo
   * @param {File} photoFile
   * @returns {Promise} Updated user object
   */
  updatePhoto: async (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    const { data } = await api.patch('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data; // Extract from wrapper
  },

  /**
   * List all users (admin only)
   * @param {Object} params - page, limit, role, search, isActive
   * @returns {Promise} { users, total, page, totalPages }
   */
  listUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data.data; // Extract from wrapper
  },

  /**
   * Get user by ID (admin only)
   * @param {string} userId
   * @returns {Promise} User object
   */
  getUser: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data.data; // Extract from wrapper
  },

  /**
   * Create new user (admin only)
   * @param {Object} userData
   * @returns {Promise} Created user object
   */
  createUser: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data.data; // Extract from wrapper
  },

  /**
   * Update user by admin (email, roleId)
   * @param {string} userId
   * @param {Object} updates - email, roleId
   * @returns {Promise} Updated user object
   */
  updateUser: async (userId, updates) => {
    const { data } = await api.patch(`/users/${userId}`, updates);
    return data.data;
  },

  /**
   * Deactivate user (admin only)
   * @param {string} userId
   * @returns {Promise} Updated user object
   */
  deactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/deactivate`);
    return data.data; // Extract from wrapper
  },

  /**
   * Reactivate user (admin only)
   * @param {string} userId
   * @returns {Promise} Updated user object
   */
  reactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/reactivate`);
    return data.data; // Extract from wrapper
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  },
};

// ============================================================================
// Activity Logs APIs
// ============================================================================

export const activityLogsAPI = {
  /**
   * Get activity logs (admin only)
   * @param {Object} params - page, limit, userId, eventType, action, startDate, endDate
   * @returns {Promise} { logs, total, page, totalPages }
   */
  getLogs: async (params = {}) => {
    const { data } = await api.get('/activity-logs', { params });
    return data.data; // Extract from wrapper
  },
};

export default api;
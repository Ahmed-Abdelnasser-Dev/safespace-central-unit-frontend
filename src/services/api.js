/**
 * API Service
 * Centralized API client with authentication and error handling
 *
 * Auth model: tokens live in HttpOnly cookies set by the backend.
 * The browser sends them automatically with every withCredentials request.
 * We NEVER store accessToken / refreshToken in sessionStorage.
 *
 * sessionStorage is only used for the user profile object (non-sensitive,
 * used only to hydrate the Redux store on page reload).
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

// ─── Request interceptor ──────────────────────────────────────────────────────
// Tokens are in HttpOnly cookies — browser attaches them automatically.
// Nothing to inject here; interceptor is kept for future use.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response interceptor — silent token refresh ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet, ask backend to rotate the refresh cookie
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh cookie is sent automatically via withCredentials.
        // Backend rotates it and sets a new access cookie.
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request — new access cookie is now in place
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — wipe the cached user profile and go to login
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
   * Login with email and password.
   * @param {string}  email
   * @param {string}  password
   * @param {boolean} rememberMe — true = 30-day cookie, false = session cookie
   * @returns {Promise} { mustChangePassword, userId } | { mfaRequired, userId } | {}
   */
  login: async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    return data.data; // Extract from wrapper
  },

  /**
   * Refresh access token — tokens travel via cookies automatically.
   */
  refresh: async () => {
    const { data } = await api.post('/auth/refresh', {});
    return data.data;
  },

  /**
   * Logout — backend revokes the refresh cookie.
   */
  logout: async () => {
    await api.post('/auth/logout', {});
  },

  /**
   * Verify MFA code
   * @param {string}  userId
   * @param {string}  code
   * @param {boolean} rememberMe — must match the value used at sign-in
   */
  verifyMFA: async (userId, code, rememberMe = false) => {
    const { data } = await api.post('/auth/mfa/verify', { userId, code, rememberMe });
    return data.data;
  },

  /**
   * Change password
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    await api.post('/auth/change-password', { userId, currentPassword, newPassword });
  },

  /**
   * Request a password reset link.
   * Always resolves — backend never reveals whether the email is registered.
   * @param {string} email
   */
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Complete password reset using the token from the email link.
   * @param {string} token       — raw token from ?token= query parameter
   * @param {string} newPassword
   */
  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },
};

// ============================================================================
// User Management APIs
// ============================================================================

export const userAPI = {
  /**
   * Get current user profile
   */
  getMe: async () => {
    const { data } = await api.get('/users/me');
    return data.data;
  },

  /**
   * Update current user profile
   */
  updateMe: async (updates) => {
    const { data } = await api.patch('/users/me', updates);
    return data.data;
  },

  /**
   * Update profile photo
   */
  updatePhoto: async (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    const { data } = await api.patch('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  /**
   * List all users (admin only)
   */
  listUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data.data;
  },

  /**
   * Get user by ID (admin only)
   */
  getUser: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data.data;
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data.data;
  },

  /**
   * Update user by admin
   */
  updateUser: async (userId, updates) => {
    const { data } = await api.patch(`/users/${userId}`, updates);
    return data.data;
  },

  /**
   * Deactivate user (admin only)
   */
  deactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/deactivate`);
    return data.data;
  },

  /**
   * Reactivate user (admin only)
   */
  reactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/reactivate`);
    return data.data;
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
  getLogs: async (params = {}) => {
    const { data } = await api.get('/activity-logs', { params });
    return data.data;
  },
};

export default api;
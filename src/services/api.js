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
// Refresh tokens rotate server-side on every use (old one is revoked, a new
// one issued). If two requests 401 at the same time and each independently
// calls /auth/refresh, the second call races against an already-rotated
// token and fails — wrongly logging out a still-valid session. This shared
// promise makes every concurrent 401 retry await the *same* refresh call.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never try to refresh if the failing request is itself an auth call.
    // /auth/login, /auth/refresh, /auth/mfa/verify etc. should fail normally
    // so the UI can show the error message to the user.
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    // If 401 and haven't retried yet, ask backend to rotate the refresh cookie
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Refresh cookie is sent automatically via withCredentials.
        // Backend rotates it and sets a new access cookie.
        // Reuse an in-flight refresh instead of starting a new one.
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;

        // Retry the original request — new access cookie is now in place
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — wipe the cached user profile and go to login
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
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
   * Generate a new TOTP secret + QR code (call once per setup flow)
   * User must be logged in.
   */
  setupMFA: async () => {
    const { data } = await api.post('/auth/mfa/setup');
    return data.data; // { qrCode, secret }
  },

  /**
   * Confirm MFA setup by verifying the first TOTP code.
   * Returns { backupCodes } — show these to the user exactly once.
   */
  enableMFA: async (code) => {
    const { data } = await api.post('/auth/mfa/enable', { code });
    return data.data; // { backupCodes: string[] }
  },

  /**
   * Disable MFA — requires password + current TOTP code.
   */
  disableMFA: async (password, code) => {
    await api.post('/auth/mfa/disable', { password, code });
  },

  /**
   * Change password.
   * Identity comes from the authenticated session (HttpOnly cookie) on the
   * backend — never send a userId here, the server ignores/rejects it.
   */
  changePassword: async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
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

  /**
   * Admin reset a user's password.
   * sendEmail=true  → backend emails reset link to user (preferred)
   * sendEmail=false → backend returns a temp password to the admin
   */
  adminResetPassword: async (userId, { sendEmail = true } = {}) => {
    const { data } = await api.post(`/users/${userId}/reset-password`, { sendEmail });
    return data.data;
  },

/**
   * Permanently delete a user (admin only).
   * Requires confirmEmail — must exactly match the target user's email.
   * This is the server-side half of the "type the user's email to confirm" modal.
   */
  deleteUser: async (userId, confirmEmail) => {
    const { data } = await api.delete(`/users/${userId}`, { data: { confirmEmail } });
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
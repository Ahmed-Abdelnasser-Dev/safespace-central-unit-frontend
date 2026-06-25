/**
 * API Service
 * Centralized API client with authentication and error handling
 *
 * Auth model: tokens live in HttpOnly cookies set by the backend.
 * The browser sends them automatically with every withCredentials request.
 * We NEVER store accessToken / refreshToken in sessionStorage.
 *
 * sessionStorage / localStorage are only used for the user profile object
 * (non-sensitive, used only to hydrate the Redux store on page reload).
 */

import axios from 'axios';
import { API_URL } from '../lib/apiConfig';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/mfa/verify', '/auth/change-password'];

const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

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

    if (!originalRequest || isAuthEndpoint(originalRequest.url || '')) {
      return Promise.reject(error);
    }

    // If 401 and we haven't retried yet, try to refresh session via cookie
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Reuse an in-flight refresh instead of starting a new one.
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;

        // Backend sets new cookies — retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear user state and redirect to login
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
   * Login with email, password, and rememberMe flag
   * Backend sets HTTP-only cookies: safespace_access_token, safespace_refresh_token
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe - extends refresh session if true
   * @returns {Promise} { user, mustChangePassword, userId } or { mfaRequired, userId }
   */
  login: async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe }, { withCredentials: true });
    return data.data;
  },

  /**
   * Refresh session using HTTP-only cookies
   * No parameters needed - backend reads cookies automatically
   * @returns {Promise} { user } or throws 401 on invalid session
   */
  refresh: async () => {
    const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
    return data.data;
  },

  /**
   * Logout - clears HTTP-only cookies server-side
   */
  logout: async () => {
    await api.post('/auth/logout', {}, { withCredentials: true });
  },

  /**
   * Verify MFA code
   * @param {string} userId
   * @param {string} code
   * @param {boolean} rememberMe - same as login choice
   * @returns {Promise} { user } - tokens set in cookies
   */
  verifyMFA: async (userId, code, rememberMe = false) => {
    const { data } = await api.post('/auth/mfa/verify', { userId, code, rememberMe }, { withCredentials: true });
    return data.data;
  },

  /**
   * Generate a new TOTP secret + QR code (call once per setup flow).
   * User must be logged in.
   * @returns {Promise<{qrCode: string, secret: string}>}
   */
  setupMFA: async () => {
    const { data } = await api.post('/auth/mfa/setup', {}, { withCredentials: true });
    return data.data;
  },

  /**
   * Confirm MFA setup by verifying the first TOTP code.
   * @param {string} code - TOTP code from authenticator app
   * @returns {Promise<{backupCodes: string[]}>}
   */
  enableMFA: async (code) => {
    const { data } = await api.post('/auth/mfa/enable', { code }, { withCredentials: true });
    return data.data;
  },

  /**
   * Disable MFA — requires password + current TOTP code.
   * @param {string} password
   * @param {string} code
   */
  disableMFA: async (password, code) => {
    await api.post('/auth/mfa/disable', { password, code }, { withCredentials: true });
  },

  /**
   * Change password. Identity comes from the authenticated session cookie.
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword }, { withCredentials: true });
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
    const { data } = await api.get('/users/me', { withCredentials: true });
    return data.data;
  },

  /**
   * Update current user profile
   */
  updateMe: async (updates) => {
    const { data } = await api.patch('/users/me', updates, { withCredentials: true });
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
      withCredentials: true,
    });
    return data.data;
  },

  /**
   * List all users (admin only)
   */
  listUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params, withCredentials: true });
    return data.data;
  },

  /**
   * Get user by ID (admin only)
   */
  getUser: async (userId) => {
    const { data } = await api.get(`/users/${userId}`, { withCredentials: true });
    return data.data;
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (userData) => {
    const { data } = await api.post('/users', userData, { withCredentials: true });
    return data.data;
  },

  /**
   * Update user by admin
   */
  updateUser: async (userId, updates) => {
    const { data } = await api.patch(`/users/${userId}`, updates, { withCredentials: true });
    return data.data;
  },

  /**
   * Deactivate user (admin only)
   */
  deactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/deactivate`, {}, { withCredentials: true });
    return data.data;
  },

  /**
   * Reactivate user (admin only)
   */
  reactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/reactivate`, {}, { withCredentials: true });
    return data.data;
  },

  /**
   * Admin reset a user's password.
   * sendEmail=true  → backend emails reset link to user (preferred)
   * sendEmail=false → backend returns a temp password to the admin
   */
  adminResetPassword: async (userId, { sendEmail = true } = {}) => {
    const { data } = await api.post(`/users/${userId}/reset-password`, { sendEmail }, { withCredentials: true });
    return data.data;
  },

  /**
   * Permanently delete a user (admin only).
   * Requires confirmEmail — must exactly match the target user's email.
   * This is the server-side half of the "type the user's email to confirm" modal.
   */
  deleteUser: async (userId, confirmEmail) => {
    const { data } = await api.delete(`/users/${userId}`, { data: { confirmEmail }, withCredentials: true });
    return data;
  },
};

// ============================================================================
// Activity Logs APIs
// ============================================================================

export const activityLogsAPI = {
  getLogs: async (params = {}) => {
    const { data } = await api.get('/activity-logs', { params, withCredentials: true });
    return data.data;
  },
};

// ============================================================================
// Metrics APIs
// ============================================================================

export const metricsAPI = {
  /**
   * Fetch aggregated hourly metrics for a given metric type and date range.
   * @param {string} type - e.g. 'user_activity' or 'alerts'
   * @param {string} startDate - ISO date string (inclusive)
   * @param {string} endDate - ISO date string (inclusive)
   * @returns {Promise} { labels: string[], data: number[] }
   */
  getHourly: async (type, startDate, endDate, unit) => {
    const params = { type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (unit) params.unit = unit;
    const { data } = await api.get('/metrics/hourly', { params, withCredentials: true });
    return data.data;
  }
};

// ============================================================================
// Emergency Dispatcher APIs
// ============================================================================

export const dispatcherAPI = {
  /**
   * Get authenticated dispatcher's session info (id, name, shiftStart)
   * @returns {Promise<{id: string, name: string, shiftStart: string}>}
   */
  getSession: async () => {
    const { data } = await api.get('/dispatcher/me', { withCredentials: true });
    return data.data;
  },

  /**
   * List dispatcher cases (paginated, filterable by status/caseType)
   * @param {Object} params - status, caseType, page, limit
   * @returns {Promise<{cases: Case[], meta: PaginationMeta}>}
   */
  listCases: async (params = {}) => {
    const { data } = await api.get('/dispatcher/cases', { params, withCredentials: true });
    return { cases: data.data, meta: data.meta };
  },

  /**
   * Get full case detail including notes and attachments
   * @param {string} id - DispatcherCase UUID
   * @returns {Promise<Case>}
   */
  getCase: async (id) => {
    const { data } = await api.get(`/dispatcher/cases/${id}`, { withCredentials: true });
    return data.data;
  },

  /**
   * Acknowledge a case — clears isUnread, transitions queued→acknowledged (idempotent)
   * @param {string} id - DispatcherCase UUID
   * @returns {Promise<Case>}
   */
  acknowledgeCase: async (id) => {
    const { data } = await api.patch(`/dispatcher/cases/${id}/acknowledge`, {}, { withCredentials: true });
    return data.data;
  },

  /**
   * Change case status (dispatcher-initiated transitions only)
   * @param {string} id - DispatcherCase UUID
   * @param {'escalated'|'resolved'|'false_alarm'|'closed'} status
   * @returns {Promise<Case>}
   */
  setCaseStatus: async (id, status) => {
    const { data } = await api.patch(`/dispatcher/cases/${id}/status`, { status }, { withCredentials: true });
    return data.data;
  },

  /**
   * Add a dispatcher note to a case (max 2000 chars)
   * @param {string} id - DispatcherCase UUID
   * @param {string} content
   * @returns {Promise<CaseNote>}
   */
  addNote: async (id, content) => {
    const { data } = await api.post(`/dispatcher/cases/${id}/notes`, { content }, { withCredentials: true });
    return data.data;
  },

  /**
   * Dispatch one or more available units to a case
   * @param {string} id - DispatcherCase UUID
   * @param {string[]} unitIds - array of EmergencyUnit UUIDs
   * @returns {Promise<Assignment[]>}
   */
  assignUnits: async (id, unitIds) => {
    const { data } = await api.post(`/dispatcher/cases/${id}/assignments`, { unitIds }, { withCredentials: true });
    return data.data;
  },

  /**
   * Advance an assignment status (forward-only: notified→en_route→on_scene→completed)
   * @param {string} assignmentId
   * @param {'en_route'|'on_scene'|'completed'} status
   * @returns {Promise<Assignment>}
   */
  updateAssignmentStatus: async (assignmentId, status) => {
    const { data } = await api.patch(`/dispatcher/assignments/${assignmentId}/status`, { status }, { withCredentials: true });
    return data.data;
  },

  /**
   * Cancel an in-progress assignment (allowed from notified or en_route)
   * @param {string} assignmentId
   * @returns {Promise<Assignment>}
   */
  cancelAssignment: async (assignmentId) => {
    const { data } = await api.patch(`/dispatcher/assignments/${assignmentId}/cancel`, {}, { withCredentials: true });
    return data.data;
  },

  /**
   * List all emergency units with live status and GPS
   * @returns {Promise<EmergencyUnit[]>}
   */
  listUnits: async () => {
    const { data } = await api.get('/dispatcher/units', { withCredentials: true });
    return data.data;
  },

  /**
   * List units ranked by straight-line distance from a coordinate
   * @param {{lat: number, lng: number, excludeOffDuty?: boolean, limit?: number}} params
   * @returns {Promise<NearestUnit[]>}
   */
  nearestUnits: async (params) => {
    const { data } = await api.get('/dispatcher/units/nearest', { params, withCredentials: true });
    return data.data;
  },

  /**
   * List all service stations (cacheable)
   * @returns {Promise<Station[]>}
   */
  listStations: async () => {
    const { data } = await api.get('/dispatcher/stations', { withCredentials: true });
    return data.data;
  },
};

// ============================================================================
// Road Observer APIs
// ============================================================================

export const observerAPI = {
  /**
   * Get observer's session stats: reviewed today, avg review time, pending count.
   * @returns {Promise<{reviewedToday: number, avgReviewTimeSec: number, pendingReview: number}>}
   */
  getStats: async () => {
    const { data } = await api.get('/observer/me/stats', { withCredentials: true });
    return data.data;
  },

  /**
   * Get paginated incident history for the authenticated observer.
   * @param {Object} params - status, severity, page, limit
   * @returns {Promise<{incidents: object[], meta: {total, page, limit, pages}}>}
   */
  getIncidentHistory: async (params = {}) => {
    const { data } = await api.get('/incidents/history', { params, withCredentials: true });
    return { incidents: data.data, meta: data.meta };
  },

  /**
   * Get full detail for a single incident by ID.
   * @param {string} id
   * @returns {Promise<object>}
   */
  getIncident: async (id) => {
    const { data } = await api.get(`/incidents/${id}`, { withCredentials: true });
    return data.data;
  },

  /**
   * Get paginated notifications for the authenticated user.
   * @param {Object} params - unread (boolean), page, limit
   * @returns {Promise<{notifications: object[], meta: {total, page, limit, unreadCount}}>}
   */
  listNotifications: async (params = {}) => {
    const { data } = await api.get('/notifications', { params, withCredentials: true });
    return { notifications: data.data, meta: data.meta };
  },

  /**
   * Mark a single notification as read.
   * @param {string} id
   */
  markNotificationRead: async (id) => {
    await api.patch(`/notifications/${id}/read`, {}, { withCredentials: true });
  },

  /**
   * Mark all notifications as read.
   */
  markAllNotificationsRead: async () => {
    await api.patch('/notifications/read-all', {}, { withCredentials: true });
  },
};

export default api;

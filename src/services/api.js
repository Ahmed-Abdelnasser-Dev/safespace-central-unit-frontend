/**
 * API Service
 * Centralized API client with authentication and error handling
 */

import axios from 'axios';
import { API_URL } from '../lib/apiConfig';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/mfa/verify', '/auth/change-password'];

const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies with every request
});

// Request interceptor (no longer adds Bearer token)
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included via withCredentials
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for cookie-based token refresh
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
        // Attempt refresh with credentials (cookies are sent automatically)
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Backend sets new cookies, no need to extract tokens from response
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear user state and redirect to login
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
   * Login with email, password, and rememberMe flag
   * Backend sets HTTP-only cookies: safespace_access_token, safespace_refresh_token
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe - extends refresh session if true
   * @returns {Promise} { user, mustChangePassword, userId } or { mfaRequired, userId }
   */
  login: async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe }, { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Refresh session using HTTP-only cookies
   * No parameters needed - backend reads cookies automatically
   * @returns {Promise} { user } or throws 401 on invalid session
   */
  refresh: async () => {
    const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Logout - clears HTTP-only cookies server-side
   * Credentials included automatically via withCredentials
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
    return data.data; // Extract from wrapper
  },

  /**
   * Change password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    await api.post('/auth/change-password', { userId, currentPassword, newPassword }, { withCredentials: true });
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
    const { data } = await api.get('/users/me', { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Update current user profile
   * @param {Object} updates - firstName, lastName, phone
   * @returns {Promise} Updated user object
   */
  updateMe: async (updates) => {
    const { data } = await api.patch('/users/me', updates, { withCredentials: true });
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
      withCredentials: true,
    });
    return data.data; // Extract from wrapper
  },

  /**
   * List all users (admin only)
   * @param {Object} params - page, limit, role, search, isActive
   * @returns {Promise} { users, total, page, totalPages }
   */
  listUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params, withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Get user by ID (admin only)
   * @param {string} userId
   * @returns {Promise} User object
   */
  getUser: async (userId) => {
    const { data } = await api.get(`/users/${userId}`, { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Create new user (admin only)
   * @param {Object} userData
   * @returns {Promise} Created user object
   */
  createUser: async (userData) => {
    const { data } = await api.post('/users', userData, { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Update user by admin (email, roleId)
   * @param {string} userId
   * @param {Object} updates - email, roleId
   * @returns {Promise} Updated user object
   */
  updateUser: async (userId, updates) => {
    const { data } = await api.patch(`/users/${userId}`, updates, { withCredentials: true });
    return data.data;
  },

  /**
   * Deactivate user (admin only)
   * @param {string} userId
   * @returns {Promise} Updated user object
   */
  deactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/deactivate`, {}, { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  /**
   * Reactivate user (admin only)
   * @param {string} userId
   * @returns {Promise} Updated user object
   */
  reactivateUser: async (userId) => {
    const { data } = await api.patch(`/users/${userId}/reactivate`, {}, { withCredentials: true });
    return data.data; // Extract from wrapper
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`/users/${userId}`, { withCredentials: true });
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
    const { data } = await api.get('/activity-logs', { params, withCredentials: true });
    return data.data; // Extract from wrapper
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
    if (unit) params.unit = unit; // e.g., 'hour' or 'minute'
    const { data } = await api.get('/metrics/hourly', { params, withCredentials: true });
    return data.data; // expected { labels: [], data: [] }
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

export default api;
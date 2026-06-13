/**
 * Auth Slice
 * Redux slice for authentication state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI } from '@/services/api';

const PENDING_MFA_USER_ID_KEY = 'pendingMfaUserId';
const PENDING_MFA_REMEMBER_ME_KEY = 'pendingMfaRememberMe';

const setPendingMfaSession = (userId, rememberMe) => {
  sessionStorage.setItem(PENDING_MFA_USER_ID_KEY, userId);
  sessionStorage.setItem(PENDING_MFA_REMEMBER_ME_KEY, String(rememberMe));
};

const clearPendingMfaSession = () => {
  sessionStorage.removeItem(PENDING_MFA_USER_ID_KEY);
  sessionStorage.removeItem(PENDING_MFA_REMEMBER_ME_KEY);
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Login user with email, password, and rememberMe
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password, rememberMe);
      
      // Handle mustChangePassword — backend sets cookies, we just store user profile
      if (response.mustChangePassword) {
        const user = response.user || await userAPI.getMe();
        if (user) {
          clearPendingMfaSession();
          sessionStorage.setItem('user', JSON.stringify(user));
          return { mustChangePassword: true, user };
        }
        throw new Error('Unable to load user profile for password change');
      }
      
      if (response.mfaRequired) {
        setPendingMfaSession(response.userId, rememberMe);
        return { mfaRequired: true, userId: response.userId };
      }

      // Successful login with user profile
      const user = response.user || await userAPI.getMe();
      if (user) {
        clearPendingMfaSession();
        sessionStorage.setItem('user', JSON.stringify(user));
        return { user };
      }

      throw new Error('Unexpected login response');
    } catch (error) {
      clearPendingMfaSession();
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

/**
 * Refresh session on app startup
 * Checks if cookies still valid, rehydrates user state
 */
export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      // Backend validates cookies, then fetch the current user profile from the cookie session
      await authAPI.refresh();
      const user = await userAPI.getMe();
      clearPendingMfaSession();
      sessionStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error) {
      // 401 means cookies are invalid or expired - redirect to login
      sessionStorage.removeItem('user');
      return rejectWithValue(
        error.response?.data?.message || 'Session expired. Please log in again.'
      );
    }
  }
);

/**
 * Fetch current user profile
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await userAPI.getMe();
      sessionStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.user?.id;
      const userEmail = state.auth.user?.email;
      
      // Call logout endpoint with credentials (cookies sent automatically)
      await authAPI.logout();

      // Clear frontend state
      clearPendingMfaSession();
      sessionStorage.removeItem('user');
      
      return { userId, email: userEmail };
    } catch (error) {
      // Even if logout fails, clear local state
      clearPendingMfaSession();
      sessionStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

/**
 * Verify MFA code
 */
export const verifyMFACode = createAsyncThunk(
  'auth/verifyMFA',
  async ({ userId, code, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyMFA(userId, code, rememberMe);
      const user = response.user || await userAPI.getMe();
      
      // Backend sets cookies and returns user
      if (user) {
        clearPendingMfaSession();
        sessionStorage.setItem('user', JSON.stringify(user));
        return { user };
      }

      throw new Error('Unable to load user profile after MFA verification');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'MFA verification failed'
      );
    }
  }
);

/**
 * Update user profile
 */
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const updatedUser = await userAPI.updateMe(updates);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// ============================================================================
// Initial State
// ============================================================================

const storedUser = JSON.parse(sessionStorage.getItem('user')) || null;

const initialState = {
  user: storedUser,
  isAuthenticated: !!storedUser, // User presence determines auth state, not tokens
  loading: false,
  loadingRefresh: true, // Start as true so initial refresh is in progress
  error: null,
  // Restore mustChangePassword from stored user so page refresh doesn't lose the lock
  mustChangePassword: storedUser?.mustChangePassword === true,
  mfaRequired: false,
};

// ============================================================================
// Auth Slice
// ============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.mustChangePassword = false;
      state.mfaRequired = false;
    },
  },
  extraReducers: (builder) => {
    // Refresh session (app startup)
    builder
      .addCase(refreshSession.pending, (state) => {
        state.loadingRefresh = true;
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loadingRefresh = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.mustChangePassword = action.payload.user?.mustChangePassword === true;
        state.mfaRequired = false;
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.loadingRefresh = false;
        state.user = null;
        state.isAuthenticated = false;
        state.mustChangePassword = false;
        state.mfaRequired = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.mustChangePassword) {
          state.mustChangePassword = true;
          state.mfaRequired = false;
          // If we got tokens+user, set authenticated so ProtectedRoute passes
          if (action.payload.user) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
          }
        } else if (action.payload.mfaRequired) {
          state.mustChangePassword = false;
          state.mfaRequired = true;
        } else {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.mustChangePassword = false;
          state.mfaRequired = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.mustChangePassword = false;
        state.mfaRequired = false;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        // If server confirms password was changed, clear the local flag
        if (action.payload.mustChangePassword === false) {
          state.mustChangePassword = false;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.mustChangePassword = false;
        state.mfaRequired = false;
      });
    builder
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.mustChangePassword = false;
        state.mfaRequired = false;
      });

    // Verify MFA
    builder
      .addCase(verifyMFACode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyMFACode.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.mfaRequired = false;
      })
      .addCase(verifyMFACode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
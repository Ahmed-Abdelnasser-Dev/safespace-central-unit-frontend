/**
 * Auth Slice
 * Redux slice for authentication state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI } from '@/services/api';

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Login user
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Handle mustChangePassword — tokens are in HttpOnly cookies, response only has the flag
      if (response.mustChangePassword) {
        const user = await userAPI.getMe();
        sessionStorage.setItem('user', JSON.stringify(user));
        return { mustChangePassword: true, user };
      }
      
      if (response.mfaRequired) {
        return { mfaRequired: true, userId: response.userId };
      }

      // Successful full login — tokens are in HttpOnly cookies (set by backend),
      // NOT in the response body (controller strips them before sending JSON).
      // We just need to fetch the user profile using the cookie that was just set.
      const user = await userAPI.getMe();
      sessionStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
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
      const refreshToken = sessionStorage.getItem('refreshToken');
      const state = getState();
      const userId = state.auth.user?.id;
      const userEmail = state.auth.user?.email;
      
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }

      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      
      return { userId, email: userEmail };
    } catch (error) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
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
  isAuthenticated: !!sessionStorage.getItem('accessToken'),
  loading: false,
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
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else if (action.payload.mfaRequired) {
          state.mfaRequired = true;
        } else {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
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
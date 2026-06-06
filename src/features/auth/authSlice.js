/**
 * Auth Slice
 * Redux slice for authentication state management
 *
 * Auth model: tokens are in HttpOnly cookies — never stored in sessionStorage.
 * sessionStorage only holds the serialised user profile so the Redux store
 * can be re-hydrated on a page reload without an extra /users/me round-trip.
 *
 * isAuthenticated is initialised from the presence of a cached user object,
 * NOT from an 'accessToken' key (which was never written to sessionStorage).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI } from '@/services/api';

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Login user.
 * Accepts rememberMe and forwards it to authAPI.login() so the backend
 * can set the correct cookie TTL (7d vs 30d).
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password, rememberMe);

      // mustChangePassword — tokens are already in HttpOnly cookies
      if (response.mustChangePassword) {
        const user = await userAPI.getMe();
        sessionStorage.setItem('user', JSON.stringify(user));
        return { mustChangePassword: true, user };
      }

      if (response.mfaRequired) {
        // Include rememberMe so SignInPage can forward it to /two-factor
        return { mfaRequired: true, userId: response.userId, rememberMe };
      }

      // Full login — tokens are in HttpOnly cookies set by backend.
      // Fetch the user profile using the cookie that was just set.
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
 * Fetch current user profile (used on app boot to verify session is alive)
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
 * Logout user — backend revokes the refresh cookie
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId    = state.auth.user?.id;
      const userEmail = state.auth.user?.email;

      await authAPI.logout(); // Cookie is sent automatically

      sessionStorage.removeItem('user');
      return { userId, email: userEmail };
    } catch (error) {
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

/**
 * Request a password reset link via email.
 *
 * Always resolves successfully from Redux's perspective — the backend
 * returns 200 whether or not the email is registered (anti-enumeration).
 * Only rejects on network errors / 5xx.
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await authAPI.forgotPassword(email);
      return { email };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  }
);

/**
 * Complete the password reset using the token from the email link.
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      await authAPI.resetPassword(token, newPassword);
      return {};
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Password reset failed. The link may be invalid or expired.'
      );
    }
  }
);

// ============================================================================
// Initial State
// ============================================================================

const storedUser = (() => {
  try {
    return JSON.parse(sessionStorage.getItem('user')) || null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  // Tokens are in HttpOnly cookies — use cached user object as auth proxy.
  // On page load, App.jsx re-validates by calling fetchCurrentUser.
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
  // Restore mustChangePassword so page refresh doesn't lose the lock
  mustChangePassword: storedUser?.mustChangePassword === true,
  mfaRequired: false,

  // Forgot / Reset password state (separate from main auth loading/error)
  passwordResetLoading: false,
  passwordResetError:   null,
  passwordResetSuccess: false,
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
    // Call on mount of ForgotPasswordPage / ResetPasswordPage to clear stale state
    clearPasswordResetState: (state) => {
      state.passwordResetLoading = false;
      state.passwordResetError   = null;
      state.passwordResetSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // ── Login ────────────────────────────────────────────────────────────────
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

    // ── Fetch current user ────────────────────────────────────────────────────
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (action.payload.mustChangePassword === false) {
          state.mustChangePassword = false;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        sessionStorage.removeItem('user');
      });

    // ── Logout ────────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.mustChangePassword = false;
        state.mfaRequired = false;
      });

    // ── Update profile ────────────────────────────────────────────────────────
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

    // ── Forgot password ───────────────────────────────────────────────────────
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError   = null;
        state.passwordResetSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError   = action.payload;
      });

    // ── Reset password ────────────────────────────────────────────────────────
    builder
      .addCase(resetPassword.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError   = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError   = action.payload;
      });
  },
});

export const { clearError, setUser, clearAuth, clearPasswordResetState } = authSlice.actions;
export default authSlice.reducer;
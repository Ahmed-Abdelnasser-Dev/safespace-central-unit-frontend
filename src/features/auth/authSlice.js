/**
 * Auth Slice
 * Redux slice for authentication state management
 *
 * Auth model: tokens are in HttpOnly cookies — never stored in sessionStorage.
 *
 * Remember Me storage:
 *   rememberMe=true  → user profile in localStorage  (survives browser close)
 *   rememberMe=false → user profile in sessionStorage (wiped on browser close)
 *
 * On boot, App.jsx calls refreshSession to re-validate the cookie and show
 * a loading spinner. If the cookie is gone/expired, auth is cleared.
 * If the cookie is still valid (30-day remember-me), the user stays logged in.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI } from '@/services/api';

// ─── Storage helpers ──────────────────────────────────────────────────────────
// Use localStorage for remember-me, sessionStorage for normal sessions.

function saveUser(user, rememberMe) {
  const serialised = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem('user', serialised);
    sessionStorage.removeItem('user');
  } else {
    sessionStorage.setItem('user', serialised);
    localStorage.removeItem('user');
  }
}

function loadUser() {
  try {
    const fromSession = sessionStorage.getItem('user');
    if (fromSession) return { user: JSON.parse(fromSession), rememberMe: false };
    const fromLocal = localStorage.getItem('user');
    if (fromLocal) return { user: JSON.parse(fromLocal), rememberMe: true };
  } catch {
    // corrupted storage — ignore
  }
  return { user: null, rememberMe: false };
}

function clearStoredUser() {
  sessionStorage.removeItem('user');
  localStorage.removeItem('user');
}

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Login user with email, password, and rememberMe.
 * Forwards rememberMe to authAPI.login() so the backend sets the correct cookie TTL.
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password, rememberMe);

      // mustChangePassword — tokens are already in HttpOnly cookies
      if (response.mustChangePassword) {
        const user = response.user || await userAPI.getMe();
        saveUser(user, rememberMe);
        return { mustChangePassword: true, user };
      }

      if (response.mfaRequired) {
        // Include rememberMe so TwoFactorAuthPage can forward it to verifyMFACode
        return { mfaRequired: true, userId: response.userId, rememberMe };
      }

      // Full login — tokens are in HttpOnly cookies set by backend.
      const user = response.user || await userAPI.getMe();
      saveUser(user, rememberMe);
      return { user, rememberMe };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

/**
 * Refresh session on app startup.
 * Checks if cookies are still valid, rehydrates user state, shows loading spinner via loadingRefresh.
 */
export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      // Backend validates cookies, then fetch the current user profile
      await authAPI.refresh();
      const user = await userAPI.getMe();
      const { rememberMe } = loadUser();
      saveUser(user, rememberMe);
      return { user };
    } catch (error) {
      clearStoredUser();
      return rejectWithValue(
        error.response?.data?.message || 'Session expired. Please log in again.'
      );
    }
  }
);

/**
 * Fetch current user profile (used after actions that mutate the profile).
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await userAPI.getMe();
      const { rememberMe } = loadUser();
      saveUser(user, rememberMe);
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

      await authAPI.logout();
      clearStoredUser();
      return { userId, email: userEmail };
    } catch (error) {
      clearStoredUser();
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

/**
 * Verify MFA code (step 2 of sign-in when MFA is required)
 */
export const verifyMFACode = createAsyncThunk(
  'auth/verifyMFA',
  async ({ userId, code, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyMFA(userId, code, rememberMe);
      const user = response?.user || await userAPI.getMe();

      if (user) {
        saveUser(user, rememberMe);
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
      const { rememberMe } = loadUser();
      saveUser(updatedUser, rememberMe);
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

// ─── MFA Thunks ───────────────────────────────────────────────────────────────

/**
 * Step 1 of setup: generate secret + QR code from backend.
 */
export const setupMFA = createAsyncThunk(
  'auth/setupMFA',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.setupMFA(); // { qrCode, secret }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start MFA setup.');
    }
  }
);

/**
 * Step 2 of setup: confirm with first TOTP code, receive backup codes.
 */
export const enableMFA = createAsyncThunk(
  'auth/enableMFA',
  async ({ code }, { getState, rejectWithValue }) => {
    try {
      const result = await authAPI.enableMFA(code); // { backupCodes }
      // Update cached user so mfaEnabled reflects the change
      const state = getState();
      const updatedUser = { ...state.auth.user, mfaEnabled: true };
      const { rememberMe } = loadUser();
      saveUser(updatedUser, rememberMe);
      return { backupCodes: result.backupCodes, user: updatedUser };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid code. Please try again.');
    }
  }
);

/**
 * Disable MFA (requires password + TOTP).
 */
export const disableMFA = createAsyncThunk(
  'auth/disableMFA',
  async ({ password, code }, { getState, rejectWithValue }) => {
    try {
      await authAPI.disableMFA(password, code);
      const state = getState();
      const updatedUser = { ...state.auth.user, mfaEnabled: false };
      const { rememberMe } = loadUser();
      saveUser(updatedUser, rememberMe);
      return { user: updatedUser };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable MFA.');
    }
  }
);

// ============================================================================
// Initial State
// ============================================================================

const { user: storedUser } = loadUser();

const initialState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
  loading: false,
  loadingRefresh: true, // Start as true so initial refresh is in progress
  error: null,
  mustChangePassword: storedUser?.mustChangePassword === true,
  mfaRequired: false,

  // Forgot / Reset password state
  passwordResetLoading: false,
  passwordResetError:   null,
  passwordResetSuccess: false,

  // MFA setup state
  mfaSetupLoading:  false,
  mfaSetupError:    null,
  mfaSetupQrCode:   null,   // data URL for QR image
  mfaSetupSecret:   null,   // plain-text secret for manual entry
  mfaSetupStep:     null,   // null | 'scan' | 'backup'
  mfaBackupCodes:   [],     // shown once after enableMFA
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
    // Reset MFA setup wizard state (cancel button)
    resetMfaSetup: (state) => {
      state.mfaSetupLoading = false;
      state.mfaSetupError   = null;
      state.mfaSetupQrCode  = null;
      state.mfaSetupSecret  = null;
      state.mfaSetupStep    = null;
      state.mfaBackupCodes  = [];
    },
  },
  extraReducers: (builder) => {
    // ── Refresh session (app startup) ─────────────────────────────────────────
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

    // ── Login ─────────────────────────────────────────────────────────────────
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
        clearStoredUser();
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
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.mustChangePassword = false;
        state.mfaRequired = false;
      });

    // ── Verify MFA ────────────────────────────────────────────────────────────
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

    // ── MFA Setup ─────────────────────────────────────────────────────────────
    builder
      .addCase(setupMFA.pending, (state) => {
        state.mfaSetupLoading = true;
        state.mfaSetupError   = null;
      })
      .addCase(setupMFA.fulfilled, (state, action) => {
        state.mfaSetupLoading = false;
        state.mfaSetupQrCode  = action.payload.qrCode;
        state.mfaSetupSecret  = action.payload.secret;
        state.mfaSetupStep    = 'scan';
      })
      .addCase(setupMFA.rejected, (state, action) => {
        state.mfaSetupLoading = false;
        state.mfaSetupError   = action.payload;
      });

    // ── MFA Enable ────────────────────────────────────────────────────────────
    builder
      .addCase(enableMFA.pending, (state) => {
        state.mfaSetupLoading = true;
        state.mfaSetupError   = null;
      })
      .addCase(enableMFA.fulfilled, (state, action) => {
        state.mfaSetupLoading = false;
        state.mfaSetupStep    = 'backup';
        state.mfaBackupCodes  = action.payload.backupCodes;
        state.user            = action.payload.user;
      })
      .addCase(enableMFA.rejected, (state, action) => {
        state.mfaSetupLoading = false;
        state.mfaSetupError   = action.payload;
      });

    // ── MFA Disable ───────────────────────────────────────────────────────────
    builder
      .addCase(disableMFA.pending, (state) => {
        state.mfaSetupLoading = true;
        state.mfaSetupError   = null;
      })
      .addCase(disableMFA.fulfilled, (state, action) => {
        state.mfaSetupLoading = false;
        state.user            = action.payload.user;
        // Reset all MFA setup state
        state.mfaSetupQrCode  = null;
        state.mfaSetupSecret  = null;
        state.mfaSetupStep    = null;
        state.mfaBackupCodes  = [];
      })
      .addCase(disableMFA.rejected, (state, action) => {
        state.mfaSetupLoading = false;
        state.mfaSetupError   = action.payload;
      });
  },
});

export const { clearError, setUser, clearAuth, clearPasswordResetState, resetMfaSetup } = authSlice.actions;
export default authSlice.reducer;

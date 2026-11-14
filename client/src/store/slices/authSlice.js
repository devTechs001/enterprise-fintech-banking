import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { authService } from '@/services/api/authService';
import tokenService from '@/services/auth/authTokenService';

/**
 * Auth slice.
 *
 * Changes from the original:
 *  - Reads the unwrapped API envelope consistently (`response.data.user`).
 *  - Keeps only the ACCESS token, in memory, via `tokenService`. The refresh
 *    token is never handled by JavaScript: it is an HttpOnly cookie.
 *  - Exposes the server-reported lockout so the login form can show a real
 *    countdown instead of silently retrying.
 */

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  loginAttempts: 0,
  attemptsRemaining: null,
  lockedUntil: null,
  lastLoginAt: null,
  mfaRequired: false,
  mfaChallenge: null,
  mfaMethod: null,
  demoCode: null,
  mfaVerified: false,
  sessionExpiresAt: null,
};

const readError = (error, fallback) => ({
  message: error?.apiMessage || error?.response?.data?.message || fallback,
  status: error?.response?.status ?? null,
  attemptsRemaining: error?.response?.data?.attemptsRemaining ?? null,
  retryAfterSeconds: error?.response?.data?.retryAfterSeconds ?? null,
  lockedUntil: error?.response?.data?.lockedUntil ?? null,
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    const data = response.data || {};

    // Step-up: the API withholds tokens until the TOTP check passes.
    if (data.requiresMfa) {
      return {
        requiresMfa: true,
        challenge: data.challenge,
        mfaMethod: data.mfaMethod,
        // Present only when running against the mock API.
        demoCode: data.demoCode || null,
      };
    }

    tokenService.setAccessToken(data.tokens?.accessToken, data.tokens?.expiresIn);
    return { user: data.user, tokens: data.tokens };
  } catch (error) {
    return rejectWithValue(readError(error, 'Sign in failed.'));
  }
});

export const verifyMfa = createAsyncThunk(
  'auth/verifyMfa',
  async ({ code, challenge }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyMfa(code, challenge);
      const data = response.data || {};
      tokenService.setAccessToken(data.tokens?.accessToken, data.tokens?.expiresIn);
      return { user: data.user, tokens: data.tokens };
    } catch (error) {
      return rejectWithValue(readError(error, 'Verification failed.'));
    }
  }
);

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(readError(error, 'Registration failed.'));
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (error) {
    // Always clear locally, even if the API call failed.
    return rejectWithValue(readError(error, 'Logout failed.'));
  } finally {
    tokenService.clearAccessToken();
  }
});

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      const data = response.data || {};
      tokenService.setAccessToken(data.accessToken, data.expiresIn);
      return data;
    } catch (error) {
      tokenService.clearAccessToken();
      return rejectWithValue(readError(error, 'Session expired.'));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      const data = response.data || {};
      // Tolerate both `{ user }` and a bare user object.
      return data.user ?? data;
    } catch (error) {
      return rejectWithValue(readError(error, 'Failed to load your profile.'));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(readError(error, 'Could not send a reset link.'));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(readError(error, 'Password reset failed.'));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(readError(error, 'Password change failed.'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user ?? state.user;
      state.token = token ?? state.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      tokenService.clearAccessToken();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.mfaRequired = false;
      state.mfaChallenge = null;
      state.demoCode = null;
      state.mfaVerified = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.lockedUntil = null;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.attemptsRemaining = null;
      state.lockedUntil = null;
    },
    setSessionExpiry: (state, action) => {
      state.sessionExpiresAt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresMfa) {
          state.mfaRequired = true;
          state.mfaChallenge = action.payload.challenge;
          state.mfaMethod = action.payload.mfaMethod || 'authenticator';
          state.demoCode = action.payload.demoCode || null;
          return;
        }
        state.user = action.payload.user;
        state.token = tokenService.getAccessToken();
        state.isAuthenticated = true;
        state.lastLoginAt = new Date().toISOString();
        state.loginAttempts = 0;
        state.attemptsRemaining = null;
        state.lockedUntil = null;
        state.mfaRequired = false;
        state.mfaVerified = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? 'Sign in failed.';
        state.loginAttempts += 1;
        state.attemptsRemaining = action.payload?.attemptsRemaining ?? null;
        state.lockedUntil = action.payload?.lockedUntil ?? null;
      })
      .addCase(verifyMfa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMfa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = tokenService.getAccessToken();
        state.isAuthenticated = true;
        state.mfaRequired = false;
        state.mfaChallenge = null;
        state.mfaVerified = true;
        state.lastLoginAt = new Date().toISOString();
        state.loginAttempts = 0;
      })
      .addCase(verifyMfa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? 'Verification failed.';
      })
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.isLoading = false; })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? 'Registration failed.';
      })
      .addCase(logout.pending, (state) => { state.isLoading = true; })
      .addCase(logout.fulfilled, () => ({ ...initialState, isInitialized: true }))
      .addCase(logout.rejected, () => ({ ...initialState, isInitialized: true }))
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = tokenService.getAccessToken();
        if (action.payload?.expiresIn) {
          state.sessionExpiresAt = new Date(Date.now() + action.payload.expiresIn * 1000).toISOString();
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.mfaVerified = Boolean(action.payload?.mfaEnabled);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      .addCase(changePassword.fulfilled, (state) => { state.error = null; });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setUser,
  updateUser,
  setInitialized,
  clearError,
  incrementLoginAttempts,
  resetLoginAttempts,
  setSessionExpiry,
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectMfaRequired = (state) => state.auth.mfaRequired;
export const selectMfaChallenge = (state) => state.auth.mfaChallenge;
export const selectDemoCode = (state) => state.auth.demoCode;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectLockedUntil = (state) => state.auth.lockedUntil;

export default authSlice.reducer;

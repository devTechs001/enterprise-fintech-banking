import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/api/authService';
import { tokenService } from '@/services/auth/authTokenService';
import { STORAGE_KEYS } from '@/constants/storage.constants';

// Initial State
const initialState = {
  user: null,
  token: tokenService.getAccessToken(),
  refreshToken: tokenService.getRefreshToken(),
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  loginAttempts: 0,
  lastLoginAt: null,
  mfaRequired: false,
  mfaVerified: false,
  sessionExpiresAt: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.data.requiresMfa) {
        return { requiresMfa: true, tempToken: response.data.tempToken };
      }
      
      tokenService.setTokens(response.data.tokens);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const verifyMfa = createAsyncThunk(
  'auth/verifyMfa',
  async ({ code, tempToken }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyMfa(code, tempToken);
      tokenService.setTokens(response.data.tokens);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'MFA verification failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      tokenService.clearTokens();
      return null;
    } catch (error) {
      tokenService.clearTokens();
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { refreshToken } = getState().auth;
      const response = await authService.refreshToken(refreshToken);
      tokenService.setAccessToken(response.data.accessToken);
      return response.data;
    } catch (error) {
      tokenService.clearTokens();
      return rejectWithValue('Session expired');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send reset email'
      );
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
      return rejectWithValue(
        error.response?.data?.message || 'Password reset failed'
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.mfaRequired = false;
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
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
    setSessionExpiry: (state, action) => {
      state.sessionExpiresAt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresMfa) {
          state.mfaRequired = true;
        } else {
          state.user = action.payload.user;
          state.token = action.payload.tokens.accessToken;
          state.refreshToken = action.payload.tokens.refreshToken;
          state.isAuthenticated = true;
          state.lastLoginAt = new Date().toISOString();
          state.loginAttempts = 0;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
      })
      // Verify MFA
      .addCase(verifyMfa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMfa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
        state.mfaRequired = false;
        state.mfaVerified = true;
        state.lastLoginAt = new Date().toISOString();
        state.loginAttempts = 0;
      })
      .addCase(verifyMfa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        return { ...initialState, isInitialized: true };
      })
      .addCase(logout.rejected, (state) => {
        return { ...initialState, isInitialized: true };
      })
      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        return { ...initialState, isInitialized: true };
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      });
  },
});

// Actions
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

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectMfaRequired = (state) => state.auth.mfaRequired;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;

export default authSlice.reducer;
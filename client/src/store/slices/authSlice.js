import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/api/authService';
import { tokenService } from '@/services/auth/authTokenService';

const initialState = {
  user: null,
  token: tokenService.getAccessToken(),
  refreshToken: tokenService.getRefreshToken(),
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  loginAttempts: 0,
  mfaRequired: false,
  mfaVerified: false,
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    if (response.data.requiresMfa) {
      return { requiresMfa: true, tempToken: response.data.tempToken };
    }
    tokenService.setTokens(response.data.tokens);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
    tokenService.clearTokens();
  } catch (error) {
    tokenService.clearTokens();
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

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
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresMfa) {
          state.mfaRequired = true;
        } else {
          state.user = action.payload.user;
          state.token = action.payload.tokens?.accessToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
      })
      .addCase(logout.fulfilled, (state) => {
        return { ...initialState, isInitialized: true };
      })
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.isLoading = false; })
      .addCase(register.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => { state.isInitialized = true; });
  },
});

export const { setCredentials, clearCredentials, setUser, setInitialized, clearError } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitialized = (state) => state.auth.isInitialized;

export default authSlice.reducer;

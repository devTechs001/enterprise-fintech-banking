import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountService } from '@/services/api/accountService';

const initialState = {
  accounts: [],
  totalBalance: 0,
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAccounts', async (_, { rejectWithValue }) => {
  try {
    const response = await accountService.getAccounts();
    return response.data.accounts;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
  }
});

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload;
      state.totalBalance = action.payload.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    },
    updateAccount: (state, action) => {
      const index = state.accounts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = { ...state.accounts[index], ...action.payload };
      }
    },
    addAccount: (state, action) => {
      state.accounts.push(action.payload);
    },
    removeAccount: (state, action) => {
      state.accounts = state.accounts.filter((a) => a.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.totalBalance = action.payload.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setAccounts, updateAccount, addAccount, removeAccount, clearError } = accountSlice.actions;
export const selectAccounts = (state) => state.accounts.accounts;
export const selectTotalBalance = (state) => state.accounts.totalBalance;
export const selectAccountById = (id) => (state) => state.accounts.accounts.find((a) => a.id === id);

export default accountSlice.reducer;

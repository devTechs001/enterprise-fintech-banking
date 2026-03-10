import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload.transactions;
      state.pagination = action.payload.pagination;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload };
      }
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setTransactions, addTransaction, updateTransaction, clearTransactions, clearError } = transactionSlice.actions;
export const selectTransactions = (state) => state.transactions.transactions;
export const selectTransactionPagination = (state) => state.transactions.pagination;

export default transactionSlice.reducer;

/**
 * Slice barrel.
 *
 * NOTE: several slices each export an action named `clearError`. Re-exporting
 * them all from one barrel is a duplicate-export SyntaxError in ESM, so they are
 * namespaced below. Import the action from its own slice when the name matters.
 */
export {
  default as authReducer,
  setCredentials,
  clearCredentials,
  setUser,
  setInitialized,
  clearError as clearAuthError,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectIsInitialized,
} from './authSlice';

export {
  default as accountReducer,
  setAccounts,
  updateAccount,
  addAccount,
  removeAccount,
  clearError as clearAccountError,
  selectAccounts,
  selectTotalBalance,
  selectAccountById,
} from './accountSlice';

export {
  default as transactionReducer,
  setTransactions,
  addTransaction,
  updateTransaction,
  clearTransactions,
  clearError as clearTransactionError,
  selectTransactions,
  selectTransactionPagination,
} from './transactionSlice';

export {
  default as cardReducer,
  setCards,
  addCard,
  updateCard,
  removeCard,
  clearError as clearCardError,
  selectCards,
  selectPrimaryCard,
} from './cardSlice';

export {
  default as uiReducer,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  selectTheme,
  selectSidebarOpen,
  selectSidebarCollapsed,
} from './uiSlice';

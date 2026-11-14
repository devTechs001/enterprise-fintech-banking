import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import accountReducer from './slices/accountSlice';
import transactionReducer from './slices/transactionSlice';
import cardReducer from './slices/cardSlice';
import uiReducer from './slices/uiSlice';

/**
 * SECURITY: `auth` used to be persisted whole, which wrote the user profile AND
 * both tokens into localStorage where any XSS could read them, and left a stale
 * `isAuthenticated: true` on disk after logout.
 *
 * Only non-sensitive UI preference state is persisted now. Session state is
 * rebuilt on load via a silent refresh against the HttpOnly cookie.
 */
const authTransform = createTransform(
  (inbound) => inbound,
  (outbound) => ({
    ...outbound,
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    mfaRequired: false,
    mfaVerified: false,
  }),
  { whitelist: ['auth'] }
);

const persistConfig = {
  key: 'securebank-root',
  version: 2,
  storage,
  // UI preferences only. Financial data belongs in React Query's memory cache.
  whitelist: ['ui'],
  transforms: [authTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  accounts: accountReducer,
  transactions: transactionReducer,
  cards: cardReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;

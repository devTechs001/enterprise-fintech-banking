/**
 * Storage keys constants
 */
const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  
  // Theme
  THEME: 'theme',
  
  // Preferences
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  
  // Session
  SESSION_ID: 'session_id',
  LAST_ACTIVITY: 'last_activity',
  
  // Feature flags
  FEATURE_FLAGS: 'feature_flags',
  
  // Cache
  ACCOUNTS_CACHE: 'accounts_cache',
  TRANSACTIONS_CACHE: 'transactions_cache',
  CARDS_CACHE: 'cards_cache',
};

/**
 * Storage types
 */
const STORAGE_TYPES = {
  LOCAL: 'local',
  SESSION: 'session',
  SECURE: 'secure',
};

export { STORAGE_KEYS, STORAGE_TYPES };
export default STORAGE_KEYS;

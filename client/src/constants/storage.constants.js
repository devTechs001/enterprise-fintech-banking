/**
 * Storage keys constants
 */
/**
 * SECURITY: tokens are deliberately absent. The access token lives in memory and
 * the refresh token in an HttpOnly cookie, so neither is readable via XSS.
 * Financial payloads are not cached in web storage either.
 */
const STORAGE_KEYS = {
  
  // Theme
  THEME: 'theme',
  
  // Preferences
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  
  // Session
  LAST_ACTIVITY: 'last_activity',
  
  // Feature flags
  FEATURE_FLAGS: 'feature_flags',
  
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

import { STORAGE_KEYS } from '@/constants/storage.constants';

/**
 * Token service for managing authentication tokens
 */
const tokenService = {
  /**
   * Get access token from storage
   * @returns {string|null} Access token
   */
  getAccessToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token from storage
   * @returns {string|null} Refresh token
   */
  getRefreshToken: () => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set access token
   * @param {string} token - Access token
   */
  setAccessToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Set refresh token
   * @param {string} token - Refresh token
   */
  setRefreshToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Set both tokens
   * @param {Object} tokens - Object containing accessToken and refreshToken
   */
  setTokens: (tokens) => {
    if (tokens.accessToken) {
      tokenService.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken) {
      tokenService.setRefreshToken(tokens.refreshToken);
    }
  },

  /**
   * Clear access token
   */
  clearAccessToken: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Clear refresh token
   */
  clearRefreshToken: () => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Clear all tokens
   */
  clearTokens: () => {
    tokenService.clearAccessToken();
    tokenService.clearRefreshToken();
  },

  /**
   * Check if access token exists
   * @returns {boolean} True if access token exists
   */
  hasAccessToken: () => {
    return !!tokenService.getAccessToken();
  },

  /**
   * Check if refresh token exists
   * @returns {boolean} True if refresh token exists
   */
  hasRefreshToken: () => {
    return !!tokenService.getRefreshToken();
  },

  /**
   * Check if user is authenticated (has both tokens)
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    return tokenService.hasAccessToken() && tokenService.hasRefreshToken();
  },
};

export { tokenService };
export default tokenService;

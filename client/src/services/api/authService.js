import axiosInstance from './axiosInstance';
import { API_BASE_URL } from '@/constants';

/**
 * Auth service for authentication-related API calls
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login response
   */
  login: async (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Registration response
   */
  register: async (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  /**
   * Verify MFA code
   * @param {string} code - MFA code
   * @param {string} tempToken - Temporary token
   * @returns {Promise} MFA verification response
   */
  verifyMfa: async (code, tempToken) => {
    return axiosInstance.post('/auth/mfa/verify', { code, tempToken });
  },

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  logout: async () => {
    return axiosInstance.post('/auth/logout');
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} Token refresh response
   */
  refreshToken: async (refreshToken) => {
    return axiosInstance.post('/auth/refresh-token', { refreshToken });
  },

  /**
   * Get current user
   * @returns {Promise} Current user response
   */
  getCurrentUser: async () => {
    return axiosInstance.get('/auth/me');
  },

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Promise} Forgot password response
   */
  forgotPassword: async (email) => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} Reset password response
   */
  resetPassword: async (token, password) => {
    return axiosInstance.post('/auth/reset-password', { token, password });
  },

  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Promise} Email verification response
   */
  verifyEmail: async (token) => {
    return axiosInstance.post('/auth/verify-email', { token });
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Change password response
   */
  changePassword: async (currentPassword, newPassword) => {
    return axiosInstance.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Setup MFA
   * @returns {Promise} MFA setup response
   */
  setupMfa: async () => {
    return axiosInstance.post('/auth/mfa/setup');
  },

  /**
   * Disable MFA
   * @param {string} code - MFA code
   * @returns {Promise} MFA disable response
   */
  disableMfa: async (code) => {
    return axiosInstance.post('/auth/mfa/disable', { code });
  },
};

export default authService;

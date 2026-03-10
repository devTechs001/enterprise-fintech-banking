import { selectAuth } from './authSlice';

/**
 * Select the current user
 * @param {Object} state - Redux state
 * @returns {Object|null} Current user or null
 */
export const selectUser = (state) => selectAuth(state)?.user;

/**
 * Select authentication status
 * @param {Object} state - Redux state
 * @returns {boolean} True if authenticated
 */
export const selectIsAuthenticated = (state) => selectAuth(state)?.isAuthenticated;

/**
 * Select loading status
 * @param {Object} state - Redux state
 * @returns {boolean} True if loading
 */
export const selectIsLoading = (state) => selectAuth(state)?.isLoading;

/**
 * Select authentication error
 * @param {Object} state - Redux state
 * @returns {string|null} Error message or null
 */
export const selectAuthError = (state) => selectAuth(state)?.error;

/**
 * Select initialization status
 * @param {Object} state - Redux state
 * @returns {boolean} True if initialized
 */
export const selectIsInitialized = (state) => selectAuth(state)?.isInitialized;

/**
 * Select MFA required status
 * @param {Object} state - Redux state
 * @returns {boolean} True if MFA is required
 */
export const selectMfaRequired = (state) => selectAuth(state)?.mfaRequired;

/**
 * Select login attempts count
 * @param {Object} state - Redux state
 * @returns {number} Login attempts count
 */
export const selectLoginAttempts = (state) => selectAuth(state)?.loginAttempts;

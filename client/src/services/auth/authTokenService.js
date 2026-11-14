/**
 * Access-token store.
 *
 * SECURITY: the access token is held in module memory only. It is never written
 * to localStorage or sessionStorage, so a cross-site scripting bug cannot read a
 * long-lived credential out of web storage. The refresh token is an opaque,
 * HttpOnly, SameSite=Strict cookie set by the API and is therefore invisible to
 * JavaScript entirely.
 *
 * On a full page load there is no access token; the app performs a silent
 * refresh (see `bootstrapSession` in AuthContext) to obtain one from the cookie.
 */

let accessToken = null;
let expiresAt = 0;

const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn(accessToken));

const tokenService = {
  getAccessToken: () => accessToken,

  /** @returns {boolean} true when a token is present and not past its expiry */
  hasValidAccessToken: () => Boolean(accessToken) && Date.now() < expiresAt,

  /**
   * @param {string} token - Opaque or JWT access token
   * @param {number} [expiresInSeconds] - Lifetime reported by the API
   */
  setAccessToken: (token, expiresInSeconds = 900) => {
    accessToken = token || null;
    // Refresh 30s early so in-flight requests never race the expiry boundary.
    expiresAt = token ? Date.now() + Math.max(0, (expiresInSeconds - 30) * 1000) : 0;
    emit();
  },

  clearAccessToken: () => {
    accessToken = null;
    expiresAt = 0;
    emit();
  },

  /** Subscribe to token changes; returns an unsubscribe function. */
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export { tokenService };
export default tokenService;

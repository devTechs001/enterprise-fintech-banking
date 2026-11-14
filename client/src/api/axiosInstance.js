import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import tokenService from '@/services/auth/authTokenService';

/**
 * Shared axios instance.
 *
 * Response contract: the API returns `{ success, data, message? }`. The response
 * interceptor unwraps that envelope once, here, so every caller can read the
 * payload as `response.data`. (Previously the server wrapped responses but the
 * client read them unwrapped, so `response.data.user` was always `undefined`.)
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  // The refresh token lives in an HttpOnly cookie; credentials must be sent.
  withCredentials: true,
});

/* ------------------------------------------------------------------ *
 * Request: attach the in-memory access token
 * ------------------------------------------------------------------ */
axiosInstance.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------------------------------------------------------ *
 * Response: unwrap the envelope, then handle 401 with a single-flight refresh
 * ------------------------------------------------------------------ */

/** Guards against N concurrent 401s each triggering their own refresh. */
let refreshInFlight = null;

const unwrap = (body) => {
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data;
  }
  return body;
};

/** Fired when the session cannot be recovered so the UI can route to /login. */
export const SESSION_EXPIRED_EVENT = 'securebank:session-expired';

const announceSessionExpired = (reason) => {
  tokenService.clearAccessToken();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { reason } }));
};

const performRefresh = async () => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      // Bare axios: never route the refresh through this instance, or a 401 on
      // the refresh call would recurse back into this interceptor.
      .post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true, timeout: 15000 })
      .then((response) => {
        const data = unwrap(response.data);
        if (!data?.accessToken) throw new Error('Refresh response missing accessToken');
        tokenService.setAccessToken(data.accessToken, data.expiresIn);
        return data.accessToken;
      })
      .finally(() => {
        // Reset on the next tick so queued callers all await the same promise.
        setTimeout(() => { refreshInFlight = null; }, 0);
      });
  }
  return refreshInFlight;
};

axiosInstance.interceptors.response.use(
  (response) => {
    response.data = unwrap(response.data);
    return response;
  },
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    // Surface the API's own message when the envelope carried one.
    const apiMessage = error.response?.data?.message;
    if (apiMessage && !error.apiMessage) error.apiMessage = apiMessage;

    const isAuthEndpoint = typeof original.url === 'string' && original.url.includes('/auth/');
    const lockout = status === 429;

    if (status === 401 && !original._retried && !isAuthEndpoint && !lockout) {
      original._retried = true;
      try {
        const accessToken = await performRefresh();
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${accessToken}` };
        const retry = await axiosInstance(original);
        retry.data = unwrap(retry.data);
        return retry;
      } catch (refreshError) {
        announceSessionExpired('refresh-failed');
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && isAuthEndpoint && original.url?.includes('/auth/me')) {
      announceSessionExpired('unauthenticated');
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance;

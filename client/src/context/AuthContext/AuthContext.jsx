import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  clearCredentials,
  fetchCurrentUser,
  logout as logoutThunk,
  refreshAccessToken,
  setInitialized,
  selectIsAuthenticated,
  selectIsInitialized,
  selectIsLoading,
  selectUser,
} from '@/store/slices/authSlice';
import { SESSION_EXPIRED_EVENT } from '@/api/axiosInstance';

const AuthContext = createContext(null);

/**
 * Session bootstrap.
 *
 * The original `AuthProvider` contained a simulated login that resolved after a
 * `setTimeout` and accepted ANY credentials, returning a hard-coded "John Doe".
 * Anything using `useAuth().login()` therefore signed in without contacting the
 * server — a client-side authentication bypass. It is replaced here by a real
 * bootstrap:
 *
 *   1. On load there is no access token (it lives in memory only), so we ask the
 *      API to exchange the HttpOnly refresh cookie for one.
 *   2. If that succeeds we fetch the profile and mark the session live.
 *   3. If it fails we mark the session unauthenticated so guards can redirect.
 *   4. We listen for `SESSION_EXPIRED_EVENT` from the axios interceptor and clear
 *      credentials, so a revoked session cannot keep a stale UI alive.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const isLoading = useSelector(selectIsLoading);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const refreshed = await dispatch(refreshAccessToken());
      if (cancelled) return;

      if (refreshAccessToken.fulfilled.match(refreshed)) {
        await dispatch(fetchCurrentUser());
      }
      if (!cancelled) dispatch(setInitialized(true));
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [dispatch]);

  useEffect(() => {
    const onExpired = () => dispatch(clearCredentials());
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [dispatch]);

  const signOut = useCallback(() => dispatch(clearCredentials()), [dispatch]);

  /**
   * Full sign-out: tell the API so the server-side session and refresh token are
   * revoked, drop the in-memory access token, then route to the sign-in page.
   */
  const logout = useCallback(async () => {
    setSigningOut(true);
    try {
      await dispatch(logoutThunk());
    } finally {
      setSigningOut(false);
      navigate('/login', { replace: true });
    }
  }, [dispatch, navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isInitialized,
      isLoading,
      signOut,
      logout,
      loggingOut: signingOut,
    }),
    [user, isAuthenticated, isInitialized, signOut, logout, signingOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

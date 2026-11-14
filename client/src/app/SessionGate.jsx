import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/common/SplashScreen';

/**
 * Gates the route tree until the session has been resolved.
 *
 * Two problems this closes:
 *
 *  1. `AuthProvider` calls `refreshAccessToken()` and then `fetchCurrentUser()`
 *     before `isInitialized` flips. During those two round-trips the guards had no
 *     user, so they rendered `null` — a signed-in customer saw a blank page on
 *     every reload, and a signed-out one saw nothing before being bounced to
 *     `/login`. Both now see the splash.
 *
 *  2. The inline splash in `index.html` is painted before any JavaScript runs, so
 *     a cold load never flashes white. This component is what retires it, after a
 *     minimum on-screen time so a fast machine does not produce a 40ms flash that
 *     reads as a rendering glitch.
 *
 * A hard ceiling guarantees the HTML splash is removed even if the session request
 * hangs: leaving it up forever would trap the user on a screen with no way out.
 */
const MIN_SPLASH_MS = 450;
const MAX_SPLASH_MS = 8000;

const SessionGate = ({ children }) => {
  const { isInitialized } = useAuth();
  const [mountedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // Drive the minimum-visible timer only while the splash is actually up.
  useEffect(() => {
    if (isInitialized || timedOut) return undefined;
    const id = setInterval(() => setElapsed(Date.now() - mountedAt), 60);
    return () => clearInterval(id);
  }, [isInitialized, timedOut, mountedAt]);

  useEffect(() => {
    if (isInitialized || timedOut) return undefined;
    const id = setTimeout(() => setTimedOut(true), MAX_SPLASH_MS);
    return () => clearTimeout(id);
  }, [isInitialized, timedOut]);

  const ready = isInitialized || timedOut;
  const minReached = elapsed >= MIN_SPLASH_MS;

  useEffect(() => {
    if (!ready || !minReached) return;
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.classList.add('is-hidden');
    // Remove from the a11y tree immediately, then from the DOM after the fade.
    splash.setAttribute('aria-hidden', 'true');
    const id = setTimeout(() => splash.remove(), 320);
    return () => clearTimeout(id);
  }, [ready, minReached]);

  if (!ready || !minReached) {
    return (
      <SplashScreen
        label={timedOut ? 'Still working…' : 'Restoring your session…'}
        minVisibleMs={MIN_SPLASH_MS}
      />
    );
  }

  return children;
};

SessionGate.propTypes = { children: PropTypes.node.isRequired };

export { SessionGate };
export default SessionGate;

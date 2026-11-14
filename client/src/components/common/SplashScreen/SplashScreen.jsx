import PropTypes from 'prop-types';

/**
 * In-app splash screen.
 *
 * Shown while `AuthProvider` bootstraps the session — it calls
 * `refreshAccessToken()` and then `fetchCurrentUser()` before `isInitialized`
 * flips. Previously that window rendered a blank white page, and worse, the route
 * guards returned `null` during it, so a signed-in user saw nothing at all for the
 * duration of two network round-trips.
 *
 * `minVisibleMs` prevents a flash: a splash that appears for 40ms and disappears
 * reads as a rendering glitch rather than a loading state.
 */
const SplashScreen = ({ label = 'Restoring your session…', minVisibleMs = 0 }) => (
  <div
    role="status"
    aria-live="polite"
    data-min-visible={minVisibleMs || undefined}
    className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#0b1020] px-6"
  >
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 shadow-lg shadow-primary-900/40">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true" focusable="false">
        <path
          d="M32 11l15 5v13c0 10-6.4 17.6-15 21-8.6-3.4-15-11-15-21V16l15-5z"
          fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" opacity=".92"
        />
        <path
          d="M38 26.5c0-2.6-2.7-4.3-6-4.3s-6 1.7-6 4.2c0 5.4 12 2.7 12 8.1 0 2.6-2.7 4.4-6 4.4s-6-1.8-6-4.4"
          fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"
        />
      </svg>
    </span>

    <div className="text-center">
      <p className="text-lg font-semibold tracking-tight text-white">SecureBank</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>

    {/* Indeterminate bar: no percentage is honest when the work is two unknown
        network calls, and a fake progress bar is worse than none. */}
    <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10">
      <div className="h-full w-1/3 animate-[splash_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary-400 to-purple-400" />
    </div>
  </div>
);

SplashScreen.propTypes = {
  label: PropTypes.string,
  minVisibleMs: PropTypes.number,
};

export { SplashScreen };
export default SplashScreen;

/**
 * Single source of truth for build/runtime mode flags.
 *
 * The reason this exists as one module rather than `import.meta.env` reads
 * scattered through components: "is this a development build?" is a security
 * decision here, not a cosmetic one. Dev-only surfaces (the mock API badge, the
 * dev console, the demo one-time code) must be impossible to reach in a
 * production bundle, and the rule has to live in exactly one place so it cannot
 * drift between call sites.
 *
 * Vite statically replaces `import.meta.env.DEV` / `.PROD` at build time, so in a
 * production bundle `IS_DEV` is the literal `false` and every branch below it is
 * dead code the minifier removes — the dev surfaces are not merely hidden in
 * production, they are not in it.
 */
const raw = import.meta.env;

export const APP_NAME = raw.VITE_APP_NAME || 'SecureBank';
export const APP_VERSION = raw.VITE_APP_VERSION || '0.0.0';
export const API_BASE_URL = raw.VITE_API_BASE_URL || '/api/v1';

/** True only under a dev server (`vite`, `vite --mode mock`) or vitest. */
export const IS_DEV = Boolean(raw.DEV) && !Boolean(raw.PROD);
/** True in `vite build` output. */
export const IS_PROD = Boolean(raw.PROD);

/**
 * The mock API flag. Note it is ANDed with IS_DEV: a production build invoked as
 * `vite build --mode mock` would otherwise read VITE_USE_MOCK_API=true and light up
 * every dev surface in an artifact meant for deployment. Development mode is a
 * property of the build, not of a string in a .env file.
 */
export const USE_MOCK_API = IS_DEV && raw.VITE_USE_MOCK_API === 'true';

/** The user-visible "dev mode": any non-production dev server. */
export const DEV_MODE = IS_DEV;

/** Dev mode backed by the in-memory mock API rather than a real backend. */
export const MOCK_MODE = USE_MOCK_API;

if (IS_PROD && raw.VITE_USE_MOCK_API === 'true') {
  // A production bundle configured to use the mock API is a misconfiguration that
  // would serve fake balances to real customers. Loud at startup, inert otherwise:
  // the mock plugin is `apply: 'serve'`, so no mock routes exist in a build anyway.
  // eslint-disable-next-line no-console
  console.error(
    '[env] VITE_USE_MOCK_API is true in a PRODUCTION build. Ignoring it: the mock '
    + 'API only exists under the dev server. Fix the build configuration.'
  );
}

/**
 * Gate for anything that must never run in production.
 * Kept as a function so call sites read as an explicit decision.
 */
export const isDevMode = () => DEV_MODE;
export const isMockMode = () => MOCK_MODE;
export const isProduction = () => IS_PROD;

export default {
  APP_NAME, APP_VERSION, API_BASE_URL, IS_DEV, IS_PROD,
  USE_MOCK_API, DEV_MODE, MOCK_MODE, isDevMode, isMockMode, isProduction,
};

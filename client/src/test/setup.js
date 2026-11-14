import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

/**
 * jsdom ships a matchMedia stub whose MediaQueryList lacks `addListener`, which
 * crashed framer-motion's reduced-motion detection (and `useMediaQuery`).
 *
 * Defined as a PLAIN function rather than `vi.fn()`: `restoreMocks: true` in
 * vitest.config.js calls `mockRestore()` before each test, which would strip a
 * `mockImplementation` and leave `matchMedia()` returning `undefined`.
 */
const createMediaQueryList = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return false; },
});

window.matchMedia = createMediaQueryList;

if (!window.scrollTo) window.scrollTo = () => {};

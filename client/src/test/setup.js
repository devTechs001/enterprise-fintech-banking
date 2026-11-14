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

/**
 * jsdom implements neither ResizeObserver nor getBoundingClientRect with real
 * geometry. recharts' ResponsiveContainer needs both to mount a chart, and every
 * page with a chart (Analytics, Dashboard, Investments) crashed on render without
 * them — the test suite would have reported a component failure that browsers never
 * see.
 *
 * Plain classes rather than vi.fn(): `restoreMocks: true` strips mock
 * implementations before each test, which is exactly the trap matchMedia hit.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverStub;
window.ResizeObserver = ResizeObserverStub;

if (!window.HTMLElement.prototype.getBoundingClientRect._stubbed) {
  const original = window.HTMLElement.prototype.getBoundingClientRect;
  window.HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
    const rect = original.call(this);
    // recharts reads width/height to decide whether to draw at all; 0x0 draws nothing.
    if (!rect.width && !rect.height) {
      return { ...rect, width: 640, height: 320, top: 0, left: 0, right: 640, bottom: 320, x: 0, y: 0 };
    }
    return rect;
  };
  window.HTMLElement.prototype.getBoundingClientRect._stubbed = true;
}

if (!window.HTMLCanvasElement.prototype.getContext) {
  window.HTMLCanvasElement.prototype.getContext = () => null;
}

/**
 * framer-motion's `whileInView` needs IntersectionObserver, which jsdom does not
 * implement. Without it every component using viewport-triggered animation threw
 * on mount — including the landing page, whose whole hero is animated that way.
 * `isIntersecting: true` means the animation resolves immediately, so tests assert
 * against the finished state rather than the pre-animation one.
 */
class IntersectionObserverStub {
  constructor(callback) { this.callback = callback; }
  observe(target) {
    this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
global.IntersectionObserver = IntersectionObserverStub;
window.IntersectionObserver = IntersectionObserverStub;

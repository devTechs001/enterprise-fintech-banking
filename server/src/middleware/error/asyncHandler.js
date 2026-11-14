/**
 * Async handler wrapper.
 *
 * This file previously contained a single line:
 *
 *     export { default as asyncHandler } from './asyncHandler.js';
 *
 * — a module re-exporting itself. Importing it produced a circular resolution and
 * `asyncHandler` was `undefined`, so any route wrapped with it silently did
 * nothing. The real implementation lives in `utils/asyncHandler.js`; this file now
 * re-exports that, keeping the `middleware/error` barrel working.
 */
export { default as asyncHandler, default } from '#utils/asyncHandler.js';

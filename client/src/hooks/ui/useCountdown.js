import { useCallback, useEffect, useState } from 'react';

/**
 * Countdown hook.
 *
 * Fixed two defects in the original:
 *  1. `seconds` was initialised from `initialSeconds` but never re-synced, so
 *     starting a countdown with a new value (e.g. a fresh lockout returned by
 *     the API) kept counting the old one.
 *  2. The interval was torn down and recreated on every tick because `seconds`
 *     was in its dependency list, and `start()` was required before it ran, so a
 *     component that simply rendered `<Countdown seconds={n} />` never moved.
 *
 * It now runs automatically whenever `initialSeconds > 0`, re-syncs when that
 * value changes, and ticks once per second with a stable interval.
 *
 * @param {number} initialSeconds - Seconds to count down from
 * @param {{ autoStart?: boolean }} [options]
 */
export const useCountdown = (initialSeconds = 0, options = {}) => {
  const { autoStart = true } = options;
  const target = Math.max(0, Math.floor(Number(initialSeconds) || 0));

  const [seconds, setSeconds] = useState(target);
  const [isRunning, setIsRunning] = useState(autoStart && target > 0);

  // Re-sync when a new duration arrives (e.g. a renewed lockout window).
  useEffect(() => {
    setSeconds(target);
    setIsRunning(autoStart && target > 0);
  }, [target, autoStart]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(target);
    setIsRunning(autoStart && target > 0);
  }, [target, autoStart]);

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [seconds]);

  return { seconds, isRunning, isComplete: seconds === 0, start, pause, reset, formatTime };
};

export default useCountdown;

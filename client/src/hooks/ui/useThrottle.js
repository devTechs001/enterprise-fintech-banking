import { useRef, useState, useEffect } from 'react';

export const useThrottle = (value, interval = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(handler);
    }
  }, [value, interval]);

  return throttledValue;
};

export default useThrottle;

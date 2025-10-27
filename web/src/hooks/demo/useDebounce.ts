/**
 * useDebounce - Debounce hook for delayed value updates
 *
 * Useful for search inputs, filter updates, and other user interactions
 * that should be delayed to avoid excessive API calls.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * const { data } = useDemoData('things', { search: debouncedSearch });
 * ```
 */

import { useEffect, useState } from 'react';

/**
 * Generic debounce hook
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce function - useful for imperative code
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Debounce with leading and trailing options
 */
export function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let maxWaitTimeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  const { leading = false, trailing = true, maxWait } = options || {};

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const isLeadingCall = lastCallTime === 0;

    // Call immediately on leading edge
    if (leading && isLeadingCall) {
      func(...args);
    }

    // Store args for trailing call
    lastArgs = args;
    lastCallTime = now;

    // Clear existing timeouts
    if (timeoutId) clearTimeout(timeoutId);
    if (maxWaitTimeoutId) clearTimeout(maxWaitTimeoutId);

    // Set trailing timeout
    if (trailing) {
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        lastCallTime = 0;
        timeoutId = null;
      }, delay);
    }

    // Set max wait timeout
    if (maxWait) {
      maxWaitTimeoutId = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        lastCallTime = 0;
        maxWaitTimeoutId = null;
      }, maxWait);
    }
  };
}

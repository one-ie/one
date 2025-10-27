/**
 * Global Test Setup for Vitest
 *
 * Runs before all tests to:
 * - Setup testing library configuration
 * - Setup mocks and stubs
 * - Configure test environment
 * - Setup beforeEach/afterEach hooks
 *
 * Run via: vitest.config.ts setupFiles
 */

import { expect, afterEach, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Setup runs before all tests
beforeAll(() => {
  // Setup environment variables for tests
  process.env.PUBLIC_CONVEX_URL = process.env.PUBLIC_CONVEX_URL || 'https://shocking-falcon-870.convex.cloud';
  process.env.NODE_ENV = 'test';
});

// Setup before each test
beforeEach(() => {
  // Reset any global state
  localStorage.clear();
  sessionStorage.clear();
});

// Cleanup runs after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Cleanup runs after all tests
afterAll(() => {
  // Add any global cleanup here
});

// Mock window.matchMedia (for dark mode tests, responsive tests, etc.)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (for scroll tests, lazy loading, etc.)
if (!global.IntersectionObserver) {
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
}

// Mock ResizeObserver (for responsive component tests)
if (!global.ResizeObserver) {
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
}

// Mock scrollTo
if (!window.scrollTo) {
  window.scrollTo = vi.fn();
}

// Setup custom matchers
declare global {
  namespace Vi {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Suppress specific console warnings in tests (optional)
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn((...args) => {
    // Filter out expected React warnings
    const message = args[0]?.toString() || '';
    if (
      !message.includes('Warning: ReactDOM.render') &&
      !message.includes('Warning: useLayoutEffect') &&
      !message.includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      originalError(...args);
    }
  });

  console.warn = vi.fn((...args) => {
    // Filter out expected warnings
    const message = args[0]?.toString() || '';
    if (!message.includes('act(')) {
      originalWarn(...args);
    }
  });
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

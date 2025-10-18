/**
 * Vitest setup file for test environment configuration
 *
 * This file runs before all tests to configure the test environment
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Setup global test utilities
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

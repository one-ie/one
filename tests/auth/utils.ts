import { ConvexHttpClient } from "convex/browser";

/**
 * Test utilities for auth tests
 */

// Initialize Convex client
export const convex = new ConvexHttpClient(
  process.env.PUBLIC_CONVEX_URL || "https://shocking-falcon-870.convex.cloud"
);

/**
 * Generate a unique test email
 */
export function generateTestEmail(prefix: string = "test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
}

/**
 * Generate a secure random password
 */
export function generateTestPassword(): string {
  return `Test${Math.random().toString(36).slice(2)}Pass123!`;
}

/**
 * Wait for a specified duration (for rate limiting tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean up test data (delete test users and sessions)
 * Note: This requires admin mutations in the backend
 */
export async function cleanupTestData(email: string): Promise<void> {
  // In production, you'd implement admin mutations to clean up test data
  // For now, we'll let Convex's TTL handle cleanup or manually clean via dashboard
  console.log(`Test cleanup: ${email} (manual cleanup required)`);
}

/**
 * Test result logger
 */
export class TestLogger {
  private testName: string;
  private startTime: number;

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
  }

  log(message: string): void {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${this.testName}] [${elapsed}ms] ${message}`);
  }

  success(message: string): void {
    const elapsed = Date.now() - this.startTime;
    console.log(`✅ [${this.testName}] [${elapsed}ms] ${message}`);
  }

  error(message: string, error?: any): void {
    const elapsed = Date.now() - this.startTime;
    console.error(`❌ [${this.testName}] [${elapsed}ms] ${message}`, error);
  }
}

/**
 * Assert helper
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Test session helper
 */
export interface TestSession {
  token: string;
  userId: string;
  email: string;
}

/**
 * Create a test user and return session
 */
export async function createTestUser(
  api: any,
  email?: string,
  password?: string
): Promise<TestSession> {
  const testEmail = email || generateTestEmail();
  const testPassword = password || generateTestPassword();

  const result = await convex.mutation(api.auth.signUp, {
    email: testEmail,
    password: testPassword,
    name: "Test User",
  });

  return {
    token: result.token,
    userId: result.userId,
    email: testEmail,
  };
}

/**
 * Sign in a test user and return session
 */
export async function signInTestUser(
  api: any,
  email: string,
  password: string
): Promise<TestSession> {
  const result = await convex.mutation(api.auth.signIn, {
    email,
    password,
  });

  return {
    token: result.token,
    userId: result.userId,
    email,
  };
}

/**
 * Get current user from session
 */
export async function getCurrentUser(api: any, token: string): Promise<any> {
  return await convex.query(api.auth.getCurrentUser, { token });
}

/**
 * Sign out and clean up session
 */
export async function signOut(api: any, token: string): Promise<void> {
  await convex.mutation(api.auth.signOut, { token });
}

/**
 * Test configuration
 */
export const TEST_CONFIG = {
  baseUrl: "http://localhost:4321",
  timeout: 10000, // 10 seconds
  retries: 3,
};

/**
 * Retry helper for flaky tests
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = TEST_CONFIG.retries,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) {
      throw error;
    }
    await wait(delay);
    return retry(fn, retries - 1, delay);
  }
}

/**
 * Email validation helper
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Password strength helper
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

/**
 * Token validation helper
 */
export function isValidToken(token: string): boolean {
  // Token should be a 64-character hex string
  return /^[a-f0-9]{64}$/.test(token);
}

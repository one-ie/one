/**
 * Provider Factory
 *
 * Creates IOntologyProvider instances based on configuration.
 * NOTE: Provider implementations in ./providers/ have been disabled.
 *
 * This is a stub that shows the expected interface for creating providers.
 * In a production system, this would load different provider implementations
 * based on environment configuration.
 */

import type { IOntologyProvider } from "./types";

/**
 * Get provider from environment configuration
 *
 * Currently returns null - no active provider implementations available.
 * To use, implement one of:
 * - ConvexProvider (for Convex backend)
 * - MarkdownProvider (for static markdown files)
 * - HTTPProvider (for custom HTTP API)
 * - CompositeProvider (combining multiple providers)
 */
export async function getProvider(): Promise<IOntologyProvider | null> {
  // TODO: Implement provider factory
  // const providerType = import.meta.env.VITE_PROVIDER || "convex";
  // switch (providerType) {
  //   case "convex":
  //     return createConvexProvider(...);
  //   case "markdown":
  //     return createMarkdownProvider(...);
  //   ...
  // }

  return null;
}

/**
 * Create a Convex provider
 *
 * Usage in production:
 * const provider = createConvexProvider(
 *   'https://your-deployment.convex.cloud',
 *   'user-id'
 * );
 */
export async function createConvexProvider(
  url: string,
  userId?: string
): Promise<IOntologyProvider> {
  // TODO: Implement ConvexProvider
  throw new Error('ConvexProvider not implemented');
}

/**
 * Create an HTTP provider
 *
 * Usage in production:
 * const provider = createHTTPProvider('https://api.example.com');
 */
export async function createHTTPProvider(
  baseUrl: string
): Promise<IOntologyProvider> {
  // TODO: Implement HTTPProvider
  throw new Error('HTTPProvider not implemented');
}

/**
 * Create a Markdown provider
 *
 * Usage in production:
 * const provider = createMarkdownProvider('src/content');
 */
export async function createMarkdownProvider(
  contentDir: string
): Promise<IOntologyProvider> {
  // TODO: Implement MarkdownProvider
  throw new Error('MarkdownProvider not implemented');
}

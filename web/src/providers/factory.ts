/**
 * DataProvider Factory
 *
 * Creates DataProvider instances based on configuration.
 * Enables switching backends by changing ONE line:
 *
 * ```typescript
 * const provider = createDataProvider('convex', config);
 * // vs
 * const provider = createDataProvider('wordpress', config);
 * ```
 */

import type { ConvexReactClient } from "convex/react";
import type { DataProvider } from "./DataProvider";
import { createConvexProvider } from "./ConvexProvider";
import { Layer } from "effect";
import { DataProviderService } from "./DataProvider";

/**
 * Supported backend providers
 */
export type ProviderType = "convex" | "wordpress" | "notion" | "supabase";

/**
 * Provider-specific configuration
 */
export type ProviderConfig =
  | {
      type: "convex";
      client: ConvexReactClient;
      cacheEnabled?: boolean;
      cacheTTL?: number;
    }
  | {
      type: "wordpress";
      url: string;
      apiKey?: string;
      username?: string;
      password?: string;
    }
  | {
      type: "notion";
      apiKey: string;
      databaseId: string;
    }
  | {
      type: "supabase";
      url: string;
      anonKey: string;
    };

/**
 * Create a DataProvider instance based on configuration
 *
 * @example
 * ```typescript
 * import { ConvexReactClient } from 'convex/react';
 *
 * const convexClient = new ConvexReactClient(process.env.PUBLIC_CONVEX_URL);
 * const provider = createDataProvider({
 *   type: 'convex',
 *   client: convexClient
 * });
 * ```
 */
export function createDataProvider(config: ProviderConfig): DataProvider {
  switch (config.type) {
    case "convex":
      return createConvexProvider({
        client: config.client,
        cacheEnabled: config.cacheEnabled,
        cacheTTL: config.cacheTTL,
      });

    case "wordpress":
      throw new Error("WordPress provider not yet implemented. See Feature 2-7.");

    case "notion":
      throw new Error("Notion provider not yet implemented. See Feature 2-7.");

    case "supabase":
      throw new Error("Supabase provider not yet implemented.");

    default:
      const _exhaustive: never = config as never;
      throw new Error(`Unknown provider type: ${JSON.stringify(_exhaustive)}`);
  }
}

/**
 * Create Effect.ts Layer for DataProvider
 *
 * This enables dependency injection in Effect.ts services.
 *
 * @example
 * ```typescript
 * const provider = createDataProvider({ type: 'convex', client });
 * const layer = createDataProviderLayer(provider);
 *
 * // Use in Effect program
 * const program = Effect.gen(function* () {
 *   const dataProvider = yield* DataProviderService;
 *   return yield* dataProvider.things.list({ type: 'course' });
 * }).pipe(Effect.provide(layer));
 * ```
 */
export function createDataProviderLayer(provider: DataProvider) {
  return Layer.succeed(DataProviderService, provider);
}

/**
 * Default Convex provider for this project
 *
 * @example
 * ```typescript
 * import { defaultProvider } from './providers/factory';
 *
 * // In React components
 * const courses = await Effect.runPromise(
 *   defaultProvider.things.list({ type: 'course' })
 * );
 * ```
 */
export let defaultProvider: DataProvider | null = null as DataProvider | null;

/**
 * Initialize default provider (call once at app startup)
 */
export function initializeDefaultProvider(config: ProviderConfig): void {
  defaultProvider = createDataProvider(config);
}

/**
 * Get the default provider (throws if not initialized)
 */
export function getDefaultProvider(): DataProvider {
  if (!defaultProvider) {
    throw new Error(
      "Default provider not initialized. Call initializeDefaultProvider() at app startup."
    );
  }
  return defaultProvider;
}

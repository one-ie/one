/**
 * Configuration Validation with Effect.ts
 *
 * Provides Effect-based validation for provider configurations,
 * encrypted credentials, and multi-tenant setups.
 *
 * Usage:
 * ```typescript
 * import { validateConfig, validateEncryptedCredentials } from '@/config/validation';
 *
 * const result = await Effect.runPromise(
 *   validateConfig(config)
 * );
 * ```
 */

import { Effect, Data } from "effect";
import { z } from "astro/zod";
import type { ProviderConfig } from "@/providers/factory";
import {
  ConvexEnvSchema,
  WordPressEnvSchema,
  NotionEnvSchema,
  SupabaseEnvSchema,
} from "./providers";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Configuration validation failed
 */
export class ConfigValidationError extends Data.TaggedError("ConfigValidationError")<{
  errors: string[];
  providerType?: string;
}> {}

/**
 * Encryption key validation failed
 */
export class EncryptionKeyError extends Data.TaggedError("EncryptionKeyError")<{
  reason: string;
}> {}

/**
 * Provider configuration is missing required fields
 */
export class MissingConfigFieldError extends Data.TaggedError("MissingConfigFieldError")<{
  field: string;
  providerType: string;
}> {}

/**
 * Provider configuration has invalid format
 */
export class InvalidConfigFormatError extends Data.TaggedError("InvalidConfigFormatError")<{
  field: string;
  expected: string;
  actual: string;
}> {}

/**
 * Organization configuration not found
 */
export class OrganizationConfigNotFoundError extends Data.TaggedError(
  "OrganizationConfigNotFoundError"
)<{
  organizationId: string;
}> {}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate provider configuration
 *
 * @param config Provider configuration to validate
 * @returns Effect that succeeds with validated config or fails with validation error
 *
 * @example
 * ```typescript
 * const config = { type: 'convex', ... };
 *
 * const program = validateConfig(config).pipe(
 *   Effect.map(validated => console.log('Valid!', validated)),
 *   Effect.catchTag('ConfigValidationError', error =>
 *     Effect.sync(() => console.error('Invalid:', error.errors))
 *   )
 * );
 *
 * await Effect.runPromise(program);
 * ```
 */
export function validateConfig(
  config: ProviderConfig
): Effect.Effect<ProviderConfig, ConfigValidationError> {
  return Effect.try({
    try: () => {
      const providerType = config.type;

      switch (providerType) {
        case "convex":
          // Validate Convex config structure
          if (!config.client && !(config as any).url) {
            throw new Error("Convex config requires 'client' or 'url'");
          }
          return config;

        case "wordpress":
          // Validate WordPress config
          const wpConfig = config as any;
          if (!wpConfig.url || !wpConfig.username || !wpConfig.password) {
            throw new Error("WordPress config requires 'url', 'username', and 'password'");
          }

          // Validate URL format
          try {
            new URL(wpConfig.url);
          } catch {
            throw new Error(`Invalid WordPress URL: ${wpConfig.url}`);
          }

          // Validate application password format (24 chars with spaces)
          if (!/^[a-zA-Z0-9 ]{24}$/.test(wpConfig.password)) {
            throw new Error(
              "WordPress application password must be 24 characters (format: xxxx xxxx xxxx xxxx xxxx xxxx)"
            );
          }

          return config;

        case "notion":
          // Validate Notion config
          const notionConfig = config as any;
          if (!notionConfig.apiKey || !notionConfig.databaseId) {
            throw new Error("Notion config requires 'apiKey' and 'databaseId'");
          }

          // Validate token format
          if (!notionConfig.apiKey.startsWith("secret_")) {
            throw new Error("Notion API key must start with 'secret_'");
          }

          return config;

        case "supabase":
          // Validate Supabase config
          const supabaseConfig = config as any;
          if (!supabaseConfig.url || !supabaseConfig.anonKey) {
            throw new Error("Supabase config requires 'url' and 'anonKey'");
          }

          // Validate URL format
          try {
            new URL(supabaseConfig.url);
          } catch {
            throw new Error(`Invalid Supabase URL: ${supabaseConfig.url}`);
          }

          return config;

        default:
          throw new Error(`Unknown provider type: ${(config as any).type}`);
      }
    },
    catch: (error) => {
      return new ConfigValidationError({
        errors: [String(error)],
        providerType: config.type,
      });
    },
  });
}

/**
 * Validate encryption key format
 *
 * @param key Encryption key (32 bytes = 64 hex chars)
 * @returns Effect that succeeds with key or fails with error
 *
 * @example
 * ```typescript
 * const key = process.env.ENCRYPTION_KEY;
 *
 * const program = validateEncryptionKey(key).pipe(
 *   Effect.map(validKey => console.log('Key valid')),
 *   Effect.catchTag('EncryptionKeyError', error =>
 *     Effect.sync(() => console.error('Key invalid:', error.reason))
 *   )
 * );
 * ```
 */
export function validateEncryptionKey(
  key?: string
): Effect.Effect<string, EncryptionKeyError> {
  return Effect.try({
    try: () => {
      if (!key) {
        throw new EncryptionKeyError({
          reason:
            "ENCRYPTION_KEY environment variable required. Generate with: openssl rand -hex 32",
        });
      }

      // Must be 32 bytes = 64 hex characters
      if (!/^[0-9a-f]{64}$/i.test(key)) {
        throw new EncryptionKeyError({
          reason:
            "ENCRYPTION_KEY must be 32 bytes (64 hex characters). Generate with: openssl rand -hex 32",
        });
      }

      return key;
    },
    catch: (error) => error as EncryptionKeyError,
  });
}

/**
 * Validate environment variables for a provider type
 *
 * @param providerType Provider type
 * @param env Environment variables
 * @returns Effect that succeeds with parsed env or fails with validation error
 *
 * @example
 * ```typescript
 * const env = {
 *   BACKEND_PROVIDER: 'convex',
 *   PUBLIC_CONVEX_URL: 'https://...',
 *   CONVEX_DEPLOYMENT: 'prod:...'
 * };
 *
 * const program = validateProviderEnv('convex', env);
 * await Effect.runPromise(program);
 * ```
 */
export function validateProviderEnv(
  providerType: string,
  env: Record<string, any>
): Effect.Effect<any, ConfigValidationError> {
  return Effect.try({
    try: () => {
      switch (providerType) {
        case "convex":
          return ConvexEnvSchema.parse(env);

        case "wordpress":
          return WordPressEnvSchema.parse(env);

        case "notion":
          return NotionEnvSchema.parse(env);

        case "supabase":
          return SupabaseEnvSchema.parse(env);

        default:
          throw new Error(`Unknown provider type: ${providerType}`);
      }
    },
    catch: (error) => {
      if (error instanceof z.ZodError) {
        return new ConfigValidationError({
          errors: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
          providerType,
        });
      }
      return new ConfigValidationError({
        errors: [String(error)],
        providerType,
      });
    },
  });
}

/**
 * Validate configuration fields are present
 *
 * @param config Configuration object
 * @param requiredFields Required field names
 * @returns Effect that succeeds if all fields present, fails otherwise
 *
 * @example
 * ```typescript
 * const config = { url: 'https://...', username: 'admin' };
 * const program = validateRequiredFields(
 *   config,
 *   ['url', 'username', 'password']
 * );
 * // Fails because 'password' is missing
 * ```
 */
export function validateRequiredFields(
  config: Record<string, any>,
  requiredFields: string[]
): Effect.Effect<void, MissingConfigFieldError> {
  return Effect.gen(function* () {
    for (const field of requiredFields) {
      if (!config[field]) {
        yield* Effect.fail(
          new MissingConfigFieldError({
            field,
            providerType: config.type || "unknown",
          })
        );
      }
    }
  });
}

/**
 * Validate URL format
 *
 * @param url URL string
 * @param fieldName Field name for error messages
 * @returns Effect that succeeds with URL or fails with format error
 *
 * @example
 * ```typescript
 * const program = validateUrl('https://example.com', 'baseUrl');
 * await Effect.runPromise(program); // Succeeds
 *
 * const program2 = validateUrl('not-a-url', 'baseUrl');
 * await Effect.runPromise(program2); // Fails
 * ```
 */
export function validateUrl(
  url: string,
  fieldName: string
): Effect.Effect<string, InvalidConfigFormatError> {
  return Effect.try({
    try: () => {
      new URL(url);
      return url;
    },
    catch: () =>
      new InvalidConfigFormatError({
        field: fieldName,
        expected: "valid URL",
        actual: url,
      }),
  });
}

/**
 * Validate configuration with all checks
 *
 * Combines multiple validation steps:
 * 1. Required fields present
 * 2. Field formats valid
 * 3. Provider-specific rules
 *
 * @param config Provider configuration
 * @returns Effect that succeeds with validated config or fails with first error
 *
 * @example
 * ```typescript
 * const config = { type: 'wordpress', ... };
 *
 * const program = validateConfigComprehensive(config).pipe(
 *   Effect.tap(() => Effect.log('✓ Configuration valid')),
 *   Effect.catchAll(error => Effect.log('✗ Validation failed:', error))
 * );
 *
 * await Effect.runPromise(program);
 * ```
 */
export function validateConfigComprehensive(
  config: ProviderConfig
): Effect.Effect<
  ProviderConfig,
  ConfigValidationError | MissingConfigFieldError | InvalidConfigFormatError
> {
  return Effect.gen(function* () {
    // Step 1: Basic structure validation
    yield* validateConfig(config);

    // Step 2: Provider-specific validation
    switch (config.type) {
      case "convex":
        // Convex validation handled by validateConfig
        break;

      case "wordpress":
        const wpConfig = config as any;
        yield* validateRequiredFields(wpConfig, ["url", "username", "password"]);
        yield* validateUrl(wpConfig.url, "url");
        break;

      case "notion":
        const notionConfig = config as any;
        yield* validateRequiredFields(notionConfig, ["apiKey", "databaseId"]);
        break;

      case "supabase":
        const supabaseConfig = config as any;
        yield* validateRequiredFields(supabaseConfig, ["url", "anonKey"]);
        yield* validateUrl(supabaseConfig.url, "url");
        break;
    }

    return config;
  });
}

/**
 * Validate organization has provider configuration
 *
 * @param organizationId Organization ID
 * @param getConfigFn Function to fetch config (for dependency injection)
 * @returns Effect that succeeds with config or fails if not found
 *
 * @example
 * ```typescript
 * const program = validateOrganizationConfig(
 *   'org_123',
 *   (id) => getOrgConfigFromDB(id)
 * );
 *
 * await Effect.runPromise(program);
 * ```
 */
export function validateOrganizationConfig(
  organizationId: string,
  getConfigFn: (orgId: string) => ProviderConfig | null
): Effect.Effect<ProviderConfig, OrganizationConfigNotFoundError> {
  return Effect.gen(function* () {
    const config = getConfigFn(organizationId);

    if (!config) {
      return yield* Effect.fail(
        new OrganizationConfigNotFoundError({ organizationId })
      );
    }

    return config;
  });
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if config is valid without throwing
 *
 * @param config Configuration to check
 * @returns true if valid, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidConfig(config)) {
 *   // Safe to use config
 * } else {
 *   // Show error message
 * }
 * ```
 */
export function isValidConfig(config: ProviderConfig): boolean {
  const result = Effect.runSync(
    validateConfig(config).pipe(
      Effect.map(() => true),
      Effect.catchAll(() => Effect.succeed(false))
    )
  );
  return result;
}

/**
 * Get validation errors as string array
 *
 * @param config Configuration to validate
 * @returns Array of error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = getValidationErrors(config);
 * if (errors.length > 0) {
 *   console.error('Validation failed:', errors.join(', '));
 * }
 * ```
 */
export function getValidationErrors(config: ProviderConfig): string[] {
  const result = Effect.runSync(
    validateConfig(config).pipe(
      Effect.map(() => [] as string[]),
      Effect.catchTag("ConfigValidationError", (error) =>
        Effect.succeed(error.errors)
      )
    )
  );
  return result;
}

/**
 * Validate configuration synchronously (for UI)
 *
 * @param config Configuration to validate
 * @returns Validation result with errors
 *
 * @example
 * ```typescript
 * const result = validateConfigSync(config);
 * if (!result.valid) {
 *   showErrorToast(result.errors.join('\n'));
 * }
 * ```
 */
export function validateConfigSync(config: ProviderConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors = getValidationErrors(config);
  return {
    valid: errors.length === 0,
    errors,
  };
}

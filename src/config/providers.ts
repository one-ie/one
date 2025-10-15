/**
 * Provider Configuration Loader
 *
 * Loads backend provider configuration from environment variables
 * with Zod validation and multi-tenant support.
 *
 * Usage:
 * ```typescript
 * import { loadProviderConfig, getProviderForOrganization } from '@/config/providers';
 *
 * // At app startup
 * const defaultConfig = loadProviderConfig();
 *
 * // Per organization (runtime)
 * const orgProvider = await getProviderForOrganization('org_123');
 * ```
 */

import { z } from "astro/zod";
import type { ProviderConfig } from "@/providers/factory";

// ============================================================================
// ENVIRONMENT VALIDATION SCHEMAS
// ============================================================================

/**
 * Convex provider configuration
 */
export const ConvexEnvSchema = z.object({
  BACKEND_PROVIDER: z.literal("convex"),
  PUBLIC_CONVEX_URL: z.string().url(),
  CONVEX_DEPLOYMENT: z.string().regex(/^(dev|prod):.+$/),
});

/**
 * WordPress provider configuration
 */
export const WordPressEnvSchema = z.object({
  BACKEND_PROVIDER: z.literal("wordpress"),
  WORDPRESS_URL: z.string().url(),
  WORDPRESS_USERNAME: z.string().min(1),
  WORDPRESS_APP_PASSWORD: z.string().refine(
    (pwd) => {
      const noSpaces = pwd.replace(/ /g, '');
      return noSpaces.length === 24 && /^[a-zA-Z0-9]{24}$/.test(noSpaces);
    },
    { message: "Must be 24 alphanumeric characters (with or without spaces)" }
  ),
});

/**
 * Notion provider configuration
 */
export const NotionEnvSchema = z.object({
  BACKEND_PROVIDER: z.literal("notion"),
  NOTION_TOKEN: z.string().startsWith("secret_"),
  NOTION_DATABASE_ID: z.string().min(1),
});

/**
 * Supabase provider configuration
 */
export const SupabaseEnvSchema = z.object({
  BACKEND_PROVIDER: z.literal("supabase"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().optional(),
});

/**
 * Discriminated union of all provider schemas
 */
export const ProviderEnvSchema = z.discriminatedUnion("BACKEND_PROVIDER", [
  ConvexEnvSchema,
  WordPressEnvSchema,
  NotionEnvSchema,
  SupabaseEnvSchema,
]);

export type ProviderEnv = z.infer<typeof ProviderEnvSchema>;

// ============================================================================
// ENCRYPTION KEY VALIDATION
// ============================================================================

/**
 * Validates encryption key for secure credential storage
 *
 * @throws {Error} If key is missing or invalid format
 */
export function validateEncryptionKey(key?: string): void {
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable required for secure credential storage. " +
      "Generate one with: openssl rand -hex 32"
    );
  }

  // Must be 32 bytes = 64 hex characters
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error(
      "ENCRYPTION_KEY must be 32 bytes (64 hex characters). " +
      "Generate one with: openssl rand -hex 32"
    );
  }
}

// ============================================================================
// CONFIGURATION LOADER
// ============================================================================

/**
 * Load and validate provider configuration from environment variables
 *
 * @throws {Error} If environment variables are missing or invalid
 * @returns Validated provider configuration
 *
 * @example
 * ```typescript
 * // Set environment variables first:
 * // BACKEND_PROVIDER=convex
 * // PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
 * // CONVEX_DEPLOYMENT=prod:shocking-falcon-870
 *
 * const config = loadProviderConfig();
 * console.log(config.type); // "convex"
 * ```
 */
export function loadProviderConfig(): ProviderConfig {
  const providerType = import.meta.env.BACKEND_PROVIDER || import.meta.env.PUBLIC_BACKEND_PROVIDER;

  if (!providerType) {
    throw new Error(
      "BACKEND_PROVIDER environment variable required. " +
      "Set to: convex, wordpress, notion, or supabase"
    );
  }

  // Build raw config object based on provider type
  const rawEnv = {
    BACKEND_PROVIDER: providerType,
    ...(providerType === "convex" && {
      PUBLIC_CONVEX_URL: import.meta.env.PUBLIC_CONVEX_URL,
      CONVEX_DEPLOYMENT: import.meta.env.CONVEX_DEPLOYMENT,
    }),
    ...(providerType === "wordpress" && {
      WORDPRESS_URL: import.meta.env.WORDPRESS_URL,
      WORDPRESS_USERNAME: import.meta.env.WORDPRESS_USERNAME,
      WORDPRESS_APP_PASSWORD: import.meta.env.WORDPRESS_APP_PASSWORD,
    }),
    ...(providerType === "notion" && {
      NOTION_TOKEN: import.meta.env.NOTION_TOKEN,
      NOTION_DATABASE_ID: import.meta.env.NOTION_DATABASE_ID,
    }),
    ...(providerType === "supabase" && {
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: import.meta.env.SUPABASE_SERVICE_KEY,
    }),
  };

  // Validate with Zod
  let validatedEnv: ProviderEnv;
  try {
    validatedEnv = ProviderEnvSchema.parse(rawEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(
        `Invalid provider configuration:\n${issues}\n\n` +
        `Check your .env file for missing or invalid environment variables.`
      );
    }
    throw error;
  }

  // Convert to ProviderConfig format
  switch (validatedEnv.BACKEND_PROVIDER) {
    case "convex":
      return {
        type: "convex",
        client: null as any, // Will be set by initializeDefaultProvider
        cacheEnabled: true,
        cacheTTL: 60000, // 1 minute
      };

    case "wordpress":
      return {
        type: "wordpress",
        url: validatedEnv.WORDPRESS_URL,
        username: validatedEnv.WORDPRESS_USERNAME,
        password: validatedEnv.WORDPRESS_APP_PASSWORD,
      };

    case "notion":
      return {
        type: "notion",
        apiKey: validatedEnv.NOTION_TOKEN,
        databaseId: validatedEnv.NOTION_DATABASE_ID,
      };

    case "supabase":
      return {
        type: "supabase",
        url: validatedEnv.SUPABASE_URL,
        anonKey: validatedEnv.SUPABASE_ANON_KEY,
      };

    default:
      const _exhaustive: never = validatedEnv;
      throw new Error(`Unknown provider type: ${JSON.stringify(validatedEnv)}`);
  }
}

// ============================================================================
// MULTI-TENANT PROVIDER CONFIGURATION
// ============================================================================

/**
 * Organization-specific provider configuration
 * Stored in Convex `entities` table with type: "organization"
 */
export interface OrganizationProviderConfig {
  organizationId: string;
  providerType: "convex" | "wordpress" | "notion" | "supabase";
  configId?: string; // Reference to external_connection entity
  switchedAt?: number;
  previousProvider?: string;
}

/**
 * Provider configuration cache (in-memory)
 * Key: organizationId
 * Value: ProviderConfig
 */
const organizationProviderCache = new Map<string, ProviderConfig>();

/**
 * Get provider configuration for a specific organization
 *
 * This enables multi-tenant isolation where each org can use a different backend.
 *
 * @param organizationId Organization ID
 * @returns Provider configuration for the organization
 *
 * @example
 * ```typescript
 * // Org A uses Convex
 * const orgAConfig = getOrganizationProviderConfig('org_a');
 * // Returns { type: 'convex', ... }
 *
 * // Org B uses WordPress
 * const orgBConfig = getOrganizationProviderConfig('org_b');
 * // Returns { type: 'wordpress', ... }
 * ```
 */
export function getOrganizationProviderConfig(
  organizationId: string
): ProviderConfig | null {
  return organizationProviderCache.get(organizationId) || null;
}

/**
 * Set provider configuration for a specific organization
 *
 * @param organizationId Organization ID
 * @param config Provider configuration
 */
export function setOrganizationProviderConfig(
  organizationId: string,
  config: ProviderConfig
): void {
  organizationProviderCache.set(organizationId, config);
}

/**
 * Clear provider configuration cache for an organization
 * (Used when switching providers)
 *
 * @param organizationId Organization ID
 */
export function clearOrganizationProviderConfig(organizationId: string): void {
  organizationProviderCache.delete(organizationId);
}

/**
 * Clear all organization provider configurations
 * (Used for testing or cache invalidation)
 */
export function clearAllOrganizationProviderConfigs(): void {
  organizationProviderCache.clear();
}

// ============================================================================
// CONFIGURATION VALIDATION HELPERS
// ============================================================================

/**
 * Validate provider configuration at runtime
 *
 * @param config Provider configuration to validate
 * @returns Validation result with errors
 *
 * @example
 * ```typescript
 * const config = { type: 'convex', deploymentUrl: 'invalid' };
 * const result = validateProviderConfig(config);
 *
 * if (!result.success) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateProviderConfig(
  config: unknown
): { success: boolean; errors?: string[] } {
  try {
    const providerType = (config as any)?.type;

    switch (providerType) {
      case "convex":
        // For Convex, we accept client (even if null) or url
        const convexConfig = config as any;
        if (!('client' in convexConfig) && !convexConfig.url) {
          return {
            success: false,
            errors: ["Convex provider requires 'client' or 'url' field"],
          };
        }
        break;

      case "wordpress":
        const wpConfig = config as any;
        // Validate WordPress requirements
        if (!wpConfig.url || !wpConfig.username || !wpConfig.password) {
          return {
            success: false,
            errors: ["WordPress requires url, username, and password"],
          };
        }
        // Validate WordPress password format (24 alphanumeric + 5 spaces = 29 total)
        // Accept format: "xxxx xxxx xxxx xxxx xxxx xxxx" (6 groups of 4 chars)
        const passwordNoSpaces = wpConfig.password.replace(/ /g, '');
        if (passwordNoSpaces.length !== 24 || !/^[a-zA-Z0-9]{24}$/.test(passwordNoSpaces)) {
          return {
            success: false,
            errors: ["WordPress application password must be 24 characters (format: xxxx xxxx xxxx xxxx xxxx xxxx)"],
          };
        }
        WordPressEnvSchema.parse({
          BACKEND_PROVIDER: "wordpress",
          WORDPRESS_URL: wpConfig.url,
          WORDPRESS_USERNAME: wpConfig.username,
          WORDPRESS_APP_PASSWORD: wpConfig.password,
        });
        break;

      case "notion":
        NotionEnvSchema.parse({
          BACKEND_PROVIDER: "notion",
          NOTION_TOKEN: (config as any).apiKey,
          NOTION_DATABASE_ID: (config as any).databaseId,
        });
        break;

      case "supabase":
        SupabaseEnvSchema.parse({
          BACKEND_PROVIDER: "supabase",
          SUPABASE_URL: (config as any).url,
          SUPABASE_ANON_KEY: (config as any).anonKey,
          SUPABASE_SERVICE_KEY: (config as any).serviceKey,
        });
        break;

      default:
        return {
          success: false,
          errors: [`Unknown provider type: ${providerType}`],
        };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      };
    }
    return {
      success: false,
      errors: [String(error)],
    };
  }
}

/**
 * Get helpful error message for missing environment variables
 *
 * @param providerType Provider type
 * @returns Helpful error message with example .env configuration
 */
export function getMissingEnvHelp(providerType: string): string {
  const examples: Record<string, string> = {
    convex: `
# Add to .env or .env.local:
BACKEND_PROVIDER=convex
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name
`,
    wordpress: `
# Add to .env or .env.local:
BACKEND_PROVIDER=wordpress
WORDPRESS_URL=https://example.com/wp-json
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
`,
    notion: `
# Add to .env or .env.local:
BACKEND_PROVIDER=notion
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=your-database-id
`,
    supabase: `
# Add to .env or .env.local:
BACKEND_PROVIDER=supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key (optional)
`,
  };

  return examples[providerType] || "Unknown provider type";
}

/**
 * Feature Flags for Ontology Integration
 *
 * Controls which ontology dimensions and features are enabled
 * based on backend provider and environment configuration.
 *
 * These flags allow graceful degradation - features can be disabled
 * for frontend-only or limited backend scenarios.
 *
 * @example
 * ```ts
 * import { features, isFeatureEnabled } from '@/lib/ontology/features';
 *
 * if (features.auth) {
 *   // Auth is enabled - show login/account UI
 * }
 *
 * if (isFeatureEnabled('groups')) {
 *   // Multi-tenant groups are enabled
 * }
 * ```
 */

/**
 * Feature flag configuration
 *
 * Controls which backend capabilities are active:
 * - auth: User authentication and authorization
 * - groups: Multi-tenant organization support
 * - permissions: Role-based access control
 * - realtime: WebSocket subscriptions and live updates
 * - search: Full-text and semantic search
 * - knowledge: Vector embeddings and RAG
 * - connections: Relationship tracking
 * - events: Activity logging and audit trail
 */
export interface FeatureFlags {
  /** Authentication enabled (requires user login) */
  auth: boolean;

  /** Multi-tenant groups enabled (org/team support) */
  groups: boolean;

  /** Role-based permissions (platform_owner, org_owner, org_user, customer) */
  permissions: boolean;

  /** Real-time subscriptions (WebSocket via Convex) */
  realtime: boolean;

  /** Full-text search (database search index) */
  search: boolean;

  /** Vector search and embeddings (RAG support) */
  knowledge: boolean;

  /** Connection tracking (relationships between entities) */
  connections: boolean;

  /** Event logging (audit trail and activity feed) */
  events: boolean;

  /** Inference (AI/LLM integration) */
  inference: boolean;

  /** Blockchain integration (NFTs, tokens, smart contracts) */
  blockchain: boolean;

  /** Payment processing (Stripe, payment gateways) */
  payments: boolean;

  /** Marketplace features (buy/sell, e-commerce) */
  marketplace: boolean;

  /** Community features (comments, reactions, following) */
  community: boolean;
}

/**
 * Default feature flags (all disabled for frontend-only mode)
 *
 * Enable features by setting environment variables:
 * VITE_FEATURE_AUTH=true
 * VITE_FEATURE_GROUPS=true
 * VITE_FEATURE_REALTIME=true
 * etc.
 */
export const defaultFeatures: FeatureFlags = {
  auth: false,
  groups: false,
  permissions: false,
  realtime: false,
  search: false,
  knowledge: false,
  connections: false,
  events: false,
  inference: false,
  blockchain: false,
  payments: false,
  marketplace: false,
  community: false,
};

/**
 * Parse feature flags from environment variables
 *
 * Looks for VITE_FEATURE_* env vars and converts them to boolean
 * Also checks for VITE_FEATURES JSON object
 *
 * @returns Merged feature flags
 */
function parseFeatureFlags(): FeatureFlags {
  const flags = { ...defaultFeatures };

  // Check for JSON-based features config
  const featuresJson = import.meta.env.VITE_FEATURES;
  if (featuresJson) {
    try {
      const parsed = JSON.parse(featuresJson);
      Object.assign(flags, parsed);
    } catch (err) {
      console.warn('Failed to parse VITE_FEATURES:', err);
    }
  }

  // Check for individual feature flags
  for (const [key, value] of Object.entries(defaultFeatures)) {
    const envKey = `VITE_FEATURE_${key.toUpperCase()}`;
    const envValue = import.meta.env[envKey];

    if (envValue !== undefined) {
      flags[key as keyof FeatureFlags] =
        envValue === 'true' || envValue === '1' || envValue === true;
    }
  }

  // If Convex URL is available, enable realtime and most features by default
  if (import.meta.env.PUBLIC_CONVEX_URL) {
    flags.realtime = true;
    flags.search = true;
    flags.connections = true;
    flags.events = true;
  }

  // Better Auth implies auth is enabled
  if (import.meta.env.BETTER_AUTH_SECRET) {
    flags.auth = true;
  }

  return flags;
}

/**
 * Current feature flags (singleton)
 *
 * Initialized at runtime from environment variables
 */
export const features = parseFeatureFlags();

/**
 * Check if a specific feature is enabled
 *
 * @param feature - Feature name
 * @returns true if enabled
 *
 * @example
 * ```ts
 * if (isFeatureEnabled('auth')) {
 *   // Show auth UI
 * }
 * ```
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return features[feature];
}

/**
 * Assert that a feature is enabled, throw if disabled
 *
 * Useful for enforcing feature availability at startup
 *
 * @param feature - Feature name
 * @throws Error if feature is disabled
 *
 * @example
 * ```ts
 * assertFeatureEnabled('auth');
 * // Will throw if auth not configured
 * ```
 */
export function assertFeatureEnabled(feature: keyof FeatureFlags): void {
  if (!features[feature]) {
    throw new Error(
      `Feature '${feature}' is not enabled. ` +
        `Set VITE_FEATURE_${feature.toUpperCase()}=true to enable.`
    );
  }
}

/**
 * Feature requirement checking for routes
 *
 * Declares what features a route/component requires
 */
export interface FeatureRequirement {
  /** Features that are required (all must be enabled) */
  required?: (keyof FeatureFlags)[];

  /** Features that are recommended (at least one should be enabled) */
  recommended?: (keyof FeatureFlags)[];

  /** Fallback route if features not available */
  fallback?: string;
}

/**
 * Check if feature requirements are met
 *
 * @param requirement - Feature requirement spec
 * @returns true if all requirements are satisfied
 *
 * @example
 * ```ts
 * const requirement: FeatureRequirement = {
 *   required: ['auth', 'groups'],
 *   fallback: '/standalone'
 * };
 *
 * if (!checkFeatureRequirements(requirement)) {
 *   // Redirect to fallback or show error
 * }
 * ```
 */
export function checkFeatureRequirements(requirement: FeatureRequirement): boolean {
  if (requirement.required) {
    return requirement.required.every(f => isFeatureEnabled(f));
  }
  return true;
}

/**
 * Get all enabled features
 *
 * @returns Array of enabled feature names
 *
 * @example
 * ```ts
 * const enabled = getEnabledFeatures();
 * console.log(`Enabled features: ${enabled.join(', ')}`);
 * ```
 */
export function getEnabledFeatures(): (keyof FeatureFlags)[] {
  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name as keyof FeatureFlags);
}

/**
 * Get all disabled features
 *
 * @returns Array of disabled feature names
 */
export function getDisabledFeatures(): (keyof FeatureFlags)[] {
  return Object.entries(features)
    .filter(([, enabled]) => !enabled)
    .map(([name]) => name as keyof FeatureFlags);
}

/**
 * Feature mode detection
 *
 * Determines what "mode" the app is running in based on features
 */
export type FeatureMode =
  | 'frontend-only' // No backend
  | 'basic' // Static content only
  | 'authenticated' // Auth + basic features
  | 'multi-tenant' // Full groups/orgs support
  | 'full' // All features enabled
  | 'custom'; // Custom feature combo

/**
 * Detect current feature mode
 *
 * @returns Current operating mode
 *
 * @example
 * ```ts
 * const mode = getFeatureMode();
 * if (mode === 'frontend-only') {
 *   // Load from markdown/content collections
 * } else if (mode === 'full') {
 *   // Use full backend integration
 * }
 * ```
 */
export function getFeatureMode(): FeatureMode {
  const enabled = getEnabledFeatures();

  if (enabled.length === 0) {
    return 'frontend-only';
  }

  const hasCore = features.auth && features.permissions;
  const hasTenant = features.groups;
  const hasFull = enabled.includes('realtime') && enabled.includes('search');

  if (hasTenant && hasFull) {
    return 'full';
  }

  if (hasTenant) {
    return 'multi-tenant';
  }

  if (hasCore) {
    return 'authenticated';
  }

  return 'custom';
}

/**
 * Provider requirement based on features
 *
 * Helps determine which backend provider is needed
 */
export interface ProviderRequirement {
  supportsAuth: boolean;
  supportsGroups: boolean;
  supportsRealtime: boolean;
  supportsSearch: boolean;
  supportsKnowledge: boolean;
  supportsPayments: boolean;
  supportsBlockchain: boolean;
}

/**
 * Get provider requirements from enabled features
 *
 * @returns What provider features are needed
 *
 * @example
 * ```ts
 * const requirement = getProviderRequirements();
 * // Check if Convex provider can handle it
 * ```
 */
export function getProviderRequirements(): ProviderRequirement {
  return {
    supportsAuth: features.auth,
    supportsGroups: features.groups,
    supportsRealtime: features.realtime,
    supportsSearch: features.search,
    supportsKnowledge: features.knowledge,
    supportsPayments: features.payments,
    supportsBlockchain: features.blockchain,
  };
}

/**
 * Log feature configuration (useful for debugging)
 *
 * @example
 * ```ts
 * logFeatureConfiguration();
 * // Logs all enabled/disabled features to console
 * ```
 */
export function logFeatureConfiguration(): void {
  const mode = getFeatureMode();
  const enabled = getEnabledFeatures();
  const disabled = getDisabledFeatures();

  console.group('Feature Configuration');
  console.log('Mode:', mode);
  console.log('Enabled:', enabled);
  console.log('Disabled:', disabled);
  console.log('Full Config:', features);
  console.groupEnd();
}

/**
 * Configuration examples for common scenarios
 */
export const FEATURE_PRESETS = {
  /**
   * Frontend-only (markdown + content collections, no backend)
   */
  frontendOnly: {
    auth: false,
    groups: false,
    permissions: false,
    realtime: false,
    search: false,
    knowledge: false,
    connections: false,
    events: false,
    inference: false,
    blockchain: false,
    payments: false,
    marketplace: false,
    community: false,
  } as FeatureFlags,

  /**
   * Static site with basic search
   */
  basicStatic: {
    auth: false,
    groups: false,
    permissions: false,
    realtime: false,
    search: true, // Client-side search
    knowledge: false,
    connections: false,
    events: false,
    inference: false,
    blockchain: false,
    payments: false,
    marketplace: false,
    community: false,
  } as FeatureFlags,

  /**
   * SaaS app with auth and multi-tenant
   */
  saas: {
    auth: true,
    groups: true,
    permissions: true,
    realtime: true,
    search: true,
    knowledge: false,
    connections: true,
    events: true,
    inference: false,
    blockchain: false,
    payments: true,
    marketplace: false,
    community: false,
  } as FeatureFlags,

  /**
   * Full-featured platform with all services
   */
  full: {
    auth: true,
    groups: true,
    permissions: true,
    realtime: true,
    search: true,
    knowledge: true,
    connections: true,
    events: true,
    inference: true,
    blockchain: true,
    payments: true,
    marketplace: true,
    community: true,
  } as FeatureFlags,

  /**
   * Marketplace app (products, payments, community)
   */
  marketplace: {
    auth: true,
    groups: true,
    permissions: true,
    realtime: true,
    search: true,
    knowledge: false,
    connections: true,
    events: true,
    inference: false,
    blockchain: false,
    payments: true,
    marketplace: true,
    community: true,
  } as FeatureFlags,
} as const;

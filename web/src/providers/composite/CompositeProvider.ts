/**
 * CompositeProvider - Multi-Backend Router
 *
 * Routes operations to different backend providers based on thing type or ID prefix.
 * Enables a single frontend to work with multiple backends simultaneously.
 *
 * Example use cases:
 * - Auth/courses in Convex, blog in WordPress, products in Shopify
 * - Development data in local Convex, production analytics in Supabase
 * - Public content in WordPress, private data in Convex
 */

import { Effect, Layer } from "effect";
import { DataProviderService } from "../DataProvider";
import type {
  DataProvider,
  Group,
  Thing,
  Connection,
  Event,
  Knowledge,
  CreateThingInput,
  UpdateThingInput,
  CreateGroupInput,
  UpdateGroupInput,
  CreateConnectionInput,
  CreateEventInput,
  CreateKnowledgeInput,
  ListThingsOptions,
  ListConnectionsOptions,
  ListEventsOptions,
  ListGroupsOptions,
  SearchKnowledgeOptions,
  ThingKnowledge,
} from "../DataProvider";

// ============================================================================
// CONFIG
// ============================================================================

export interface ProviderRoute {
  name: string;
  provider: DataProvider;
  // Thing types this provider handles
  thingTypes?: string[];
  // ID prefix this provider handles (e.g., "wp-", "convex-")
  idPrefix?: string;
  // Is this the default/fallback provider?
  isDefault?: boolean;
}

export interface CompositeProviderConfig {
  routes: ProviderRoute[];
}

// ============================================================================
// COMPOSITE PROVIDER IMPLEMENTATION
// ============================================================================

export const makeCompositeProvider = (config: CompositeProviderConfig): DataProvider => {
  // Find default provider
  const defaultProvider = config.routes.find((r) => r.isDefault)?.provider;

  if (!defaultProvider) {
    throw new Error("CompositeProvider requires at least one default provider");
  }

  // Route by thing ID
  const routeById = (id: string): DataProvider => {
    for (const route of config.routes) {
      if (route.idPrefix && id.startsWith(route.idPrefix)) {
        return route.provider;
      }
    }
    return defaultProvider;
  };

  // Route by thing type
  const routeByType = (type: string): DataProvider => {
    for (const route of config.routes) {
      if (route.thingTypes?.includes(type)) {
        return route.provider;
      }
    }
    return defaultProvider;
  };

  return {
    // ===== GROUPS =====
    groups: {
      get: (id: string) =>
        Effect.gen(function* () {
          const provider = defaultProvider;
          return yield* provider.groups.get(id);
        }),

      getBySlug: (slug: string) =>
        Effect.gen(function* () {
          const provider = defaultProvider;
          return yield* provider.groups.getBySlug(slug);
        }),

      list: (options?: ListGroupsOptions) =>
        Effect.gen(function* () {
          // Query all providers and merge results
          const results: Group[] = [];

          for (const route of config.routes) {
            const groups = yield* route.provider.groups.list(options);
            results.push(...groups);
          }

          // Sort by createdAt descending
          results.sort((a, b) => b.createdAt - a.createdAt);

          // Apply limit if specified
          if (options?.limit) {
            return results.slice(0, options.limit);
          }

          return results;
        }),

      create: (input: CreateGroupInput) =>
        Effect.gen(function* () {
          const provider = defaultProvider;
          return yield* provider.groups.create(input);
        }),

      update: (id: string, input: UpdateGroupInput) =>
        Effect.gen(function* () {
          const provider = defaultProvider;
          return yield* provider.groups.update(id, input);
        }),

      delete: (id: string) =>
        Effect.gen(function* () {
          const provider = defaultProvider;
          return yield* provider.groups.delete(id);
        }),
    },

    // ===== THINGS =====
    things: {
      get: (id: string) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.things.get(id);
        }),

      list: (options?: ListThingsOptions) =>
        Effect.gen(function* () {
          if (options?.type) {
            // Single provider for specific type
            const provider = routeByType(options.type);
            return yield* provider.things.list(options);
          }

          // Query all providers and merge results
          const results: Thing[] = [];

          for (const route of config.routes) {
            const things = yield* route.provider.things.list(options);
            results.push(...things);
          }

          // Sort by createdAt descending
          results.sort((a, b) => b.createdAt - a.createdAt);

          // Apply limit if specified
          if (options?.limit) {
            return results.slice(0, options.limit);
          }

          return results;
        }),

      create: (input: CreateThingInput) =>
        Effect.gen(function* () {
          const provider = routeByType(input.type);
          return yield* provider.things.create(input);
        }),

      update: (id: string, input: UpdateThingInput) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.things.update(id, input);
        }),

      delete: (id: string) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.things.delete(id);
        }),
    },

    // ===== CONNECTIONS =====
    connections: {
      get: (id: string) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.connections.get(id);
        }),

      list: (options?: ListConnectionsOptions) =>
        Effect.gen(function* () {
          // If filtering by entity ID, use that entity's provider
          if (options?.fromEntityId) {
            const provider = routeById(options.fromEntityId);
            return yield* provider.connections.list(options);
          }

          if (options?.toEntityId) {
            const provider = routeById(options.toEntityId);
            return yield* provider.connections.list(options);
          }

          // Query all providers and merge
          const results: Connection[] = [];

          for (const route of config.routes) {
            const connections = yield* route.provider.connections.list(options);
            results.push(...connections);
          }

          results.sort((a, b) => b.createdAt - a.createdAt);

          if (options?.limit) {
            return results.slice(0, options.limit);
          }

          return results;
        }),

      create: (input: CreateConnectionInput) =>
        Effect.gen(function* () {
          // Use provider of the "from" entity
          const provider = routeById(input.fromEntityId);
          return yield* provider.connections.create(input);
        }),

      delete: (id: string) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.connections.delete(id);
        }),
    },

    // ===== EVENTS =====
    events: {
      get: (id: string) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.events.get(id);
        }),

      list: (options?: ListEventsOptions) =>
        Effect.gen(function* () {
          // If filtering by actor/target, use that entity's provider
          if (options?.actorId) {
            const provider = routeById(options.actorId);
            return yield* provider.events.list(options);
          }

          if (options?.targetId) {
            const provider = routeById(options.targetId);
            return yield* provider.events.list(options);
          }

          // Query all providers and merge
          const results: Event[] = [];

          for (const route of config.routes) {
            const events = yield* route.provider.events.list(options);
            results.push(...events);
          }

          results.sort((a, b) => b.timestamp - a.timestamp);

          if (options?.limit) {
            return results.slice(0, options.limit);
          }

          return results;
        }),

      create: (input: CreateEventInput) =>
        Effect.gen(function* () {
          // Use provider of the actor entity
          const provider = routeById(input.actorId);
          return yield* provider.events.create(input);
        }),
    },

    // ===== KNOWLEDGE =====
    knowledge: {
      get: (id: string) =>
        Effect.gen(function* () {
          const provider = routeById(id);
          return yield* provider.knowledge.get(id);
        }),

      list: (options?: SearchKnowledgeOptions) =>
        Effect.gen(function* () {
          // If filtering by source thing, use that thing's provider
          if (options?.sourceThingId) {
            const provider = routeById(options.sourceThingId);
            return yield* provider.knowledge.list(options);
          }

          // Query all providers and merge
          const results: Knowledge[] = [];

          for (const route of config.routes) {
            const knowledge = yield* route.provider.knowledge.list(options);
            results.push(...knowledge);
          }

          results.sort((a, b) => b.createdAt - a.createdAt);

          if (options?.limit) {
            return results.slice(0, options.limit);
          }

          return results;
        }),

      create: (input: CreateKnowledgeInput) =>
        Effect.gen(function* () {
          // Use provider of source thing if specified
          if (input.sourceThingId) {
            const provider = routeById(input.sourceThingId);
            return yield* provider.knowledge.create(input);
          }

          // Otherwise use default provider
          return yield* defaultProvider.knowledge.create(input);
        }),

      link: (thingId: string, knowledgeId: string, role?: ThingKnowledge["role"]) =>
        Effect.gen(function* () {
          // Use provider of the thing
          const provider = routeById(thingId);
          return yield* provider.knowledge.link(thingId, knowledgeId, role);
        }),

      search: (embedding: number[], options?: SearchKnowledgeOptions) =>
        Effect.gen(function* () {
          // If filtering by source thing, use that thing's provider
          if (options?.sourceThingId) {
            const provider = routeById(options.sourceThingId);
            return yield* provider.knowledge.search(embedding, options);
          }

          // Query all providers and merge
          const results: Knowledge[] = [];

          for (const route of config.routes) {
            const knowledge = yield* route.provider.knowledge.search(embedding, options);
            results.push(...knowledge);
          }

          // Sort by relevance (assuming first results are most relevant)
          if (options?.limit) {
            return results.slice(0, options.limit);
          }

          return results;
        }),
    },

    // ===== AUTH =====
    // Auth always uses default provider (typically the primary backend)
    auth: defaultProvider.auth,
  };
};

// ============================================================================
// EFFECT LAYER
// ============================================================================

export const CompositeProviderLive = (config: CompositeProviderConfig) =>
  Layer.succeed(DataProviderService, makeCompositeProvider(config));

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const compositeProvider = (routes: ProviderRoute[]) =>
  makeCompositeProvider({ routes });

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Example: Convex for auth/courses, WordPress for blog

import { convexProvider } from "../convex/ConvexProvider";
import { wordPressProvider } from "../wordpress/WordPressProvider";

const provider = compositeProvider([
  {
    name: "convex",
    provider: convexProvider(process.env.PUBLIC_CONVEX_URL!),
    thingTypes: ["creator", "course", "lesson", "token"],
    isDefault: true, // Fallback for everything else
  },
  {
    name: "wordpress",
    provider: wordPressProvider("https://blog.example.com/wp-json/wp/v2"),
    thingTypes: ["blog_post"],
    idPrefix: "wp-",
  },
]);

// Now use provider - it automatically routes:
// - Blog posts go to WordPress
// - Courses go to Convex
// - Everything else goes to Convex (default)

const blogPosts = await Effect.runPromise(
  provider.things.list({ type: "blog_post" }).pipe(
    Effect.provide(CompositeProviderLive({ routes: [...] }))
  )
);
*/

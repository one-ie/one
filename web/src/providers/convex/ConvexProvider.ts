/**
 * ConvexProvider - Convex Backend Implementation of DataProvider
 *
 * Wraps the existing Convex backend with the DataProvider interface.
 * This preserves all existing functionality while enabling backend abstraction.
 */

import { Effect, Layer } from "effect";
import { ConvexHttpClient } from "convex/browser";
import type { Id } from "@/types/convex";
import {
  DataProviderService,
  ThingNotFoundError,
  ThingCreateError,
  ThingUpdateError,
  ConnectionNotFoundError,
  ConnectionCreateError,
  EventCreateError,
  KnowledgeNotFoundError,
  GroupNotFoundError,
  GroupCreateError,
  QueryError,
} from "../DataProvider";
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

export interface ConvexProviderConfig {
  url: string;
  client?: ConvexHttpClient;
}

// ============================================================================
// CONVEX PROVIDER IMPLEMENTATION
// ============================================================================

export const makeConvexProvider = (config: ConvexProviderConfig): DataProvider => {
  const client = config.client || new ConvexHttpClient(config.url);

  return {
    // ===== GROUPS =====
    groups: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/groups:get" as any, { id: id as Id<"groups"> });
            if (!result) {
              throw new GroupNotFoundError(id, `Group with id ${id} not found`);
            }
            return result as Group;
          },
          catch: (error) => {
            if (error instanceof GroupNotFoundError) return error;
            return new GroupNotFoundError(id, String(error));
          },
        }),

      getBySlug: (slug: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/groups:getBySlug" as any, { slug });
            if (!result) {
              throw new GroupNotFoundError(slug, `Group with slug ${slug} not found`);
            }
            return result as Group;
          },
          catch: (error) => {
            if (error instanceof GroupNotFoundError) return error;
            return new GroupNotFoundError(slug, String(error));
          },
        }),

      list: (options?: ListGroupsOptions) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/groups:list" as any, {
              type: options?.type,
              status: options?.status,
              parentGroupId: options?.parentGroupId,
              limit: options?.limit,
            });
            return result as Group[];
          },
          catch: (error) => new QueryError("Failed to list groups", error),
        }),

      create: (input: CreateGroupInput) =>
        Effect.tryPromise({
          try: async () => {
            const now = Date.now();
            const result = await client.mutation("mutations/groups:create" as any, {
              slug: input.slug,
              name: input.name,
              type: input.type,
              parentGroupId: input.parentGroupId,
              description: input.description,
              metadata: input.metadata,
              settings: input.settings,
              status: "active",
              createdAt: now,
              updatedAt: now,
            });
            return result as string;
          },
          catch: (error) => new GroupCreateError(String(error), error),
        }),

      update: (id: string, input: UpdateGroupInput) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("mutations/groups:update" as any, {
              id: id as Id<"groups">,
              name: input.name,
              description: input.description,
              metadata: input.metadata,
              settings: input.settings,
              status: input.status,
              updatedAt: Date.now(),
            });
          },
          catch: (error) => new QueryError(String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("mutations/groups:delete" as any, {
              id: id as Id<"groups">,
            });
          },
          catch: (error) => new GroupNotFoundError(id, String(error)),
        }),
    },

    // ===== THINGS =====
    things: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/entities:get" as any, { id: id as Id<"entities"> });
            if (!result) {
              throw new ThingNotFoundError(id, `Thing with id ${id} not found`);
            }
            return result as Thing;
          },
          catch: (error) => {
            if (error instanceof ThingNotFoundError) return error;
            return new ThingNotFoundError(id, String(error));
          },
        }),

      list: (options?: ListThingsOptions) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/entities:list" as any, {
              type: options?.type,
              status: options?.status,
              limit: options?.limit,
            });
            return result as Thing[];
          },
          catch: (error) => new QueryError("Failed to list things", error),
        }),

      create: (input: CreateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const now = Date.now();
            const result = await client.mutation("mutations/entities:create" as any, {
              type: input.type,
              name: input.name,
              properties: input.properties,
              status: input.status || "draft",
              createdAt: now,
              updatedAt: now,
            });
            return result as string;
          },
          catch: (error) => new ThingCreateError(String(error), error),
        }),

      update: (id: string, input: UpdateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("mutations/entities:update" as any, {
              id: id as Id<"entities">,
              name: input.name,
              properties: input.properties,
              status: input.status,
              updatedAt: Date.now(),
            });
          },
          catch: (error) => new ThingUpdateError(id, String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("mutations/entities:delete" as any, {
              id: id as Id<"entities">,
            });
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),
    },

    // ===== CONNECTIONS =====
    connections: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/connections:get" as any, {
              id: id as Id<"connections">,
            });
            if (!result) {
              throw new ConnectionNotFoundError(id, `Connection with id ${id} not found`);
            }
            return result as Connection;
          },
          catch: (error) => {
            if (error instanceof ConnectionNotFoundError) return error;
            return new ConnectionNotFoundError(id, String(error));
          },
        }),

      list: (options?: ListConnectionsOptions) =>
        Effect.tryPromise({
          try: async () => {
            if (options?.fromEntityId && options?.relationshipType) {
              const result = await client.query("queries/connections:listFrom" as any, {
                fromEntityId: options.fromEntityId as Id<"entities">,
                relationshipType: options.relationshipType,
              });
              return result as Connection[];
            } else if (options?.toEntityId && options?.relationshipType) {
              const result = await client.query("queries/connections:listTo" as any, {
                toEntityId: options.toEntityId as Id<"entities">,
                relationshipType: options.relationshipType,
              });
              return result as Connection[];
            } else if (options?.relationshipType) {
              const result = await client.query("queries/connections:listByType" as any, {
                relationshipType: options.relationshipType,
                limit: options.limit,
              });
              return result as Connection[];
            } else {
              // Fallback: list from entity
              if (options?.fromEntityId) {
                const result = await client.query("queries/connections:listFrom" as any, {
                  fromEntityId: options.fromEntityId as Id<"entities">,
                });
                return result as Connection[];
              }
              return [];
            }
          },
          catch: (error) => new QueryError("Failed to list connections", error),
        }),

      create: (input: CreateConnectionInput) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("mutations/connections:create" as any, {
              fromEntityId: input.fromEntityId as Id<"entities">,
              toEntityId: input.toEntityId as Id<"entities">,
              relationshipType: input.relationshipType,
              metadata: input.metadata,
              strength: input.strength,
              validFrom: input.validFrom,
              validTo: input.validTo,
              createdAt: Date.now(),
            });
            return result as string;
          },
          catch: (error) => new ConnectionCreateError(String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("mutations/connections:delete" as any, {
              id: id as Id<"connections">,
            });
          },
          catch: (error) => new ConnectionNotFoundError(id, String(error)),
        }),
    },

    // ===== EVENTS =====
    events: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/events:get" as any, {
              id: id as Id<"events">,
            });
            if (!result) {
              throw new QueryError(`Event with id ${id} not found`);
            }
            return result as Event;
          },
          catch: (error) => {
            if (error instanceof QueryError) return error;
            return new QueryError(String(error), error);
          },
        }),

      list: (options?: ListEventsOptions) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/events:list" as any, {
              type: options?.type,
              actorId: options?.actorId as Id<"entities"> | undefined,
              targetId: options?.targetId as Id<"entities"> | undefined,
              since: options?.since,
              until: options?.until,
              limit: options?.limit,
            });
            return result as Event[];
          },
          catch: (error) => new QueryError("Failed to list events", error),
        }),

      create: (input: CreateEventInput) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("mutations/events:create" as any, {
              type: input.type,
              actorId: input.actorId as Id<"entities">,
              targetId: input.targetId as Id<"entities"> | undefined,
              timestamp: Date.now(),
              metadata: input.metadata,
            });
            return result as string;
          },
          catch: (error) => new EventCreateError(String(error), error),
        }),
    },

    // ===== KNOWLEDGE =====
    knowledge: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/knowledge:get" as any, {
              id: id as Id<"knowledge">,
            });
            if (!result) {
              throw new KnowledgeNotFoundError(id, `Knowledge with id ${id} not found`);
            }
            return result as Knowledge;
          },
          catch: (error) => {
            if (error instanceof KnowledgeNotFoundError) return error;
            return new KnowledgeNotFoundError(id, String(error));
          },
        }),

      list: (options?: SearchKnowledgeOptions) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/knowledge:list" as any, {
              knowledgeType: options?.knowledgeType,
              sourceThingId: options?.sourceThingId as Id<"entities"> | undefined,
              limit: options?.limit,
            });
            return result as Knowledge[];
          },
          catch: (error) => new QueryError("Failed to list knowledge", error),
        }),

      create: (input: CreateKnowledgeInput) =>
        Effect.tryPromise({
          try: async () => {
            const now = Date.now();
            const result = await client.mutation("mutations/knowledge:create" as any, {
              knowledgeType: input.knowledgeType,
              text: input.text,
              embedding: input.embedding,
              embeddingModel: input.embeddingModel,
              embeddingDim: input.embeddingDim,
              sourceThingId: input.sourceThingId as Id<"entities"> | undefined,
              sourceField: input.sourceField,
              chunk: input.chunk,
              labels: input.labels,
              metadata: input.metadata,
              createdAt: now,
              updatedAt: now,
            });
            return result as string;
          },
          catch: (error) => new QueryError(String(error), error),
        }),

      link: (thingId: string, knowledgeId: string, role?: ThingKnowledge["role"]) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("mutations/knowledge:link" as any, {
              thingId: thingId as Id<"entities">,
              knowledgeId: knowledgeId as Id<"knowledge">,
              role: role,
              createdAt: Date.now(),
            });
            return result as string;
          },
          catch: (error) => new QueryError(String(error), error),
        }),

      search: (embedding: number[], options?: SearchKnowledgeOptions) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("queries/knowledge:search" as any, {
              embedding,
              knowledgeType: options?.knowledgeType,
              sourceThingId: options?.sourceThingId as Id<"entities"> | undefined,
              limit: options?.limit || 10,
            });
            return result as Knowledge[];
          },
          catch: (error) => new QueryError("Failed to search knowledge", error),
        }),
    },

    // ===== AUTH =====
    auth: {
      login: (args) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("auth:login" as any, args);
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      signup: (args) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("auth:signup" as any, args);
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      logout: () =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("auth:logout" as any, {});
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      getCurrentUser: () =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("auth:getCurrentUser" as any, {});
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      magicLinkAuth: (args) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("auth:magicLinkAuth" as any, args);
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      passwordReset: (args) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("auth:passwordReset" as any, args);
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      passwordResetComplete: (args) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("auth:passwordResetComplete" as any, args);
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      verifyEmail: (args) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("auth:verifyEmail" as any, args);
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      get2FAStatus: () =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.query("auth:get2FAStatus" as any, {});
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      setup2FA: () =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.mutation("auth:setup2FA" as any, {});
            return result as any;
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      verify2FA: (args) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("auth:verify2FA" as any, args);
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),

      disable2FA: (args) =>
        Effect.tryPromise({
          try: async () => {
            await client.mutation("auth:disable2FA" as any, args);
          },
          catch: (error) => new QueryError(String(error), error) as any,
        }),
    },
  };
};

// ============================================================================
// EFFECT LAYER
// ============================================================================

export const ConvexProviderLive = (config: ConvexProviderConfig) =>
  Layer.succeed(DataProviderService, makeConvexProvider(config));

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export const convexProvider = (url: string) => makeConvexProvider({ url });

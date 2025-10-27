/**
 * Things Service (Dimension 3: Entities)
 *
 * Handles all entity types in the system (things).
 * Everything that isn't a person, connection, event, or knowledge is a "thing".
 *
 * 66+ Thing Types:
 * - Core: group, organization, team, department
 * - People-related: creator, audience_member, collaborator
 * - Content: blog_post, video, podcast, document, course, lesson
 * - Products: product, service, offer, bundle, promotion
 * - Community: forum_post, comment, review, rating
 * - Tokens: token, token_contract, nft, cryptocurrency
 * - Knowledge: knowledge_base, topic, skill, certification
 * - Platform: feature, setting, configuration
 * - Business: company, workspace, project, task
 * - Auth: session, api_key, oauth_token
 * - Marketing: campaign, email, landing_page
 * - External: external_api, webhook, integration
 * - Protocol: protocol_config, protocol_instance
 *
 * Pattern:
 * - All things scoped to group (multi-tenant)
 * - Flexible properties for type-specific data
 * - Status lifecycle: draft → active → published → archived
 * - Rich filtering by type, status, creation date
 * - Search support via fulltext
 *
 * Usage:
 * ```ts
 * const service = yield* ThingsService;
 * const things = yield* service.list({ type: 'blog_post', status: 'published' });
 * const thing = yield* service.get(thingId);
 * const created = yield* service.create({
 *   type: 'blog_post',
 *   name: 'My Post',
 *   properties: { content: '...' }
 * });
 * ```
 */

import { Effect } from 'effect';

// ============================================================================
// SERVICE CONTEXT & PROVIDER INTERFACE
// ============================================================================

/**
 * Provider interface for things/entities access
 * Implementations: Convex, Notion, Markdown, HTTP, etc.
 */
export interface IThingsProvider {
  list(filter?: ThingFilter): Promise<Thing[]>;
  get(id: string): Promise<Thing | null>;
  create(data: CreateThingInput): Promise<Thing>;
  update(id: string, data: UpdateThingInput): Promise<Thing>;
  delete(id: string): Promise<void>;
  search(query: string, filter?: ThingFilter): Promise<Thing[]>;
  listByType(type: string, groupId: string): Promise<Thing[]>;
}

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

/**
 * Status lifecycle for things
 * draft → active/inactive → published → archived
 */
export type ThingStatus = 'active' | 'inactive' | 'draft' | 'published' | 'archived';

/**
 * Main Thing entity
 * Represents any entity in the system
 */
export interface Thing {
  _id: string;
  type: string; // Will be specific like 'blog_post', 'product', etc.
  name: string;
  groupId: string;
  properties: Record<string, any>; // Type-specific data
  status: ThingStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

/**
 * Filters for listing things
 */
export interface ThingFilter {
  groupId?: string;
  type?: string;
  status?: ThingStatus;
  createdAfter?: number;
  createdBefore?: number;
  updatedAfter?: number;
  updatedBefore?: number;
  limit?: number;
  offset?: number;
}

/**
 * Input for creating a thing
 */
export interface CreateThingInput {
  groupId: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: ThingStatus;
}

/**
 * Input for updating a thing
 */
export interface UpdateThingInput {
  name?: string;
  properties?: Record<string, any>;
  status?: ThingStatus;
}

// ============================================================================
// ERROR TYPES (Tagged Unions)
// ============================================================================

export type ThingError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'InvalidThingTypeError'; type: string }
  | { _tag: 'InvalidStatusTransitionError'; from: ThingStatus; to: ThingStatus }
  | { _tag: 'PropertyValidationError'; message: string; properties: Record<string, any> }
  | { _tag: 'ConcurrencyError'; id: string; expectedVersion?: number }
  | { _tag: 'DeletedThingError'; id: string; deletedAt: number }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };

// ============================================================================
// VALIDATION
// ============================================================================

function validateThingType(type: string): Effect.Effect<string, ThingError> {
  // Type must be lowercase, alphanumeric with underscores
  const typeRegex = /^[a-z0-9_]+$/;
  return typeRegex.test(type)
    ? Effect.succeed(type)
    : Effect.fail({
        _tag: 'InvalidThingTypeError' as const,
        type,
      });
}

function validateStatusTransition(from: ThingStatus, to: ThingStatus): Effect.Effect<void, ThingError> {
  // Valid transitions:
  // draft → active, inactive, published, archived
  // active → inactive, published, archived
  // inactive → active, published, archived
  // published → archived
  // archived → active (for unarchiving)
  const validTransitions: Record<ThingStatus, ThingStatus[]> = {
    draft: ['active', 'inactive', 'published', 'archived'],
    active: ['inactive', 'published', 'archived'],
    inactive: ['active', 'published', 'archived'],
    published: ['archived'],
    archived: ['active', 'inactive', 'draft'], // Allow restoring
  };

  return validTransitions[from].includes(to)
    ? Effect.succeed(void 0)
    : Effect.fail({
        _tag: 'InvalidStatusTransitionError' as const,
        from,
        to,
      });
}

function validateCreateInput(input: CreateThingInput): Effect.Effect<CreateThingInput, ThingError> {
  return Effect.gen(function* () {
    if (!input.name || input.name.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Thing name is required',
        field: 'name',
      });
    }

    if (!input.type || input.type.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Thing type is required',
        field: 'type',
      });
    }

    yield* validateThingType(input.type);

    if (!input.groupId || input.groupId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group ID is required',
        field: 'groupId',
      });
    }

    if (!input.properties || typeof input.properties !== 'object') {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Properties must be a valid object',
        field: 'properties',
      });
    }

    return input;
  });
}

// ============================================================================
// THINGSSERVICE - Main Service
// ============================================================================

export class ThingsService extends Effect.Service<ThingsService>()('ThingsService', {
  effect: Effect.gen(function* () {
    return {
      /**
       * List all things with optional filtering
       * Can filter by type, status, creation date, etc.
       * Supports pagination via limit/offset
       */
      list: (filter?: ThingFilter) =>
        Effect.gen(function* () {
          if (filter?.groupId && filter.groupId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID cannot be empty',
              field: 'groupId',
            });
          }

          const provider = yield* Effect.Tag<IThingsProvider>();
          return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list things: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get a single thing by ID
       */
      get: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Thing ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IThingsProvider>();
          const thing = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!thing) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          if (thing.deletedAt) {
            yield* Effect.fail({
              _tag: 'DeletedThingError' as const,
              id,
              deletedAt: thing.deletedAt,
            });
          }

          return thing;
        }),

      /**
       * Create a new thing
       * Validates input and type
       */
      create: (input: CreateThingInput) =>
        Effect.gen(function* () {
          yield* validateCreateInput(input);

          const provider = yield* Effect.Tag<IThingsProvider>();
          const created = yield* Effect.tryPromise(() => provider.create(input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to create thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return created;
        }),

      /**
       * Update a thing
       * Partial update - only provided fields are changed
       * Validates status transitions
       */
      update: (id: string, input: UpdateThingInput) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Thing ID is required',
              field: 'id',
            });
          }

          // Get current thing to validate status transition
          const provider = yield* Effect.Tag<IThingsProvider>();
          const current = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!current) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          // Validate status transition
          if (input.status && input.status !== current.status) {
            yield* validateStatusTransition(current.status, input.status);
          }

          const updated = yield* Effect.tryPromise(() => provider.update(id, input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to update thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return updated;
        }),

      /**
       * Delete a thing (soft delete - sets deletedAt)
       */
      delete: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Thing ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IThingsProvider>();

          // Verify thing exists
          const thing = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!thing) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          return yield* Effect.tryPromise(() => provider.delete(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to delete thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Search things by name/content
       * Full-text search across thing names and searchable properties
       */
      search: (query: string, filter?: ThingFilter) =>
        Effect.gen(function* () {
          if (!query || query.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Search query is required',
              field: 'query',
            });
          }

          if (query.length > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Search query too long (max 1000 characters)',
              field: 'query',
            });
          }

          const provider = yield* Effect.Tag<IThingsProvider>();
          return yield* Effect.tryPromise(() => provider.search(query, filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to search things: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * List all things of a specific type in a group
       * Useful for filtered views by entity type
       */
      listByType: (type: string, groupId: string) =>
        Effect.gen(function* () {
          yield* validateThingType(type);

          if (!groupId || groupId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID is required',
              field: 'groupId',
            });
          }

          const provider = yield* Effect.Tag<IThingsProvider>();
          return yield* Effect.tryPromise(() => provider.listByType(type, groupId)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list things by type: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Batch create things
       * Useful for bulk imports
       */
      batchCreate: (inputs: CreateThingInput[]) =>
        Effect.gen(function* () {
          if (!inputs || inputs.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'At least one thing must be provided',
              field: 'inputs',
            });
          }

          if (inputs.length > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Maximum 1000 things per batch',
              field: 'inputs',
            });
          }

          // Validate all inputs first
          yield* Effect.all(inputs.map((input) => validateCreateInput(input)));

          const provider = yield* Effect.Tag<IThingsProvider>();
          const results = yield* Effect.all(
            inputs.map((input) =>
              Effect.tryPromise(() => provider.create(input)).pipe(
                Effect.mapError((error) => ({
                  _tag: 'ProviderError' as const,
                  message: `Failed to create thing: ${error instanceof Error ? error.message : String(error)}`,
                  originalError: error,
                }))
              )
            ),
            { concurrency: 10 }
          );

          return results;
        }),

      /**
       * Get thing with enriched data (connections, events, knowledge)
       * Used for detail views
       */
      getEnriched: (id: string) =>
        Effect.gen(function* () {
          const thing = yield* (this as any).get(id);
          // This would be enhanced with connection and event data in actual implementation
          return thing;
        }),
    };
  }),
  dependencies: [Effect.Tag<IThingsProvider>()],
}) {}

// ============================================================================
// EXPORTS
// ============================================================================

export type { ThingFilter, CreateThingInput, UpdateThingInput, ThingError };

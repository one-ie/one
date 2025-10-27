/**
 * Connections Service (Dimension 4: Relationships)
 *
 * Handles relationships between entities (things).
 * Connections link two things together with a relationship type and optional metadata.
 *
 * 25+ Connection Types:
 * - Ownership: owns, authored_by, created_by, managed_by
 * - Hierarchy: part_of, contains, parent_of, child_of
 * - Learning: enrolled_in, completed, teaching, learning_from, prerequisites
 * - Commerce: purchased, sold_by, has_variant, bundled_with
 * - Social: follows, following, friend_of, member_of
 * - Content: references, cited_by, linked_to, embedded_in
 * - Token: holds_tokens, transferred_to, minted_by, burned_by
 * - Collaboration: collaborating_with, delegated_to, assigned_to
 * - Communication: communicated_with, mentioned_in
 *
 * Pattern:
 * - Bidirectional relationships (explicit both ways)
 * - Optional metadata for relationship properties (e.g., weight, confidence)
 * - Temporal validity (validFrom/validTo for time-bound relationships)
 * - Strength metric for relationship confidence/weight
 * - Scoped to group for multi-tenancy
 *
 * Usage:
 * ```ts
 * const service = yield* ConnectionsService;
 * const outgoing = yield* service.listFromSource(thingId);
 * const incoming = yield* service.listToTarget(thingId);
 * const created = yield* service.create({
 *   fromThingId: userId,
 *   toThingId: courseId,
 *   relationshipType: 'enrolled_in'
 * });
 * ```
 */

import { Effect } from 'effect';

// ============================================================================
// SERVICE CONTEXT & PROVIDER INTERFACE
// ============================================================================

/**
 * Provider interface for connections/relationships access
 * Implementations: Convex, Notion, Markdown, HTTP, etc.
 */
export interface IConnectionsProvider {
  list(filter?: ConnectionFilter): Promise<Connection[]>;
  get(id: string): Promise<Connection | null>;
  create(data: CreateConnectionInput): Promise<Connection>;
  update(id: string, data: UpdateConnectionInput): Promise<Connection>;
  delete(id: string): Promise<void>;
  listFromSource(fromThingId: string): Promise<Connection[]>;
  listToTarget(toThingId: string): Promise<Connection[]>;
  listByType(relationshipType: string, groupId: string): Promise<Connection[]>;
  getBidirectional(fromThingId: string, toThingId: string): Promise<Connection[]>;
}

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

/**
 * Main Connection entity
 * Represents a relationship between two things
 */
export interface Connection {
  _id: string;
  groupId: string;
  fromThingId: string;
  toThingId: string;
  relationshipType: string; // e.g., 'owns', 'enrolled_in', 'follows'
  metadata?: Record<string, any>; // Type-specific relationship data
  strength?: number; // 0-1 for relationship confidence/weight
  validFrom?: number; // Relationship start time (optional)
  validTo?: number; // Relationship end time (optional)
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

/**
 * Filters for listing connections
 */
export interface ConnectionFilter {
  groupId?: string;
  fromThingId?: string;
  toThingId?: string;
  relationshipType?: string;
  validAt?: number; // Returns connections valid at this timestamp
  limit?: number;
  offset?: number;
}

/**
 * Input for creating a connection
 */
export interface CreateConnectionInput {
  groupId: string;
  fromThingId: string;
  toThingId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
}

/**
 * Input for updating a connection
 */
export interface UpdateConnectionInput {
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
}

// ============================================================================
// ERROR TYPES (Tagged Unions)
// ============================================================================

export type ConnectionError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'InvalidRelationshipTypeError'; type: string }
  | { _tag: 'SelfReferenceError'; thingId: string }
  | { _tag: 'DuplicateConnectionError'; fromId: string; toId: string; type: string }
  | { _tag: 'InvalidTemporalRangeError'; validFrom: number; validTo: number }
  | { _tag: 'InvalidStrengthError'; strength: number }
  | { _tag: 'ThingNotFoundError'; id: string }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };

// ============================================================================
// VALIDATION
// ============================================================================

function validateRelationshipType(type: string): Effect.Effect<string, ConnectionError> {
  // Type must be lowercase, alphanumeric with underscores
  const typeRegex = /^[a-z0-9_]+$/;
  return typeRegex.test(type)
    ? Effect.succeed(type)
    : Effect.fail({
        _tag: 'InvalidRelationshipTypeError' as const,
        type,
      });
}

function validateStrength(strength?: number): Effect.Effect<number | undefined, ConnectionError> {
  if (strength === undefined) return Effect.succeed(undefined);
  return strength >= 0 && strength <= 1
    ? Effect.succeed(strength)
    : Effect.fail({
        _tag: 'InvalidStrengthError' as const,
        strength,
      });
}

function validateTemporalRange(
  validFrom?: number,
  validTo?: number
): Effect.Effect<void, ConnectionError> {
  if (validFrom === undefined || validTo === undefined) {
    return Effect.succeed(void 0);
  }

  return validFrom < validTo
    ? Effect.succeed(void 0)
    : Effect.fail({
        _tag: 'InvalidTemporalRangeError' as const,
        validFrom,
        validTo,
      });
}

function validateCreateInput(input: CreateConnectionInput): Effect.Effect<CreateConnectionInput, ConnectionError> {
  return Effect.gen(function* () {
    if (!input.fromThingId || input.fromThingId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'From thing ID is required',
        field: 'fromThingId',
      });
    }

    if (!input.toThingId || input.toThingId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'To thing ID is required',
        field: 'toThingId',
      });
    }

    if (input.fromThingId === input.toThingId) {
      yield* Effect.fail({
        _tag: 'SelfReferenceError' as const,
        thingId: input.fromThingId,
      });
    }

    if (!input.relationshipType || input.relationshipType.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Relationship type is required',
        field: 'relationshipType',
      });
    }

    yield* validateRelationshipType(input.relationshipType);
    yield* validateStrength(input.strength);
    yield* validateTemporalRange(input.validFrom, input.validTo);

    if (!input.groupId || input.groupId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group ID is required',
        field: 'groupId',
      });
    }

    return input;
  });
}

// ============================================================================
// CONNECTIONSSERVICE - Main Service
// ============================================================================

export class ConnectionsService extends Effect.Service<ConnectionsService>()(
  'ConnectionsService',
  {
    effect: Effect.gen(function* () {
      return {
        /**
         * List all connections with optional filtering
         */
        list: (filter?: ConnectionFilter) =>
          Effect.gen(function* () {
            const provider = yield* Effect.Tag<IConnectionsProvider>();
            return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to list connections: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );
          }),

        /**
         * Get a single connection by ID
         */
        get: (id: string) =>
          Effect.gen(function* () {
            if (!id || id.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'Connection ID is required',
                field: 'id',
              });
            }

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            const connection = yield* Effect.tryPromise(() => provider.get(id)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to get connection: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );

            if (!connection) {
              yield* Effect.fail({
                _tag: 'NotFoundError' as const,
                id,
              });
            }

            return connection;
          }),

        /**
         * Create a new connection
         * Validates input, checks for duplicates
         */
        create: (input: CreateConnectionInput) =>
          Effect.gen(function* () {
            yield* validateCreateInput(input);

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            const created = yield* Effect.tryPromise(() => provider.create(input)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to create connection: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );

            return created;
          }),

        /**
         * Update a connection
         * Partial update - only provided fields are changed
         */
        update: (id: string, input: UpdateConnectionInput) =>
          Effect.gen(function* () {
            if (!id || id.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'Connection ID is required',
                field: 'id',
              });
            }

            yield* validateStrength(input.strength);
            yield* validateTemporalRange(input.validFrom, input.validTo);

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            const updated = yield* Effect.tryPromise(() => provider.update(id, input)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to update connection: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );

            return updated;
          }),

        /**
         * Delete a connection (soft delete - sets deletedAt)
         */
        delete: (id: string) =>
          Effect.gen(function* () {
            if (!id || id.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'Connection ID is required',
                field: 'id',
              });
            }

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            return yield* Effect.tryPromise(() => provider.delete(id)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to delete connection: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );
          }),

        /**
         * Get all connections from a source thing (outgoing)
         */
        listFromSource: (fromThingId: string) =>
          Effect.gen(function* () {
            if (!fromThingId || fromThingId.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'From thing ID is required',
                field: 'fromThingId',
              });
            }

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            return yield* Effect.tryPromise(() => provider.listFromSource(fromThingId)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to list connections from source: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );
          }),

        /**
         * Get all connections to a target thing (incoming)
         */
        listToTarget: (toThingId: string) =>
          Effect.gen(function* () {
            if (!toThingId || toThingId.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'To thing ID is required',
                field: 'toThingId',
              });
            }

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            return yield* Effect.tryPromise(() => provider.listToTarget(toThingId)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to list connections to target: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );
          }),

        /**
         * Get all connections of a specific type in a group
         */
        listByType: (relationshipType: string, groupId: string) =>
          Effect.gen(function* () {
            yield* validateRelationshipType(relationshipType);

            if (!groupId || groupId.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'Group ID is required',
                field: 'groupId',
              });
            }

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            return yield* Effect.tryPromise(() => provider.listByType(relationshipType, groupId)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to list connections by type: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );
          }),

        /**
         * Get all connections between two things (bidirectional)
         * Returns both directions: A→B and B→A
         */
        getBidirectional: (fromThingId: string, toThingId: string) =>
          Effect.gen(function* () {
            if (!fromThingId || fromThingId.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'From thing ID is required',
                field: 'fromThingId',
              });
            }

            if (!toThingId || toThingId.length === 0) {
              yield* Effect.fail({
                _tag: 'ValidationError' as const,
                message: 'To thing ID is required',
                field: 'toThingId',
              });
            }

            const provider = yield* Effect.Tag<IConnectionsProvider>();
            return yield* Effect.tryPromise(() =>
              provider.getBidirectional(fromThingId, toThingId)
            ).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to get bidirectional connections: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );
          }),

        /**
         * Get both incoming and outgoing connections for a thing
         */
        getAll: (thingId: string) =>
          Effect.gen(function* () {
            const outgoing = yield* (this as any).listFromSource(thingId);
            const incoming = yield* (this as any).listToTarget(thingId);
            return { outgoing, incoming };
          }),
      };
    }),
    dependencies: [Effect.Tag<IConnectionsProvider>()],
  }
) {}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ConnectionFilter,
  CreateConnectionInput,
  UpdateConnectionInput,
  ConnectionError,
};

/**
 * Events Service (Dimension 5: Actions & Audit Trail)
 *
 * Handles event recording for all entity operations.
 * Events are the complete audit trail of the system - who did what, when.
 *
 * 67+ Event Types:
 * - Entity lifecycle: entity_created, entity_updated, entity_deleted, entity_archived
 * - Auth events: user_registered, user_logged_in, user_logged_out, user_joined_group
 * - Learning: course_enrolled, lesson_completed, certificate_earned
 * - Commerce: item_purchased, payment_processed, refund_issued, order_shipped
 * - Social: post_created, comment_added, user_followed, user_unfollowed
 * - Content: blog_published, video_uploaded, document_shared
 * - Token: tokens_transferred, tokens_minted, tokens_burned, nft_minted
 * - Communication: message_sent, email_sent, notification_sent
 * - Inference: inference_request, inference_completed, inference_failed
 * - Blockchain: contract_deployed, transaction_recorded, bridge_executed
 *
 * Pattern:
 * - Immutable - events cannot be modified or deleted (soft delete only)
 * - Time-ordered - sorted by timestamp for replay capability
 * - Actor-Target pairs - who (actor) did what (type) to whom/what (target)
 * - Rich metadata - event-specific data stored in metadata
 * - Scoped to group for multi-tenancy and privacy
 * - Used for analytics, audit trails, and system replay
 *
 * Usage:
 * ```ts
 * const service = yield* EventsService;
 * const events = yield* service.list({ actorId: userId, limit: 50 });
 * const timeline = yield* service.timeline(groupId);
 * const recorded = yield* service.record({
 *   type: 'entity_created',
 *   actorId: userId,
 *   targetId: newThingId
 * });
 * ```
 */

import { Effect } from 'effect';

// ============================================================================
// SERVICE CONTEXT & PROVIDER INTERFACE
// ============================================================================

/**
 * Provider interface for events access
 * Implementations: Convex, Notion, Markdown, HTTP, etc.
 */
export interface IEventsProvider {
  list(filter?: EventFilter): Promise<Event[]>;
  get(id: string): Promise<Event | null>;
  record(data: CreateEventInput): Promise<Event>;
  timeline(groupId: string, limit?: number): Promise<Event[]>;
  getByActor(actorId: string, limit?: number): Promise<Event[]>;
  getByTarget(targetId: string, limit?: number): Promise<Event[]>;
  getByType(type: string, groupId: string, limit?: number): Promise<Event[]>;
  batch(events: CreateEventInput[]): Promise<Event[]>;
}

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

/**
 * Main Event entity
 * Represents an action or state change in the system
 * Immutable audit trail record
 */
export interface Event {
  _id: string;
  groupId: string;
  type: string; // Event type (e.g., 'entity_created', 'user_logged_in')
  actorId: string; // Who performed the action (thing ID)
  targetId?: string; // What was affected (thing ID, optional)
  timestamp: number; // When it happened
  metadata?: Record<string, any>; // Event-specific additional data
}

/**
 * Filters for querying events
 */
export interface EventFilter {
  groupId?: string;
  type?: string;
  actorId?: string;
  targetId?: string;
  timestampFrom?: number;
  timestampTo?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp';
  orderDirection?: 'asc' | 'desc';
  [key: string]: any; // For metadata filters
}

/**
 * Input for recording an event
 */
export interface CreateEventInput {
  groupId: string;
  type: string;
  actorId: string;
  targetId?: string;
  timestamp?: number; // Defaults to current time
  metadata?: Record<string, any>;
}

// ============================================================================
// ERROR TYPES (Tagged Unions)
// ============================================================================

export type EventError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'InvalidEventTypeError'; type: string }
  | { _tag: 'InvalidTimestampError'; timestamp: number; reason: string }
  | { _tag: 'ActorNotFoundError'; actorId: string }
  | { _tag: 'TargetNotFoundError'; targetId: string }
  | { _tag: 'TimelineOffsetError'; limit: number; offset: number }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };

// ============================================================================
// VALIDATION
// ============================================================================

function validateEventType(type: string): Effect.Effect<string, EventError> {
  // Type must be lowercase, alphanumeric with underscores
  const typeRegex = /^[a-z0-9_]+$/;
  return typeRegex.test(type)
    ? Effect.succeed(type)
    : Effect.fail({
        _tag: 'InvalidEventTypeError' as const,
        type,
      });
}

function validateTimestamp(timestamp?: number): Effect.Effect<number, EventError> {
  const ts = timestamp ?? Date.now();
  const now = Date.now();

  // Allow up to 24 hours in the past or 1 hour in the future (for clock skew)
  const maxPastTime = now - 24 * 60 * 60 * 1000;
  const maxFutureTime = now + 60 * 60 * 1000;

  return ts >= maxPastTime && ts <= maxFutureTime
    ? Effect.succeed(ts)
    : Effect.fail({
        _tag: 'InvalidTimestampError' as const,
        timestamp: ts,
        reason: 'Timestamp must be within 24 hours in the past or 1 hour in the future',
      });
}

function validateCreateInput(input: CreateEventInput): Effect.Effect<CreateEventInput, EventError> {
  return Effect.gen(function* () {
    if (!input.type || input.type.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Event type is required',
        field: 'type',
      });
    }

    yield* validateEventType(input.type);

    if (!input.actorId || input.actorId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Actor ID is required',
        field: 'actorId',
      });
    }

    if (!input.groupId || input.groupId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group ID is required',
        field: 'groupId',
      });
    }

    yield* validateTimestamp(input.timestamp);

    return input;
  });
}

// ============================================================================
// EVENTSSERVICE - Main Service
// ============================================================================

export class EventsService extends Effect.Service<EventsService>()('EventsService', {
  effect: Effect.gen(function* () {
    return {
      /**
       * List events with optional filtering
       * Supports filtering by type, actor, target, timestamp range
       */
      list: (filter?: EventFilter) =>
        Effect.gen(function* () {
          const provider = yield* Effect.Tag<IEventsProvider>();
          return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list events: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get a single event by ID
       */
      get: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Event ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IEventsProvider>();
          const event = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get event: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!event) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          return event;
        }),

      /**
       * Record a new event
       * This is how all actions are logged to the audit trail
       */
      record: (input: CreateEventInput) =>
        Effect.gen(function* () {
          yield* validateCreateInput(input);

          const provider = yield* Effect.Tag<IEventsProvider>();
          const recorded = yield* Effect.tryPromise(() => provider.record(input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to record event: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return recorded;
        }),

      /**
       * Get complete timeline for a group
       * Shows all events in chronological order
       */
      timeline: (groupId: string, limit: number = 100) =>
        Effect.gen(function* () {
          if (!groupId || groupId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID is required',
              field: 'groupId',
            });
          }

          if (limit < 1 || limit > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Limit must be between 1 and 1000',
              field: 'limit',
            });
          }

          const provider = yield* Effect.Tag<IEventsProvider>();
          return yield* Effect.tryPromise(() => provider.timeline(groupId, limit)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get timeline: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get all events performed by an actor
       * Useful for activity feeds and user history
       */
      getByActor: (actorId: string, limit: number = 50) =>
        Effect.gen(function* () {
          if (!actorId || actorId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Actor ID is required',
              field: 'actorId',
            });
          }

          if (limit < 1 || limit > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Limit must be between 1 and 1000',
              field: 'limit',
            });
          }

          const provider = yield* Effect.Tag<IEventsProvider>();
          return yield* Effect.tryPromise(() => provider.getByActor(actorId, limit)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get events by actor: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get all events targeting a specific thing
       * Useful for entity-centric activity views
       */
      getByTarget: (targetId: string, limit: number = 50) =>
        Effect.gen(function* () {
          if (!targetId || targetId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Target ID is required',
              field: 'targetId',
            });
          }

          if (limit < 1 || limit > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Limit must be between 1 and 1000',
              field: 'limit',
            });
          }

          const provider = yield* Effect.Tag<IEventsProvider>();
          return yield* Effect.tryPromise(() => provider.getByTarget(targetId, limit)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get events by target: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get all events of a specific type in a group
       * Useful for analytics and monitoring
       */
      getByType: (type: string, groupId: string, limit: number = 50) =>
        Effect.gen(function* () {
          yield* validateEventType(type);

          if (!groupId || groupId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID is required',
              field: 'groupId',
            });
          }

          if (limit < 1 || limit > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Limit must be between 1 and 1000',
              field: 'limit',
            });
          }

          const provider = yield* Effect.Tag<IEventsProvider>();
          return yield* Effect.tryPromise(() => provider.getByType(type, groupId, limit)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get events by type: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Record multiple events in batch
       * More efficient than individual record calls
       */
      batch: (events: CreateEventInput[]) =>
        Effect.gen(function* () {
          if (!events || events.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'At least one event must be provided',
              field: 'events',
            });
          }

          if (events.length > 1000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Maximum 1000 events per batch',
              field: 'events',
            });
          }

          // Validate all events first
          yield* Effect.all(events.map((event) => validateCreateInput(event)));

          const provider = yield* Effect.Tag<IEventsProvider>();
          return yield* Effect.tryPromise(() => provider.batch(events)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to batch record events: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get state of an entity at a specific point in time
       * Replays events to reconstruct historical state
       */
      replayToTime: (targetId: string, timestamp: number): Effect.Effect<Record<string, any>, EventError> =>
        Effect.gen(function* () {
          if (!targetId || targetId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Target ID is required',
              field: 'targetId',
            });
          }

          yield* validateTimestamp(timestamp);

          const provider = yield* Effect.Tag<IEventsProvider>();
          const events = yield* Effect.tryPromise(() =>
            provider.list({
              targetId,
              timestampTo: timestamp,
              orderDirection: 'asc',
            })
          ).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to replay events: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          // Reconstruct state by applying events in order
          let state: Record<string, any> = { createdAt: timestamp };
          for (const event of events) {
            if (event.metadata) {
              state = { ...state, ...event.metadata };
            }
          }

          return state;
        }),
    };
  }),
  dependencies: [Effect.Tag<IEventsProvider>()],
}) {}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  EventFilter,
  CreateEventInput,
  EventError,
};

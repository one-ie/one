/**
 * EventService - Backend-Agnostic Event Operations
 *
 * Handles all 67 event types using DataProvider interface.
 * Provides event logging, querying, and analytics.
 */

import { Effect } from "effect";
import {
  DataProviderService,
  type Event,
  type CreateEventInput,
  type ListEventsOptions,
  EventCreateError,
  QueryError,
} from "../providers/DataProvider";

// ============================================================================
// EVENT SERVICE
// ============================================================================

export class EventService {
  /**
   * Get an event by ID
   */
  static get = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.events.get(id);
    });

  /**
   * List events with filters
   */
  static list = (options?: ListEventsOptions) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.events.list(options);
    });

  /**
   * Create a new event (log an action)
   */
  static create = (input: CreateEventInput) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate required fields
      if (!input.type || input.type.trim() === "") {
        return yield* Effect.fail(new EventCreateError("Event type is required"));
      }

      if (!input.actorId) {
        return yield* Effect.fail(new EventCreateError("Actor ID is required"));
      }

      // Create event with current timestamp
      return yield* provider.events.create({
        ...input,
        metadata: {
          ...input.metadata,
          timestamp: Date.now(),
        },
      });
    });

  /**
   * Log entity lifecycle event
   */
  static logEntityLifecycle = (
    type: "entity_created" | "entity_updated" | "entity_deleted" | "entity_archived",
    actorId: string,
    targetId: string,
    metadata?: Record<string, any>
  ) =>
    Effect.gen(function* () {
      return yield* EventService.create({
        type,
        actorId,
        targetId,
        metadata,
      });
    });

  /**
   * Log user event
   */
  static logUserEvent = (
    type: string,
    userId: string,
    metadata?: Record<string, any>
  ) =>
    Effect.gen(function* () {
      return yield* EventService.create({
        type,
        actorId: userId,
        metadata,
      });
    });

  /**
   * Get events for an actor
   */
  static listByActor = (actorId: string, limit?: number) =>
    Effect.gen(function* () {
      return yield* EventService.list({
        actorId,
        limit,
      });
    });

  /**
   * Get events for a target
   */
  static listByTarget = (targetId: string, limit?: number) =>
    Effect.gen(function* () {
      return yield* EventService.list({
        targetId,
        limit,
      });
    });

  /**
   * Get events by type
   */
  static listByType = (type: string, limit?: number) =>
    Effect.gen(function* () {
      return yield* EventService.list({
        type,
        limit,
      });
    });

  /**
   * Get events in time range
   */
  static listByTimeRange = (since: number, until: number, limit?: number) =>
    Effect.gen(function* () {
      return yield* EventService.list({
        since,
        until,
        limit,
      });
    });

  /**
   * Get recent events (last N)
   */
  static listRecent = (limit: number = 50) =>
    Effect.gen(function* () {
      return yield* EventService.list({
        limit,
      });
    });

  /**
   * Get event timeline for a thing
   */
  static getTimeline = (thingId: string, limit?: number) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get all events where thing is actor or target
      const asActor = yield* provider.events.list({
        actorId: thingId,
        limit,
      });

      const asTarget = yield* provider.events.list({
        targetId: thingId,
        limit,
      });

      // Combine and sort by timestamp
      const combined = [...asActor, ...asTarget];
      combined.sort((a, b) => b.timestamp - a.timestamp);

      return combined;
    });

  /**
   * Count events by type
   */
  static countByType = (type: string, since?: number, until?: number) =>
    Effect.gen(function* () {
      const events = yield* EventService.list({
        type,
        since,
        until,
      });

      return events.length;
    });

  /**
   * Get event statistics
   */
  static getStatistics = (since?: number, until?: number) =>
    Effect.gen(function* () {
      const events = yield* EventService.list({
        since,
        until,
      });

      // Count by type
      const byType: Record<string, number> = {};
      for (const event of events) {
        byType[event.type] = (byType[event.type] || 0) + 1;
      }

      // Count by actor
      const byActor: Record<string, number> = {};
      for (const event of events) {
        byActor[event.actorId] = (byActor[event.actorId] || 0) + 1;
      }

      return {
        total: events.length,
        byType,
        byActor,
        timeRange: {
          earliest: events[events.length - 1]?.timestamp,
          latest: events[0]?.timestamp,
        },
      };
    });

  /**
   * Log protocol-specific event
   */
  static logProtocolEvent = (
    type: string,
    actorId: string,
    protocol: string,
    metadata?: Record<string, any>
  ) =>
    Effect.gen(function* () {
      return yield* EventService.create({
        type,
        actorId,
        metadata: {
          ...metadata,
          protocol,
        },
      });
    });

  /**
   * Log consolidated event with metadata
   */
  static logConsolidatedEvent = (
    type: string,
    actorId: string,
    action: string,
    metadata?: Record<string, any>
  ) =>
    Effect.gen(function* () {
      return yield* EventService.create({
        type,
        actorId,
        metadata: {
          ...metadata,
          action,
        },
      });
    });

  /**
   * Get audit trail for a thing (all related events)
   */
  static getAuditTrail = (thingId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get thing
      const thing = yield* provider.things.get(thingId);

      // Get all events
      const timeline = yield* EventService.getTimeline(thingId);

      // Get related connections
      const connections = yield* provider.connections.list({
        fromEntityId: thingId,
      });

      return {
        thing,
        events: timeline,
        connections,
        createdAt: thing.createdAt,
        updatedAt: thing.updatedAt,
      };
    });
}

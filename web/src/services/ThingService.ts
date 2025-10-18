/**
 * ThingService - Backend-Agnostic Thing Operations
 *
 * Handles all 66 thing types generically using DataProvider interface.
 * Business logic layer that works with any backend (Convex, WordPress, Notion, etc.)
 */

import { Effect } from "effect";
import {
  DataProviderService,
  type CreateThingInput,
  type UpdateThingInput,
  type ListThingsOptions,
  type ThingStatus,
  ThingCreateError,
} from "../providers/DataProvider";

// ============================================================================
// THING SERVICE
// ============================================================================

export class ThingService {
  /**
   * Get a thing by ID
   */
  static get = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.things.get(id);
    });

  /**
   * List things with filters
   */
  static list = (options?: ListThingsOptions) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.things.list(options);
    });

  /**
   * Create a new thing
   */
  static create = (input: CreateThingInput) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate input
      if (!input.name || input.name.trim() === "") {
        return yield* Effect.fail(new ThingCreateError("Thing name cannot be empty"));
      }

      if (!input.type || input.type.trim() === "") {
        return yield* Effect.fail(new ThingCreateError("Thing type is required"));
      }

      // Create thing
      const thingId = yield* provider.things.create(input);

      // Log creation event
      yield* provider.events.create({
        type: "entity_created",
        actorId: "system", // TODO: Get from auth context
        targetId: thingId,
        metadata: {
          entityType: input.type,
        },
      });

      return thingId;
    });

  /**
   * Update an existing thing
   */
  static update = (id: string, input: UpdateThingInput) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate thing exists
      yield* provider.things.get(id);

      // Update thing
      yield* provider.things.update(id, input);

      // Log update event
      yield* provider.events.create({
        type: "entity_updated",
        actorId: "system", // TODO: Get from auth context
        targetId: id,
        metadata: {
          updatedFields: Object.keys(input),
        },
      });
    });

  /**
   * Delete a thing (soft delete by default)
   */
  static delete = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate thing exists
      yield* provider.things.get(id);

      // Soft delete: update status to archived
      yield* provider.things.update(id, {
        status: "archived",
      });

      // Log deletion event
      yield* provider.events.create({
        type: "entity_archived",
        actorId: "system", // TODO: Get from auth context
        targetId: id,
        metadata: {
          deletedAt: Date.now(),
        },
      });
    });

  /**
   * Change thing status
   */
  static changeStatus = (id: string, status: ThingStatus) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get current thing
      const thing = yield* provider.things.get(id);

      // Update status
      yield* provider.things.update(id, { status });

      // Log status change event
      yield* provider.events.create({
        type: "entity_updated",
        actorId: "system", // TODO: Get from auth context
        targetId: id,
        metadata: {
          previousStatus: thing.status,
          newStatus: status,
          statusChanged: true,
        },
      });
    });

  /**
   * List things by type
   */
  static listByType = (type: string, limit?: number) =>
    Effect.gen(function* () {
      return yield* ThingService.list({ type, limit });
    });

  /**
   * List things by status
   */
  static listByStatus = (status: ThingStatus, limit?: number) =>
    Effect.gen(function* () {
      return yield* ThingService.list({ status, limit });
    });

  /**
   * Get thing with relationships
   */
  static getWithRelationships = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get thing
      const thing = yield* provider.things.get(id);

      // Get outgoing connections (things this thing relates to)
      const outgoing = yield* provider.connections.list({
        fromEntityId: id,
      });

      // Get incoming connections (things that relate to this thing)
      const incoming = yield* provider.connections.list({
        toEntityId: id,
      });

      return {
        ...thing,
        relationships: {
          outgoing,
          incoming,
        },
      };
    });

  /**
   * Get thing history (events)
   */
  static getHistory = (id: string, limit?: number) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate thing exists
      yield* provider.things.get(id);

      // Get events for this thing
      return yield* provider.events.list({
        targetId: id,
        limit,
      });
    });

  /**
   * Batch create things
   */
  static batchCreate = (inputs: CreateThingInput[]) =>
    Effect.gen(function* () {
      const results: string[] = [];

      for (const input of inputs) {
        const id = yield* ThingService.create(input);
        results.push(id);
      }

      return results;
    });

  /**
   * Search things by name (simple text search)
   */
  static search = (query: string, options?: Omit<ListThingsOptions, "name">) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // List all things with filters
      const things = yield* provider.things.list(options);

      // Filter by name (case-insensitive)
      const lowerQuery = query.toLowerCase();
      return things.filter((thing) =>
        thing.name.toLowerCase().includes(lowerQuery)
      );
    });
}

/**
 * ConnectionService - Backend-Agnostic Connection Operations
 *
 * Handles all 25 relationship types using DataProvider interface.
 * Manages bidirectional relationships and connection lifecycle.
 */

import { Effect } from "effect";
import {
  DataProviderService,
  type CreateConnectionInput,
  type ListConnectionsOptions,
  type ConnectionType,
  ConnectionNotFoundError,
  ConnectionCreateError,
} from "../providers/DataProvider";

// ============================================================================
// CONNECTION SERVICE
// ============================================================================

export class ConnectionService {
  /**
   * Get a connection by ID
   */
  static get = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.connections.get(id);
    });

  /**
   * List connections with filters
   */
  static list = (options?: ListConnectionsOptions) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.connections.list(options);
    });

  /**
   * Create a new connection
   */
  static create = (input: CreateConnectionInput) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate entities exist
      yield* provider.things.get(input.fromEntityId);
      yield* provider.things.get(input.toEntityId);

      // Prevent self-connections (unless explicitly allowed)
      if (input.fromEntityId === input.toEntityId) {
        return yield* Effect.fail(
          new ConnectionCreateError("Cannot create connection from thing to itself")
        );
      }

      // Create connection
      const connectionId = yield* provider.connections.create(input);

      // Log creation event
      yield* provider.events.create({
        type: "connection_created",
        actorId: "system", // TODO: Get from auth context
        targetId: input.fromEntityId,
        metadata: {
          connectionId,
          relationshipType: input.relationshipType,
          fromEntityId: input.fromEntityId,
          toEntityId: input.toEntityId,
        },
      });

      return connectionId;
    });

  /**
   * Delete a connection
   */
  static delete = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get connection details before deletion
      const connection = yield* provider.connections.get(id);

      // Delete connection
      yield* provider.connections.delete(id);

      // Log deletion event
      yield* provider.events.create({
        type: "connection_deleted",
        actorId: "system", // TODO: Get from auth context
        metadata: {
          connectionId: id,
          relationshipType: connection.relationshipType,
          fromEntityId: connection.fromEntityId,
          toEntityId: connection.toEntityId,
        },
      });
    });

  /**
   * List outgoing connections from a thing
   */
  static listFrom = (fromEntityId: string, relationshipType?: ConnectionType) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.connections.list({
        fromEntityId,
        relationshipType,
      });
    });

  /**
   * List incoming connections to a thing
   */
  static listTo = (toEntityId: string, relationshipType?: ConnectionType) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.connections.list({
        toEntityId,
        relationshipType,
      });
    });

  /**
   * List all connections for a thing (both directions)
   */
  static listAll = (entityId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get outgoing
      const outgoing = yield* provider.connections.list({
        fromEntityId: entityId,
      });

      // Get incoming
      const incoming = yield* provider.connections.list({
        toEntityId: entityId,
      });

      return {
        outgoing,
        incoming,
        total: outgoing.length + incoming.length,
      };
    });

  /**
   * Check if connection exists between two things
   */
  static exists = (
    fromEntityId: string,
    toEntityId: string,
    relationshipType?: ConnectionType
  ) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      const connections = yield* provider.connections.list({
        fromEntityId,
        toEntityId,
        relationshipType,
      });

      return connections.length > 0;
    });

  /**
   * Get connection between two things
   */
  static getBetween = (
    fromEntityId: string,
    toEntityId: string,
    relationshipType?: ConnectionType
  ) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      const connections = yield* provider.connections.list({
        fromEntityId,
        toEntityId,
        relationshipType,
      });

      if (connections.length === 0) {
        return yield* Effect.fail(
          new ConnectionNotFoundError(
            "none",
            `No connection found between ${fromEntityId} and ${toEntityId}`
          )
        );
      }

      return connections[0];
    });

  /**
   * Create or update connection (upsert pattern)
   */
  static upsert = (input: CreateConnectionInput) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Check if connection exists
      const existing = yield* provider.connections.list({
        fromEntityId: input.fromEntityId,
        toEntityId: input.toEntityId,
        relationshipType: input.relationshipType,
      });

      if (existing.length > 0) {
        // Connection exists - could update metadata here
        return existing[0]._id;
      }

      // Create new connection
      return yield* ConnectionService.create(input);
    });

  /**
   * Update connection metadata
   */
  static updateMetadata = (id: string, metadata: Record<string, any>) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get current connection
      const connection = yield* provider.connections.get(id);

      // Delete and recreate with new metadata (Convex pattern)
      yield* provider.connections.delete(id);

      return yield* provider.connections.create({
        fromEntityId: connection.fromEntityId,
        toEntityId: connection.toEntityId,
        relationshipType: connection.relationshipType,
        metadata: { ...connection.metadata, ...metadata },
        strength: connection.strength,
        validFrom: connection.validFrom,
        validTo: connection.validTo,
      });
    });

  /**
   * List connections by type
   */
  static listByType = (relationshipType: ConnectionType, limit?: number) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.connections.list({
        relationshipType,
        limit,
      });
    });

  /**
   * Get connection graph for a thing (n-levels deep)
   */
  static getGraph = (entityId: string, depth: number = 1) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const visited = new Set<string>();
      const graph: Record<string, any> = {};

      const traverse = function* (id: string, currentDepth: number): Generator<any, any, any> {
        if (currentDepth > depth || visited.has(id)) {
          return;
        }

        visited.add(id);

        // Get thing
        const thing = yield* provider.things.get(id);
        graph[id] = { thing, connections: [] };

        // Get connections
        const outgoing = yield* provider.connections.list({
          fromEntityId: id,
        });

        graph[id].connections = outgoing;

        // Recurse for each connected thing
        if (currentDepth < depth) {
          for (const conn of outgoing) {
            yield* traverse(conn.toEntityId, currentDepth + 1);
          }
        }
      };

      yield* traverse(entityId, 0);
      return graph;
    });
}

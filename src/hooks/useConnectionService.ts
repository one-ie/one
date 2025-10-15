import { useCallback, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from './useEffectRunner';
import type { Thing } from './useThingService';

/**
 * Connection types matching the backend ontology
 */
export type ConnectionType =
  // Ownership (2)
  | 'owns'
  | 'created_by'
  // AI (3)
  | 'clone_of'
  | 'trained_on'
  | 'powers'
  // Content (5)
  | 'authored'
  | 'generated_by'
  | 'published_to'
  | 'part_of'
  | 'references'
  // Community (4)
  | 'member_of'
  | 'following'
  | 'moderates'
  | 'participated_in'
  // Business (3)
  | 'manages'
  | 'reports_to'
  | 'collaborates_with'
  // Token (3)
  | 'holds_tokens'
  | 'staked_in'
  | 'earned_from'
  // Product (4)
  | 'purchased'
  | 'enrolled_in'
  | 'completed'
  | 'teaching'
  // Consolidated (7)
  | 'transacted'
  | 'notified'
  | 'referred'
  | 'communicated'
  | 'delegated'
  | 'approved'
  | 'fulfilled';

export interface Connection {
  _id: Id<'connections'>;
  _creationTime: number;
  fromEntityId: Id<'entities'>;
  toEntityId: Id<'entities'>;
  relationshipType: ConnectionType;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

export interface CreateConnectionArgs {
  fromEntityId: Id<'entities'>;
  toEntityId: Id<'entities'>;
  relationshipType: ConnectionType;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
}

export interface ListConnectionsArgs {
  fromEntityId?: Id<'entities'>;
  toEntityId?: Id<'entities'>;
  relationshipType?: ConnectionType;
  organizationId?: Id<'entities'>;
}

export interface GetRelatedArgs {
  entityId: Id<'entities'>;
  relationshipType: ConnectionType;
  direction?: 'from' | 'to' | 'both';
}

/**
 * Hook for accessing Connection-related services
 *
 * Provides type-safe access to relationship operations
 * following the 6-dimension ontology pattern.
 *
 * @example
 * ```tsx
 * const { create, getRelated, loading } = useConnectionService();
 *
 * // Create ownership connection
 * create({
 *   fromEntityId: creatorId,
 *   toEntityId: courseId,
 *   relationshipType: 'owns'
 * }, {
 *   onSuccess: () => toast.success('Course created!')
 * });
 *
 * // Get all courses owned by creator
 * getRelated({
 *   entityId: creatorId,
 *   relationshipType: 'owns',
 *   direction: 'from'
 * }, {
 *   onSuccess: (courses) => setCourses(courses)
 * });
 * ```
 */
export function useConnectionService() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const [connections, setConnections] = useState<Connection[]>([]);

  /**
   * List connections by criteria
   */
  const list = useCallback(
    async (
      args: ListConnectionsArgs,
      options?: {
        onSuccess?: (connections: Connection[]) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.connections.list(args);

        return [] as Connection[];
      });

      return run(program, {
        onSuccess: (result) => {
          setConnections(result);
          options?.onSuccess?.(result);
        },
        onError: options?.onError,
      });
    },
    [run]
  );

  /**
   * Get related entities through connections
   */
  const getRelated = useCallback(
    async (
      args: GetRelatedArgs,
      options?: {
        onSuccess?: (entities: Thing[]) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.connections.getRelated(args);

        return [] as Thing[];
      });

      return run(program, options);
    },
    [run]
  );

  /**
   * Create a new connection
   */
  const create = useCallback(
    async (
      args: CreateConnectionArgs,
      options?: {
        onSuccess?: (id: Id<'connections'>) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.connections.create(args);

        return '' as Id<'connections'>;
      });

      return run(program, options);
    },
    [run]
  );

  /**
   * Update connection metadata or strength
   */
  const update = useCallback(
    async (
      id: Id<'connections'>,
      updates: Partial<CreateConnectionArgs>,
      options?: {
        onSuccess?: (connection: Connection) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.connections.update(id, updates);

        return null as unknown as Connection;
      });

      return run(program, options);
    },
    [run]
  );

  /**
   * Remove (soft delete) a connection
   */
  const remove = useCallback(
    async (
      id: Id<'connections'>,
      options?: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.connections.delete(id);
      });

      return run(program, options);
    },
    [run]
  );

  return {
    list,
    getRelated,
    create,
    update,
    remove,
    connections,
    loading,
    error,
  };
}

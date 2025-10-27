/**
 * Connections Hook
 *
 * Operations on relationships (connections) between entities
 * in the 6-dimension ontology.
 *
 * @example
 * ```tsx
 * import { useConnection, useConnections } from '@/hooks/ontology/useConnection';
 *
 * function CourseEnrollments() {
 *   const { create } = useConnection();
 *   const { connections } = useConnections({
 *     relationshipType: 'enrolled_in'
 *   });
 *
 *   const handleEnroll = async (courseId) => {
 *     await create({
 *       fromEntityId: userId,
 *       toEntityId: courseId,
 *       relationshipType: 'enrolled_in'
 *     });
 *   };
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from '../useEffectRunner';
import { useIsProviderAvailable } from './useProvider';

/**
 * Connection (relationship) types
 */
export type ConnectionType =
  // Ownership
  | 'owns'
  | 'created_by'
  // AI
  | 'clone_of'
  | 'trained_on'
  | 'powers'
  // Content
  | 'authored'
  | 'generated_by'
  | 'published_to'
  | 'part_of'
  | 'references'
  // Community
  | 'member_of'
  | 'following'
  | 'moderates'
  | 'participated_in'
  // Business
  | 'manages'
  | 'reports_to'
  | 'collaborates_with'
  // Token
  | 'holds_tokens'
  | 'staked_in'
  | 'earned_from'
  // Product
  | 'purchased'
  | 'enrolled_in'
  | 'completed'
  | 'teaching'
  // Consolidated with metadata
  | 'transacted'
  | 'notified'
  | 'referred'
  | 'communicated'
  | 'delegated'
  | 'approved'
  | 'fulfilled';

/**
 * Connection entity
 */
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

/**
 * Input for creating a connection
 */
export interface CreateConnectionInput {
  fromEntityId: Id<'entities'>;
  toEntityId: Id<'entities'>;
  relationshipType: ConnectionType;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
}

/**
 * Filters for querying connections
 */
export interface ConnectionFilter {
  fromEntityId?: Id<'entities'>;
  toEntityId?: Id<'entities'>;
  relationshipType?: ConnectionType;
  limit?: number;
  offset?: number;
}

/**
 * Hook for connection operations (create, update, delete)
 *
 * @returns Connection CRUD operations and state
 *
 * @example
 * ```tsx
 * const { create, update, remove, loading } = useConnection();
 *
 * const handleCreate = async () => {
 *   await create({
 *     fromEntityId: userId,
 *     toEntityId: courseId,
 *     relationshipType: 'enrolled_in',
 *     metadata: { enrolledAt: Date.now() }
 *   });
 * };
 * ```
 */
export function useConnection() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();

  /**
   * Create a new connection
   */
  const create = useCallback(
    async (
      input: CreateConnectionInput,
      options?: {
        onSuccess?: (connection: Connection) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.connections.create(input);
        return null as unknown as Connection;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Update connection metadata or strength
   */
  const update = useCallback(
    async (
      id: Id<'connections'>,
      updates: Partial<CreateConnectionInput>,
      options?: {
        onSuccess?: (connection: Connection) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.connections.update(id, updates);
        return null as unknown as Connection;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Delete a connection
   */
  const remove = useCallback(
    async (
      id: Id<'connections'>,
      options?: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.connections.delete(id);
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  return {
    create,
    update,
    remove,
    loading,
    error,
  };
}

/**
 * Hook for listing connections with filtering
 *
 * @param filter - Filters for connections
 * @returns Connections array and state
 *
 * @example
 * ```tsx
 * const { connections: enrollments } = useConnections({
 *   relationshipType: 'enrolled_in',
 *   toEntityId: courseId
 * });
 * ```
 */
export function useConnections(filter?: ConnectionFilter) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (!isProviderAvailable) {
      setConnections([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.connections.list(filter);
      return [] as Connection[];
    });

    run(program, {
      onSuccess: (data) => setConnections(data),
    });
  }, [isProviderAvailable, filter?.fromEntityId, filter?.toEntityId, run]);

  return {
    connections,
    loading,
    error,
  };
}

/**
 * Hook for getting entities related to a specific entity
 *
 * @param entityId - Entity to find relationships for
 * @param relationshipType - Type of relationship to filter
 * @param direction - 'from' (entity is source) | 'to' (entity is target) | 'both'
 * @returns Related entities via connections
 *
 * @example
 * ```tsx
 * // Get all courses this user is enrolled in
 * const { entities: enrolledCourses } = useRelatedEntities(
 *   userId,
 *   'enrolled_in',
 *   'from'
 * );
 *
 * // Get all users enrolled in this course
 * const { entities: students } = useRelatedEntities(
 *   courseId,
 *   'enrolled_in',
 *   'to'
 * );
 * ```
 */
export function useRelatedEntities(
  entityId?: Id<'entities'>,
  relationshipType?: ConnectionType,
  direction?: 'from' | 'to' | 'both'
) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    if (!entityId || !isProviderAvailable) {
      setEntities([]);
      return;
    }

    const filter: ConnectionFilter =
      direction === 'from' || direction === 'both'
        ? { fromEntityId: entityId, relationshipType }
        : { toEntityId: entityId, relationshipType };

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.connections.getRelated(filter);
      return [] as any[];
    });

    run(program, {
      onSuccess: (data) => setEntities(data),
    });
  }, [entityId, relationshipType, direction, isProviderAvailable, run]);

  return {
    entities,
    loading,
    error,
  };
}

/**
 * Hook for checking if two entities are connected
 *
 * @param fromId - Source entity
 * @param toId - Target entity
 * @param relationshipType - Type of relationship to check
 * @returns true if connection exists
 *
 * @example
 * ```tsx
 * const isFollowing = useIsConnected(userId, authorId, 'following');
 * ```
 */
export function useIsConnected(
  fromId?: Id<'entities'>,
  toId?: Id<'entities'>,
  relationshipType?: ConnectionType
): boolean {
  const { connections } = useConnections({
    fromEntityId: fromId,
    toEntityId: toId,
    relationshipType,
  });

  return connections.length > 0;
}

/**
 * Hook for getting entities owned by another entity
 *
 * @param ownerId - Owner entity ID
 * @returns Owned entities
 *
 * @example
 * ```tsx
 * const { entities: courses } = useOwnedEntities(organizationId);
 * ```
 */
export function useOwnedEntities(ownerId: Id<'entities'>) {
  return useRelatedEntities(ownerId, 'owns', 'from');
}

/**
 * Hook for getting followers of an entity
 *
 * @param entityId - Entity to get followers for
 * @returns Followers
 *
 * @example
 * ```tsx
 * const { entities: followers } = useFollowers(authorId);
 * ```
 */
export function useFollowers(entityId: Id<'entities'>) {
  return useRelatedEntities(entityId, 'following', 'to');
}

/**
 * Hook for getting entities this user follows
 *
 * @param userId - User to get following list for
 * @returns Followed entities
 *
 * @example
 * ```tsx
 * const { entities: following } = useFollowing(userId);
 * ```
 */
export function useFollowing(userId: Id<'entities'>) {
  return useRelatedEntities(userId, 'following', 'from');
}

/**
 * Hook for getting enrollments (people enrolled in a course)
 *
 * @param courseId - Course entity ID
 * @returns Enrolled users
 *
 * @example
 * ```tsx
 * const { entities: students } = useEnrollments(courseId);
 * ```
 */
export function useEnrollments(courseId: Id<'entities'>) {
  return useRelatedEntities(courseId, 'enrolled_in', 'to');
}

/**
 * Hook for getting courses a user is enrolled in
 *
 * @param userId - User entity ID
 * @returns Enrolled courses
 *
 * @example
 * ```tsx
 * const { entities: courses } = useUserEnrollments(userId);
 * ```
 */
export function useUserEnrollments(userId: Id<'entities'>) {
  return useRelatedEntities(userId, 'enrolled_in', 'from');
}

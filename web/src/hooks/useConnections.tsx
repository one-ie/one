/**
 * useConnections - React hooks for Connections dimension
 *
 * Provides hooks for querying and mutating relationships between entities.
 */

import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';
import type {
  Connection,
  CreateConnectionInput,
  ListConnectionsOptions,
} from '@/providers/DataProvider';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useConnections - Query relationships
 *
 * @param options - Filter options (fromEntityId, toEntityId, relationshipType)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * // Get all courses owned by creator
 * const { data: ownedCourses } = useConnections({
 *   fromEntityId: creatorId,
 *   relationshipType: 'owns'
 * });
 *
 * // Get all enrollments for a course
 * const { data: enrollments } = useConnections({
 *   toEntityId: courseId,
 *   relationshipType: 'enrolled_in'
 * });
 * ```
 */
export function useConnections(
  options?: ListConnectionsOptions,
  queryOptions?: QueryOptions
): QueryResult<Connection[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['connections', options];

  const queryFn = async (): Promise<Connection[]> => {
    const effect = provider.connections.list(options);
    return await Effect.runPromise(effect);
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    ...reactQueryOptions,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: async () => {
      await query.refetch();
    },
    refetching: query.isRefetching,
  };
}

/**
 * useConnection - Get single connection by ID
 *
 * @param id - Connection ID (null to disable query)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * const { data: connection } = useConnection(connectionId);
 * ```
 */
export function useConnection(
  id: string | null,
  queryOptions?: QueryOptions
): QueryResult<Connection> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['connection', id];

  const queryFn = async (): Promise<Connection> => {
    if (!id) throw new Error('Connection ID is required');
    const effect = provider.connections.get(id);
    return await Effect.runPromise(effect);
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!id,
    ...reactQueryOptions,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: async () => {
      await query.refetch();
    },
    refetching: query.isRefetching,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useCreateConnection - Create relationship
 *
 * Automatically invalidates related entity caches.
 *
 * @example
 * ```tsx
 * const { mutate: enroll } = useCreateConnection({
 *   onSuccess: () => toast.success('Enrolled!')
 * });
 *
 * await enroll({
 *   fromEntityId: userId,
 *   toEntityId: courseId,
 *   relationshipType: 'enrolled_in',
 *   metadata: { progress: 0 }
 * });
 * ```
 */
export function useCreateConnection(
  mutationOptions?: MutationOptions<string, CreateConnectionInput>
): MutationResult<string, CreateConnectionInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: CreateConnectionInput): Promise<string> => {
      const effect = provider.connections.create(input);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (id, input) => {
      // Invalidate connection queries
      await queryClient.invalidateQueries({ queryKey: ['connections'] });

      // Invalidate related things
      await queryClient.invalidateQueries({ queryKey: ['thing', input.fromEntityId] });
      await queryClient.invalidateQueries({ queryKey: ['thing', input.toEntityId] });

      await mutationOptions?.onSuccess?.(id, input);
    },
    onError: async (error, input) => {
      await mutationOptions?.onError?.(error as Error, input);
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    data: mutation.data ?? null,
  };
}

/**
 * useDeleteConnection - Delete relationship
 *
 * @example
 * ```tsx
 * const { mutate: unenroll } = useDeleteConnection({
 *   onSuccess: () => toast.success('Unenrolled')
 * });
 *
 * await unenroll(connectionId);
 * ```
 */
export function useDeleteConnection(
  mutationOptions?: MutationOptions<void, string>
): MutationResult<void, string> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (id: string): Promise<void> => {
      const effect = provider.connections.delete(id);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['connection', id] });

      // Invalidate all connection lists
      await queryClient.invalidateQueries({ queryKey: ['connections'] });

      await mutationOptions?.onSuccess?.(data, id);
    },
    onError: async (error, id) => {
      await mutationOptions?.onError?.(error as Error, id);
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    data: mutation.data ?? null,
  };
}

// ============================================================================
// RELATIONSHIP-SPECIFIC HOOKS (Convenience)
// ============================================================================

/**
 * useOwnedThings - Get entities owned by an entity
 *
 * @example
 * ```tsx
 * const { data: ownedCourses } = useOwnedThings(creatorId);
 * ```
 */
export function useOwnedThings(ownerId: string | null, queryOptions?: QueryOptions) {
  return useConnections(
    ownerId ? { fromEntityId: ownerId, relationshipType: 'owns' } : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!ownerId }
  );
}

/**
 * useEnrollments - Get enrollments for a user
 *
 * @example
 * ```tsx
 * const { data: enrollments } = useEnrollments(userId);
 * ```
 */
export function useEnrollments(userId: string | null, queryOptions?: QueryOptions) {
  return useConnections(
    userId ? { fromEntityId: userId, relationshipType: 'enrolled_in' } : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!userId }
  );
}

/**
 * useFollowing - Get entities a user is following
 *
 * @example
 * ```tsx
 * const { data: following } = useFollowing(userId);
 * ```
 */
export function useFollowing(userId: string | null, queryOptions?: QueryOptions) {
  return useConnections(
    userId ? { fromEntityId: userId, relationshipType: 'following' } : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!userId }
  );
}

/**
 * useTokenHoldings - Get token holdings for a user
 *
 * @example
 * ```tsx
 * const { data: holdings } = useTokenHoldings(userId);
 * ```
 */
export function useTokenHoldings(userId: string | null, queryOptions?: QueryOptions) {
  return useConnections(
    userId ? { fromEntityId: userId, relationshipType: 'holds_tokens' } : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!userId }
  );
}

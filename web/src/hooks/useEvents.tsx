/**
 * useEvents - React hooks for Events dimension
 *
 * Provides hooks for querying event streams and logging events.
 */

import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';
import type { Event, CreateEventInput, ListEventsOptions } from '@/providers/DataProvider';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useEvents - Query event stream
 *
 * @param options - Filter options (type, actorId, targetId, time range)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * // Get recent events for an entity
 * const { data: events } = useEvents({
 *   targetId: courseId,
 *   limit: 20
 * });
 *
 * // Get activity feed for a user
 * const { data: activities } = useEvents({
 *   actorId: userId,
 *   since: Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
 * });
 * ```
 */
export function useEvents(
  options?: ListEventsOptions,
  queryOptions?: QueryOptions
): QueryResult<Event[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['events', options];

  const queryFn = async (): Promise<Event[]> => {
    const effect = provider.events.list(options);
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
 * useEvent - Get single event by ID
 *
 * @param id - Event ID (null to disable query)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * const { data: event } = useEvent(eventId);
 * ```
 */
export function useEvent(id: string | null, queryOptions?: QueryOptions): QueryResult<Event> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['event', id];

  const queryFn = async (): Promise<Event> => {
    if (!id) throw new Error('Event ID is required');
    const effect = provider.events.get(id);
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
 * useLogEvent - Log new event
 *
 * Automatically invalidates event queries for affected entities.
 *
 * @example
 * ```tsx
 * const { mutate: logEvent } = useLogEvent({
 *   onSuccess: () => console.log('Event logged')
 * });
 *
 * await logEvent({
 *   type: 'course_completed',
 *   actorId: userId,
 *   targetId: courseId,
 *   metadata: { score: 95 }
 * });
 * ```
 */
export function useLogEvent(
  mutationOptions?: MutationOptions<string, CreateEventInput>
): MutationResult<string, CreateEventInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: CreateEventInput): Promise<string> => {
      const effect = provider.events.create(input);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (id, input) => {
      // Invalidate event queries for affected entities
      await queryClient.invalidateQueries({ queryKey: ['events'] });

      if (input.actorId) {
        await queryClient.invalidateQueries({
          queryKey: ['events', { actorId: input.actorId }],
        });
      }

      if (input.targetId) {
        await queryClient.invalidateQueries({
          queryKey: ['events', { targetId: input.targetId }],
        });
      }

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

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * useAuditTrail - Get audit trail for an entity
 *
 * Returns events ordered by timestamp descending (most recent first).
 *
 * @example
 * ```tsx
 * const { data: auditTrail } = useAuditTrail(courseId);
 *
 * return (
 *   <div>
 *     {auditTrail?.map(event => (
 *       <div key={event._id}>
 *         {event.type} - {new Date(event.timestamp).toLocaleString()}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useAuditTrail(
  targetId: string | null,
  options?: { limit?: number; since?: number },
  queryOptions?: QueryOptions
) {
  return useEvents(
    targetId
      ? {
          targetId,
          limit: options?.limit ?? 50,
          since: options?.since,
        }
      : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!targetId }
  );
}

/**
 * useActivityFeed - Get activity feed for a user
 *
 * Returns events where the user is the actor, ordered by timestamp descending.
 *
 * @example
 * ```tsx
 * const { data: activities } = useActivityFeed(userId, {
 *   limit: 20,
 *   realtime: true
 * });
 * ```
 */
export function useActivityFeed(
  actorId: string | null,
  options?: { limit?: number; since?: number },
  queryOptions?: QueryOptions
) {
  return useEvents(
    actorId
      ? {
          actorId,
          limit: options?.limit ?? 20,
          since: options?.since,
        }
      : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!actorId }
  );
}

/**
 * useRecentEvents - Get recent events of a specific type
 *
 * @example
 * ```tsx
 * // Get recent purchases
 * const { data: recentPurchases } = useRecentEvents('tokens_purchased', {
 *   limit: 10
 * });
 * ```
 */
export function useRecentEvents(
  eventType: string | null,
  options?: { limit?: number; since?: number },
  queryOptions?: QueryOptions
) {
  return useEvents(
    eventType
      ? {
          type: eventType,
          limit: options?.limit ?? 20,
          since: options?.since,
        }
      : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!eventType }
  );
}

/**
 * useThings - React hooks for Things dimension
 *
 * Provides Convex-style API for querying and mutating entities
 * while being backend-agnostic through DataProvider.
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider, queryClient } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';
import type {
  Thing,
  CreateThingInput,
  UpdateThingInput,
  ListThingsOptions,
} from '@/providers/DataProvider';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useThings - List entities by type and filters
 *
 * Similar to Convex's useQuery but works with any backend provider.
 * Automatically handles loading states, errors, and refetching.
 *
 * @param options - Filter options (type, status, limit, offset)
 * @param queryOptions - Query configuration (enabled, realtime, etc.)
 *
 * @example
 * ```tsx
 * // List all published courses
 * const { data: courses, loading, error } = useThings({
 *   type: 'course',
 *   status: 'published'
 * });
 *
 * // With real-time updates
 * const { data } = useThings(
 *   { type: 'course' },
 *   { realtime: true }
 * );
 * ```
 */
export function useThings<T extends Thing = Thing>(
  options?: ListThingsOptions,
  queryOptions?: QueryOptions
): QueryResult<T[]> {
  const provider = useDataProvider();
  const { realtime = false, enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  // Build query key (used for caching and invalidation)
  const queryKey = ['things', options];

  // Query function
  const queryFn = async (): Promise<T[]> => {
    const effect = provider.things.list(options);
    const result = await Effect.runPromise(effect);
    return result as T[];
  };

  // Execute query
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    ...reactQueryOptions,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!realtime || !enabled) return;

    // TODO: Implement subscription mechanism
    // This would depend on the backend provider's subscription capabilities
    // For Convex, this would use Convex subscriptions
    // For other providers, this might use WebSockets or polling

    return () => {
      // Cleanup subscription
    };
  }, [realtime, enabled, JSON.stringify(options)]);

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
 * useThing - Get single entity by ID
 *
 * @param id - Entity ID (null to disable query)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * const { data: course, loading } = useThing(courseId);
 *
 * if (loading) return <Skeleton />;
 * if (!course) return <div>Not found</div>;
 *
 * return <div>{course.name}</div>;
 * ```
 */
export function useThing<T extends Thing = Thing>(
  id: string | null,
  queryOptions?: QueryOptions
): QueryResult<T> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['thing', id];

  const queryFn = async (): Promise<T> => {
    if (!id) throw new Error('Thing ID is required');
    const effect = provider.things.get(id);
    const result = await Effect.runPromise(effect);
    return result as T;
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
 * useCreateThing - Create new entity
 *
 * Similar to Convex's useMutation but with automatic cache invalidation.
 *
 * @param mutationOptions - Callbacks for mutation lifecycle
 *
 * @example
 * ```tsx
 * const { mutate: createCourse, loading } = useCreateThing({
 *   onSuccess: (id) => navigate(`/courses/${id}`)
 * });
 *
 * async function handleSubmit() {
 *   await createCourse({
 *     type: 'course',
 *     name: 'My Course',
 *     properties: { description: '...' }
 *   });
 * }
 * ```
 */
export function useCreateThing(
  mutationOptions?: MutationOptions<string, CreateThingInput>
): MutationResult<string, CreateThingInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: CreateThingInput): Promise<string> => {
      const effect = provider.things.create(input);
      return await Effect.runPromise(effect);
    },
    onMutate: async (input) => {
      await mutationOptions?.onMutate?.(input);
    },
    onSuccess: async (id, input) => {
      // Invalidate list queries for this type
      await queryClient.invalidateQueries({
        queryKey: ['things', { type: input.type }],
      });
      await queryClient.invalidateQueries({
        queryKey: ['things'],
      });

      await mutationOptions?.onSuccess?.(id, input);
    },
    onError: async (error, input) => {
      await mutationOptions?.onError?.(error as Error, input);
    },
    onSettled: async (data, error, input) => {
      await mutationOptions?.onSettled?.(data ?? null, error as Error | null, input);
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
 * useUpdateThing - Update existing entity
 *
 * Supports optimistic updates for instant UI feedback.
 *
 * @example
 * ```tsx
 * const { mutate: updateCourse } = useUpdateThing({
 *   onSuccess: () => toast.success('Updated!')
 * });
 *
 * await updateCourse({
 *   id: courseId,
 *   name: 'Updated Name',
 *   status: 'published'
 * });
 * ```
 */
export function useUpdateThing(
  mutationOptions?: MutationOptions<void, { id: string } & UpdateThingInput>
): MutationResult<void, { id: string } & UpdateThingInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async ({ id, ...input }: { id: string } & UpdateThingInput): Promise<void> => {
      const effect = provider.things.update(id, input);
      return await Effect.runPromise(effect);
    },
    onMutate: async ({ id, ...updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['thing', id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['thing', id]);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData(['thing', id], {
          ...previous,
          ...updates,
          updatedAt: Date.now(),
        });
      }

      await mutationOptions?.onMutate?.({ id, ...updates });

      return { previous };
    },
    onError: async (error, { id, ...updates }, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['thing', id], context.previous);
      }

      await mutationOptions?.onError?.(error as Error, { id, ...updates });
    },
    onSuccess: async (data, { id, ...updates }) => {
      // Update single entity cache
      await queryClient.invalidateQueries({ queryKey: ['thing', id] });

      // Invalidate list queries
      await queryClient.invalidateQueries({ queryKey: ['things'] });

      await mutationOptions?.onSuccess?.(data, { id, ...updates });
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
 * useDeleteThing - Delete entity (soft delete)
 *
 * @example
 * ```tsx
 * const { mutate: deleteCourse } = useDeleteThing({
 *   onSuccess: () => navigate('/courses')
 * });
 *
 * await deleteCourse(courseId);
 * ```
 */
export function useDeleteThing(
  mutationOptions?: MutationOptions<void, string>
): MutationResult<void, string> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (id: string): Promise<void> => {
      const effect = provider.things.delete(id);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['thing', id] });

      // Invalidate all thing lists
      await queryClient.invalidateQueries({ queryKey: ['things'] });

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
// TYPE-SPECIFIC HOOKS (Convenience)
// ============================================================================

/**
 * useCourses - Shorthand for useThings with type='course'
 */
export function useCourses(options?: Omit<ListThingsOptions, 'type'>, queryOptions?: QueryOptions) {
  return useThings({ ...options, type: 'course' }, queryOptions);
}

/**
 * useAgents - Shorthand for useThings with type='ai_clone'
 */
export function useAgents(options?: Omit<ListThingsOptions, 'type'>, queryOptions?: QueryOptions) {
  return useThings({ ...options, type: 'ai_clone' }, queryOptions);
}

/**
 * useBlogPosts - Shorthand for useThings with type='blog_post'
 */
export function useBlogPosts(options?: Omit<ListThingsOptions, 'type'>, queryOptions?: QueryOptions) {
  return useThings({ ...options, type: 'blog_post' }, queryOptions);
}

/**
 * useTokens - Shorthand for useThings with type='token'
 */
export function useTokens(options?: Omit<ListThingsOptions, 'type'>, queryOptions?: QueryOptions) {
  return useThings({ ...options, type: 'token' }, queryOptions);
}

/**
 * useKnowledge - React hooks for Knowledge dimension
 *
 * Provides hooks for semantic search, RAG, and knowledge management.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';
import type {
  Knowledge,
  CreateKnowledgeInput,
  SearchKnowledgeOptions,
} from '@/providers/DataProvider';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useKnowledge - List knowledge items
 *
 * @param options - Filter options (type, sourceThingId, knowledgeType)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * // Get all labels
 * const { data: labels } = useKnowledge({
 *   knowledgeType: 'label'
 * });
 *
 * // Get chunks for a thing
 * const { data: chunks } = useKnowledge({
 *   sourceThingId: courseId,
 *   knowledgeType: 'chunk'
 * });
 * ```
 */
export function useKnowledge(
  options?: SearchKnowledgeOptions,
  queryOptions?: QueryOptions
): QueryResult<Knowledge[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['knowledge', options];

  const queryFn = async (): Promise<Knowledge[]> => {
    const effect = provider.knowledge.list(options);
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
 * useSearch - Semantic search with query debouncing
 *
 * Automatically debounces search queries to avoid excessive API calls.
 *
 * @param query - Search query string
 * @param options - Search options
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const { data: results, loading } = useSearch(searchQuery, {
 *   limit: 10,
 *   knowledgeType: 'document'
 * });
 *
 * return (
 *   <div>
 *     <input
 *       value={searchQuery}
 *       onChange={(e) => setSearchQuery(e.target.value)}
 *       placeholder="Search..."
 *     />
 *     {loading && <div>Searching...</div>}
 *     {results?.map(result => (
 *       <div key={result._id}>{result.text}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useSearch(
  query: string,
  options?: Omit<SearchKnowledgeOptions, 'query'>,
  queryOptions?: QueryOptions
): QueryResult<Knowledge[]> {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['search', debouncedQuery, options];

  const queryFn = async (): Promise<Knowledge[]> => {
    // TODO: Implement text-to-embedding conversion
    // For now, this assumes the backend handles text queries
    const effect = provider.knowledge.list({
      query: debouncedQuery,
      ...options,
    });
    return await Effect.runPromise(effect);
  };

  const searchQuery = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && debouncedQuery.length > 0,
    staleTime: 60000, // Cache search results for 1 minute
    ...reactQueryOptions,
  });

  return {
    data: searchQuery.data ?? null,
    loading: searchQuery.isLoading,
    error: searchQuery.error as Error | null,
    refetch: async () => {
      await searchQuery.refetch();
    },
    refetching: searchQuery.isRefetching,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useCreateKnowledge - Create knowledge item
 *
 * @example
 * ```tsx
 * const { mutate: createLabel } = useCreateKnowledge({
 *   onSuccess: (id) => console.log('Label created:', id)
 * });
 *
 * await createLabel({
 *   knowledgeType: 'label',
 *   text: 'machine-learning',
 *   labels: ['skill', 'technology']
 * });
 * ```
 */
export function useCreateKnowledge(
  mutationOptions?: MutationOptions<string, CreateKnowledgeInput>
): MutationResult<string, CreateKnowledgeInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: CreateKnowledgeInput): Promise<string> => {
      const effect = provider.knowledge.create(input);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (id, input) => {
      // Invalidate knowledge queries
      await queryClient.invalidateQueries({ queryKey: ['knowledge'] });

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
 * useLinkKnowledge - Link knowledge to a thing
 *
 * @example
 * ```tsx
 * const { mutate: linkLabel } = useLinkKnowledge({
 *   onSuccess: () => toast.success('Label added')
 * });
 *
 * await linkLabel({
 *   thingId: courseId,
 *   knowledgeId: labelId,
 *   role: 'label'
 * });
 * ```
 */
export function useLinkKnowledge(
  mutationOptions?: MutationOptions<
    string,
    { thingId: string; knowledgeId: string; role?: string }
  >
): MutationResult<string, { thingId: string; knowledgeId: string; role?: string }> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async ({
      thingId,
      knowledgeId,
      role,
    }: {
      thingId: string;
      knowledgeId: string;
      role?: string;
    }): Promise<string> => {
      const effect = provider.knowledge.link(thingId, knowledgeId, role as any);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (id, { thingId }) => {
      // Invalidate knowledge queries for this thing
      await queryClient.invalidateQueries({
        queryKey: ['knowledge', { sourceThingId: thingId }],
      });

      // Invalidate the thing itself (it may display linked knowledge)
      await queryClient.invalidateQueries({ queryKey: ['thing', thingId] });

      await mutationOptions?.onSuccess?.(id, { thingId, knowledgeId: '', role: '' });
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
 * useLabels - Get labels with optional category filter
 *
 * @example
 * ```tsx
 * // Get all skill labels
 * const { data: skills } = useLabels('skill');
 *
 * // Get all labels
 * const { data: allLabels } = useLabels();
 * ```
 */
export function useLabels(category?: string, queryOptions?: QueryOptions) {
  return useKnowledge(
    {
      knowledgeType: 'label',
      // Note: category filtering would need to be implemented in the backend
      // For now, this returns all labels and filtering can be done client-side
    },
    {
      staleTime: 300000, // Labels are relatively static, cache for 5 minutes
      ...queryOptions,
    }
  );
}

/**
 * useThingKnowledge - Get knowledge items linked to a thing
 *
 * @example
 * ```tsx
 * const { data: courseLabels } = useThingKnowledge(courseId);
 * ```
 */
export function useThingKnowledge(thingId: string | null, queryOptions?: QueryOptions) {
  return useKnowledge(
    thingId
      ? {
          sourceThingId: thingId,
        }
      : undefined,
    { ...queryOptions, enabled: queryOptions?.enabled && !!thingId }
  );
}

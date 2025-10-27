/**
 * Knowledge & Search Hook
 *
 * Operations on knowledge dimension (semantic search, embeddings, labels)
 * in the 6-dimension ontology.
 *
 * @example
 * ```tsx
 * import { useSearch, useLabels } from '@/hooks/ontology/useSearch';
 *
 * function SearchPage() {
 *   const [query, setQuery] = useState('');
 *   const { results, loading } = useSearch(query);
 *   const { labels } = useLabels();
 *
 *   return (
 *     <div>
 *       <input
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         placeholder="Search..."
 *       />
 *       {results?.map(r => (
 *         <SearchResult key={r._id} result={r} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from '../useEffectRunner';
import { useIsProviderAvailable } from './useProvider';

/**
 * Label/tag categories for knowledge organization
 */
export type LabelCategory =
  | 'industry'
  | 'skill'
  | 'topic'
  | 'format'
  | 'goal'
  | 'audience'
  | 'technology'
  | 'status'
  | 'capability'
  | 'protocol'
  | 'payment_method'
  | 'network'
  | string;

/**
 * Label/tag for categorizing and organizing entities
 */
export interface Label {
  _id: Id<'knowledge'>;
  _creationTime: number;
  name: string;
  category: LabelCategory;
  description?: string;
  color?: string;
  createdAt: number;
}

/**
 * Search result item
 */
export interface SearchResult {
  _id: Id<'entities'>;
  type: string;
  name: string;
  snippet?: string;
  score?: number;
  relevance?: number;
  matchedFields?: string[];
}

/**
 * Semantic search options
 */
export interface SearchOptions {
  limit?: number;
  offset?: number;
  type?: string;
  filters?: Record<string, any>;
  includeArchived?: boolean;
}

/**
 * Hook for full-text and semantic search
 *
 * @param query - Search query
 * @param options - Search options
 * @returns Search results and state
 *
 * @example
 * ```tsx
 * const { results, loading, error } = useSearch('React tutorial', {
 *   type: 'course',
 *   limit: 20
 * });
 * ```
 */
export function useSearch(query: string, options?: SearchOptions) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim() || !isProviderAvailable) {
      setResults([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.search(query, options);
      return [] as SearchResult[];
    });

    // Debounce search
    const timeout = setTimeout(() => {
      run(program, {
        onSuccess: (data) => setResults(data),
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, options?.type, isProviderAvailable, run]);

  return {
    results,
    loading,
    error,
    hasResults: results.length > 0,
  };
}

/**
 * Hook for searching by entity type with type-safe results
 *
 * @param query - Search query
 * @param type - Entity type to search within
 * @returns Type-filtered search results
 *
 * @example
 * ```tsx
 * const { results: courses } = useSearchByType('Python', 'course');
 * const { results: posts } = useSearchByType('AI', 'blog_post');
 * ```
 */
export function useSearchByType(query: string, type: string) {
  return useSearch(query, { type });
}

/**
 * Hook for getting all available labels
 *
 * @param category - Optional filter by category
 * @returns Labels array
 *
 * @example
 * ```tsx
 * const { labels: allLabels } = useLabels();
 * const { labels: skills } = useLabels('skill');
 * ```
 */
export function useLabels(category?: LabelCategory) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (!isProviderAvailable) {
      setLabels([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.labels(category);
      return [] as Label[];
    });

    run(program, {
      onSuccess: (data) => setLabels(data),
    });
  }, [category, isProviderAvailable, run]);

  return {
    labels,
    loading,
    error,
  };
}

/**
 * Hook for labels in a specific category
 *
 * @param category - Label category
 * @returns Labels in that category
 *
 * @example
 * ```tsx
 * const { labels: technologies } = useLabelsByCategory('technology');
 * ```
 */
export function useLabelsByCategory(category: LabelCategory) {
  return useLabels(category);
}

/**
 * Hook for getting knowledge/labels linked to a specific entity
 *
 * @param entityId - Entity ID
 * @returns Labels linked to that entity
 *
 * @example
 * ```tsx
 * const { labels } = useEntityLabels(courseId);
 * // Shows all tags/categories this course is labeled with
 * ```
 */
export function useEntityLabels(entityId?: Id<'entities'>) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (!entityId || !isProviderAvailable) {
      setLabels([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.getEntityLabels(entityId);
      return [] as Label[];
    });

    run(program, {
      onSuccess: (data) => setLabels(data),
    });
  }, [entityId, isProviderAvailable, run]);

  return {
    labels,
    loading,
    error,
  };
}

/**
 * Hook for getting entities by label
 *
 * @param labelId - Label ID
 * @returns Entities with that label
 *
 * @example
 * ```tsx
 * const { entities } = useEntitiesByLabel(skillLabelId);
 * // Shows all courses with 'Python' skill label
 * ```
 */
export function useEntitiesByLabel(labelId?: Id<'knowledge'>) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    if (!labelId || !isProviderAvailable) {
      setEntities([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.getEntitiesByLabel(labelId);
      return [] as any[];
    });

    run(program, {
      onSuccess: (data) => setEntities(data),
    });
  }, [labelId, isProviderAvailable, run]);

  return {
    entities,
    loading,
    error,
  };
}

/**
 * Hook for semantic similarity search
 *
 * Uses embeddings to find similar entities
 *
 * @param entityId - Entity to find similar items for
 * @param limit - Number of results
 * @returns Similar entities
 *
 * @example
 * ```tsx
 * const { results: similar } = useSimilarEntities(courseId, 10);
 * // Shows courses similar to this one
 * ```
 */
export function useSimilarEntities(
  entityId?: Id<'entities'>,
  limit = 10
) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!entityId || !isProviderAvailable) {
      setResults([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.findSimilar(entityId, limit);
      return [] as any[];
    });

    run(program, {
      onSuccess: (data) => setResults(data),
    });
  }, [entityId, limit, isProviderAvailable, run]);

  return {
    results,
    loading,
    error,
  };
}

/**
 * Hook for advanced faceted search
 *
 * Supports filtering by labels, categories, and other facets
 *
 * @param query - Search query
 * @param facets - Facet filters
 * @returns Search results and facet options
 *
 * @example
 * ```tsx
 * const { results, facets } = useFacetedSearch('Python', {
 *   category: 'skill',
 *   type: 'course'
 * });
 *
 * // Show results
 * // Show facet filters (technologies, levels, etc.)
 * ```
 */
export function useFacetedSearch(
  query: string,
  facets?: Record<string, string>
) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [availableFacets, setAvailableFacets] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    if (!query.trim() || !isProviderAvailable) {
      setResults([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.facetedSearch(query, facets);
      return {
        results: [] as SearchResult[],
        facets: {} as Record<string, string[]>,
      };
    });

    const timeout = setTimeout(() => {
      run(program, {
        onSuccess: (data) => {
          setResults(data.results);
          setAvailableFacets(data.facets);
        },
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, facets?.category, facets?.type, isProviderAvailable, run]);

  return {
    results,
    facets: availableFacets,
    loading,
    error,
  };
}

/**
 * Hook for trending/popular entities
 *
 * @param entityType - Type of entities
 * @param limit - Number to return
 * @returns Popular entities
 *
 * @example
 * ```tsx
 * const { results: trendingCourses } = useTrendingEntities('course', 10);
 * ```
 */
export function useTrendingEntities(entityType?: string, limit = 10) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!isProviderAvailable) {
      setResults([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.getTrending(entityType, limit);
      return [] as SearchResult[];
    });

    run(program, {
      onSuccess: (data) => setResults(data),
    });
  }, [entityType, limit, isProviderAvailable, run]);

  return {
    results,
    loading,
    error,
  };
}

/**
 * Hook for embedding-based recommendations
 *
 * RAG-powered suggestions based on user behavior
 *
 * @param userId - User to get recommendations for
 * @param limit - Number of recommendations
 * @returns Recommended entities
 *
 * @example
 * ```tsx
 * const { results: recommendations } = useRecommendations(userId, 20);
 * // Shows AI-powered course recommendations
 * ```
 */
export function useRecommendations(userId?: Id<'entities'>, limit = 20) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!userId || !isProviderAvailable) {
      setResults([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider + RAG
      // const provider = yield* DataProvider;
      // return yield* provider.knowledge.getRecommendations(userId, limit);
      return [] as SearchResult[];
    });

    run(program, {
      onSuccess: (data) => setResults(data),
    });
  }, [userId, limit, isProviderAvailable, run]);

  return {
    results,
    loading,
    error,
  };
}

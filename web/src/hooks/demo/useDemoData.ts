/**
 * useDemoData - Fetch and cache data from HTTP API endpoints
 *
 * Provides React Query integration for fetching ontology data from demo API,
 * with automatic caching, refetching intervals, and error handling.
 *
 * @example
 * ```tsx
 * const { data: things, loading, error, refetch } = useDemoData('things', {
 *   groupId: myGroupId,
 *   type: 'course'
 * });
 *
 * if (loading) return <Skeleton />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     {things?.map(thing => (
 *       <ThingCard key={thing._id} thing={thing} />
 *     ))}
 *   </div>
 * );
 * ```
 */

import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { atom } from 'nanostores';
import type { PropsWithChildren } from 'react';

export type ResourceType = 'groups' | 'people' | 'things' | 'connections' | 'events' | 'knowledge';

export interface DemoDataOptions {
  groupId?: string;
  type?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export interface DemoDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  expiresAt: number;
}

// Nanostores for caching
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const API_BASE_URL = '/http';

// Cache store
const $demoCache = atom<Record<string, CacheEntry<any>>>({});

/**
 * Generate cache key for query
 */
function getCacheKey(
  resource: ResourceType,
  options?: DemoDataOptions
): QueryKey {
  return [
    'demo',
    resource,
    options?.groupId,
    options?.type,
    options?.status,
    options?.search,
    options?.limit,
    options?.offset,
  ];
}

/**
 * Generate cache ID for storage
 */
function getCacheId(resource: ResourceType, options?: DemoDataOptions): string {
  return JSON.stringify({ resource, options });
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(entry: CacheEntry<any>): boolean {
  return Date.now() < entry.expiresAt;
}

/**
 * Get cached data
 */
function getCachedData<T>(
  resource: ResourceType,
  options?: DemoDataOptions
): T[] | null {
  const cache = $demoCache.get();
  const cacheId = getCacheId(resource, options);
  const entry = cache[cacheId];

  if (!entry) return null;
  if (!isCacheValid(entry)) {
    // Remove expired entry
    const newCache = { ...cache };
    delete newCache[cacheId];
    $demoCache.set(newCache);
    return null;
  }

  return entry.data as T[];
}

/**
 * Set cached data
 */
function setCachedData<T>(
  resource: ResourceType,
  options: DemoDataOptions | undefined,
  data: T[],
  duration = DEFAULT_CACHE_DURATION
) {
  const cache = $demoCache.get();
  const cacheId = getCacheId(resource, options);

  cache[cacheId] = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  };

  $demoCache.set(cache);
}

/**
 * Clear all cached data
 */
export function clearDemoCache() {
  $demoCache.set({});
}

/**
 * Clear cached data for specific resource
 */
export function clearDemoCacheForResource(resource: ResourceType) {
  const cache = $demoCache.get();
  const newCache = { ...cache };

  Object.keys(newCache).forEach((key) => {
    try {
      const parsed = JSON.parse(key);
      if (parsed.resource === resource) {
        delete newCache[key];
      }
    } catch {
      // Skip invalid keys
    }
  });

  $demoCache.set(newCache);
}

/**
 * Fetch data from HTTP API endpoint
 */
async function fetchDemoData<T>(
  resource: ResourceType,
  options?: DemoDataOptions
): Promise<T[]> {
  // Check cache first
  const cached = getCachedData<T>(resource, options);
  if (cached) {
    return cached;
  }

  // Build query string
  const params = new URLSearchParams();
  if (options?.groupId) params.append('groupId', options.groupId);
  if (options?.type) params.append('type', options.type);
  if (options?.status) params.append('status', options.status);
  if (options?.search) params.append('search', options.search);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const queryString = params.toString();
  const url = `${API_BASE_URL}/${resource}${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    const result = Array.isArray(data) ? data : data.data || [];
    setCachedData(resource, options, result);

    return result as T[];
  } catch (error) {
    throw new Error(
      `Failed to fetch ${resource}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Hook for fetching demo data with caching and refetching
 */
export function useDemoData<T extends Record<string, any> = any>(
  resource: ResourceType,
  options?: DemoDataOptions
): DemoDataResult<T> {
  const queryClient = useQueryClient();
  const {
    enabled = true,
    refetchInterval = 0,
    staleTime = DEFAULT_CACHE_DURATION,
  } = options || {};

  const queryKey = getCacheKey(resource, options);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchDemoData<T>(resource, options),
    enabled,
    refetchInterval: refetchInterval || false,
    staleTime,
    gcTime: DEFAULT_CACHE_DURATION * 2,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refetch = async () => {
    // Clear cache for this resource
    const cacheId = getCacheId(resource, options);
    const cache = $demoCache.get();
    const newCache = { ...cache };
    delete newCache[cacheId];
    $demoCache.set(newCache);

    // Refetch
    await queryClient.invalidateQueries({ queryKey });
  };

  const totalCount = (query.data?.length || 0) + (options?.offset || 0);
  const hasNextPage = query.data && query.data.length >= (options?.limit || 20);
  const hasPreviousPage = (options?.offset || 0) > 0;

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch,
    isRefetching: query.isRefetching,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Batch fetch multiple resources
 */
export async function fetchDemoBatch(
  resources: Array<{
    resource: ResourceType;
    options?: DemoDataOptions;
  }>
): Promise<Record<string, any[]>> {
  const results: Record<string, any[]> = {};

  for (const { resource, options } of resources) {
    try {
      results[resource] = await fetchDemoData(resource, options);
    } catch (error) {
      console.error(`Failed to fetch ${resource}:`, error);
      results[resource] = [];
    }
  }

  return results;
}

/**
 * Prefetch data for faster loading
 */
export async function prefetchDemoData(
  queryClient: any,
  resource: ResourceType,
  options?: DemoDataOptions
) {
  const queryKey = getCacheKey(resource, options);

  return queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchDemoData(resource, options),
    staleTime: DEFAULT_CACHE_DURATION,
  });
}

/**
 * Invalidate cache for a resource
 */
export function invalidateDemoCache(queryClient: any, resource: ResourceType) {
  queryClient.invalidateQueries({
    queryKey: ['demo', resource],
  });
  clearDemoCacheForResource(resource);
}

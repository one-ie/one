/**
 * Type definitions for React hooks
 *
 * Matches Convex API ergonomics while being backend-agnostic
 */

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

/**
 * QueryResult - Return type for query hooks (similar to useQuery in Convex)
 *
 * @template T - The data type returned by the query
 */
export interface QueryResult<T> {
  /** Query data (null during loading or on error) */
  data: T | null;

  /** True while query is loading */
  loading: boolean;

  /** Error object if query failed, null otherwise */
  error: Error | null;

  /** Function to manually refetch the query */
  refetch: () => Promise<void>;

  /** True if query is being refetched in background */
  refetching: boolean;
}

/**
 * MutationResult - Return type for mutation hooks (similar to useMutation in Convex)
 *
 * @template TData - The data type returned by the mutation
 * @template TArgs - The argument type for the mutation function
 */
export interface MutationResult<TData = unknown, TArgs = unknown> {
  /** Async mutation function */
  mutate: (args: TArgs) => Promise<TData>;

  /** True while mutation is in progress */
  loading: boolean;

  /** Error object if mutation failed, null otherwise */
  error: Error | null;

  /** Function to clear error state */
  reset: () => void;

  /** The result of the last successful mutation */
  data: TData | null;
}

// ============================================================================
// QUERY OPTIONS
// ============================================================================

/**
 * QueryOptions - Configuration for query hooks
 */
export interface QueryOptions {
  /** Enable/disable the query. Useful for dependent queries */
  enabled?: boolean;

  /** Enable real-time updates (subscription) */
  realtime?: boolean;

  /** Time in milliseconds before data is considered stale */
  staleTime?: number;

  /** Time in milliseconds to cache data */
  cacheTime?: number;

  /** Refetch interval in milliseconds (0 to disable) */
  refetchInterval?: number;

  /** Refetch on window focus */
  refetchOnWindowFocus?: boolean;

  /** Refetch on mount if stale */
  refetchOnMount?: boolean;

  /** Number of retry attempts */
  retry?: number;
}

/**
 * MutationOptions - Configuration for mutation hooks
 */
export interface MutationOptions<TData = unknown, TArgs = unknown> {
  /** Callback fired before mutation starts */
  onMutate?: (args: TArgs) => Promise<void> | void;

  /** Callback fired on successful mutation */
  onSuccess?: (data: TData, args: TArgs) => Promise<void> | void;

  /** Callback fired on mutation error */
  onError?: (error: Error, args: TArgs) => Promise<void> | void;

  /** Callback fired after mutation completes (success or error) */
  onSettled?: (data: TData | null, error: Error | null, args: TArgs) => Promise<void> | void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the data type from a QueryResult
 */
export type ExtractQueryData<T> = T extends QueryResult<infer U> ? U : never;

/**
 * Extract the arguments type from a MutationResult
 */
export type ExtractMutationArgs<T> = T extends MutationResult<any, infer U> ? U : never;

/**
 * Extract the data type from a MutationResult
 */
export type ExtractMutationData<T> = T extends MutationResult<infer U, any> ? U : never;

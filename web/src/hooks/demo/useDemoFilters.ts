/**
 * useDemoFilters - Manage filter state with URL synchronization
 *
 * Provides URL-synced filter state management for demo pages, supporting:
 * - Type filtering (course, blog_post, token, etc.)
 * - Status filtering (draft, active, published, archived)
 * - Search/text filtering with debouncing
 * - View mode switching (list, grid, graph)
 * - Pagination (limit, offset)
 *
 * All state is synchronized with URL query parameters for shareable links.
 *
 * @example
 * ```tsx
 * const { filters, setFilters, search, setSearch, view, setView } = useDemoFilters();
 *
 * return (
 *   <>
 *     <Input
 *       placeholder="Search..."
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *     />
 *
 *     <Select value={filters.type} onValueChange={(type) => setFilters({ type })}>
 *       <SelectItem value="course">Courses</SelectItem>
 *       <SelectItem value="blog_post">Blog Posts</SelectItem>
 *     </Select>
 *
 *     <Select value={view} onValueChange={setView}>
 *       <SelectItem value="list">List</SelectItem>
 *       <SelectItem value="grid">Grid</SelectItem>
 *     </Select>
 *   </>
 * );
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { atom } from 'nanostores';
import { useDebounce } from './useDebounce';

export type ThingType =
  | 'course'
  | 'blog_post'
  | 'token'
  | 'ai_clone'
  | 'product'
  | 'video'
  | 'podcast'
  | 'creator'
  | string;

export type ThingStatus = 'draft' | 'active' | 'published' | 'archived' | 'inactive';

export type ViewMode = 'list' | 'grid' | 'graph' | 'table';

export interface DemoFilters {
  type?: ThingType;
  status?: ThingStatus;
  groupId?: string;
  limit?: number;
  offset?: number;
}

export interface FilterState {
  filters: DemoFilters;
  search: string;
  view: ViewMode;
  debouncedSearch: string;
}

const DEFAULT_LIMIT = 20;

// Nanostores for global filter state
export const $demoFilters = atom<FilterState>({
  filters: {
    limit: DEFAULT_LIMIT,
    offset: 0,
  },
  search: '',
  view: 'list',
  debouncedSearch: '',
});

/**
 * Parse URL query parameters into filter state
 */
function parseUrlFilters(): DemoFilters & { view?: ViewMode } {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  return {
    type: params.get('type') || undefined,
    status: (params.get('status') as ThingStatus) || undefined,
    groupId: params.get('groupId') || undefined,
    limit: params.get('limit') ? parseInt(params.get('limit')!, 10) : DEFAULT_LIMIT,
    offset: params.get('offset') ? parseInt(params.get('offset')!, 10) : 0,
  };
}

/**
 * Serialize filter state to URL query parameters
 */
function serializeUrlFilters(state: FilterState) {
  const params = new URLSearchParams();

  if (state.filters.type) params.set('type', state.filters.type);
  if (state.filters.status) params.set('status', state.filters.status);
  if (state.filters.groupId) params.set('groupId', state.filters.groupId);
  if (state.filters.limit && state.filters.limit !== DEFAULT_LIMIT) {
    params.set('limit', state.filters.limit.toString());
  }
  if (state.filters.offset && state.filters.offset > 0) {
    params.set('offset', state.filters.offset.toString());
  }
  if (state.search) params.set('search', state.search);
  if (state.view && state.view !== 'list') params.set('view', state.view);

  const queryString = params.toString();
  if (typeof window !== 'undefined') {
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, '', newUrl);
  }
}

/**
 * Initialize filters from URL on mount
 */
function initializeFiltersFromUrl() {
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const state: FilterState = {
    filters: {
      type: (params.get('type') as ThingType) || undefined,
      status: (params.get('status') as ThingStatus) || undefined,
      groupId: params.get('groupId') || undefined,
      limit: params.get('limit') ? parseInt(params.get('limit')!, 10) : DEFAULT_LIMIT,
      offset: params.get('offset') ? parseInt(params.get('offset')!, 10) : 0,
    },
    search: params.get('search') || '',
    view: (params.get('view') as ViewMode) || 'list',
    debouncedSearch: params.get('search') || '',
  };

  $demoFilters.set(state);
}

/**
 * React hook for demo filters with URL synchronization
 */
export function useDemoFilters() {
  const [state, setState] = useState<FilterState>($demoFilters.get());
  const debouncedSearch = useDebounce(state.search, 300);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = $demoFilters.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    initializeFiltersFromUrl();
  }, []);

  // Sync to URL when filters change
  useEffect(() => {
    serializeUrlFilters(state);
  }, [state]);

  // Update debounced search in state
  useEffect(() => {
    const current = $demoFilters.get();
    if (current.debouncedSearch !== debouncedSearch) {
      $demoFilters.set({
        ...current,
        debouncedSearch,
      });
    }
  }, [debouncedSearch]);

  // Setters
  const setFilters = useCallback((updates: Partial<DemoFilters>) => {
    const current = $demoFilters.get();
    $demoFilters.set({
      ...current,
      filters: {
        ...current.filters,
        ...updates,
        offset: 0, // Reset pagination on filter change
      },
    });
  }, []);

  const setSearch = useCallback((search: string) => {
    const current = $demoFilters.get();
    $demoFilters.set({
      ...current,
      search,
      filters: {
        ...current.filters,
        offset: 0, // Reset pagination on search
      },
    });
  }, []);

  const setView = useCallback((view: ViewMode) => {
    const current = $demoFilters.get();
    $demoFilters.set({
      ...current,
      view,
    });
  }, []);

  const setType = useCallback((type: ThingType | undefined) => {
    setFilters({ type });
  }, [setFilters]);

  const setStatus = useCallback((status: ThingStatus | undefined) => {
    setFilters({ status });
  }, [setFilters]);

  const setGroupId = useCallback((groupId: string | undefined) => {
    setFilters({ groupId });
  }, [setFilters]);

  const setPagination = useCallback(
    (limit?: number, offset?: number) => {
      const current = $demoFilters.get();
      $demoFilters.set({
        ...current,
        filters: {
          ...current.filters,
          limit: limit ?? current.filters.limit,
          offset: offset ?? 0,
        },
      });
    },
    []
  );

  const nextPage = useCallback(() => {
    const { filters } = $demoFilters.get();
    setPagination(
      filters.limit,
      (filters.offset || 0) + (filters.limit || DEFAULT_LIMIT)
    );
  }, [setPagination]);

  const previousPage = useCallback(() => {
    const { filters } = $demoFilters.get();
    const newOffset = Math.max(0, (filters.offset || 0) - (filters.limit || DEFAULT_LIMIT));
    setPagination(filters.limit, newOffset);
  }, [setPagination]);

  const resetFilters = useCallback(() => {
    $demoFilters.set({
      filters: {
        limit: DEFAULT_LIMIT,
        offset: 0,
      },
      search: '',
      view: 'list',
      debouncedSearch: '',
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearch('');
  }, [setSearch]);

  return {
    // Current state
    filters: state.filters,
    search: state.search,
    debouncedSearch: state.debouncedSearch,
    view: state.view,

    // Filter setters
    setFilters,
    setType,
    setStatus,
    setGroupId,
    setSearch,
    setView,

    // Pagination
    setPagination,
    nextPage,
    previousPage,
    currentPage: Math.floor((state.filters.offset || 0) / (state.filters.limit || DEFAULT_LIMIT)) + 1,
    pageSize: state.filters.limit || DEFAULT_LIMIT,
    offset: state.filters.offset || 0,

    // Utilities
    resetFilters,
    clearSearch,
    hasActiveFilters: !!(state.filters.type || state.filters.status || state.search),
    shareableUrl: typeof window !== 'undefined' ? window.location.href : '',
  };
}

/**
 * Get current filter state without subscribing to updates
 */
export function getDemoFilters(): FilterState {
  return $demoFilters.get();
}

/**
 * Initialize filters on app startup
 */
export function initializeDemoFilters() {
  initializeFiltersFromUrl();
}

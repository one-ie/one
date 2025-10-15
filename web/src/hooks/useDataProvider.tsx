/**
 * DataProvider Context and Hook
 *
 * Provides access to the DataProvider instance throughout the React component tree.
 * Uses React Context for dependency injection similar to Convex's ConvexProvider.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DataProvider } from '@/providers/DataProvider';

// ============================================================================
// CONTEXT SETUP
// ============================================================================

const DataProviderContext = createContext<DataProvider | null>(null);

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Default QueryClient configuration optimized for real-time data
 * matching Convex's behavior
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // Data is fresh for 5 seconds
      gcTime: 300000, // Cache for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus (can enable if needed)
      retry: 1, // Retry failed queries once
      refetchOnMount: true, // Refetch on mount if stale
    },
    mutations: {
      retry: 0, // Don't retry mutations automatically
    },
  },
});

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface DataProviderProviderProps {
  provider: DataProvider;
  children: ReactNode;
}

/**
 * DataProviderProvider - Top-level provider component
 *
 * Wraps the app and provides DataProvider instance to all hooks.
 * Also sets up React Query for state management.
 *
 * @example
 * ```tsx
 * import { ConvexProvider } from '@/providers/convex/ConvexProvider';
 * import { DataProviderProvider } from '@/hooks/useDataProvider';
 *
 * const convexProvider = new ConvexProvider(convexClient);
 *
 * <DataProviderProvider provider={convexProvider}>
 *   <App />
 * </DataProviderProvider>
 * ```
 */
export function DataProviderProvider({ provider, children }: DataProviderProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProviderContext.Provider value={provider}>
        {children}
      </DataProviderContext.Provider>
    </QueryClientProvider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useDataProvider - Access the DataProvider instance
 *
 * Returns the current DataProvider instance from context.
 * Throws if used outside DataProviderProvider.
 *
 * @example
 * ```tsx
 * const provider = useDataProvider();
 * const result = await Effect.runPromise(provider.things.get(id));
 * ```
 */
export function useDataProvider(): DataProvider {
  const provider = useContext(DataProviderContext);

  if (!provider) {
    throw new Error(
      'useDataProvider must be used within a DataProviderProvider. ' +
        'Make sure to wrap your app with <DataProviderProvider provider={...}>.'
    );
  }

  return provider;
}

/**
 * Type guard to check if DataProvider is available
 */
export function hasDataProvider(provider: DataProvider | null): provider is DataProvider {
  return provider !== null;
}

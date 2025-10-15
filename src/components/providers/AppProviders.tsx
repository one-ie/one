/**
 * AppProviders - Root provider wrapper for the entire application
 *
 * Sets up all necessary providers:
 * - DataProviderProvider (backend-agnostic data access)
 * - Convex client (real-time database)
 */

import { type ReactNode, useMemo } from 'react';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import { DataProviderProvider } from '@/hooks/useDataProvider';
import { createConvexProvider } from '@/providers/ConvexProvider';

export interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders - Wraps app with all necessary providers
 *
 * Usage in Astro:
 * ```astro
 * <AppProviders client:only="react">
 *   <YourComponent client:load />
 * </AppProviders>
 * ```
 */
export function AppProviders({ children }: AppProvidersProps) {
  // Initialize Convex client inside component (client-side only)
  const convexClient = useMemo(() => {
    const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      throw new Error('PUBLIC_CONVEX_URL environment variable is not set');
    }

    return new ConvexReactClient(convexUrl);
  }, []);

  // Create ConvexProvider instance for DataProvider
  const convexDataProvider = useMemo(() => {
    return createConvexProvider({ client: convexClient });
  }, [convexClient]);

  return (
    <ConvexProvider client={convexClient}>
      <DataProviderProvider provider={convexDataProvider}>
        {children}
      </DataProviderProvider>
    </ConvexProvider>
  );
}

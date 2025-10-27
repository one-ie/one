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
  convexUrl?: string; // Allow passing URL as prop
}

/**
 * AppProviders - Wraps app with all necessary providers
 *
 * Usage in Astro:
 * ```astro
 * <AppProviders convexUrl={import.meta.env.PUBLIC_CONVEX_URL} client:only="react">
 *   <YourComponent />
 * </AppProviders>
 * ```
 */
export function AppProviders({ children, convexUrl: convexUrlProp }: AppProvidersProps) {
  // Initialize Convex client inside component (client-side only)
  const convexClient = useMemo(() => {
    const convexUrl = convexUrlProp || import.meta.env.PUBLIC_CONVEX_URL;

    console.log('[AppProviders] Initializing with Convex URL:', convexUrl);

    if (!convexUrl) {
      console.error('[AppProviders] PUBLIC_CONVEX_URL is not set!');
      throw new Error('PUBLIC_CONVEX_URL environment variable is not set. Pass it as convexUrl prop.');
    }

    console.log('[AppProviders] Creating ConvexReactClient...');
    return new ConvexReactClient(convexUrl);
  }, [convexUrlProp]);

  // Create ConvexProvider instance for DataProvider
  const convexDataProvider = useMemo(() => {
    console.log('[AppProviders] Creating ConvexProvider instance...');
    const provider = createConvexProvider({ client: convexClient });
    console.log('[AppProviders] ConvexProvider created:', !!provider);
    return provider;
  }, [convexClient]);

  console.log('[AppProviders] Rendering providers...');

  return (
    <ConvexProvider client={convexClient}>
      <DataProviderProvider provider={convexDataProvider}>
        {children}
      </DataProviderProvider>
    </ConvexProvider>
  );
}

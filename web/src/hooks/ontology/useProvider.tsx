/**
 * Provider Context Hook
 *
 * Provides access to the current DataProvider instance for ontology operations.
 * Works with any backend implementation (Convex, WordPress, Notion, Stripe, etc.)
 *
 * @example
 * ```tsx
 * import { useProvider } from '@/hooks/ontology/useProvider';
 *
 * function MyComponent() {
 *   const provider = useProvider();
 *   const isAvailable = !!provider;
 *
 *   if (!isAvailable) {
 *     return <div>Backend unavailable - using local data</div>;
 *   }
 *
 *   return <div>Connected to {provider.name}</div>;
 * }
 * ```
 */

import { createContext, useContext } from 'react';

/**
 * Minimal provider interface for type checking
 * Full interface defined in lib/ontology/types.ts
 */
export interface IDataProvider {
  name: string;
  isAvailable: boolean;
  supportsGroups?: boolean;
  supportsPeople?: boolean;
  supportsRealtime?: boolean;
}

/**
 * Provider context for injecting different backends
 */
const ProviderContext = createContext<IDataProvider | null>(null);

/**
 * Provider for wrapping the app
 */
export function DataProviderProvider({
  provider,
  children,
}: {
  provider: IDataProvider | null;
  children: React.ReactNode;
}) {
  return (
    <ProviderContext.Provider value={provider}>
      {children}
    </ProviderContext.Provider>
  );
}

/**
 * Hook to access current provider instance
 *
 * Returns null if no provider is configured (frontend-only mode).
 * Always returns non-null for Convex deployments.
 *
 * @returns Current provider or null if not available
 *
 * @throws Error if called outside DataProviderProvider
 *
 * @example
 * ```tsx
 * const provider = useProvider();
 *
 * // Check provider capabilities
 * if (provider?.supportsRealtime) {
 *   // Can use WebSocket subscriptions
 * }
 *
 * // Fall back to local-only mode
 * if (!provider) {
 *   return <LocalOnlyUI />;
 * }
 * ```
 */
export function useProvider(): IDataProvider | null {
  const context = useContext(ProviderContext);

  if (context === undefined) {
    throw new Error(
      'useProvider must be called within DataProviderProvider. ' +
        'Wrap your app with <DataProviderProvider provider={provider}>'
    );
  }

  return context;
}

/**
 * Hook to check if provider is available
 *
 * Useful for conditional rendering based on backend availability.
 *
 * @returns true if provider is available and connected
 *
 * @example
 * ```tsx
 * const isOnline = useIsProviderAvailable();
 *
 * return (
 *   <div>
 *     Status: {isOnline ? 'Online' : 'Offline'}
 *   </div>
 * );
 * ```
 */
export function useIsProviderAvailable(): boolean {
  const provider = useProvider();
  return !!provider?.isAvailable;
}

/**
 * Hook to check specific provider capabilities
 *
 * @param capability - Capability to check ('groups', 'people', 'realtime')
 * @returns true if provider supports the capability
 *
 * @example
 * ```tsx
 * const supportsGroups = useProviderCapability('groups');
 *
 * if (!supportsGroups) {
 *   return <SingleGroupUI />;
 * }
 * ```
 */
export function useProviderCapability(
  capability: 'groups' | 'people' | 'realtime'
): boolean {
  const provider = useProvider();

  if (!provider) return false;

  switch (capability) {
    case 'groups':
      return provider.supportsGroups !== false;
    case 'people':
      return provider.supportsPeople !== false;
    case 'realtime':
      return provider.supportsRealtime !== false;
    default:
      return false;
  }
}

/**
 * Hook to get provider name (for debugging/display)
 *
 * @returns Provider name (e.g., 'Convex', 'Notion', 'WordPress')
 *
 * @example
 * ```tsx
 * const providerName = useProviderName();
 * console.log(`Using ${providerName} backend`);
 * ```
 */
export function useProviderName(): string | null {
  const provider = useProvider();
  return provider?.name || null;
}

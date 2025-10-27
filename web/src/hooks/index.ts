/**
 * Backend-Agnostic React Hooks
 *
 * Convex-style API for accessing the 6-dimension ontology through any backend provider.
 *
 * @example
 * ```tsx
 * import {
 *   DataProviderProvider,
 *   useThings,
 *   useCreateThing,
 *   useConnections,
 *   useLogEvent
 * } from '@/hooks';
 *
 * function App() {
 *   return (
 *     <DataProviderProvider provider={convexProvider}>
 *       <MyComponent />
 *     </DataProviderProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { data: courses, loading } = useThings({ type: 'course' });
 *   const { mutate: createCourse } = useCreateThing();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {courses?.map(course => <div key={course._id}>{course.name}</div>)}
 *       <button onClick={() => createCourse({
 *         type: 'course',
 *         name: 'New Course',
 *         properties: {}
 *       })}>
 *         Create Course
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// PROVIDER & CONTEXT
// ============================================================================

export { DataProviderProvider, useDataProvider, queryClient } from './useDataProvider';

// ============================================================================
// TYPES
// ============================================================================

export type {
  QueryResult,
  MutationResult,
  QueryOptions,
  MutationOptions,
  ExtractQueryData,
  ExtractMutationArgs,
  ExtractMutationData,
} from './types';

// ============================================================================
// THINGS DIMENSION
// ============================================================================

export {
  // Query hooks
  useThings,
  useThing,

  // Mutation hooks
  useCreateThing,
  useUpdateThing,
  useDeleteThing,

  // Type-specific hooks
  useCourses,
  useAgents,
  useBlogPosts,
  useTokens,
} from './useThings';

// ============================================================================
// CONNECTIONS DIMENSION
// ============================================================================

export {
  // Query hooks
  useConnections,
  useConnection,

  // Mutation hooks
  useCreateConnection,
  useDeleteConnection,

  // Relationship-specific hooks
  useOwnedThings,
  useEnrollments,
  useFollowing,
  useTokenHoldings,
} from './useConnections';

// ============================================================================
// EVENTS DIMENSION
// ============================================================================

export {
  // Query hooks
  useEvents,
  useEvent,

  // Mutation hooks
  useLogEvent,

  // Convenience hooks
  useAuditTrail,
  useActivityFeed,
  useRecentEvents,
} from './useEvents';

// ============================================================================
// KNOWLEDGE DIMENSION
// ============================================================================

export {
  // Query hooks
  useKnowledge,
  useSearch,

  // Mutation hooks
  useCreateKnowledge,
  useLinkKnowledge,

  // Convenience hooks
  useLabels,
  useThingKnowledge,
} from './useKnowledge';

// ============================================================================
// ORGANIZATIONS DIMENSION
// ============================================================================

export {
  // Query hooks
  useOrganization,
  useOrganizations,

  // Mutation hooks
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,

  // Convenience hooks
  useCurrentOrganization,
  useOrganizationMembers,
} from './useOrganizations';

// ============================================================================
// PEOPLE DIMENSION
// ============================================================================

export {
  // Query hooks
  useCurrentUser,
  usePerson,
  usePeople,

  // Mutation hooks
  useUpdatePerson,
  useInvitePerson,

  // Role & permission helpers
  useHasPermission,
  useHasRole,
} from './usePeople';

// ============================================================================
// AUTH DIMENSION
// ============================================================================

export {
  // Authentication hooks
  useLogin,
  useSignup,
  useLogout,
  useMagicLinkAuth,

  // Password management
  usePasswordReset,
  usePasswordResetComplete,

  // Email verification
  useVerifyEmail,

  // Two-factor authentication
  use2FA,
} from './useAuth';

// ============================================================================
// ONTOLOGY DISCOVERY
// ============================================================================

export {
  // Complete ontology
  useOntology,
  useOntologyMetadata,

  // Feature detection
  useHasFeature,
  useEnabledFeatures,
  useFeatureBreakdown,

  // Type discovery
  useThingTypes,
  useConnectionTypes,
  useEventTypes,
} from './useOntology';

// ============================================================================
// DEMO INFRASTRUCTURE
// ============================================================================

export {
  // Connection monitoring
  useBackendConnection,
  getConnectionState,
  checkBackendHealth,
  initializeBackendConnection,
  cleanupBackendConnection,
  // Data fetching
  useDemoData,
  fetchDemoBatch,
  prefetchDemoData,
  invalidateDemoCache,
  clearDemoCache,
  clearDemoCacheForResource,
  // Mutations
  useDemoCreateMutation,
  useDemoUpdateMutation,
  useDemoDeleteMutation,
  useDemoCustomMutation,
  // Filters
  useDemoFilters,
  getDemoFilters,
  initializeDemoFilters,
  // Utilities
  useDebounce,
  debounce,
  createDebounce,
  // Types
  type ConnectionStatus,
  type ConnectionState,
  type ResourceType,
  type DemoDataOptions,
  type DemoDataResult,
  type MutationMethod,
  type DemoMutationOptions,
  type DemoMutationResult,
  type ThingType,
  type ThingStatus,
  type ViewMode,
  type DemoFilters,
  type FilterState,
} from './demo';

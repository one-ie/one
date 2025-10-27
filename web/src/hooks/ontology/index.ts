/**
 * Ontology Hooks - Complete barrel export
 *
 * Import any ontology hook from '@/hooks/ontology'
 *
 * @example
 * ```tsx
 * import {
 *   useProvider,
 *   useGroup,
 *   useCurrentUser,
 *   useThings,
 *   useConnections,
 *   useEvents,
 *   useSearch,
 *   isFeatureEnabled
 * } from '@/hooks/ontology';
 * ```
 */

// Provider
export {
  type IDataProvider,
  DataProviderProvider,
  useProvider,
  useIsProviderAvailable,
  useProviderCapability,
  useProviderName,
} from './useProvider';

// Groups
export {
  type GroupType,
  type GroupPlan,
  type Group,
  type CreateGroupInput,
  type UpdateGroupInput,
  type GroupFilter,
  useGroup,
  useGroups,
  useCurrentGroup,
  useChildGroups,
} from './useGroup';

// People
export {
  type UserRole,
  type Person,
  type CreatePersonInput,
  usePerson,
  useCurrentUser,
  useHasRole,
  useCanAccess,
  useGroupMembers,
  useUserProfile,
} from './usePerson';

// Things
export {
  type Thing,
  type CreateThingInput,
  type UpdateThingInput,
  type ThingFilter,
  useThing,
  useThings,
  useThingDetail,
  useThingsByType,
  useThingSearch,
  usePublishedThings,
  useMyThings,
} from './useThing';

// Connections
export {
  type ConnectionType,
  type Connection,
  type CreateConnectionInput,
  type ConnectionFilter,
  useConnection,
  useConnections,
  useRelatedEntities,
  useIsConnected,
  useOwnedEntities,
  useFollowers,
  useFollowing,
  useEnrollments,
  useUserEnrollments,
} from './useConnection';

// Events
export {
  type EventType,
  type Event,
  type RecordEventInput,
  type EventFilter,
  useEvent,
  useEvents,
  useActivityFeed,
  useAuditTrail,
  useUserHistory,
  useEventsByType,
  useEventCount,
  useTimeline,
  useEventStream,
} from './useEvent';

// Knowledge & Search
export {
  type LabelCategory,
  type Label,
  type SearchResult,
  type SearchOptions,
  useSearch,
  useSearchByType,
  useLabels,
  useLabelsByCategory,
  useEntityLabels,
  useEntitiesByLabel,
  useSimilarEntities,
  useFacetedSearch,
  useTrendingEntities,
  useRecommendations,
} from './useSearch';

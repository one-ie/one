/**
 * Ontology Services Index
 *
 * Central export point for all 6-dimension ontology services.
 * Each service is an Effect-TS module that provides type-safe operations
 * for one dimension of the ontology.
 *
 * Services are backend-agnostic through provider interfaces:
 * - DataProvider implementations handle concrete persistence
 * - Services provide business logic and validation
 * - Frontend hooks compose services for UI
 *
 * Usage:
 * ```ts
 * import { GroupsService, ThingsService, PeopleService } from '@/lib/ontology/services';
 *
 * // Service methods return Effect computations
 * const program = Effect.gen(function* () {
 *   const groupsService = yield* GroupsService;
 *   const groups = yield* groupsService.list();
 *   return groups;
 * });
 * ```
 */

// ============================================================================
// DIMENSION 1: GROUPS (Multi-Tenant Isolation)
// ============================================================================
export { GroupsService } from './groups';
export type {
  IGroupsProvider,
  Group,
  GroupType,
  GroupPlan,
  GroupFilter,
  CreateGroupInput,
  UpdateGroupInput,
  GroupError,
  GroupHierarchy,
} from './groups';

// ============================================================================
// DIMENSION 2: PEOPLE (Authorization & Governance)
// ============================================================================
export { PeopleService } from './people';
export type {
  IPeopleProvider,
  Person,
  Role,
  PeopleFilter,
  CreatePersonInput,
  UpdatePersonInput,
  PeopleError,
} from './people';
export { canPerformAction, canManageUsers, canManageOrganization, canViewSensitiveData } from './people';

// ============================================================================
// DIMENSION 3: THINGS (Entities)
// ============================================================================
export { ThingsService } from './things';
export type {
  IThingsProvider,
  Thing,
  ThingStatus,
  ThingFilter,
  CreateThingInput,
  UpdateThingInput,
  ThingError,
} from './things';

// ============================================================================
// DIMENSION 4: CONNECTIONS (Relationships)
// ============================================================================
export { ConnectionsService } from './connections';
export type {
  IConnectionsProvider,
  Connection,
  ConnectionFilter,
  CreateConnectionInput,
  UpdateConnectionInput,
  ConnectionError,
} from './connections';

// ============================================================================
// DIMENSION 5: EVENTS (Actions & Audit Trail)
// ============================================================================
export { EventsService } from './events';
export type {
  IEventsProvider,
  Event,
  EventFilter,
  CreateEventInput,
  EventError,
} from './events';

// ============================================================================
// DIMENSION 6: KNOWLEDGE (RAG & Semantic Search)
// ============================================================================
export { KnowledgeService } from './knowledge';
export type {
  IKnowledgeProvider,
  Knowledge,
  KnowledgeType,
  KnowledgeFilter,
  CreateKnowledgeInput,
  UpdateKnowledgeInput,
  KnowledgeError,
  ChunkOptions,
  SearchResult,
  ChunkResult,
} from './knowledge';

// ============================================================================
// TYPE ALIASES FOR COMMON PATTERNS
// ============================================================================

/**
 * All service provider interfaces combined
 * Used for dependency injection and provider implementations
 */
export interface IOntologyProviders {
  groups: import('./groups').IGroupsProvider;
  people: import('./people').IPeopleProvider;
  things: import('./things').IThingsProvider;
  connections: import('./connections').IConnectionsProvider;
  events: import('./events').IEventsProvider;
  knowledge: import('./knowledge').IKnowledgeProvider;
}

/**
 * All error types from all services
 * Use discriminated union to handle errors from any service
 */
export type OntologyError =
  | import('./groups').GroupError
  | import('./people').PeopleError
  | import('./things').ThingError
  | import('./connections').ConnectionError
  | import('./events').EventError
  | import('./knowledge').KnowledgeError;

/**
 * Common filter type for all services
 */
export type OntologyFilter =
  | import('./groups').GroupFilter
  | import('./people').PeopleFilter
  | import('./things').ThingFilter
  | import('./connections').ConnectionFilter
  | import('./events').EventFilter
  | import('./knowledge').KnowledgeFilter;

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * # Ontology Services Architecture
 *
 * The 6 services implement the 6-dimension ontology with Effect-TS:
 *
 * ```
 * ┌─────────────────────────────────────────────────┐
 * │  FRONTEND LAYER (React hooks)                   │
 * │  useGroups, useThings, usePeople, etc.          │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 *                   ↓ (Effect computations)
 * ┌─────────────────────────────────────────────────┐
 * │  SERVICES LAYER (Business Logic)                │
 * │  GroupsService, ThingsService, PeopleService... │
 * │  - Validation                                   │
 * │  - Type-safe error handling                     │
 * │  - Provider-agnostic operations                 │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 *                   ↓ (Via IxxxProvider interface)
 * ┌─────────────────────────────────────────────────┐
 * │  PROVIDER LAYER (Data Access)                   │
 * │  ConvexProvider, NotionProvider, etc.           │
 * │  - Actual database/API calls                    │
 * │  - Query/mutation execution                     │
 * │  - Error translation                            │
 * └─────────────────────────────────────────────────┘
 * ```
 *
 * ## Key Patterns
 *
 * ### 1. Service Definition
 * Each service extends Effect.Service with a single dependencies list:
 *
 * ```typescript
 * export class GroupsService extends Effect.Service<GroupsService>()(
 *   'GroupsService',
 *   {
 *     effect: Effect.gen(function* () {
 *       // Methods yield from provider
 *       const provider = yield* Effect.Tag<IGroupsProvider>();
 *       return {
 *         list: (filter) => ... // Uses provider
 *       };
 *     }),
 *     dependencies: [Effect.Tag<IGroupsProvider>()],
 *   }
 * ) {}
 * ```
 *
 * ### 2. Error Handling
 * All errors are tagged unions with _tag discriminator:
 *
 * ```typescript
 * export type GroupError =
 *   | { _tag: 'ValidationError'; message: string; field?: string }
 *   | { _tag: 'NotFoundError'; id: string }
 *   | { _tag: 'ProviderError'; message: string; originalError?: unknown };
 * ```
 *
 * ### 3. Operation Pattern
 * Operations validate inputs then delegate to provider:
 *
 * ```typescript
 * const list: (filter?: GroupFilter) => Effect<Group[], GroupError> =
 *   (filter) => Effect.gen(function* () {
 *     // 1. Validate
 *     // 2. Call provider
 *     // 3. Handle errors
 *     // 4. Return result
 *   });
 * ```
 *
 * ## Provider Contract
 *
 * Each service defines a provider interface (IxxxProvider) that:
 * - Lists all operations the provider must implement
 * - Uses Promise-based API (handlers do async/await)
 * - Returns domain types (not raw DB types)
 * - Can throw errors for exceptional cases
 *
 * Examples:
 * - ConvexProvider: Uses useQuery/useMutation hooks
 * - NotionProvider: Uses Notion SDK
 * - HTTPProvider: Makes REST API calls
 * - MarkdownProvider: Reads .md files
 *
 * ## Composition Pattern
 *
 * Services can compose other services using Effect dependencies:
 *
 * ```typescript
 * class UserWithGroupService extends Effect.Service<...>()(..., {
 *   effect: Effect.gen(function* () {
 *     const peopleService = yield* PeopleService;
 *     const groupsService = yield* GroupsService;
 *
 *     return {
 *       getUserWithGroup: (userId) => Effect.gen(function* () {
 *         const user = yield* peopleService.get(userId);
 *         const group = yield* groupsService.get(user.groupId);
 *         return { user, group };
 *       })
 *     };
 *   }),
 *   dependencies: [PeopleService.Default, GroupsService.Default],
 * }) {}
 * ```
 *
 * ## Testing Pattern
 *
 * Mock providers for unit testing:
 *
 * ```typescript
 * const MockProvider = Layer.succeed(Effect.Tag<IGroupsProvider>(), {
 *   list: () => Promise.resolve([...test data...]),
 *   get: (id) => Promise.resolve(testGroup),
 *   // ... other methods
 * });
 *
 * // Use in test
 * Effect.provide(service.list(), MockProvider);
 * ```
 */

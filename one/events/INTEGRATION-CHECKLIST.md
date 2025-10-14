# Integration Implementation Checklist

**Integration Specialist Deliverable**
**Date:** 2025-10-13
**Purpose:** Practical step-by-step checklist for executing the integration orchestration plan

---

## Pre-Migration Checklist

### ✅ Documentation Review

- [ ] Read `/INTEGRATION-ORCHESTRATION.md` (complete plan)
- [ ] Read `/INTEGRATION-SUMMARY.md` (executive overview)
- [ ] Read `/INTEGRATION-ARCHITECTURE.md` (visual guide)
- [ ] Read `/one/knowledge/ontology.md` (6-dimension ontology)
- [ ] Read `/one/connections/workflow.md` (development workflow)
- [ ] Read `/frontend/AGENTS.md` (Convex patterns)

### ✅ Environment Setup

- [ ] Node.js 18+ installed
- [ ] Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- [ ] Convex CLI installed (`npm install -g convex`)
- [ ] Wrangler CLI installed (`npm install -g wrangler`)
- [ ] Git repository cloned
- [ ] Dependencies installed (`bun install` in `/frontend` and `/backend`)

### ✅ Backend Validation

- [ ] Convex deployment active (`npx convex status`)
- [ ] Schema deployed (`/backend/convex/schema.ts`)
- [ ] Better Auth configured (`/backend/convex/auth.ts`)
- [ ] Resend email component configured
- [ ] Rate limiter configured
- [ ] Environment variables set (`.env.local` in `/backend`)

### ✅ Frontend Validation

- [ ] Astro 5 running (`bun run dev`)
- [ ] React 19 components working
- [ ] Tailwind CSS v4 configured
- [ ] shadcn/ui components installed
- [ ] Auth tests passing (`bun test test/auth`)
- [ ] Environment variables set (`.env.local` in `/frontend`)

### ✅ Test Baseline

- [ ] All auth tests pass (50+ test cases)
- [ ] E2E tests pass (user journeys)
- [ ] Build succeeds (`bun run build`)
- [ ] Type checking passes (`bunx astro check`)
- [ ] No console errors in development

---

## Phase 1: Interface Definition (Week 1)

### Day 1: Define Core Interface

**File:** `/frontend/src/lib/providers/interface.ts`

- [ ] Create `IDataProvider` interface
- [ ] Define 6 dimension operation interfaces:
  - [ ] `OrganizationOperations`
  - [ ] `PeopleOperations`
  - [ ] `ThingOperations`
  - [ ] `ConnectionOperations`
  - [ ] `EventOperations`
  - [ ] `KnowledgeOperations`
- [ ] Add metadata fields (`name`, `supportsRealtime`, `capabilities`)
- [ ] Add lifecycle methods (`initialize()`, `disconnect()`)
- [ ] Add optional `subscribe()` method for real-time

**Tests:**

```bash
# Verify interface compiles
bunx tsc --noEmit src/lib/providers/interface.ts
```

**Validation:**

- [ ] Interface compiles without errors
- [ ] All method signatures defined
- [ ] Return types are serializable
- [ ] No `any` types (except in metadata)

### Day 2-3: Define Operation Types

**Files:** `/frontend/src/lib/providers/types/*.ts`

- [ ] Create `OrganizationTypes.ts`
  - [ ] `Organization` interface
  - [ ] `CreateOrgArgs` interface
  - [ ] `ListOrgsArgs` interface
- [ ] Create `ThingTypes.ts`
  - [ ] `Thing` interface (matches backend schema)
  - [ ] `CreateThingArgs` interface
  - [ ] `ThingType` enum (66 types)
  - [ ] `ThingStatus` enum (draft, active, published, archived)
- [ ] Create `ConnectionTypes.ts`
  - [ ] `Connection` interface
  - [ ] `ConnectionType` enum (25 types)
  - [ ] `CreateConnectionArgs` interface
- [ ] Create `EventTypes.ts`
  - [ ] `Event` interface
  - [ ] `EventType` enum (67 types)
  - [ ] `CreateEventArgs` interface
- [ ] Create `KnowledgeTypes.ts`
  - [ ] `KnowledgeItem` interface
  - [ ] `KnowledgeType` enum
  - [ ] `SearchArgs` interface

**Tests:**

```bash
# Verify all types compile
bunx tsc --noEmit src/lib/providers/types/**/*.ts
```

**Validation:**

- [ ] All types match backend schema
- [ ] Types are exported correctly
- [ ] No circular dependencies
- [ ] Documentation comments added

### Day 4: Review & Iteration

**Review Checklist:**

- [ ] Backend Specialist reviews interface
- [ ] Frontend Specialist reviews types
- [ ] Integration Specialist validates ontology alignment
- [ ] All 6 dimensions covered
- [ ] Interface is provider-agnostic

**Actions:**

- [ ] Address review feedback
- [ ] Update interface based on team input
- [ ] Document any decisions in comments

### Day 5: Documentation

- [ ] Update `/frontend/AGENTS.md` with provider patterns
- [ ] Add interface usage examples
- [ ] Document provider lifecycle
- [ ] Create migration guide

**Deliverable:** ✅ IDataProvider interface complete and reviewed

---

## Phase 2: ConvexProvider (Week 2)

### Day 1: Basic Implementation

**File:** `/frontend/src/lib/providers/convex.ts`

- [ ] Create `ConvexProvider` class
- [ ] Implement `IDataProvider` interface
- [ ] Add constructor (accepts `ConvexReactClient`)
- [ ] Set metadata (`name: "convex"`, `supportsRealtime: true`)
- [ ] Implement `initialize()` and `disconnect()`

```typescript
export class ConvexProvider implements IDataProvider {
  constructor(private client: ConvexReactClient) {}

  name = "convex";
  supportsRealtime = true;
  capabilities = ["organizations", "people", "things", "connections", "events", "knowledge"];

  async initialize() {
    // No initialization needed for Convex
  }

  async disconnect() {
    // Convex client manages its own lifecycle
  }
}
```

**Tests:**

```bash
# Create test file
touch test/integration/providers/convex.test.ts
```

**Validation:**

- [ ] Class compiles
- [ ] Implements all interface methods
- [ ] No TypeScript errors

### Day 2-3: Implement 6 Dimensions

**Organizations:**

- [ ] `list(args)` → `api.queries.organizations.list`
- [ ] `get(args)` → `api.queries.organizations.get`
- [ ] `create(args)` → `api.mutations.organizations.create`
- [ ] `update(args)` → `api.mutations.organizations.update`
- [ ] `delete(args)` → `api.mutations.organizations.delete`

**People:**

- [ ] `getCurrentUser()` → `api.queries.auth.getCurrentUser`
- [ ] `verifyPermissions(args)` → `api.queries.auth.verifyPermissions`
- [ ] `updateProfile(args)` → `api.mutations.auth.updateProfile`

**Things:**

- [ ] `list(args)` → `api.queries.things.list`
- [ ] `get(id)` → `api.queries.things.get`
- [ ] `create(args)` → `api.mutations.things.create`
- [ ] `update(id, updates)` → `api.mutations.things.update`
- [ ] `delete(id)` → `api.mutations.things.delete`

**Connections:**

- [ ] `list(args)` → `api.queries.connections.list`
- [ ] `create(args)` → `api.mutations.connections.create`
- [ ] `delete(id)` → `api.mutations.connections.delete`
- [ ] `count(args)` → `api.queries.connections.count`

**Events:**

- [ ] `listForThing(args)` → `api.queries.events.listForThing`
- [ ] `listForActor(args)` → `api.queries.events.listForActor`
- [ ] `create(args)` → `api.mutations.events.create`

**Knowledge:**

- [ ] `search(args)` → `api.queries.knowledge.search`
- [ ] `embed(text)` → `api.actions.knowledge.embed`
- [ ] `linkToThing(args)` → `api.mutations.knowledge.linkToThing`

**Validation:**

- [ ] All 6 dimensions implemented
- [ ] Methods call correct backend functions
- [ ] Error handling in place (try/catch)
- [ ] Return types match interface

### Day 4: Error Handling

**File:** `/frontend/src/lib/providers/errors.ts`

- [ ] Create `ProviderError` class
  ```typescript
  export class ProviderError extends Error {
    constructor(
      message: string,
      public code: string,
      public provider: string,
      public retryable: boolean = false,
      public details?: any
    ) {
      super(message);
      this.name = "ProviderError";
    }
  }
  ```
- [ ] Add error transformation in ConvexProvider
  ```typescript
  try {
    return await this.client.query(api.queries.organizations.get, args);
  } catch (error) {
    throw new ProviderError(
      error.message,
      "CONVEX_ERROR",
      "convex",
      true, // retryable
      error
    );
  }
  ```

**Validation:**

- [ ] All operations wrapped in try/catch
- [ ] Errors are transformed to `ProviderError`
- [ ] Retryable flag set correctly
- [ ] Error details preserved

### Day 5: Testing

**File:** `test/integration/providers/convex.test.ts`

- [ ] Test organizations operations
  ```typescript
  describe("ConvexProvider.organizations", () => {
    it("should list organizations", async () => {
      const provider = new ConvexProvider(testClient);
      const orgs = await provider.organizations.list({ userId: "user_123" });
      expect(orgs).toBeInstanceOf(Array);
    });

    it("should create organization", async () => {
      const provider = new ConvexProvider(testClient);
      const orgId = await provider.organizations.create({
        name: "Test Org",
        ownerId: "user_123",
      });
      expect(orgId).toBeDefined();
    });
  });
  ```
- [ ] Test people operations
- [ ] Test things operations
- [ ] Test connections operations
- [ ] Test events operations
- [ ] Test knowledge operations
- [ ] Test error handling
- [ ] Test real-time subscriptions

**Run Tests:**

```bash
bun test test/integration/providers/convex.test.ts
```

**Validation:**

- [ ] All tests pass
- [ ] 90%+ code coverage
- [ ] Auth tests still pass (backward compatibility)

**Deliverable:** ✅ ConvexProvider complete with tests

---

## Phase 3: Service Layer (Week 3)

### Day 1: Setup Effect.ts

**File:** `/backend/convex/lib/effect-database.ts`

- [ ] Create `ConvexDatabase` service
  ```typescript
  export class ConvexDatabase extends Effect.Context.Tag("ConvexDatabase")<
    ConvexDatabase,
    {
      get: <T>(id: string) => Effect.Effect<T, Error>;
      insert: <T>(table: string, value: T) => Effect.Effect<string, Error>;
      patch: <T>(id: string, value: Partial<T>) => Effect.Effect<void, Error>;
      query: <T>(query: any) => Effect.Effect<T[], Error>;
    }
  >() {}

  export const ConvexDatabaseLive = Layer.succeed(ConvexDatabase, {
    get: (id) => Effect.tryPromise(() => ctx.db.get(id)),
    insert: (table, value) => Effect.tryPromise(() => ctx.db.insert(table, value)),
    patch: (id, value) => Effect.tryPromise(() => ctx.db.patch(id, value)),
    query: (query) => Effect.tryPromise(() => query.collect()),
  });
  ```

**Validation:**

- [ ] Service compiles
- [ ] All database operations wrapped
- [ ] Error handling in place

### Day 2-3: Implement Services

**File:** `/backend/convex/services/organizations/organization-service.ts`

- [ ] Create `OrganizationService`
  ```typescript
  export class OrganizationService extends Effect.Service<OrganizationService>()(
    "OrganizationService",
    {
      effect: Effect.gen(function* () {
        const db = yield* ConvexDatabase;

        return {
          create: (args: CreateOrgArgs) =>
            Effect.gen(function* () {
              // Validate
              // Create entity
              // Create connection
              // Log event
              return orgId;
            }),
        };
      }),
      dependencies: [ConvexDatabase.Default],
    }
  ) {}
  ```

**Implement services for all 6 dimensions:**

- [ ] `OrganizationService` (organizations)
- [ ] `AuthService` (people)
- [ ] `ThingService` (things)
- [ ] `ConnectionService` (connections)
- [ ] `EventService` (events)
- [ ] `KnowledgeService` (knowledge)

**Validation:**

- [ ] All services compile
- [ ] Pure functions (no side effects outside Effect)
- [ ] Typed errors with `_tag` pattern
- [ ] Business logic separated from Convex

### Day 4: Error Types

**File:** `/backend/convex/services/errors.ts`

- [ ] Define error types
  ```typescript
  export class OrganizationNotFoundError extends Data.TaggedError("OrgNotFound")<{
    orgId: string;
  }> {}

  export class InsufficientPermissionsError extends Data.TaggedError("InsufficientPermissions")<{
    userId: string;
    action: string;
    required: string[];
  }> {}
  ```

**Validation:**

- [ ] Errors use `Data.TaggedError`
- [ ] Error types are discriminated unions
- [ ] All expected errors defined

### Day 5: Testing

**File:** `test/unit/services/organization.test.ts`

- [ ] Test service methods with mocked dependencies
  ```typescript
  describe("OrganizationService.create", () => {
    it("should create organization", async () => {
      const MockDB = Layer.succeed(ConvexDatabase, mockDatabase);

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* OrganizationService;
          return yield* service.create({
            name: "Test Org",
            ownerId: "user_123",
          });
        }).pipe(Effect.provide(MockDB))
      );

      expect(result).toBeDefined();
    });
  });
  ```

**Run Tests:**

```bash
bun test test/unit/services/
```

**Validation:**

- [ ] All unit tests pass
- [ ] 90%+ code coverage
- [ ] Error cases tested

**Deliverable:** ✅ Effect.ts services complete with tests

---

## Phase 4: Configuration (Week 4)

### Day 1-2: Provider Configuration

**File:** `/frontend/src/lib/providers/config.ts`

- [ ] Define `ProviderConfig` interface
  ```typescript
  export interface ProviderConfig {
    default: "convex" | "supabase" | "composite";
    convex?: { url: string };
    supabase?: { url: string; anonKey: string };
    wordpress?: { url: string; apiKey: string };
  }
  ```
- [ ] Load config from environment
  ```typescript
  export const providerConfig: ProviderConfig = {
    default: import.meta.env.PUBLIC_DEFAULT_PROVIDER || "convex",
    convex: { url: import.meta.env.PUBLIC_CONVEX_URL },
  };
  ```
- [ ] Create provider factory
  ```typescript
  export function createProvider(config: ProviderConfig): IDataProvider {
    switch (config.default) {
      case "convex":
        return new ConvexProvider(new ConvexReactClient(config.convex.url));
      case "supabase":
        return new SupabaseProvider(createClient(config.supabase.url, config.supabase.anonKey));
      case "composite":
        return new CompositeProvider({ ... });
      default:
        throw new Error(`Unknown provider: ${config.default}`);
    }
  }
  ```

**Validation:**

- [ ] Config loads from environment
- [ ] Provider factory creates correct provider
- [ ] Invalid config throws error

### Day 3: React Context

**File:** `/frontend/src/lib/providers/context.tsx`

- [ ] Create React Context
  ```typescript
  export const DataProviderContext = createContext<IDataProvider | null>(null);

  export function DataProviderProvider({ children }: { children: ReactNode }) {
    const provider = useMemo(() => createProvider(providerConfig), []);

    useEffect(() => {
      provider.initialize();
      return () => provider.disconnect();
    }, [provider]);

    return (
      <DataProviderContext.Provider value={provider}>
        {children}
      </DataProviderContext.Provider>
    );
  }

  export function useDataProvider(): IDataProvider {
    const provider = useContext(DataProviderContext);
    if (!provider) throw new Error("DataProvider not initialized");
    return provider;
  }
  ```

**Validation:**

- [ ] Context creates provider
- [ ] Hook returns provider
- [ ] Lifecycle methods called

### Day 4: Feature Flags

**File:** `/frontend/src/lib/providers/feature-flags.ts`

- [ ] Create feature flag system
  ```typescript
  export function shouldUseDataProvider(): boolean {
    if (!providerConfig.featureFlags?.useDataProvider) return false;

    const rolloutPercentage = getRolloutPercentage();
    const userHash = hashUserId(currentUserId);

    return userHash % 100 < rolloutPercentage;
  }
  ```

**Validation:**

- [ ] Feature flags control rollout
- [ ] Percentage-based rollout works
- [ ] Easy to toggle on/off

### Day 5: Testing

**File:** `test/integration/providers/config.test.ts`

- [ ] Test provider creation
- [ ] Test provider switching
- [ ] Test feature flags
- [ ] Test React Context

**Run Tests:**

```bash
bun test test/integration/providers/config.test.ts
```

**Validation:**

- [ ] All tests pass
- [ ] Provider switching works
- [ ] Feature flags work

**Deliverable:** ✅ Configuration system complete

---

## Phase 5: Component Migration (Weeks 5-6)

### Week 5: Non-Critical Pages

#### Day 1: Static Content Pages

**Pages:**

- [ ] `/about` → Migrate to DataProvider
- [ ] `/docs` → Migrate to DataProvider
- [ ] `/blog` → Migrate to DataProvider

**Migration Steps (per page):**

1. [ ] Read current implementation
2. [ ] Identify Convex usage (`useQuery`, `useMutation`)
3. [ ] Replace with `useDataProvider()` + provider methods
4. [ ] Update loading/error states
5. [ ] Test page locally
6. [ ] Run auth tests (`bun test test/auth`)
7. [ ] Run E2E tests for page
8. [ ] Commit changes

**Example Migration:**

```typescript
// Before
export function BlogList() {
  const posts = useQuery(api.queries.blog.list);
  return <div>{posts?.map(...)}</div>;
}

// After
export function BlogList() {
  const provider = useDataProvider();
  const posts = useRealtimeData(provider, { type: "blog_post" });
  return <div>{posts?.map(...)}</div>;
}
```

**Validation:**

- [ ] Pages load correctly
- [ ] Data displays correctly
- [ ] Auth tests pass
- [ ] No console errors

#### Day 2-3: User Settings Pages

**Pages:**

- [ ] `/account/settings` → Migrate to DataProvider
- [ ] `/tokens/[id]` → Migrate to DataProvider (read-only)

**Migration Steps:** Same as above

**Validation:**

- [ ] Settings save correctly
- [ ] Token details display
- [ ] Auth tests pass

#### Day 4-5: Buffer & Testing

- [ ] Fix any issues from Days 1-3
- [ ] Run comprehensive tests
- [ ] Document any new patterns discovered
- [ ] Review with team

**Final Validation:**

- [ ] All auth tests pass (50+ test cases)
- [ ] All migrated pages work correctly
- [ ] No regressions in non-migrated pages

### Week 6: Critical Pages

#### Day 1-2: Dashboard

**Page:** `/dashboard`

**Migration Steps:**

1. [ ] Read current implementation (complex page)
2. [ ] Identify all Convex usage
3. [ ] Plan migration (components affected)
4. [ ] Migrate dashboard stats component
5. [ ] Migrate organization selector
6. [ ] Migrate activity feed
7. [ ] Test real-time updates
8. [ ] Test with multiple organizations
9. [ ] Run auth tests
10. [ ] Run E2E dashboard tests

**Validation:**

- [ ] Dashboard loads correctly
- [ ] Real-time updates work
- [ ] Multi-org switching works
- [ ] Auth tests pass

#### Day 3: Auth Pages

**Pages:**

- [ ] `/account` → Auth dashboard
- [ ] `/account/signin` → Already uses Better Auth (no changes)
- [ ] `/account/signup` → Already uses Better Auth (no changes)

**Migration Steps:**

1. [ ] Migrate account dashboard
2. [ ] Test auth flows
3. [ ] Run ALL auth tests
4. [ ] Verify backward compatibility

**CRITICAL:**

- [ ] Run auth tests after EVERY change
- [ ] All 50+ test cases must pass
- [ ] No breaking changes to auth flows

**Validation:**

- [ ] Auth flows work correctly
- [ ] All auth tests pass (100% pass rate)
- [ ] Session management works
- [ ] OAuth flows work

#### Day 4: Admin Pages

**Pages:**

- [ ] `/admin` → Platform owner dashboard
- [ ] `/admin/organizations` → Org management

**Migration Steps:**

1. [ ] Migrate admin dashboard
2. [ ] Test org creation
3. [ ] Test org management
4. [ ] Test permissions
5. [ ] Run admin E2E tests

**Validation:**

- [ ] Admin dashboard loads
- [ ] Org management works
- [ ] Permissions enforced
- [ ] Auth tests pass

#### Day 5: Final Validation

- [ ] Run all tests (unit, integration, E2E, auth)
- [ ] Test all migrated pages
- [ ] Test backward compatibility
- [ ] Performance testing (context < 1.5KB, latency < 100ms)
- [ ] Team review

**Final Checklist:**

- [ ] All pages migrated
- [ ] All tests pass
- [ ] No regressions
- [ ] Performance within budget
- [ ] Auth tests pass (100%)

**Deliverable:** ✅ All critical pages migrated

---

## Phase 6: Cleanup (Week 7)

### Day 1-2: Remove Old Code

**Tasks:**

- [ ] Find all direct Convex imports
  ```bash
  grep -r "from \"convex/react\"" frontend/src/components/
  grep -r "api.queries" frontend/src/components/
  grep -r "api.mutations" frontend/src/components/
  ```
- [ ] Remove unused imports
- [ ] Remove old helper functions
- [ ] Update imports to use provider exports

**Validation:**

- [ ] No direct Convex imports in components
- [ ] All components use DataProvider
- [ ] Build succeeds

### Day 3: Update Dependencies

**File:** `/frontend/package.json`

- [ ] Review dependencies
- [ ] Remove unused provider packages
- [ ] Update versions if needed
- [ ] Run `bun install`

**Validation:**

- [ ] `bun install` succeeds
- [ ] No unused dependencies
- [ ] Lock file updated

### Day 4: Consolidate Exports

**File:** `/frontend/src/lib/providers/index.ts`

- [ ] Export all public APIs
  ```typescript
  export { IDataProvider } from "./interface";
  export { ConvexProvider } from "./convex";
  export { SupabaseProvider } from "./supabase";
  export { CompositeProvider } from "./composite";
  export { useDataProvider, DataProviderProvider } from "./context";
  export { ProviderError } from "./errors";
  export { withRetry } from "./retry";
  ```

**Validation:**

- [ ] All exports available
- [ ] No circular dependencies
- [ ] Build succeeds

### Day 5: Testing & Documentation

**Tasks:**

- [ ] Run all tests (unit, integration, E2E, auth)
  ```bash
  bun test
  bun test test/auth
  bun run build
  bunx astro check
  ```
- [ ] Update documentation
  - [ ] `/frontend/AGENTS.md`
  - [ ] `/INTEGRATION-ORCHESTRATION.md`
  - [ ] Provider usage examples
- [ ] Create migration guide for future developers

**Validation:**

- [ ] All tests pass
- [ ] Build succeeds
- [ ] Type checking passes
- [ ] Documentation complete

**Deliverable:** ✅ Cleanup complete, codebase clean

---

## Phase 7: Alternative Providers (Week 8+)

### SupabaseProvider (Week 8)

#### Day 1-2: Implementation

**File:** `/frontend/src/lib/providers/supabase.ts`

- [ ] Create `SupabaseProvider` class
- [ ] Implement `IDataProvider` interface
- [ ] Implement all 6 dimensions
- [ ] Add real-time subscriptions
  ```typescript
  subscribe(query: Query, callback: (data: any) => void) {
    const channel = this.client
      .channel("db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: query.table }, callback)
      .subscribe();

    return () => channel.unsubscribe();
  }
  ```

**Validation:**

- [ ] All 6 dimensions implemented
- [ ] Real-time subscriptions work
- [ ] pgvector search works

#### Day 3-4: Testing

**File:** `test/integration/providers/supabase.test.ts`

- [ ] Test all operations
- [ ] Test real-time subscriptions
- [ ] Test vector search
- [ ] Test error handling

**Run Tests:**

```bash
bun test test/integration/providers/supabase.test.ts
```

**Validation:**

- [ ] All tests pass
- [ ] Real-time works
- [ ] Vector search works

#### Day 5: Documentation

- [ ] Document Supabase setup
- [ ] Add configuration example
- [ ] Document limitations

**Deliverable:** ✅ SupabaseProvider complete

### WordPressProvider (Week 9)

#### Day 1-2: Implementation

**File:** `/frontend/src/lib/providers/wordpress.ts`

- [ ] Create `WordPressProvider` class
- [ ] Implement read-only things operations
- [ ] Add polling fallback (no real-time)
- [ ] Transform WordPress posts to things

**Validation:**

- [ ] Can read WordPress posts
- [ ] Transform to ontology correctly
- [ ] Polling works

#### Day 3-4: Sync Strategy

**File:** `/backend/convex/sync/wordpress.ts`

- [ ] Implement webhook handler
- [ ] Create sync action
- [ ] Schedule periodic sync

**Validation:**

- [ ] Webhooks work
- [ ] Sync creates/updates things
- [ ] Events logged

#### Day 5: Testing

- [ ] Test WordPress integration
- [ ] Test sync
- [ ] Test error handling

**Deliverable:** ✅ WordPressProvider complete

### CompositeProvider (Week 10)

#### Day 1-3: Implementation

**File:** `/frontend/src/lib/providers/composite.ts`

- [ ] Create `CompositeProvider` class
- [ ] Implement routing logic
  ```typescript
  things = {
    list: async (args) => {
      switch (args.type) {
        case "blog_post": return this.wordpress.things.list(args);
        case "product": return this.shopify.things.list(args);
        default: return this.convex.things.list(args);
      }
    },
  };
  ```
- [ ] Implement unified search
- [ ] Handle cross-backend consistency

**Validation:**

- [ ] Routing works correctly
- [ ] Unified search works
- [ ] Cross-backend queries work

#### Day 4-5: Testing

- [ ] Test routing
- [ ] Test unified search
- [ ] Test cross-backend operations
- [ ] Test error handling

**Deliverable:** ✅ CompositeProvider complete

---

## Post-Migration Validation

### Final Testing Checklist

#### Unit Tests

```bash
bun test test/unit/
```

- [ ] All service tests pass
- [ ] 90%+ code coverage
- [ ] Error cases tested

#### Integration Tests

```bash
bun test test/integration/
```

- [ ] All provider tests pass
- [ ] ConvexProvider works
- [ ] SupabaseProvider works
- [ ] WordPressProvider works
- [ ] CompositeProvider works
- [ ] Cross-provider operations work

#### E2E Tests

```bash
bun test test/e2e/
```

- [ ] All user journeys work
- [ ] Dashboard works
- [ ] Auth flows work
- [ ] Org management works
- [ ] Data CRUD works

#### Auth Tests (CRITICAL)

```bash
bun test test/auth
```

- [ ] Email/Password auth works
- [ ] OAuth (GitHub, Google) works
- [ ] Magic links work
- [ ] Password reset works
- [ ] Email verification works
- [ ] 2FA/TOTP works
- [ ] All 50+ test cases pass (100% pass rate)

#### Performance Tests

```bash
bun test test/performance/
```

- [ ] Context usage < 1.5KB
- [ ] API latency < 100ms
- [ ] Real-time updates < 50ms
- [ ] No memory leaks

#### Build Tests

```bash
bun run build
bunx astro check
```

- [ ] Frontend builds successfully
- [ ] Backend deploys successfully
- [ ] No TypeScript errors
- [ ] No build warnings

### Success Metrics

**Ontology Alignment:**

- [ ] All 6 dimensions respected
- [ ] Organization boundaries enforced
- [ ] Role-based authorization works
- [ ] Complete audit trail
- [ ] Protocol metadata tracked

**Technical Quality:**

- [ ] All systems connect correctly
- [ ] Data flows work end-to-end
- [ ] Errors handled gracefully
- [ ] Performance within budget
- [ ] No regressions

**Coordination:**

- [ ] Team aligned
- [ ] No manual handoffs
- [ ] Documentation complete
- [ ] Knowledge captured

---

## Deployment Checklist

### Backend Deployment (Convex)

```bash
cd /backend
npx convex deploy --prod
npx convex status
```

- [ ] Schema deployed
- [ ] Functions deployed
- [ ] No errors in logs
- [ ] Backend healthy

### Frontend Deployment (Cloudflare)

```bash
cd /frontend
bun run build
wrangler pages deploy dist --project-name=one-platform
```

- [ ] Build succeeds
- [ ] Deployment succeeds
- [ ] Site loads correctly
- [ ] No console errors

### Rollout Plan

**Week 1:**

- [ ] Deploy code with feature flag OFF (0%)
- [ ] Verify deployment successful
- [ ] Monitor for issues

**Week 2:**

- [ ] Enable feature flag for 5% of users (internal testing)
- [ ] Monitor metrics
- [ ] Fix any issues

**Week 3:**

- [ ] Increase to 10% (early adopters)
- [ ] Monitor metrics
- [ ] Gather feedback

**Week 4:**

- [ ] Increase to 25%
- [ ] Monitor metrics
- [ ] Verify no issues

**Week 5:**

- [ ] Increase to 50% (half of users)
- [ ] Monitor metrics
- [ ] Prepare for full rollout

**Week 6:**

- [ ] Increase to 75% (most users)
- [ ] Monitor metrics
- [ ] Final validation

**Week 7:**

- [ ] Full rollout (100%)
- [ ] Monitor metrics
- [ ] Celebrate! 🎉

### Rollback Procedure

**If issues occur:**

1. [ ] Set feature flag to 0% (instant rollback)
2. [ ] Monitor for recovery
3. [ ] Investigate issue
4. [ ] Fix issue
5. [ ] Resume rollout

**If deployment fails:**

1. [ ] Run `wrangler pages rollback`
2. [ ] Investigate issue
3. [ ] Fix issue
4. [ ] Redeploy

---

## Success Criteria

### All Phases Complete

- [ ] Phase 1: Interface Definition ✅
- [ ] Phase 2: ConvexProvider ✅
- [ ] Phase 3: Service Layer ✅
- [ ] Phase 4: Configuration ✅
- [ ] Phase 5: Component Migration ✅
- [ ] Phase 6: Cleanup ✅
- [ ] Phase 7: Alternative Providers ✅

### All Tests Pass

- [ ] Unit tests (90%+ coverage) ✅
- [ ] Integration tests (all providers) ✅
- [ ] E2E tests (user journeys) ✅
- [ ] Auth tests (50+ cases, 100% pass rate) ✅
- [ ] Performance tests (context < 1.5KB, latency < 100ms) ✅

### All Systems Operational

- [ ] Frontend deployed and healthy ✅
- [ ] Backend deployed and healthy ✅
- [ ] Real-time updates working ✅
- [ ] Multi-backend federation working ✅
- [ ] Error handling working ✅

### Documentation Complete

- [ ] Integration orchestration plan ✅
- [ ] Integration summary ✅
- [ ] Integration architecture ✅
- [ ] Implementation checklist ✅
- [ ] Migration guide ✅
- [ ] Provider usage examples ✅

---

**Integration Specialist: Connect systems. Map protocols. Respect the ontology. Make integrations seamless.**

---

**End of Integration Implementation Checklist**

# Complete Step-by-Step Build Plan: ONE Platform (REVISED)

**Version:** 3.0.0 - Agent-Parallel Execution
**Created:** 2025-10-24
**Philosophy:** Safe → Quick → Accurate (build on solid foundation with parallel agents)
**Architecture:** Completely separate backend (multi-tenant) and frontend
**Status:** Foundation 90% complete, refining with parallel agent coordination
**Execution Model:** Agent-Director orchestrates parallel specialist agents

**Using Convex Components:**
- `@convex-dev/agent` - AI agents with threading
- `@convex-dev/rag` - Retrieval-augmented generation
- `@convex-dev/rate-limiter` - Per-user/org rate limiting
- `@convex-dev/workflow` - Durable workflows with retries
- `@convex-dev/persistent-text-streaming` - Real-time streaming
- `@convex-dev/workpool` - Task queuing and parallelism
- `@convex-dev/retrier` - Robust error recovery

**Reference:** `/Users/toc/Server/ONE/one/things/components.md` - Complete integration guide

---

## 🤖 AGENT-DIRECTOR ORCHESTRATION MODEL

**WHO DOES THE WORK:**

This plan is executed by the agent network, coordinated by **agent-director**:

```
┌─────────────────────────────────────────────────────────────────┐
│ agent-director (Orchestrator)                                   │
│  ├─ Validates plan against 6-dimension ontology                │
│  ├─ Assigns features to specialist agents                      │
│  ├─ Monitors for completion events                             │
│  ├─ Detects blockers and delegates to problem-solver           │
│  └─ Marks complete and advances to next phase                  │
└─────────────────────────────────────────────────────────────────┘
        ↓                                    ↓
┌────────────────────────┐        ┌─────────────────────────┐
│ agent-backend          │        │ agent-frontend          │
│  ├─ Schema design      │        │  ├─ Page components     │
│  ├─ CRUD mutations     │        │  ├─ React islands       │
│  ├─ Query optimization │        │  ├─ Tailwind styling    │
│  └─ Effect.ts services │        │  └─ Performance tuning  │
└────────────────────────┘        └─────────────────────────┘
        ↓                                    ↓
┌────────────────────────┐        ┌─────────────────────────┐
│ agent-quality          │        │ agent-ops               │
│  ├─ Test definitions   │        │  ├─ Deployment setup    │
│  ├─ Acceptance criteria│        │  ├─ CI/CD pipelines     │
│  ├─ Validation runs    │        │  ├─ Monitoring          │
│  └─ Insight generation │        │  └─ Release automation  │
└────────────────────────┘        └─────────────────────────┘
        ↓                                    ↓
┌────────────────────────┐        ┌─────────────────────────┐
│ agent-documenter       │        │ agent-problem-solver    │
│  ├─ API docs           │        │  ├─ Root cause analysis │
│  ├─ Integration guides │        │  ├─ Solution proposals  │
│  ├─ Architecture docs  │        │  ├─ Test verification   │
│  └─ Knowledge updates  │        │  └─ Lessons captured    │
└────────────────────────┘        └─────────────────────────┘
```

**HOW IT WORKS:**

1. **agent-director** reads this plan and validates it against ontology
2. For **Phase 1 (Backend):**
   - agent-director emits `feature_assigned` event for backend tasks
   - **agent-backend** begins implementation
   - **agent-quality** simultaneously defines tests (no blocking dependency)
   - agent-backend and agent-quality work in parallel
   - When implementation done: agent-quality validates
   - If tests fail: agent-problem-solver investigates
   - If tests pass: agent-documenter writes docs
   - agent-director marks phase complete

3. For **Phase 4 (Features):**
   - agent-director breaks feature into sub-tasks (backend, frontend, integration)
   - **agent-backend**, **agent-frontend**, **agent-integrator** work in parallel
   - Each specialist emits `implementation_complete` when done
   - **agent-quality** runs tests for each component
   - **agent-designer** creates UI specs driven by test requirements
   - All specialists implement to pass tests
   - agent-director waits for all to complete

4. **Failure Recovery:**
   - If any specialist fails: emit `test_failed` event
   - **agent-problem-solver** analyzes failure
   - Problem solver proposes fix with `solution_proposed` event
   - Original specialist implements fix
   - Quality re-validates
   - Pipeline continues

---

## ⚡ PARALLEL EXECUTION STRATEGY

**THE GOAL:** 5x faster delivery by eliminating sequential wait times

**CURRENT BOTTLENECKS (Sequential):**
```
Phase 1: Backend implementation (10-12 hrs)
   → Wait for backend done
   → Phase 1 QA: Testing (3 hrs)
   → Wait for tests pass
   → Phase 2: Frontend implementation (8-10 hrs)
Total Sequential: 21-25 hours ❌
```

**NEW APPROACH (Parallel):**
```
Phase 1a: Backend coding + Phase 1b: Test definition (simultaneous)
   10-12 hrs (backend)  \
                         → Parallel execution
    3 hrs (test def)    /

Phase 1c: Implementation validation (3 hrs)
   Test backend against defined criteria

Phase 2a: Frontend coding + Phase 2b: Integration spec (simultaneous)
    8-10 hrs (frontend)  \
                          → Parallel execution
    2 hrs (integration)  /

Result: ~18 hours total (vs. 25 sequential) = 28% time savings ✅
```

**WHICH PHASES CAN RUN IN PARALLEL:**

✅ **Can Parallelize (Independent):**
- Backend CRUD + Test definition (tests don't depend on implementation)
- Backend code + Frontend code (different codebases)
- Documentation + Quality checks (separate concerns)

❌ **Must Wait (Dependencies):**
- Backend implementation MUST complete before integration tests
- Schema design MUST complete before tests are written (defines what to test)
- Quality approval MUST complete before documenter finalizes

**PARALLEL PHASE EXECUTION PLAN:**

```yaml
Phase 1 - Backend Foundation (Week 1-2):
  agent-backend:
    - Implement Groups CRUD (2h)
    - Implement Things CRUD (2h)
    - Implement Connections CRUD (1.5h)
    - Implement Events queries (1.5h)
    - Implement Knowledge queries (1h)
    - Effect.ts service layer (2h)
    - Test coverage: Aim for 80%+
    Parallel with:

  agent-quality:
    - Define user flows for Groups (1h)
    - Define acceptance criteria (1.5h)
    - Create test suite templates (1h)
    - Coverage analysis prep (0.5h)
    Parallel with:

  agent-documenter (optional):
    - Draft schema documentation (1h)
    - API endpoint reference (1h)
    - Integration examples (1h)

Phase 2 - Integration Layer (Week 2):
  agent-integrator:
    - Design API gateway (optional 1h)
    - Create integration specs (1h)
    Parallel with:

  agent-backend (continued):
    - Implement remaining CRUD (2h)
    - Fix issues from Phase 1 QA

Phase 3 - Full System Test (Week 3):
  agent-quality:
    - Run comprehensive test suite (1h)
    - Performance benchmarking (1h)
    - Coverage reports (0.5h)
  agent-ops:
    - Prepare staging deployment (1h)
    - Set up monitoring (0.5h)

Phase 4 - Feature Development (Week 4+):
  For each feature (e.g., Blog):
    agent-backend (1-2 days):
      - Implement blog schema
      - Create blog mutations/queries
      - Effect.ts blog service

    agent-frontend (1-2 days, starts after backend schema):
      - Create blog components
      - Blog listing pages
      - Blog detail pages

    agent-integrator (1 day, parallel with above):
      - Design blog API
      - Create integration tests

    agent-quality (continuous):
      - Define blog user flows
      - Create acceptance criteria
      - Run tests as components complete

    agent-designer (1 day, driven by test requirements):
      - Create wireframes
      - Design system components
      - Accessibility audit

    Result: Feature done in 4-5 days (vs. 7+ sequential)

Phase 5 - Deployment (Week 5+):
  agent-ops:
    - Create deployment pipeline (2-3h)
    - Staging deployment (1h)
    - Production release (1h)
    - Monitoring setup (1h)
```

---

## 📊 AGENT ASSIGNMENTS & RESPONSIBILITIES

### Per-Phase Assignments:

| Phase | Primary Agent | Secondary Agents | Duration | Dependencies |
|-------|---------------|-----------------|----------|--------------|
| 1a: Backend Code | agent-backend | agent-quality (tests) | 10-12h | None |
| 1b: Test Definition | agent-quality | agent-backend (schema) | 3h | Schema done |
| 1c: Validation | agent-quality | agent-backend (fixes) | 2-3h | 1a + 1b done |
| 2a: Integration | agent-integrator | agent-backend | 2h | Phase 1 done |
| 2b: HTTP Layer | agent-backend | agent-integrator | 2h | Phase 1 done |
| 3: System Test | agent-quality | agent-ops | 3h | Phase 2 done |
| 4a: Feature Backend | agent-backend | agent-quality | 2-3d | Feature spec |
| 4b: Feature Frontend | agent-frontend | agent-quality | 2-3d | Schema done |
| 4c: Feature Integration | agent-integrator | agent-quality | 1-2d | Schema done |
| 5a: Deploy Staging | agent-ops | agent-quality | 1h | Phase 4 done |
| 5b: Deploy Prod | agent-ops | agent-quality | 1h | Staging pass |
| Docs & Knowledge | agent-documenter | agent-quality | 1h/phase | Phase done |

### Coordinator (Always agent-director):
- Validates plan against 6-dimension ontology ✅
- Emits feature assignments ✅
- Monitors for blocking issues ✅
- Delegates to problem-solver on failures ✅
- Marks features complete ✅
- Advances to next phase ✅

---

## 🎯 AGENT SKILL IMPROVEMENTS NEEDED

To execute this plan optimally, update agents as follows:

### agent-director
**Current:** Validates ideas, creates plans, assigns features
**Needed:**
- Add `parallelExecutionOrchestration()` method to manage concurrent phases
- Add `dependencyResolution()` to identify which tasks can run in parallel
- Add `blockageDetection()` to identify stuck tasks waiting for dependencies
- Add `eventMonitoring()` to watch for `implementation_complete` from all agents
- Add `progressTracking()` to display real-time parallel execution status
- Enhance `featureAssignment()` to batch-assign multiple features to multiple agents simultaneously

**Implementation:**
```typescript
// In agent-director prompts:
"You manage parallel execution across 5-8 agents simultaneously.
When assigning Phase 1 tasks:
1. Assign backend code to agent-backend
2. SIMULTANEOUSLY assign test definition to agent-quality
3. Monitor BOTH for completion events
4. Wait for both to complete before validation
5. Track overall progress as: Parallel(backend_code, test_def) → validation
6. Display progress: 'Backend: 8/10 hrs | Quality: 2/3 hrs | ETA: 2h'"
```

### agent-backend
**Current:** Implements mutations, queries, schema, Effect.ts
**Needed:**
- Add `parallelCRUDImplementation()` to parallelize Groups/Things/Connections implementation
- Add `dependencyTracker()` to know which services are ready for Effect.ts wrapping
- Add `testReadiness()` to emit `schema_ready` event when schema complete (so quality can start)
- Add `progressEmission()` to emit hourly updates of which services are complete
- Add `blockageHandling()` to detect when waiting on quality feedback

**Implementation:**
```typescript
// In agent-backend prompts:
"Emit events to keep agent-quality informed:
- When schema complete: emit 'schema_ready' event
- Every hour: emit 'progress_update' with completed_services: ['groups', 'things', ...]
- When mutation done: emit 'mutation_complete' with mutation_name
- If stuck: emit 'blocked_waiting_for' with blocker_name"
```

### agent-frontend
**Current:** Implements components, pages, styling, performance
**Needed:**
- Add `waitForSchemaEvent()` to not start until backend emits `schema_ready`
- Add `parallelComponentDevelopment()` to code multiple pages simultaneously
- Add `designSystemAlignment()` to wait for agent-designer's component specs
- Add `progressTracking()` to emit component completion events
- Add `performanceBudgeting()` to measure Core Web Vitals during development

**Implementation:**
```typescript
// In agent-frontend prompts:
"Watch for these events to proceed:
- 'schema_ready' → Begin component development (can't start before)
- 'test_definitions_complete' → Understand test requirements
- 'wireframes_complete' → Have design guidance
- After each component done: emit 'component_complete' event"
```

### agent-quality
**Current:** Defines tests, validates implementations, generates insights
**Needed:**
- Add `parallelTestDefinition()` to define tests for multiple dimensions (Groups, Things, Connections, Events, Knowledge) simultaneously
- Add `schemaAwarenessWaiting()` to emit `ready_to_define` when schema structure known
- Add `continuousValidation()` to validate components as they complete (not waiting for all)
- Add `parallelTestExecution()` to run unit, integration, e2e tests concurrently
- Add `blockageRecovery()` to handle test failures by emitting `test_failed` for problem-solver

**Implementation:**
```typescript
// In agent-quality prompts:
"Enable parallel test development:
- Watch for 'schema_ready' event from agent-backend
- THEN define tests for Groups, Things, Connections, Events, Knowledge in parallel
- For each, emit 'tests_ready_for_X' event
- As backend components complete, emit 'validation_passed_for_X'
- If tests fail: emit 'test_failed' with detailed failure reason
- Agent-problem-solver monitors test_failed events"
```

### agent-designer
**Current:** Creates wireframes, component specs, design tokens
**Needed:**
- Add `testDrivenDesign()` to use agent-quality's test requirements to guide design
- Add `parallelComponentDesign()` to design multiple components simultaneously
- Add `accessibilityFirstDesign()` to ensure WCAG 2.1 AA from start (not retrofit)
- Add `readyStateTracking()` to emit `design_spec_complete_for_X` for each component
- Add `performanceConsiderations()` to design for Core Web Vitals (LCP < 2.5s)

**Implementation:**
```typescript
// In agent-designer prompts:
"Design components driven by test requirements:
- Read test user flows from agent-quality
- For each component: emit 'design_spec_complete_for_X'
- Ensure all designs meet WCAG 2.1 AA standards
- Consider image sizes, lazy loading, critical CSS for performance
- Provide design tokens that agent-frontend can directly implement"
```

### agent-ops
**Current:** Handles deployment, CI/CD, monitoring, releases
**Needed:**
- Add `deploymentPipelineSetup()` to prepare staging/production pipelines early
- Add `releaseAutomation()` to automate version bumping, changelog generation
- Add `productionReadiness()` to validate all quality gates before production deploy
- Add `postDeploymentMonitoring()` to track metrics after each release
- Add `incidentResponse()` to handle failures in production quickly

**Implementation:**
```typescript
// In agent-ops prompts:
"Prepare deployment infrastructure early:
- During Phase 1: Set up staging environment
- During Phase 2: Test deployment pipeline with dummy app
- During Phase 3: Run full system test on staging
- Before Phase 4: Validate all quality gates
- Each release: Run sanity checks on production
- Monitor: Lighthouse scores, API latency, error rates, user retention"
```

### agent-documenter
**Current:** Writes documentation, updates knowledge base
**Needed:**
- Add `parallelDocumentation()` to write different docs simultaneously (API, integration, architecture)
- Add `knowledgeBaseUpdates()` to automatically extract lessons learned from test results
- Add `semanticSearchOptimization()` to use knowledge embeddings for discovery
- Add `useCaseDocumentation()` to document real customer workflows
- Add `lessonsCapture()` to automatically capture and store insights

**Implementation:**
```typescript
// In agent-documenter prompts:
"Document each completed phase:
- As agent-backend completes: Write API docs + schema docs
- As agent-frontend completes: Write component usage guide
- As agent-quality runs tests: Capture test patterns as lessons learned
- Store in /one/knowledge/ with appropriate labels for semantic search
- Generate README sections from architecture insights"
```

### agent-problem-solver
**Current:** Analyzes failures, proposes solutions
**Needed:**
- Add `continuousMonitoring()` to watch `test_failed` events from all agents
- Add `rootCauseAnalysisAutomation()` to automatically categorize failures
- Add `solutionProposalSpeed()` to propose fixes within 10 minutes of failure
- Add `fixVerification()` to re-run tests after fix to confirm resolution
- Add `failurePatternDetection()` to identify recurring issues early

**Implementation:**
```typescript
// In agent-problem-solver prompts:
"Monitor all test_failed events continuously:
- When received: Immediately analyze root cause
- Categorize: Ontology violation | Logic error | Performance | Accessibility
- Propose fix with specific code changes
- Emit 'solution_proposed' event with fix details
- Original specialist implements fix
- You re-run tests to verify
- If pass: Emit 'fix_complete' + capture lesson learned"
```

---

## ✅ What's ALREADY DONE

**Frontend (COMPLETE):**
- ✅ Astro 5 + React 19 with SSR on Cloudflare
- ✅ shadcn/ui (50+ components pre-installed)
- ✅ Tailwind CSS v4 with dark mode
- ✅ Better Auth UI (signup, signin, password reset, magic links, email verification, 2FA)
- ✅ DataProvider pattern (works with ANY backend)
- ✅ Complete hooks (useThings, useConnections, useEvents, useKnowledge, useGroups, usePeople)
- ✅ Dashboard, ecommerce templates, blog system
- ✅ Stripe payment integration

**Backend (MOSTLY COMPLETE):**
- ✅ Convex schema (6-dimension ontology)
- ✅ Better Auth (6 auth methods fully working)
- ✅ Query/mutation stubs
- ✅ Service layer structure

**Testing (DONE):**
- ✅ 50+ auth tests (all 6 methods)
- ✅ Provider tests
- ✅ Integration tests

**Documentation (EXCELLENT):**
- ✅ CLAUDE.md (2,500+ lines, comprehensive guidance)
- ✅ AGENTS.md (Convex patterns)
- ✅ /one/ directory (41 files, 8 layers)

---

## 🎯 What We're Doing Now

**Don't rebuild what's done. Polish what's started.**

```
Phase 1: POLISH FOUNDATION (3 days)
  └─ Implement Quick Wins to solidify what exists
       ↓
Phase 2: COMPLETE BACKEND (1-2 weeks)
  └─ Implement all CRUD endpoints that are stubbed
  └─ Connect to frontend that's waiting
       ↓
Phase 3: FULL SYSTEM TEST (1 week)
  └─ Entire stack: frontend → backend → database → frontend
       ↓
Phase 4: BUILD FEATURES ONE AT A TIME (2-3 weeks per feature)
  └─ Blog, Portfolio, Courses, Tokens, etc.
       ↓
Phase 5: DEPLOYMENT (1 week)
  └─ Staging → Production

Total: 4-6 weeks to production with SOLID foundation
```

---

## 🚀 IMMEDIATE: THIS WEEK (Quick Wins)

**Goal:** Polish existing foundation and unblock Phase 2

**Do the 10 Quick Wins from quick-wins.md (pick top 5 for now):**

1. ✅ **Error Taxonomy** - All errors are typed
2. ✅ **Type Safety Audit** - Zero `any` except properties
3. ✅ **Service Documentation** - Services documented with examples
4. ✅ **Pre-commit Hooks** - Type check + lint before commit
5. ✅ **Performance Baselines** - Know what to optimize

**These 5 quick wins:**
- Take ~2 hours each = 10 hours total
- Unblock everything else
- Make code generation 50% more accurate
- Give team confidence the foundation is solid

---

## 📋 PHASE 1: COMPLETE BACKEND WITH CONVEX COMPONENTS (Week 1-2)

**Status:** Using Convex components for production AI agents
**Owner:** agent-backend
**Time:** 10-12 hours total
**Components:** Agent, RAG, Rate Limiter, Workflow, Retrier, Workpool, Streaming

### What's Already in Place:
- ✅ Schema with all 6 tables defined
- ✅ Query/mutation stubs
- ✅ Service structure
- ✅ Better Auth fully configured

### Component-Based Architecture:

```
backend/convex/
├── schema.ts              # 6-dimension ontology
├── services/
│   ├── agent.service.ts       # @convex-dev/agent wrapper with Effect
│   ├── rag.service.ts         # @convex-dev/rag for semantic search
│   ├── rate-limit.service.ts  # @convex-dev/rate-limiter wrapper
│   ├── workflow.service.ts    # @convex-dev/workflow for durable jobs
│   ├── streaming.service.ts   # @convex-dev/persistent-text-streaming
│   ├── workpool.service.ts    # @convex-dev/workpool for task queuing
│   └── layers.ts              # Effect.ts Layer composition
├── domain/
│   ├── errors.ts              # Tagged Error types
│   ├── types.ts               # Domain types
│   └── business-logic.ts      # Pure Effect.ts logic
└── api/
    ├── things.ts              # Thing CRUD + filtering
    ├── connections.ts         # Connection CRUD
    ├── events.ts              # Event logging
    ├── groups.ts              # Group management
    ├── people.ts              # People/authorization
    ├── knowledge.ts           # Knowledge search/embeddings
    ├── agents.ts              # AI agent endpoints
    └── workflows.ts           # Workflow triggers
```

### Why This Architecture:

**Convex Components handle:**
- Agent thread management & streaming
- Vector search for RAG
- Rate limiting (per-user, per-org)
- Durable workflows with retries
- Long-running task queues
- Real-time persistent streaming

**Effect.ts wraps them for:**
- Type-safe error handling
- Service composition
- Dependency injection
- Testability
- Business logic orchestration

### Step 1.1: Implement Groups Queries & Mutations
**Time:** 2 hours
**Deliverable:** Full CRUD for groups

```typescript
// backend/convex/queries/groups.ts - Complete this

export const get = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  }
})

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("groups").collect()
  }
})

// backend/convex/mutations/groups.ts - Complete this

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("organization"),
      // ... other group types
    ),
    parentGroupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    // Create group with all properties
    const id = await ctx.db.insert("groups", {
      name: args.name,
      type: args.type,
      parentGroupId: args.parentGroupId,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    // Log creation event
    await ctx.db.insert("events", {
      groupId: id,
      type: "group_created",
      actorId: ctx.auth?.getUserIdentity()?.tokenIdentifier,
      targetId: id,
      timestamp: Date.now(),
    })
    return id
  }
})
```

**Check:**
- [ ] Query returns correct group
- [ ] Mutation creates with all fields
- [ ] Events logged
- [ ] Tests pass

---

### Step 1.2: Implement Things Queries & Mutations
**Time:** 2 hours
**Deliverable:** Full CRUD for things with filtering and pagination (Ontology Dimension 3)

```typescript
// backend/convex/queries/things.ts - Complete this

export const list = query({
  args: {
    groupId: v.id("groups"),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("entities")
      .withIndex("group_type", q => q.eq("groupId", args.groupId))

    if (args.type) query = query.filter(q => q.eq(q.field("type"), args.type))
    if (args.status) query = query.filter(q => q.eq(q.field("status"), args.status))

    return await query.take(args.limit ?? 100).collect()
  }
})

export const get = query({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  }
})
```

**Check:**
- [ ] List returns items
- [ ] Filtering works
- [ ] Pagination works
- [ ] Get returns single item

---

### Step 1.3: Implement Connections Queries & Mutations
**Time:** 1.5 hours
**Deliverable:** Query and create relationships

```typescript
// backend/convex/queries/connections.ts - Complete this

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.query("connections")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect()
  }
})

export const fromEntity = query({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
    return await ctx.db.query("connections")
      .filter(q => q.eq(q.field("fromEntityId"), args.entityId))
      .collect()
  }
})
```

**Check:**
- [ ] List works
- [ ] Filtering by source works
- [ ] Bidirectional queries work

---

### Step 1.4: Implement Events Queries
**Time:** 1.5 hours
**Deliverable:** Query event history and timeline

```typescript
// backend/convex/queries/events.ts - Complete this

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.query("events")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .order("desc")  // Most recent first
      .collect()
  }
})

export const byActor = query({
  args: { actorId: v.id("entities") },
  handler: async (ctx, args) => {
    return await ctx.db.query("events")
      .filter(q => q.eq(q.field("actorId"), args.actorId))
      .order("desc")
      .collect()
  }
})
```

**Check:**
- [ ] Timeline returns events in order
- [ ] Filtering works
- [ ] Pagination ready

---

### Step 1.5: Implement Knowledge Queries
**Time:** 1 hour
**Deliverable:** Query and search knowledge base

```typescript
// backend/convex/queries/knowledge.ts - Complete this

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.query("knowledge")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect()
  }
})

export const search = query({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For now, basic text search
    // Later: vector similarity search
    const all = await ctx.db.query("knowledge")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect()

    const filtered = all.filter(k =>
      k.text?.toLowerCase().includes(args.query.toLowerCase())
    )

    return filtered.slice(0, args.limit ?? 10)
  }
})
```

**Check:**
- [ ] List works
- [ ] Search returns results
- [ ] Limit works

---

### Step 1.6: Effect.ts Service Layer (Core Infrastructure)

**Time:** 2 hours
**Deliverable:** Effect.ts services wrapping Convex for composition

```typescript
// backend/convex/services/layers.ts

import { Effect, Context, Layer, Data } from "effect"
import { Agent } from "@convex-dev/agent"
import { RAG } from "@convex-dev/rag"

// Error definitions
class AgentError extends Data.TaggedError("AgentError")<{
  cause: unknown
}> {}

class RAGError extends Data.TaggedError("RAGError")<{
  cause: unknown
}> {}

// Service definitions
class AgentService extends Context.Tag("AgentService")<
  AgentService,
  {
    readonly createThread: (userId: string) => Effect.Effect<string, AgentError>
    readonly generateResponse: (threadId: string, prompt: string) => Effect.Effect<string, AgentError>
  }
>() {}

class RAGService extends Context.Tag("RAGService")<
  RAGService,
  {
    readonly addDocument: (namespace: string, text: string, metadata: any) => Effect.Effect<string, RAGError>
    readonly search: (namespace: string, query: string, limit: number) => Effect.Effect<SearchResult[], RAGError>
  }
>() {}

// Implementations
const AgentServiceLive = Layer.effect(
  AgentService,
  Effect.gen(function* () {
    // Agent component initialized
    const agent = new Agent(components.agent, {
      name: "ONE Assistant",
      chat: openai.chat("gpt-4o-mini"),
      instructions: "You are a helpful assistant for the ONE Platform."
    })

    return {
      createThread: (userId) =>
        Effect.tryPromise({
          try: async () => {
            const { threadId } = await agent.createThread(ctx, { userId })
            return threadId
          },
          catch: (error) => new AgentError({ cause: error })
        }),

      generateResponse: (threadId, prompt) =>
        Effect.tryPromise({
          try: async () => {
            const { thread } = await agent.continueThread(ctx, { threadId })
            const { text } = await thread.generateText({ prompt })
            return text
          },
          catch: (error) => new AgentError({ cause: error })
        })
    }
  })
)

const RAGServiceLive = Layer.effect(
  RAGService,
  Effect.gen(function* () {
    const rag = new RAG(components.rag, {
      textEmbeddingModel: openai.embedding("text-embedding-3-small"),
      embeddingDimension: 1536
    })

    return {
      addDocument: (namespace, text, metadata) =>
        Effect.tryPromise({
          try: () => rag.add(ctx, { namespace, text, filterValues: Object.entries(metadata).map(([k, v]) => ({ name: k, value: v })) }),
          catch: (error) => new RAGError({ cause: error })
        }),

      search: (namespace, query, limit) =>
        Effect.tryPromise({
          try: () => rag.search(ctx, { namespace, query, limit, vectorScoreThreshold: 0.6 }),
          catch: (error) => new RAGError({ cause: error })
        })
    }
  })
)

// Export combined layer
export const AllServicesLive = Layer.merge(AgentServiceLive, RAGServiceLive)
```

**Check:**
- [ ] Services layer compiles
- [ ] Effects properly typed
- [ ] Layers can be composed

---

### Summary: Phase 1 Complete

**After Phase 1:**
- ✅ All basic CRUD operations implemented
- ✅ Effect.ts service layer wrapping components
- ✅ Tests verify everything
- ✅ Frontend can connect to backend
- ✅ Foundation ready for AI features

---

## 📡 REST API Reference (Ontology-Aligned)

**All endpoints follow the 6-dimension ontology exactly:**

```
# Groups (Dimension 1: Multi-tenant isolation)
GET    /api/groups              # List all groups (with ?limit=, ?cursor=)
GET    /api/groups/:id          # Get group details
POST   /api/groups              # Create group { name, type, parentGroupId? }
PATCH  /api/groups/:id          # Update group { name, settings }
DELETE /api/groups/:id          # Archive group (soft delete)

# Things (Dimension 3: Entities/Things)
GET    /api/things              # List things ?type=course&status=active&limit=10&cursor=
GET    /api/things/:id          # Get single thing
POST   /api/things              # Create { groupId, type, name, properties }
PATCH  /api/things/:id          # Update { name, properties, status }
DELETE /api/things/:id          # Soft delete

# Connections (Dimension 4: Relationships)
GET    /api/connections         # List connections in group
GET    /api/connections/:id     # Get connection details
POST   /api/connections         # Create { groupId, fromThingId, toThingId, type }
DELETE /api/connections/:id     # Remove connection
GET    /api/connections?from=:id # Things connected FROM X
GET    /api/connections?to=:id   # Things connected TO X

# Events (Dimension 5: Audit trail)
GET    /api/events              # List events (timeline)
GET    /api/events/:id          # Get event details
POST   /api/events              # Log custom event
GET    /api/events?actor=:id    # Events by actor (person)
GET    /api/events?target=:id   # Events by target (thing)

# Knowledge (Dimension 6: Semantic search)
GET    /api/knowledge           # List knowledge items
GET    /api/knowledge/:id       # Get knowledge details
POST   /api/knowledge           # Create { text, labels, metadata }
DELETE /api/knowledge/:id       # Delete
POST   /api/knowledge/search    # Semantic search { query, limit }
POST   /api/knowledge/embed     # Create embeddings { texts }

# People (Dimension 2: Authorization)
GET    /api/people              # List people in group
GET    /api/people/:id          # Get person details
POST   /api/people              # Create { groupId, email, role }
PATCH  /api/people/:id          # Update role/permissions
DELETE /api/people/:id          # Remove from group
```

**Response Format (Consistent):**

```typescript
// Success response
{
  "data": {
    "_id": "string",
    "groupId": "string",
    "type": "string",
    "name": "string",
    // ... other fields matching ontology
  }
}

// List response
{
  "data": {
    "items": [...],
    "count": 10,
    "hasMore": true,
    "cursor": "abc123"
  }
}

// Error response
{
  "error": {
    "_tag": "EntityNotFound" | "Unauthorized" | "ValidationFailed" | etc.,
    "message": "Human-readable message",
    "details": {} // optional extra context
  }
}
```

---

## 🔗 PHASE 2: HONO HTTP LAYER + INTEGRATION (Week 2-3)

**Status:** Optional but valuable for external API access
**Time:** 3-4 hours
**Deliverable:** External API layer with API key auth

### Option A: Just Connect Frontend to Convex (FAST - 2 hours)

If you just want frontend + backend talking:

```typescript
// The frontend hooks already call the backend perfectly
// Just ensure:
✅ web/.env.local has CONVEX_URL
✅ backend/.env.local has CONVEX_DEPLOYMENT
✅ Both are the same backend deployment
✅ Frontend runs at localhost:4321
✅ Backend at localhost:3210

// Then test end-to-end:
1. Start backend: cd backend && npx convex dev
2. Start frontend: cd web && bun run dev
3. Visit http://localhost:4321/signup
4. Sign up → check convex dashboard for user created
5. Visit dashboard → fetch data from backend
```

**This works TODAY because:**
- ✅ Frontend hooks use DataProvider (backend-agnostic)
- ✅ Better Auth is fully configured
- ✅ All Convex queries/mutations exist (or will after Phase 1)
- ✅ No Hono layer needed unless you want REST API

---

### Option B: Add Hono REST API (BETTER - 4 hours)

If you want external API access (mobile apps, third-party integrations, etc.):

```typescript
// backend/convex/http.ts - Create Hono HTTP layer

import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"
import { httpRouter } from "convex/server"

const app = new Hono()

// Middleware
app.use("*", cors())

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() })
})

// Route to Convex queries
app.get("/api/groups/:id", async (c) => {
  const id = c.req.param("id")
  // Call Convex mutation/query
  // Return response
})

app.post("/api/things", async (c) => {
  const body = await c.req.json()
  // Call Convex mutation
  // Return created ID
})

// ... More routes

export default httpRouter({
  "/": handle(app),
})
```

**This lets you:**
- ✅ Call ONE from mobile apps (API key auth)
- ✅ Build third-party integrations
- ✅ Use Zapier/Make integrations
- ✅ Expose REST API to partners

**Decision:** Skip Hono for now. Connect frontend→backend directly. Add Hono in Phase 4 if needed.

---

## ✅ PHASE 3: FULL SYSTEM TEST (Week 3)

**Status:** After Phase 1 & 2, test the entire stack end-to-end

### Test Checklist (2-3 hours)

```bash
# 1. Start both servers
cd backend && npx convex dev &  # Terminal 1
cd web && bun run dev            # Terminal 2

# 2. Test signup flow
- Visit http://localhost:4321/signup
- Sign up with test email
- Check Convex dashboard for user creation
- Should see Better Auth user created

# 3. Test authentication
- Sign in with same email/password
- Session should persist
- Sign out should clear session

# 4. Test data operations (after Phase 1)
- Create a thing from frontend
- See it appear in Convex dashboard
- Refresh page - data should persist
- Delete from frontend
- Confirm deleted in dashboard

# 5. Test permissions
- Create group
- Try to access as different user (should fail)
- Verify groupId isolation works

# 6. Test error handling
- Try invalid inputs
- Should show friendly error
- No 500 errors in console

# 7. Test performance
- BUN run build should complete
- No TypeScript errors
- No linting errors
```

**Success Criteria:**
- [ ] Signup/signin works
- [ ] Data persists
- [ ] Multi-tenant isolation works
- [ ] No errors in console/logs
- [ ] Build succeeds

---

## 🎯 PHASE 4: BUILD FEATURES ONE AT A TIME (Weeks 4+)

**Pick ONE feature at a time. Complete it fully before starting next.**

### Feature Template (2-3 weeks each):

```
1. Design (2 hours)
   - Map to Things/Connections/Events/Knowledge
   - Identify new entity types
   - Identify new relationship types

2. Backend (4-6 hours)
   - Update schema if needed (add types)
   - Implement queries/mutations
   - Add tests

3. Frontend (4-6 hours)
   - Create components
   - Wire up API calls
   - Add tests

4. Integration (2 hours)
   - E2E tests
   - User flow testing

5. Deploy (1 hour)
   - Staging test
   - Production deploy
```

### Recommended Features (in order):

1. **Blog System** (2 weeks)
   - Things: BlogPost, BlogCategory, BlogTag
   - Connections: published_in, tagged_with
   - Events: post_created, post_published, post_commented
   - UI: Blog list, post view, editor

2. **Portfolio** (1.5 weeks)
   - Things: Project, Skill, Award
   - Connections: showcases, uses_skill
   - UI: Portfolio page, project detail

3. **Course System** (2 weeks)
   - Things: Course, Lesson, Quiz
   - Connections: enrolled_in, completed
   - Events: course_started, lesson_completed
   - UI: Course list, lesson view, progress tracking

4. **Tokens** (2 weeks)
   - Things: Token, TokenHolder
   - Connections: holds_tokens
   - Events: tokens_purchased, tokens_transferred
   - Integration: Stripe payment

5. **Comments System** (1 week)
   - Things: Comment
   - Connections: commented_on
   - Events: comment_created
   - UI: Comment threads

---

## 🚀 PHASE 5: DEPLOYMENT (Week 5+)

**Get it in production and monitored.**

### Staging (1 hour)

```bash
# Build for production
cd web && bun run build

# Deploy to staging
wrangler pages deploy dist --project-name=one-staging

# Test at https://staging.one.ie
# Create account, verify flow works
```

### Production (1 hour)

```bash
# Same as staging but to production
wrangler pages deploy dist --project-name=one

# Live at https://one.ie
# Tell the world! 🎉
```

### Monitoring (1 hour)

```
Set up:
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- Uptime monitoring
- Email alerts for critical errors
```

---

## 📊 COMPLETE TIMELINE

```
This Week (3 days):        Quick Wins (polish foundation)
Week 1-2 (10 hours):       Complete backend stubs + Phase 1
Week 2-3 (4 hours):        Connect frontend to backend (Phase 2)
Week 3 (3 hours):          Full system test (Phase 3)
Week 4 onwards (2-3 wks):  Build features one at a time

TOTAL TO PRODUCTION: 4-5 weeks with solid foundation
```

---

## 🎓 Key Principles

1. **Don't rebuild - build on what exists**
   - Frontend is complete
   - Schema is complete
   - Auth is complete
   - Just fill in the backend stubs

2. **One feature at a time**
   - Complete feature fully before next
   - Each feature tests the whole stack
   - Quick wins = fast feedback

3. **Test end-to-end**
   - Frontend → Backend → Database → Frontend
   - Real user flows, not just unit tests
   - Proves integration works

4. **Deploy early, often**
   - Staging after each feature
   - Production after testing
   - Learn from real usage

5. **Follow the patterns**
   - Every feature: Things → Connections → Events → Knowledge
   - Every mutation: create, update, delete with logging
   - Every component: loading, error, success states

---

## ✅ RIGHT NOW: Start Here

```bash
# 1. Read this file completely (15 min)

# 2. Pick your first quick win (2 hours)
   - Error Taxonomy, OR
   - Type Safety Audit, OR
   - Service Documentation

# 3. After quick wins, start Phase 1 (8-10 hours)
   - Complete backend stubs
   - All queries/mutations fully implemented
   - Tests passing

# 4. Phase 2: Connect frontend to backend (2-4 hours)
   - Test signup/signin flow
   - Verify data persists
   - Confirm no errors

# 5. Phase 3: Full system test (3 hours)
   - Create thing from frontend
   - Verify it appears in backend
   - Test multi-tenant isolation

# 6. Phase 4: Build your first feature (2-3 weeks)
   - Pick blog, portfolio, or courses
   - Complete fully
   - Deploy to staging

# 7. Go live! 🚀
```

---

**You have everything you need. You're 90% done. Just finish the backend, test it, and launch. The world is waiting.** 🎉

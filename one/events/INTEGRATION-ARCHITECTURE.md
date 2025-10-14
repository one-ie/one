# Integration Architecture - Visual Guide

**Integration Specialist Deliverable**
**Date:** 2025-10-13

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Astro 5 Pages (SSR)                                     │  │
│  │  - /pages/dashboard.astro                                │  │
│  │  - /pages/admin/organizations.astro                      │  │
│  │  - /pages/account/*.astro                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 19 Components (Islands)                           │  │
│  │  - OrganizationList.tsx                                  │  │
│  │  - ThingCard.tsx                                         │  │
│  │  - SemanticSearch.tsx                                    │  │
│  │  (client:load for interactivity)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Hooks (Provider-Agnostic)                               │  │
│  │  - useDataProvider()                                     │  │
│  │  - useRealtimeData()                                     │  │
│  │  - useOrganizations()                                    │  │
│  │  - useThings()                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ IDataProvider Interface
                     │ (Protocol-Agnostic)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DATA PROVIDER LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  IDataProvider Interface                                 │  │
│  │  - organizations: OrganizationOperations                 │  │
│  │  - people: PeopleOperations                              │  │
│  │  - things: ThingOperations                               │  │
│  │  - connections: ConnectionOperations                     │  │
│  │  - events: EventOperations                               │  │
│  │  - knowledge: KnowledgeOperations                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Provider Implementations                                │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│  │  │  Convex     │ │ Supabase    │ │ Composite   │       │  │
│  │  │  Provider   │ │ Provider    │ │ Provider    │       │  │
│  │  │             │ │             │ │             │       │  │
│  │  │ Real-time   │ │ pgvector    │ │ Multi-      │       │  │
│  │  │ WebSocket   │ │ PostgreSQL  │ │ backend     │       │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│  │  │ WordPress   │ │ Shopify     │ │ Notion      │       │  │
│  │  │ Provider    │ │ Provider    │ │ Provider    │       │  │
│  │  │             │ │             │ │             │       │  │
│  │  │ CMS         │ │ E-commerce  │ │ Docs        │       │  │
│  │  │ Polling     │ │ REST API    │ │ Webhooks    │       │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ API Calls, WebSocket, REST, GraphQL
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Convex Backend (Primary)                               │  │
│  │  - Real-time database (WebSocket)                        │  │
│  │  - Typed functions (queries, mutations, actions)         │  │
│  │  - Better Auth (session management)                      │  │
│  │  - Vector search (embeddings)                            │  │
│  │  - Rate limiting (@convex-dev/rate-limiter)             │  │
│  │  - Email (Resend component)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Alternative Backends                                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│  │  │ Supabase    │ │ WordPress   │ │ Shopify     │       │  │
│  │  │ PostgreSQL  │ │ CMS         │ │ E-commerce  │       │  │
│  │  │ pgvector    │ │ REST API    │ │ REST API    │       │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│  │  ┌─────────────┐                                        │  │
│  │  │ Notion      │                                        │  │
│  │  │ Docs        │                                        │  │
│  │  │ GraphQL     │                                        │  │
│  │  └─────────────┘                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6-Dimension Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   1. ORGANIZATIONS                              │
│  Multi-tenant isolation boundary                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend: useOrganizations()                           │   │
│  │      ↓                                                   │   │
│  │  Provider: organizations.list(userId)                   │   │
│  │      ↓                                                   │   │
│  │  Backend: Query entities WHERE type="organization"      │   │
│  │           + Filter by membership connections            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   2. PEOPLE                                     │
│  Authorization & governance                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend: useAuth()                                    │   │
│  │      ↓                                                   │   │
│  │  Provider: auth.getCurrentUser()                        │   │
│  │      ↓                                                   │   │
│  │  Backend: Better Auth + role-based permissions         │   │
│  │           Roles: platform_owner, org_owner, org_user    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   3. THINGS                                     │
│  All entities (66 types)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend: useThings({ type: "blog_post" })            │   │
│  │      ↓                                                   │   │
│  │  Provider: things.list(type)                            │   │
│  │      ↓ (Route to appropriate backend)                   │   │
│  │  CompositeProvider:                                     │   │
│  │    - "blog_post" → WordPress                            │   │
│  │    - "product" → Shopify                                │   │
│  │    - "document" → Notion                                │   │
│  │    - default → Convex                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   4. CONNECTIONS                                │
│  All relationships (25 types)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend: useConnections({ thingId })                  │   │
│  │      ↓                                                   │   │
│  │  Provider: connections.list(thingId)                    │   │
│  │      ↓                                                   │   │
│  │  Backend: Query connections (bidirectional)             │   │
│  │    - Outgoing: from_entity index                        │   │
│  │    - Incoming: to_entity index                          │   │
│  │    - Cross-backend: Convex ↔ WordPress ↔ Notion        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   5. EVENTS                                     │
│  All actions (67 types)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend: useEvents({ thingId })                       │   │
│  │      ↓                                                   │   │
│  │  Provider: events.listForThing(thingId)                 │   │
│  │      ↓                                                   │   │
│  │  Backend: Complete audit trail                          │   │
│  │    - Actor tracking (who did what)                      │   │
│  │    - Protocol metadata (A2A, ACP, AP2, X402, AG-UI)    │   │
│  │    - Spans provider boundaries                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   6. KNOWLEDGE                                  │
│  Labels, embeddings, semantic search                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend: useSemanticSearch({ query, orgId })          │   │
│  │      ↓                                                   │   │
│  │  Provider: knowledge.search(query)                      │   │
│  │      ↓ (Unified search across backends)                 │   │
│  │  CompositeProvider:                                     │   │
│  │    - Search Convex (native vectors)                     │   │
│  │    - Search Supabase (pgvector)                         │   │
│  │    - Search Notion (API)                                │   │
│  │    - Merge and rank results                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Real-Time Coordination

```
┌─────────────────────────────────────────────────────────────────┐
│                   REAL-TIME STRATEGY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │   Convex      │  │  Supabase     │  │  WordPress    │      │
│  │               │  │               │  │               │      │
│  │  Native       │  │  PostgreSQL   │  │  Polling      │      │
│  │  WebSocket    │  │  Real-time    │  │  Fallback     │      │
│  │               │  │               │  │  (30s)        │      │
│  │  useQuery()   │  │  .on()        │  │  setInterval  │      │
│  │  (automatic)  │  │  subscribe()  │  │  ()           │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│         ↓                  ↓                   ↓                │
│         └──────────────────┴───────────────────┘                │
│                            ↓                                    │
│              ┌──────────────────────────┐                       │
│              │  useRealtimeData()       │                       │
│              │  (Provider-agnostic)     │                       │
│              └──────────────────────────┘                       │
│                            ↓                                    │
│              ┌──────────────────────────┐                       │
│              │  Frontend Component      │                       │
│              │  (Auto-updates)          │                       │
│              └──────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

**Real-Time Support:**

- ✅ **Convex:** Native WebSocket (preferred)
- ✅ **Supabase:** PostgreSQL real-time subscriptions
- ✅ **WordPress:** Polling fallback (no native real-time)
- ✅ **Notion:** Webhook-based updates

**Frontend receives updates regardless of backend!**

---

## Multi-Backend Federation

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPOSITE PROVIDER ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Frontend                                                │  │
│  │  const things = useThings({ type: "blog_post" });       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CompositeProvider (Router)                             │  │
│  │                                                          │  │
│  │  switch (type) {                                        │  │
│  │    case "blog_post": → WordPress                        │  │
│  │    case "product": → Shopify                            │  │
│  │    case "document": → Notion                            │  │
│  │    default: → Convex                                    │  │
│  │  }                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │              │              │              │          │
│         ↓              ↓              ↓              ↓          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │WordPress │   │ Shopify  │   │ Notion   │   │ Convex   │   │
│  │ Provider │   │ Provider │   │ Provider │   │ Provider │   │
│  │          │   │          │   │          │   │          │   │
│  │ Blog     │   │ Products │   │ Docs     │   │ Users    │   │
│  │ Posts    │   │ Orders   │   │ Pages    │   │ Orgs     │   │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│         │              │              │              │          │
│         ↓              ↓              ↓              ↓          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Central Event Log (Convex)                             │  │
│  │  - All sync events logged                               │  │
│  │  - Cross-backend consistency                            │  │
│  │  - Audit trail maintained                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Backend Routing Rules:**

| Thing Type | Primary Backend | Sync Strategy |
|------------|----------------|---------------|
| `creator`, `organization`, `agent`, `token` | Convex | Native |
| `blog_post`, `social_post` | WordPress | Read-only sync to Convex |
| `product`, `payment`, `subscription` | Shopify | Event-driven sync |
| `document`, `knowledge_item` | Notion | Bidirectional sync |

**Cross-Backend Consistency:**

- Event-driven sync (webhooks)
- Central event log in Convex
- Scheduled reconciliation jobs
- Conflict resolution strategies

---

## Migration Phases (Visual Timeline)

```
┌─────────────────────────────────────────────────────────────────┐
│                   7-PHASE MIGRATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Interface Definition (Week 1)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Define IDataProvider interface                          │  │
│  │  ✅ Type definitions for all 6 dimensions                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Phase 2: ConvexProvider (Week 2)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Implement ConvexProvider                                │  │
│  │  ✅ 100% backward compatibility                           │  │
│  │  ✅ All 6 dimensions operational                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Phase 3: Service Layer (Week 3)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Implement Effect.ts services                            │  │
│  │  ✅ Pure business logic                                   │  │
│  │  ✅ Typed errors                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Phase 4: Configuration (Week 4)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Add provider configuration                              │  │
│  │  ✅ Provider factory                                      │  │
│  │  ✅ React Context                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Phase 5: Component Migration (Weeks 5-6)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Week 5: Non-critical pages                              │  │
│  │    /about, /docs, /blog, /account/settings               │  │
│  │  Week 6: Critical pages                                  │  │
│  │    /dashboard, /account, /admin                          │  │
│  │  ✅ Auth tests after each migration                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Phase 6: Cleanup (Week 7)                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Remove old dependencies                                 │  │
│  │  ✅ Direct Convex imports removed                         │  │
│  │  ✅ All tests pass                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Phase 7: Alternative Providers (Week 8+)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Implement alternative providers                         │  │
│  │  ✅ SupabaseProvider                                      │  │
│  │  ✅ WordPressProvider                                     │  │
│  │  ✅ CompositeProvider                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Propagation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Backend Error (Effect.ts)                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  class OrganizationNotFoundError                         │  │
│  │    extends Data.TaggedError("OrgNotFound")               │  │
│  │  { orgId: string }                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Provider Error                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  class ProviderError extends Error {                     │  │
│  │    message: "Organization not found"                     │  │
│  │    code: "ORGANIZATION_NOT_FOUND"                        │  │
│  │    provider: "convex"                                    │  │
│  │    retryable: false                                      │  │
│  │  }                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  Frontend Display                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  <Alert variant="destructive">                           │  │
│  │    <AlertTitle>Error</AlertTitle>                        │  │
│  │    <AlertDescription>                                    │  │
│  │      Organization not found                              │  │
│  │      Provider: convex | Code: ORGANIZATION_NOT_FOUND     │  │
│  │    </AlertDescription>                                   │  │
│  │  </Alert>                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Retry Strategy (for retryable errors)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Attempt 1: Immediate                                    │  │
│  │  Attempt 2: Wait 1s (exponential backoff)                │  │
│  │  Attempt 3: Wait 2s                                      │  │
│  │  Attempt 4: Wait 4s                                      │  │
│  │  Max retries: 3                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              DEPLOYMENT ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Cloudflare Pages)                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Astro 5 + React 19                                      │  │
│  │  Runtime: Cloudflare Workers (edge)                      │  │
│  │  CDN: Global edge network                                │  │
│  │                                                          │  │
│  │  Deploy: bun run build → wrangler pages deploy           │  │
│  │  Rollback: wrangler pages rollback                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓ API Calls                          │
│  Backend (Convex Cloud)                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Real-time database                                      │  │
│  │  Region: Auto (global replication)                       │  │
│  │  Typed functions (queries, mutations, actions)           │  │
│  │                                                          │  │
│  │  Deploy: npx convex deploy --prod                        │  │
│  │  Status: npx convex status                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  External Backends (Optional)                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ WordPress  │  │ Shopify    │  │ Notion     │              │
│  │ Self-hosted│  │ SaaS       │  │ SaaS       │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└─────────────────────────────────────────────────────────────────┘

Zero-Downtime Migration (Feature Flags)
┌──────────────────────────────────────────────────────────────┐
│  Rollout Plan:                                               │
│  Week 1: 0%   (deploy code, flag off)                       │
│  Week 2: 5%   (internal testing)                            │
│  Week 3: 10%  (early adopters)                              │
│  Week 4: 25%  (monitoring for issues)                       │
│  Week 5: 50%  (half of users)                               │
│  Week 6: 75%  (most users)                                  │
│  Week 7: 100% (full rollout)                                │
│                                                              │
│  Rollback: Instant (set feature flag to 0%)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Success Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│              SUCCESS METRICS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Ontology Alignment                                            │
│  ✅ Organizations: Multi-tenant isolation enforced             │
│  ✅ People: Role-based authorization working                   │
│  ✅ Things: All 66 types supported                             │
│  ✅ Connections: Bidirectional relationships                   │
│  ✅ Events: Complete audit trail                               │
│  ✅ Knowledge: Vector search operational                       │
│                                                                 │
│  Protocol Integration                                          │
│  ✅ A2A: Agent-to-agent communication                          │
│  ✅ ACP: Agentic commerce protocol                             │
│  ✅ AP2: Agent payments protocol                               │
│  ✅ X402: HTTP micropayments                                   │
│  ✅ AG-UI: Generative UI (CopilotKit)                          │
│                                                                 │
│  Technical Quality                                             │
│  ✅ Data flows work end-to-end                                 │
│  ✅ Errors handled gracefully                                  │
│  ✅ User journeys tested                                       │
│  ✅ Auth tests pass (50+ cases, 100% pass rate)                │
│  ✅ Performance: Context < 1.5KB, Latency < 100ms              │
│                                                                 │
│  Coordination                                                  │
│  ✅ Frontend + Backend specialists aligned                     │
│  ✅ Quality agent validates flows                              │
│  ✅ Integration specialist coordinates                         │
│  ✅ No manual handoffs                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Provider Interface

```typescript
interface IDataProvider {
  // 6 Dimensions
  organizations: OrganizationOperations;
  people: PeopleOperations;
  things: ThingOperations;
  connections: ConnectionOperations;
  events: EventOperations;
  knowledge: KnowledgeOperations;

  // Metadata
  name: string;
  supportsRealtime: boolean;
  capabilities: string[];
}
```

### Frontend Usage

```typescript
// Get provider from context
const provider = useDataProvider();

// Use provider methods
const orgs = await provider.organizations.list({ userId });
const things = await provider.things.list({ type: "blog_post" });
const events = await provider.events.listForThing({ thingId });

// Real-time updates
const data = useRealtimeData(provider, { type: "organizations" });
```

### Backend Implementation

```typescript
// Effect.ts service
export class ThingService extends Effect.Service<ThingService>() {
  create: (args) => Effect.gen(function* () {
    // Create entity
    const thingId = yield* Effect.tryPromise(() =>
      db.insert("entities", { ... })
    );
    // Create connection
    yield* Effect.tryPromise(() =>
      db.insert("connections", { ... })
    );
    // Log event
    yield* Effect.tryPromise(() =>
      db.insert("events", { ... })
    );
    return thingId;
  });
}
```

---

**Integration Specialist: Connect systems. Map protocols. Respect the ontology. Make integrations seamless.**

---

**End of Integration Architecture Visual Guide**

# Codebase Improvement Plan: Full Integration & Accuracy

**Status:** Draft
**Version:** 1.0.0
**Date:** 2025-10-18
**Goal:** Achieve complete ontology integration, eliminate gaps, and ensure production-ready accuracy across all 6 dimensions

---

## Executive Summary

The ONE platform has a **world-class ontology** (6 dimensions, 66 thing types, 25 connections, 67 events) but **incomplete implementation**. This plan identifies 47 specific improvements across backend, frontend, integration, and operations to achieve 100% ontology coverage and production readiness.

**Current State:**
- ✅ Excellent: Ontology design, schema definition, documentation
- ⚠️ Partial: Backend mutations/queries, frontend integration, auth linkage
- ❌ Missing: Effect.ts glue layer, protocol integration, RAG implementation, multi-tenant UI

**Target State:**
- 100% ontology coverage in backend (all 66 thing types, 25 connections, 67 events)
- Complete Effect.ts glue layer with typed errors and service composition
- Full multi-tenant frontend with group hierarchy navigation
- Protocol integration (A2A, ACP, AP2, X402, AG-UI) via metadata
- Production-grade RAG with knowledge chunking and vector search
- Automated testing across all dimensions

---

## Part 1: Backend Integration (Convex + Effect.ts)

### 1.1 Missing Backend Mutations/Queries

**Problem:** Only `groups` and `connections` have implementations. Missing 64 other thing types.

**Impact:** Cannot create/update/delete most entities (courses, tokens, agents, content, etc.)

**Solution:** Generate complete CRUD operations for all thing types

<details>
<summary>📋 Click to expand: Missing Backend Operations</summary>

**Priority 1 (Core Entities):**
```typescript
// backend/convex/mutations/entities.ts
export const createCreator = mutation({ ... })
export const createAiClone = mutation({ ... })
export const createOrganization = mutation({ ... })
export const updateCreator = mutation({ ... })
```

**Priority 2 (Content & Products):**
```typescript
// backend/convex/mutations/content.ts
export const createBlogPost = mutation({ ... })
export const createCourse = mutation({ ... })
export const createLesson = mutation({ ... })
export const publishContent = mutation({ ... })
```

**Priority 3 (Tokens & Commerce):**
```typescript
// backend/convex/mutations/tokens.ts
export const createToken = mutation({ ... })
export const mintTokens = mutation({ ... })
export const transferTokens = mutation({ ... })
```

**Priority 4 (Agents & AI):**
```typescript
// backend/convex/mutations/agents.ts
export const createStrategyAgent = mutation({ ... })
export const createMarketingAgent = mutation({ ... })
export const executeAgent = mutation({ ... })
```

**Priority 5 (Auth & Session):**
```typescript
// backend/convex/mutations/auth.ts
export const createSession = mutation({ ... })
export const createOAuthAccount = mutation({ ... })
export const create2FA = mutation({ ... })
```

</details>

**Acceptance Criteria:**
- [ ] All 66 thing types have create/update/archive mutations
- [ ] All 25 connection types have create/update/delete mutations
- [ ] All mutations log appropriate events
- [ ] All mutations enforce groupId scoping
- [ ] TypeScript strict mode passes with no errors

**Effort:** 40 hours (5 days)

---

### 1.2 Effect.ts Glue Layer (100% Coverage Goal)

**Problem:** No Effect.ts layer exists. Business logic mixed with Convex mutations.

**Impact:** No composability, no typed errors, difficult testing, high coupling

**Solution:** Implement complete Effect.ts service layer as documented

<details>
<summary>📋 Click to expand: Effect.ts Architecture</summary>

**Service Structure:**
```typescript
// backend/convex/services/entities/creator.service.ts
import { Effect, Layer } from "effect"

export class CreatorService extends Effect.Service<CreatorService>()("CreatorService", {
  effect: Effect.gen(function* () {
    const db = yield* DatabaseService
    const events = yield* EventLogService

    const create = (input: CreateCreatorInput) =>
      Effect.gen(function* () {
        // 1. Validate input
        yield* validateCreatorInput(input)

        // 2. Check permissions
        yield* checkGroupOwnership(input.groupId)

        // 3. Create entity
        const creatorId = yield* db.insert("entities", {
          groupId: input.groupId,
          type: "creator",
          name: input.name,
          properties: input.properties,
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now()
        })

        // 4. Log event
        yield* events.log({
          groupId: input.groupId,
          type: "entity_created",
          actorId: input.actorId,
          targetId: creatorId,
          timestamp: Date.now(),
          metadata: { entityType: "creator" }
        })

        return creatorId
      }).pipe(
        Effect.mapError(e => new CreatorCreationError(e))
      )

    return { create, update, archive, get, list } as const
  })
}) {}
```

**Error Hierarchy:**
```typescript
// backend/convex/services/errors.ts
export class EntityError extends Data.TaggedClass("EntityError")<{
  message: string
  entityType: string
}> {}

export class CreatorCreationError extends EntityError {
  readonly _tag = "CreatorCreationError"
}

export class ValidationError extends Data.TaggedClass("ValidationError")<{
  field: string
  reason: string
}> {}

export class PermissionError extends Data.TaggedClass("PermissionError")<{
  userId: string
  groupId: string
  action: string
}> {}
```

**Service Composition:**
```typescript
// backend/convex/services/layers.ts
export const ServicesLayer = Layer.mergeAll(
  DatabaseServiceLive,
  EventLogServiceLive,
  CreatorServiceLive,
  GroupServiceLive,
  ConnectionServiceLive,
  AuthServiceLive
)

// Usage in Convex mutation:
export const createCreator = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const program = Effect.gen(function* () {
      const creatorService = yield* CreatorService
      return yield* creatorService.create(args)
    })

    return await Effect.runPromise(
      program.pipe(Effect.provide(ServicesLayer))
    )
  }
})
```

</details>

**Acceptance Criteria:**
- [ ] All 66 thing types have Effect.ts services
- [ ] All services use tagged errors (no try/catch)
- [ ] All services compose via Layer.mergeAll
- [ ] Services have 90%+ test coverage
- [ ] Mutations are thin wrappers (< 10 lines each)

**Effort:** 80 hours (10 days)

---

### 1.3 Event Logging Completeness

**Problem:** Events are only logged in `groups.ts`. Missing from all other operations.

**Impact:** No audit trail, no analytics, no real-time updates

**Solution:** Implement comprehensive event logging service

<details>
<summary>📋 Click to expand: Event Logging Strategy</summary>

**EventLogService:**
```typescript
// backend/convex/services/events/event-log.service.ts
export class EventLogService extends Effect.Service<EventLogService>()("EventLogService", {
  effect: Effect.gen(function* () {
    const db = yield* DatabaseService

    const log = (event: EventInput) =>
      Effect.gen(function* () {
        // Validate event structure
        yield* validateEvent(event)

        // Insert event
        const eventId = yield* db.insert("events", {
          groupId: event.groupId,
          type: event.type,
          actorId: event.actorId,
          targetId: event.targetId,
          timestamp: event.timestamp,
          metadata: event.metadata
        })

        // Trigger real-time subscriptions (Convex handles this)
        return eventId
      })

    const query = (filters: EventFilters) =>
      Effect.gen(function* () {
        const events = yield* db.query("events")
          .withIndex("group_type", q =>
            q.eq("groupId", filters.groupId)
             .eq("type", filters.type)
          )
          .collect()

        return events
      })

    return { log, query, getByActor, getByTarget } as const
  })
}) {}
```

**Automatic Event Logging:**
```typescript
// Wrap every mutation with event logging
const withEventLogging = <T>(
  operation: Effect.Effect<T, any, any>,
  eventType: EventType,
  metadata?: Record<string, any>
) =>
  Effect.gen(function* () {
    const result = yield* operation
    const events = yield* EventLogService

    yield* events.log({
      type: eventType,
      actorId: metadata.actorId,
      targetId: result,
      timestamp: Date.now(),
      metadata
    })

    return result
  })
```

**Coverage Matrix:**
```typescript
// Ensure every mutation logs the right event
const EVENT_COVERAGE = {
  // Entity lifecycle
  "entities.create": "entity_created",
  "entities.update": "entity_updated",
  "entities.archive": "entity_archived",

  // User events
  "auth.register": "user_registered",
  "auth.login": "user_login",
  "auth.verify": "email_verified",

  // Group events
  "groups.create": "group_created",
  "groups.invite": "user_invited_to_group",

  // Token events
  "tokens.mint": "token_minted",
  "tokens.transfer": "tokens_transferred",

  // ... (67 total event types)
}
```

</details>

**Acceptance Criteria:**
- [ ] All 67 event types are logged automatically
- [ ] EventLogService uses Effect.ts with typed errors
- [ ] Events include proper groupId scoping
- [ ] Event metadata follows ontology spec
- [ ] Real-time event streaming works in frontend

**Effort:** 24 hours (3 days)

---

### 1.4 Connection Management

**Problem:** Basic connection CRUD exists but lacks relationship-specific logic

**Impact:** Cannot enforce connection rules (e.g., revenue splits, token balances)

**Solution:** Implement connection services with business rules

<details>
<summary>📋 Click to expand: Connection Services</summary>

**Ownership Connections:**
```typescript
// backend/convex/services/connections/ownership.service.ts
export const createOwnership = (input: OwnershipInput) =>
  Effect.gen(function* () {
    const connections = yield* ConnectionService

    // Validate ownership rules
    if (input.metadata?.revenueShare) {
      yield* validateRevenueShare(input.metadata.revenueShare)
    }

    // Create connection
    return yield* connections.create({
      fromEntityId: input.ownerId,
      toEntityId: input.ownedEntityId,
      relationshipType: "owns",
      metadata: input.metadata
    })
  })
```

**Token Holdings:**
```typescript
// backend/convex/services/connections/token-holdings.service.ts
export const updateTokenBalance = (input: TokenBalanceInput) =>
  Effect.gen(function* () {
    const connections = yield* ConnectionService

    // Get existing holding connection
    const existing = yield* connections.getByType({
      fromEntityId: input.userId,
      toEntityId: input.tokenId,
      relationshipType: "holds_tokens"
    })

    if (existing) {
      // Update balance
      yield* connections.update({
        connectionId: existing._id,
        metadata: {
          ...existing.metadata,
          balance: input.newBalance
        }
      })
    } else {
      // Create new holding
      yield* connections.create({
        fromEntityId: input.userId,
        toEntityId: input.tokenId,
        relationshipType: "holds_tokens",
        metadata: { balance: input.newBalance }
      })
    }
  })
```

**Group Membership with Roles:**
```typescript
// backend/convex/services/connections/membership.service.ts
export const addGroupMember = (input: MembershipInput) =>
  Effect.gen(function* () {
    const connections = yield* ConnectionService
    const events = yield* EventLogService

    // Validate role
    yield* validateGroupRole(input.role)

    // Check if already member
    const existing = yield* connections.getByType({
      fromEntityId: input.userId,
      toEntityId: input.groupId,
      relationshipType: "member_of"
    })

    if (existing) {
      return yield* new MembershipError({ message: "Already a member" })
    }

    // Create membership connection
    const connectionId = yield* connections.create({
      fromEntityId: input.userId,
      toEntityId: input.groupId,
      relationshipType: "member_of",
      metadata: {
        role: input.role,
        invitedBy: input.inviterId,
        joinedAt: Date.now()
      }
    })

    // Log event
    yield* events.log({
      groupId: input.groupId,
      type: "user_joined_group",
      actorId: input.userId,
      targetId: input.groupId,
      timestamp: Date.now(),
      metadata: { role: input.role }
    })

    return connectionId
  })
```

</details>

**Acceptance Criteria:**
- [ ] All 25 connection types have specialized services
- [ ] Connection rules are enforced (revenue shares, balances, etc.)
- [ ] Bidirectional queries work (fromEntity and toEntity)
- [ ] Connection metadata follows ontology spec
- [ ] All connection operations log events

**Effort:** 32 hours (4 days)

---

### 1.5 Knowledge & RAG Implementation

**Problem:** Knowledge table exists but RAG ingestion pipeline is missing

**Impact:** Cannot use vector search, no AI-powered features

**Solution:** Implement complete RAG pipeline as documented in ontology

<details>
<summary>📋 Click to expand: RAG Implementation</summary>

**Chunking Service:**
```typescript
// backend/convex/services/knowledge/chunking.service.ts
export class ChunkingService extends Effect.Service<ChunkingService>()("ChunkingService", {
  effect: Effect.gen(function* () {
    const chunk = (text: string, options: ChunkOptions) =>
      Effect.gen(function* () {
        const windowSize = options.windowSize || 800
        const overlap = options.overlap || 200

        // Smart sentence-aware chunking
        const sentences = text.split(/[.!?]+/)
        const chunks: Chunk[] = []
        let currentChunk = ""
        let tokenCount = 0

        for (const sentence of sentences) {
          const sentenceTokens = estimateTokens(sentence)

          if (tokenCount + sentenceTokens > windowSize && currentChunk.length > 0) {
            chunks.push({
              text: currentChunk.trim(),
              tokenCount,
              index: chunks.length
            })

            // Keep overlap for context
            const overlapText = currentChunk.slice(-overlap)
            currentChunk = overlapText + sentence
            tokenCount = estimateTokens(currentChunk)
          } else {
            currentChunk += sentence
            tokenCount += sentenceTokens
          }
        }

        // Add final chunk
        if (currentChunk.length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            tokenCount,
            index: chunks.length
          })
        }

        return chunks
      })

    return { chunk } as const
  })
}) {}
```

**Embedding Service:**
```typescript
// backend/convex/services/knowledge/embedding.service.ts
export class EmbeddingService extends Effect.Service<EmbeddingService>()("EmbeddingService", {
  effect: Effect.gen(function* () {
    const config = yield* ConfigService

    const embed = (text: string) =>
      Effect.gen(function* () {
        const model = config.embeddingModel || "text-embedding-3-large"

        // Call OpenAI API
        const response = yield* Effect.tryPromise({
          try: () => fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.openaiApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ model, input: text })
          }),
          catch: (e) => new EmbeddingError({ message: String(e) })
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (e) => new EmbeddingError({ message: String(e) })
        })

        return {
          embedding: data.data[0].embedding,
          model,
          dim: data.data[0].embedding.length
        }
      })

    return { embed, embedBatch } as const
  })
}) {}
```

**RAG Ingestion Pipeline:**
```typescript
// backend/convex/services/knowledge/rag-ingestion.service.ts
export const ingestThing = (thingId: string, fields?: string[]) =>
  Effect.gen(function* () {
    const entities = yield* EntityService
    const chunking = yield* ChunkingService
    const embedding = yield* EmbeddingService
    const knowledge = yield* KnowledgeService

    // 1. Get thing
    const thing = yield* entities.get(thingId)

    // 2. Extract text from specified fields
    const texts = yield* extractTexts(thing, fields)

    // 3. Chunk each text
    const allChunks = []
    for (const { field, text, labels } of texts) {
      const chunks = yield* chunking.chunk(text, {
        windowSize: 800,
        overlap: 200
      })

      allChunks.push(...chunks.map(c => ({ ...c, field, labels })))
    }

    // 4. Embed chunks (batch for efficiency)
    const embeddings = yield* embedding.embedBatch(
      allChunks.map(c => c.text)
    )

    // 5. Store knowledge items
    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i]
      const { embedding: vector, model, dim } = embeddings[i]

      const knowledgeId = yield* knowledge.create({
        groupId: thing.groupId,
        knowledgeType: "chunk",
        text: chunk.text,
        embedding: vector,
        embeddingModel: model,
        embeddingDim: dim,
        sourceThingId: thingId,
        sourceField: chunk.field,
        chunk: {
          index: chunk.index,
          tokenCount: chunk.tokenCount,
          overlap: 200
        },
        labels: chunk.labels
      })

      // 6. Link to thing via junction table
      yield* knowledge.linkToThing({
        thingId,
        knowledgeId,
        role: "chunk_of"
      })
    }

    return allChunks.length
  })
```

**Vector Search:**
```typescript
// backend/convex/services/knowledge/vector-search.service.ts
export const search = (query: string, options: SearchOptions) =>
  Effect.gen(function* () {
    const embedding = yield* EmbeddingService
    const knowledge = yield* KnowledgeService

    // 1. Embed query
    const { embedding: queryVector } = yield* embedding.embed(query)

    // 2. Vector search (use Convex vector search when available)
    const results = yield* knowledge.vectorSearch({
      vectorField: "embedding",
      query: queryVector,
      filter: {
        groupId: options.groupId,
        knowledgeType: "chunk"
      },
      k: options.k || 10
    })

    // 3. Hybrid scoring with lexical signals
    const scored = results.map(r => ({
      ...r,
      hybridScore: r.similarity * 0.7 + lexicalScore(query, r.text) * 0.3
    }))

    return scored.sort((a, b) => b.hybridScore - a.hybridScore)
  })
```

</details>

**Acceptance Criteria:**
- [ ] Chunking service handles 800-token windows with 200-token overlap
- [ ] Embedding service integrates with OpenAI API
- [ ] RAG ingestion pipeline processes all content types
- [ ] Vector search returns relevant chunks with hybrid scoring
- [ ] Knowledge labels work for taxonomy/categorization
- [ ] Junction table (thingKnowledge) links chunks to entities

**Effort:** 60 hours (7.5 days)

---

## Part 2: Frontend Integration (Astro + React)

### 2.1 Multi-Tenant Dashboard

**Problem:** No group-scoped UI. No hierarchy navigation.

**Impact:** Cannot manage nested groups or visualize ontology

**Solution:** Build complete multi-tenant dashboard

<details>
<summary>📋 Click to expand: Dashboard Components</summary>

**Group Selector:**
```tsx
// web/src/components/groups/GroupSelector.tsx
export function GroupSelector() {
  const currentGroup = useQuery(api.queries.groups.getById, {
    groupId: useGroupId()
  })
  const hierarchy = useQuery(api.queries.groups.getHierarchy, {
    rootGroupId: currentGroup?._id
  })

  return (
    <Select value={currentGroup?._id} onValueChange={switchGroup}>
      <SelectTrigger>
        <SelectValue>
          {currentGroup?.name} ({currentGroup?.type})
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {hierarchy?.map(group => (
          <SelectItem key={group._id} value={group._id}>
            {"  ".repeat(group.depth)}{group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**Ontology Browser:**
```tsx
// web/src/components/ontology/OntologyBrowser.tsx
export function OntologyBrowser({ groupId }: { groupId: string }) {
  const [dimension, setDimension] = useState<Dimension>("things")

  return (
    <div className="grid grid-cols-[250px_1fr]">
      {/* Sidebar: 6 Dimensions */}
      <aside>
        <nav>
          <button onClick={() => setDimension("groups")}>
            1. Groups
          </button>
          <button onClick={() => setDimension("people")}>
            2. People
          </button>
          <button onClick={() => setDimension("things")}>
            3. Things
          </button>
          <button onClick={() => setDimension("connections")}>
            4. Connections
          </button>
          <button onClick={() => setDimension("events")}>
            5. Events
          </button>
          <button onClick={() => setDimension("knowledge")}>
            6. Knowledge
          </button>
        </nav>
      </aside>

      {/* Main: Dimension Content */}
      <main>
        {dimension === "things" && <ThingsView groupId={groupId} />}
        {dimension === "connections" && <ConnectionsView groupId={groupId} />}
        {dimension === "events" && <EventsView groupId={groupId} />}
        {/* ... */}
      </main>
    </div>
  )
}
```

**Real-Time Stats:**
```tsx
// web/src/components/dashboard/DashboardStats.tsx
export function DashboardStats({ groupId }: { groupId: string }) {
  const stats = useQuery(api.queries.groups.getStats, {
    groupId,
    includeSubgroups: true
  })

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatsCard
        title="Members"
        value={stats?.stats.members}
        icon={Users}
      />
      <StatsCard
        title="Entities"
        value={stats?.stats.entities}
        icon={Box}
      />
      <StatsCard
        title="Connections"
        value={stats?.stats.connections}
        icon={Link}
      />
      <StatsCard
        title="Events"
        value={stats?.stats.events}
        icon={Activity}
      />
    </div>
  )
}
```

</details>

**Acceptance Criteria:**
- [ ] Group selector shows full hierarchy with nesting
- [ ] Dashboard scopes all data to selected group
- [ ] Real-time stats update via Convex subscriptions
- [ ] Ontology browser shows all 6 dimensions
- [ ] Role-based access control works (group_owner vs group_user)

**Effort:** 40 hours (5 days)

---

### 2.2 Entity Management UI

**Problem:** No UI to create/edit/view entities by type

**Impact:** Cannot test ontology, no user-facing features

**Solution:** Build type-specific entity forms and views

<details>
<summary>📋 Click to expand: Entity UI Components</summary>

**Generic Entity Form:**
```tsx
// web/src/components/entities/EntityForm.tsx
export function EntityForm({
  type,
  groupId,
  initialData
}: EntityFormProps) {
  const createEntity = useMutation(api.mutations.entities.create)
  const schema = getSchemaForType(type)

  return (
    <Form schema={schema} onSubmit={handleSubmit}>
      <FormField name="name" label="Name" />

      {/* Type-specific fields */}
      {type === "creator" && (
        <>
          <FormField name="email" label="Email" />
          <FormField name="bio" label="Bio" type="textarea" />
          <FormField name="niche" label="Niche" type="tags" />
        </>
      )}

      {type === "course" && (
        <>
          <FormField name="title" label="Title" />
          <FormField name="price" label="Price" type="number" />
          <FormField name="duration" label="Duration (hrs)" />
        </>
      )}

      <Button type="submit">Create {type}</Button>
    </Form>
  )
}
```

**Entity List View:**
```tsx
// web/src/components/entities/EntityList.tsx
export function EntityList({
  groupId,
  type
}: EntityListProps) {
  const entities = useQuery(api.queries.entities.list, {
    groupId,
    type
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entities?.map(entity => (
          <TableRow key={entity._id}>
            <TableCell>{entity.name}</TableCell>
            <TableCell>
              <Badge>{entity.type}</Badge>
            </TableCell>
            <TableCell>
              <StatusBadge status={entity.status} />
            </TableCell>
            <TableCell>
              {formatDate(entity.createdAt)}
            </TableCell>
            <TableCell>
              <EntityActions entity={entity} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

</details>

**Acceptance Criteria:**
- [ ] Entity forms for all 66 thing types
- [ ] Type-specific property editors (JSON + structured)
- [ ] Entity list views with filtering and sorting
- [ ] Entity detail pages with connections and events
- [ ] Real-time updates when entities change

**Effort:** 60 hours (7.5 days)

---

### 2.3 Connection Visualization

**Problem:** No way to see relationships between entities

**Impact:** Cannot understand data structure, no graph views

**Solution:** Build connection graph and relationship explorer

<details>
<summary>📋 Click to expand: Connection Visualization</summary>

**Graph View:**
```tsx
// web/src/components/connections/ConnectionGraph.tsx
import ReactFlow from 'reactflow'

export function ConnectionGraph({ groupId }: { groupId: string }) {
  const connections = useQuery(api.queries.connections.list, { groupId })
  const entities = useQuery(api.queries.entities.list, { groupId })

  const nodes = entities?.map(e => ({
    id: e._id,
    type: 'entity',
    data: { label: e.name, type: e.type },
    position: calculatePosition(e) // Use force-directed layout
  }))

  const edges = connections?.map(c => ({
    id: c._id,
    source: c.fromEntityId,
    target: c.toEntityId,
    label: c.relationshipType,
    type: 'smoothstep'
  }))

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  )
}
```

**Relationship Explorer:**
```tsx
// web/src/components/connections/RelationshipExplorer.tsx
export function RelationshipExplorer({ entityId }: { entityId: string }) {
  const entity = useQuery(api.queries.entities.get, { entityId })
  const outgoing = useQuery(api.queries.connections.getOutgoing, { entityId })
  const incoming = useQuery(api.queries.connections.getIncoming, { entityId })

  return (
    <div>
      <h2>{entity?.name} Relationships</h2>

      <section>
        <h3>Outgoing ({outgoing?.length})</h3>
        {outgoing?.map(conn => (
          <RelationshipCard
            key={conn._id}
            type={conn.relationshipType}
            target={conn.toEntityId}
            metadata={conn.metadata}
          />
        ))}
      </section>

      <section>
        <h3>Incoming ({incoming?.length})</h3>
        {incoming?.map(conn => (
          <RelationshipCard
            key={conn._id}
            type={conn.relationshipType}
            source={conn.fromEntityId}
            metadata={conn.metadata}
          />
        ))}
      </section>
    </div>
  )
}
```

</details>

**Acceptance Criteria:**
- [ ] Interactive graph view with zoom/pan
- [ ] Filter connections by relationship type
- [ ] Click entity to see details
- [ ] Show connection metadata on hover
- [ ] Export graph as image/JSON

**Effort:** 32 hours (4 days)

---

### 2.4 Event Timeline

**Problem:** No UI to view event history

**Impact:** Cannot see audit trail or debug issues

**Solution:** Build real-time event timeline

<details>
<summary>📋 Click to expand: Event Timeline</summary>

```tsx
// web/src/components/events/EventTimeline.tsx
export function EventTimeline({ groupId }: { groupId: string }) {
  const events = useQuery(api.queries.events.getRecent, {
    groupId,
    limit: 100
  })

  return (
    <div className="space-y-4">
      {events?.map(event => (
        <EventCard
          key={event._id}
          type={event.type}
          actor={event.actorId}
          target={event.targetId}
          timestamp={event.timestamp}
          metadata={event.metadata}
        />
      ))}
    </div>
  )
}

function EventCard({ type, actor, target, timestamp, metadata }: EventCardProps) {
  const actorEntity = useQuery(api.queries.entities.get, { entityId: actor })
  const targetEntity = useQuery(api.queries.entities.get, { entityId: target })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <EventIcon type={type} />
          <CardTitle>{formatEventType(type)}</CardTitle>
          <Badge variant="outline">{formatTimeAgo(timestamp)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p>
          <EntityLink entity={actorEntity} /> {getEventVerb(type)} <EntityLink entity={targetEntity} />
        </p>
        {metadata && (
          <pre className="text-xs mt-2">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
```

</details>

**Acceptance Criteria:**
- [ ] Real-time event stream (Convex subscription)
- [ ] Filter by event type, actor, target
- [ ] Group events by time period (hour, day, week)
- [ ] Click event to see full details
- [ ] Export events as CSV/JSON

**Effort:** 24 hours (3 days)

---

## Part 3: Protocol Integration

### 3.1 Protocol Metadata Standards

**Problem:** Protocol identity via `metadata.protocol` is documented but not enforced

**Impact:** Inconsistent metadata structure across protocols

**Solution:** Define TypeScript schemas for each protocol

<details>
<summary>📋 Click to expand: Protocol Schemas</summary>

```typescript
// backend/convex/types/protocols.ts

// Base protocol metadata
export interface ProtocolMetadata {
  protocol: "a2a" | "acp" | "ap2" | "x402" | "ag-ui"
}

// A2A: Agent-to-Agent Communication
export interface A2AMetadata extends ProtocolMetadata {
  protocol: "a2a"
  messageType: "task_delegation" | "status_update" | "result"
  agentPlatform: "elizaos" | "autogen" | "crewai" | "custom"
  taskId?: string
  conversationId?: string
}

// ACP: Agentic Commerce Protocol
export interface ACPMetadata extends ProtocolMetadata {
  protocol: "acp"
  eventType: "purchase_initiated" | "merchant_approved" | "transaction_completed"
  agentPlatform: "chatgpt" | "claude" | "gemini" | "custom"
  productId: string
  amount: number
  currency: string
}

// AP2: Agent Payments Protocol
export interface AP2Metadata extends ProtocolMetadata {
  protocol: "ap2"
  mandateType: "intent" | "cart"
  autoExecute: boolean
  maxBudget?: number
  criteria?: Record<string, any>
}

// X402: HTTP Micropayments
export interface X402Metadata extends ProtocolMetadata {
  protocol: "x402"
  scheme: "permit" | "invoice"
  network: "base" | "ethereum" | "polygon"
  txHash?: string
  amount: string
  resource: string
}

// AG-UI: Generative UI (CopilotKit)
export interface AGUIMetadata extends ProtocolMetadata {
  protocol: "ag-ui"
  messageType: "text" | "ui" | "action"
  component?: string
  props?: Record<string, any>
}

// Union type for all protocols
export type AnyProtocolMetadata =
  | A2AMetadata
  | ACPMetadata
  | AP2Metadata
  | X402Metadata
  | AGUIMetadata

// Validation function
export const validateProtocolMetadata = (metadata: any): metadata is AnyProtocolMetadata => {
  if (!metadata.protocol) return false

  switch (metadata.protocol) {
    case "a2a":
      return !!metadata.messageType && !!metadata.agentPlatform
    case "acp":
      return !!metadata.eventType && !!metadata.productId
    case "ap2":
      return !!metadata.mandateType
    case "x402":
      return !!metadata.scheme && !!metadata.network
    case "ag-ui":
      return !!metadata.messageType
    default:
      return false
  }
}
```

</details>

**Acceptance Criteria:**
- [ ] TypeScript schemas for all 5 protocols
- [ ] Validation functions enforce schema compliance
- [ ] Backend mutations reject invalid protocol metadata
- [ ] Frontend forms guide users to correct structure
- [ ] Documentation updated with examples

**Effort:** 16 hours (2 days)

---

### 3.2 Cross-Protocol Analytics

**Problem:** Cannot analyze usage across protocols

**Impact:** No visibility into protocol adoption or revenue

**Solution:** Build protocol analytics dashboard

<details>
<summary>📋 Click to expand: Protocol Analytics</summary>

```tsx
// web/src/components/analytics/ProtocolDashboard.tsx
export function ProtocolDashboard({ groupId }: { groupId: string }) {
  const analytics = useQuery(api.queries.analytics.getProtocolStats, { groupId })

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Revenue by Protocol */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={analytics?.revenueByProtocol} />
        </CardContent>
      </Card>

      {/* Transaction Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={analytics?.volumeOverTime} />
        </CardContent>
      </Card>

      {/* Protocol Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={analytics?.usageByProtocol} />
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Generators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {analytics?.topEntities.map(entity => (
                <TableRow key={entity._id}>
                  <TableCell>{entity.name}</TableCell>
                  <TableCell>${entity.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Backend Query:**
```typescript
// backend/convex/queries/analytics.ts
export const getProtocolStats = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    // Get all payment events
    const paymentEvents = await ctx.db
      .query("events")
      .withIndex("group_type", q =>
        q.eq("groupId", groupId).eq("type", "payment_event")
      )
      .collect()

    // Aggregate by protocol
    const revenueByProtocol = paymentEvents.reduce((acc, e) => {
      const protocol = e.metadata?.protocol || "traditional"
      acc[protocol] = (acc[protocol] || 0) + (e.metadata?.amount || 0)
      return acc
    }, {} as Record<string, number>)

    return {
      revenueByProtocol,
      volumeOverTime: groupByTime(paymentEvents),
      usageByProtocol: countByProtocol(paymentEvents),
      topEntities: getTopRevenue(paymentEvents)
    }
  }
})
```

</details>

**Acceptance Criteria:**
- [ ] Revenue breakdown by protocol (X402, ACP, AP2, traditional)
- [ ] Transaction volume over time (daily, weekly, monthly)
- [ ] Protocol usage pie chart
- [ ] Top revenue-generating entities
- [ ] Export data as CSV

**Effort:** 24 hours (3 days)

---

## Part 4: Testing & Quality

### 4.1 Backend Test Suite

**Problem:** No automated tests for backend logic

**Impact:** Regressions, bugs in production, slow development

**Solution:** Implement comprehensive test suite

<details>
<summary>📋 Click to expand: Test Structure</summary>

```typescript
// backend/convex/services/__tests__/creator.service.test.ts
import { describe, it, expect } from "vitest"
import { Effect, Layer } from "effect"
import { CreatorService } from "../entities/creator.service"
import { TestDatabaseService } from "./mocks/database.service"

describe("CreatorService", () => {
  const TestLayer = Layer.mergeAll(
    TestDatabaseService,
    EventLogServiceMock,
    CreatorServiceLive
  )

  it("should create a creator entity", async () => {
    const program = Effect.gen(function* () {
      const service = yield* CreatorService

      const creatorId = yield* service.create({
        groupId: "test-group-id",
        name: "John Doe",
        properties: {
          email: "john@example.com",
          bio: "Fitness coach"
        },
        actorId: "test-actor-id"
      })

      expect(creatorId).toBeDefined()
    })

    await Effect.runPromise(
      program.pipe(Effect.provide(TestLayer))
    )
  })

  it("should reject invalid email", async () => {
    const program = Effect.gen(function* () {
      const service = yield* CreatorService

      yield* service.create({
        groupId: "test-group-id",
        name: "John Doe",
        properties: {
          email: "invalid-email"
        },
        actorId: "test-actor-id"
      })
    })

    const result = await Effect.runPromiseExit(
      program.pipe(Effect.provide(TestLayer))
    )

    expect(Exit.isFailure(result)).toBe(true)
  })

  it("should log entity_created event", async () => {
    const eventLog = new EventLogSpy()

    const program = Effect.gen(function* () {
      const service = yield* CreatorService
      yield* service.create({ ... })
    })

    await Effect.runPromise(
      program.pipe(Effect.provide(TestLayerWithSpy(eventLog)))
    )

    expect(eventLog.events).toContainEqual({
      type: "entity_created",
      metadata: { entityType: "creator" }
    })
  })
})
```

**Coverage Goals:**
- Unit tests: All Effect.ts services (90%+ coverage)
- Integration tests: Mutations + queries (80%+ coverage)
- E2E tests: Critical user flows (50%+ coverage)

</details>

**Acceptance Criteria:**
- [ ] 90%+ test coverage for services
- [ ] All 66 thing types have create/update tests
- [ ] All 25 connection types have tests
- [ ] All 67 event types are logged in tests
- [ ] CI/CD runs tests on every commit

**Effort:** 80 hours (10 days)

---

### 4.2 Frontend Integration Tests

**Problem:** No tests for React components or Convex hooks

**Impact:** UI bugs, broken real-time updates

**Solution:** Add Vitest + Testing Library tests

<details>
<summary>📋 Click to expand: Frontend Tests</summary>

```typescript
// web/src/components/__tests__/EntityForm.test.tsx
import { render, screen, userEvent } from "@testing-library/react"
import { ConvexProviderWithAuth } from "convex/react"
import { EntityForm } from "../entities/EntityForm"

describe("EntityForm", () => {
  it("should render creator form fields", () => {
    render(
      <ConvexProviderWithAuth client={mockConvexClient}>
        <EntityForm type="creator" groupId="test-group" />
      </ConvexProviderWithAuth>
    )

    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Bio")).toBeInTheDocument()
  })

  it("should call createCreator mutation on submit", async () => {
    const createMock = vi.fn()

    render(
      <ConvexProviderWithAuth client={mockConvexClient}>
        <EntityForm type="creator" groupId="test-group" />
      </ConvexProviderWithAuth>
    )

    await userEvent.type(screen.getByLabelText("Name"), "John Doe")
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com")
    await userEvent.click(screen.getByText("Create creator"))

    expect(createMock).toHaveBeenCalledWith({
      groupId: "test-group",
      type: "creator",
      name: "John Doe",
      properties: { email: "john@example.com" }
    })
  })
})
```

</details>

**Acceptance Criteria:**
- [ ] 70%+ test coverage for components
- [ ] Mock Convex queries/mutations
- [ ] Test real-time updates (subscriptions)
- [ ] Visual regression tests (Storybook + Chromatic)
- [ ] Accessibility tests (axe-core)

**Effort:** 40 hours (5 days)

---

## Part 5: Operations & Deployment

### 5.1 Monitoring & Observability

**Problem:** No logging, metrics, or error tracking

**Impact:** Cannot debug production issues

**Solution:** Implement comprehensive monitoring

<details>
<summary>📋 Click to expand: Monitoring Setup</summary>

**Error Tracking (Sentry):**
```typescript
// backend/convex/lib/sentry.ts
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.CONVEX_DEPLOYMENT,
  integrations: [new Sentry.Integrations.Http({ tracing: true })]
})

export const withErrorTracking = <T>(
  operation: Effect.Effect<T, any, any>
) =>
  operation.pipe(
    Effect.tapError(error => {
      Sentry.captureException(error)
      return Effect.unit
    })
  )
```

**Metrics (Prometheus):**
```typescript
// backend/convex/lib/metrics.ts
import { Counter, Histogram } from "prom-client"

export const entityCreationCounter = new Counter({
  name: "entity_created_total",
  help: "Total entities created",
  labelNames: ["type", "groupId"]
})

export const mutationDuration = new Histogram({
  name: "mutation_duration_seconds",
  help: "Mutation execution time",
  labelNames: ["operation"]
})
```

**Logging (Structured):**
```typescript
// backend/convex/lib/logger.ts
import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({ pid: bindings.pid, hostname: bindings.hostname })
  }
})

export const logEvent = (event: Event) => {
  logger.info({
    event: event.type,
    groupId: event.groupId,
    actorId: event.actorId,
    timestamp: event.timestamp
  }, "Event logged")
}
```

</details>

**Acceptance Criteria:**
- [ ] Sentry error tracking in production
- [ ] Prometheus metrics exported
- [ ] Structured logging to Cloudflare
- [ ] Real-time alerting (PagerDuty)
- [ ] Performance monitoring dashboard

**Effort:** 24 hours (3 days)

---

### 5.2 Database Migrations

**Problem:** Schema changes require manual updates

**Impact:** Risky deployments, data loss potential

**Solution:** Automated migration system

<details>
<summary>📋 Click to expand: Migration Strategy</summary>

```typescript
// backend/convex/migrations/001_add_groupId_to_all_tables.ts
export const migration001 = {
  id: "001_add_groupId",
  up: async (ctx: MigrationContext) => {
    // Get all entities without groupId
    const entities = await ctx.db
      .query("entities")
      .filter(q => q.eq(q.field("groupId"), undefined))
      .collect()

    // Assign to default group
    const defaultGroup = await ctx.db
      .query("groups")
      .withIndex("by_slug", q => q.eq("slug", "default"))
      .first()

    for (const entity of entities) {
      await ctx.db.patch(entity._id, {
        groupId: defaultGroup._id
      })
    }

    logger.info(`Migrated ${entities.length} entities to default group`)
  },

  down: async (ctx: MigrationContext) => {
    // Rollback logic
  }
}
```

</details>

**Acceptance Criteria:**
- [ ] Versioned migration system
- [ ] Automatic backups before migration
- [ ] Rollback capability
- [ ] Migration status tracking
- [ ] Dry-run mode for testing

**Effort:** 16 hours (2 days)

---

## Summary & Timeline

### Total Effort Estimate

| Category | Tasks | Effort | Priority |
|----------|-------|--------|----------|
| Backend Integration | 1.1-1.5 | 236 hours (29.5 days) | P0 |
| Frontend Integration | 2.1-2.4 | 156 hours (19.5 days) | P1 |
| Protocol Integration | 3.1-3.2 | 40 hours (5 days) | P2 |
| Testing & Quality | 4.1-4.2 | 120 hours (15 days) | P0 |
| Operations | 5.1-5.2 | 40 hours (5 days) | P2 |
| **TOTAL** | **47 tasks** | **592 hours (74 days)** | |

### Recommended Phases

**Phase 1: Core Backend (Weeks 1-4)**
- Complete 1.1: Missing backend mutations/queries
- Complete 1.2: Effect.ts glue layer
- Complete 1.3: Event logging
- **Deliverable:** All 66 thing types operational

**Phase 2: Testing & Quality (Weeks 5-6)**
- Complete 4.1: Backend test suite
- Complete 4.2: Frontend integration tests
- **Deliverable:** 90% test coverage

**Phase 3: Frontend (Weeks 7-10)**
- Complete 2.1: Multi-tenant dashboard
- Complete 2.2: Entity management UI
- Complete 2.3: Connection visualization
- Complete 2.4: Event timeline
- **Deliverable:** Production-ready UI

**Phase 4: Advanced Features (Weeks 11-12)**
- Complete 1.4: Connection management
- Complete 1.5: RAG implementation
- Complete 3.1-3.2: Protocol integration
- **Deliverable:** Full protocol support + RAG

**Phase 5: Production Ready (Weeks 13-14)**
- Complete 5.1: Monitoring
- Complete 5.2: Migrations
- Load testing
- Security audit
- **Deliverable:** Launch ready

---

## Key Metrics for Success

**Backend Completeness:**
- ✅ 66/66 thing types have CRUD operations
- ✅ 25/25 connection types implemented
- ✅ 67/67 event types logged
- ✅ 100% Effect.ts coverage

**Frontend Completeness:**
- ✅ Multi-tenant dashboard with hierarchy
- ✅ Entity forms for all types
- ✅ Real-time subscriptions working
- ✅ Graph visualization

**Quality:**
- ✅ 90%+ backend test coverage
- ✅ 70%+ frontend test coverage
- ✅ Zero TypeScript errors
- ✅ Sub-200ms mutation latency

**Production Readiness:**
- ✅ Error tracking live
- ✅ Metrics dashboards
- ✅ Automated backups
- ✅ Migration system

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize tasks** based on business needs
3. **Start Phase 1** immediately (backend integration)
4. **Set up CI/CD** for automated testing
5. **Track progress** weekly against this plan

**Golden Rule:** The ontology is perfect. Now make the implementation match it.

# ONE Ontology Engineering

**Version:** 1.0.0
**Purpose:** Context Engineering, Agent Architecture, and Dynamic Website Generation
**Philosophy:** Minimal Context, Maximum Intelligence

---

## Table of Contents

1. [Context Engineering Strategy](#context-engineering-strategy)
2. [Specialist AI Agent Architecture](#specialist-ai-agent-architecture)
3. [Frontend/Backend Implementation](#frontendbackend-implementation)
4. [Dynamic Website Generation](#dynamic-website-generation)
5. [Code Generation Patterns](#code-generation-patterns)
6. [Performance Optimization](#performance-optimization)

---

## Context Engineering Strategy

### The Problem: Context Window Explosion

**Traditional Approach (❌ Bad):**
```
AI reads entire codebase → 100k+ tokens → expensive, slow, hallucinations
```

**ONE Approach (✅ Good):**
```
AI queries ontology → focused retrieval → <5k tokens → fast, accurate, cheap
```

### Principle 1: Ontology as Context Compression

The 6-dimension ontology IS our context compression:

```typescript
// Instead of loading 50 files (30k tokens):
const allUsers = readFiles(['users.ts', 'auth.ts', 'sessions.ts', ...])

// Query the ontology (500 tokens):
const context = {
  things: ['creator', 'audience_member'],
  connections: ['member_of'],
  events: ['user_login', 'user_registered']
}
```

**Result:** 98% context reduction with full semantic fidelity.

### Principle 2: Just-In-Time Context Loading

**Strategy:** Load context ONLY when needed, not upfront.

```typescript
// ❌ BAD: Load everything
const fullOntology = await loadOntology() // 15k tokens

// ✅ GOOD: Load on demand
async function getRelevantContext(userIntent: string) {
  const embedding = await embed(userIntent)
  const relevantChunks = await vectorSearch(embedding, { k: 3 }) // 800 tokens
  const relevantThings = await getThingsByType(extractTypes(relevantChunks)) // 300 tokens

  return { chunks: relevantChunks, things: relevantThings } // Total: 1,100 tokens
}
```

### Principle 3: Query-First Architecture

**Pattern:** Every operation starts with a focused query.

```typescript
// User request: "Show me all fitness creators"

// Step 1: Parse intent
const intent = {
  thingType: 'creator',
  filter: { niche: 'fitness' },
  connections: undefined,
  events: undefined
}

// Step 2: Focused query (only what's needed)
const creators = await db
  .query('things')
  .withIndex('by_type', q => q.eq('type', 'creator'))
  .filter(q => q.field('properties.niche').includes('fitness'))
  .take(10) // ALWAYS LIMIT

// Step 3: Load related data IF NEEDED
if (needsStats) {
  const stats = await getCreatorStats(creators.map(c => c._id))
}
```

**Context Used:**
- Intent parsing: ~200 tokens
- Query: ~50 tokens
- Results: ~500 tokens
- **Total: ~750 tokens** (vs 10k+ for full creator records)

### Principle 4: Contextual Caching

**Strategy:** Cache frequently accessed ontology patterns.

```typescript
// Cache structure
const ontologyCache = {
  // Thing type definitions (rarely change)
  thingTypes: Map<ThingType, ThingDefinition>, // ~2k tokens

  // Connection patterns (rarely change)
  connectionTypes: Map<ConnectionType, ConnectionDefinition>, // ~1k tokens

  // Event types (rarely change)
  eventTypes: Map<EventType, EventDefinition>, // ~1k tokens

  // Organization-specific (cache per org, TTL: 5 min)
  orgSchema: Map<OrgId, OrgContext>, // ~500 tokens per org

  // User-specific (cache per session, TTL: 1 hour)
  userContext: Map<UserId, UserContext>, // ~300 tokens per user
}

// Total cold start: ~5k tokens
// Total warm (per request): ~800 tokens
```

### Principle 5: Semantic Compression via Knowledge

**Strategy:** Use knowledge embeddings to compress semantic meaning.

```typescript
// Instead of passing full documentation (5k tokens):
const docs = `
  The creator entity represents a human creator...
  Properties include email, username, niche...
  Creators can own ai_clones and create content...
  [3000+ more words]
`

// Pass compressed reference (50 tokens + retrieval):
const creatorContext = {
  thingType: 'creator',
  knowledgeRef: 'knowledge_item_creator_docs', // Vector retrieval when needed
  quickRef: 'Human creator with email, username, niche. Owns clones & content.'
}

// AI retrieves detailed docs ONLY if needed
if (needsDetail) {
  const detailedDocs = await retrieveKnowledge('knowledge_item_creator_docs')
}
```

---

## Specialist AI Agent Architecture

### Agent Design Philosophy

**Traditional Monolithic Agent (❌ Bad):**
```
One agent tries to do everything → 50k token context → slow, expensive, confused
```

**ONE Specialist Agents (✅ Good):**
```
10 specialist agents, each expert in one domain → 3k tokens each → fast, cheap, accurate
```

### Core Agent Types

#### 1. **Ontology Agent** - The Router

**Purpose:** Parse user intent and route to specialist agents.

**Context Budget:** 2k tokens max

**Capabilities:**
- Intent classification
- Entity/connection/event identification
- Agent routing

```typescript
interface OntologyAgent {
  parseIntent(userInput: string): Intent
  routeToAgent(intent: Intent): SpecialistAgent

  context: {
    ontologyTypes: ThingType[] // Cached
    connectionTypes: ConnectionType[] // Cached
    eventTypes: EventType[] // Cached
  }
}

// Example
const intent = await ontologyAgent.parseIntent("Create a fitness course")
// Returns: { action: 'create', thingType: 'course', metadata: { niche: 'fitness' } }

const agent = ontologyAgent.routeToAgent(intent)
// Returns: ContentCreationAgent
```

#### 2. **Schema Agent** - Database Structure Expert

**Purpose:** Generate Convex schemas, indexes, and migrations.

**Context Budget:** 3k tokens max

**Capabilities:**
- Schema generation
- Index optimization
- Migration planning

```typescript
interface SchemaAgent {
  generateSchema(thingTypes: ThingType[]): ConvexSchema
  optimizeIndexes(queryPatterns: QueryPattern[]): IndexDefinition[]
  planMigration(from: Schema, to: Schema): MigrationPlan

  context: {
    ontologySpec: OntologyReference // Links to detailed docs
    indexPatterns: IndexPattern[] // Common patterns
    validationRules: ValidationRule[]
  }
}

// Example
const schema = await schemaAgent.generateSchema(['creator', 'course', 'lesson'])
// Returns optimized Convex schema with indexes
```

#### 3. **Query Agent** - Database Query Expert

**Purpose:** Generate optimized Convex queries.

**Context Budget:** 2k tokens max

**Capabilities:**
- Query generation
- Query optimization
- Index selection

```typescript
interface QueryAgent {
  generateQuery(intent: QueryIntent): ConvexQuery
  optimizeQuery(query: ConvexQuery): ConvexQuery
  explainQuery(query: ConvexQuery): QueryExplanation

  context: {
    availableIndexes: Index[] // Current DB indexes
    queryPatterns: QueryPattern[] // Common patterns
  }
}

// Example
const query = await queryAgent.generateQuery({
  thingType: 'creator',
  filter: { niche: 'fitness', totalFollowers: { $gt: 10000 } },
  limit: 10
})
// Returns optimized Convex query with correct index usage
```

#### 4. **Mutation Agent** - Database Write Expert

**Purpose:** Generate Convex mutations with proper validation and events.

**Context Budget:** 3k tokens max

**Capabilities:**
- Mutation generation
- Validation logic
- Event logging
- Transaction handling

```typescript
interface MutationAgent {
  generateMutation(action: MutationIntent): ConvexMutation
  addValidation(mutation: ConvexMutation): ConvexMutation
  logEvents(mutation: ConvexMutation): ConvexMutation

  context: {
    validationRules: ValidationRule[]
    eventTypes: EventType[]
    transactionPatterns: TransactionPattern[]
  }
}

// Example
const mutation = await mutationAgent.generateMutation({
  action: 'create',
  thingType: 'course',
  properties: { title: 'Fitness 101', niche: 'fitness' },
  connections: [{ type: 'owns', fromId: creatorId }]
})
// Returns mutation with validation + event logging + connection creation
```

#### 5. **Frontend Component Agent** - UI Generator

**Purpose:** Generate Astro/React components from ontology.

**Context Budget:** 4k tokens max

**Capabilities:**
- Component generation
- Type-safe props
- Convex integration
- Styling with Tailwind

```typescript
interface FrontendAgent {
  generateComponent(spec: ComponentSpec): AstroComponent
  generatePage(spec: PageSpec): AstroPage
  generateAPI(spec: APISpec): HonoRoute

  context: {
    componentPatterns: ComponentPattern[] // Reusable patterns
    designSystem: DesignTokens // Colors, spacing, etc.
    ontologyTypes: ThingType[] // For type generation
  }
}

// Example
const component = await frontendAgent.generateComponent({
  name: 'CourseCard',
  thingType: 'course',
  fields: ['title', 'description', 'price'],
  actions: ['enroll', 'view']
})
// Returns fully typed Astro component with Convex hooks
```

#### 6. **Backend Logic Agent** - Business Logic Expert

**Purpose:** Generate Convex actions and complex business logic.

**Context Budget:** 4k tokens max

**Capabilities:**
- Action generation
- External API integration
- Workflow orchestration
- Error handling

```typescript
interface BackendAgent {
  generateAction(spec: ActionSpec): ConvexAction
  orchestrateWorkflow(steps: WorkflowStep[]): WorkflowAction
  handleErrors(action: ConvexAction): ConvexAction

  context: {
    workflowPatterns: WorkflowPattern[]
    integrationPatterns: IntegrationPattern[]
    errorPatterns: ErrorPattern[]
  }
}

// Example
const action = await backendAgent.generateAction({
  name: 'createCourseWithAI',
  steps: [
    'generateContent',
    'createCourse',
    'embedContent',
    'notifyCreator'
  ]
})
// Returns orchestrated Convex action with error handling
```

#### 7. **Knowledge Agent** - RAG & Embeddings Expert

**Purpose:** Manage knowledge embeddings and semantic search.

**Context Budget:** 3k tokens max

**Capabilities:**
- Embedding generation
- Vector search
- Chunk optimization
- Label management

```typescript
interface KnowledgeAgent {
  embedContent(thing: Thing, fields: string[]): Knowledge[]
  semanticSearch(query: string, filters: Filter): Knowledge[]
  optimizeChunks(text: string): Chunk[]
  manageLabels(thing: Thing): Label[]

  context: {
    embeddingModel: 'text-embedding-3-large'
    chunkStrategy: ChunkStrategy
    labelTaxonomy: LabelCategory[]
  }
}

// Example
const chunks = await knowledgeAgent.embedContent(course, ['title', 'description', 'content'])
// Returns knowledge chunks with embeddings + links via thingKnowledge
```

#### 8. **Organization Agent** - Multi-Tenant Expert

**Purpose:** Manage organization scope, permissions, quotas.

**Context Budget:** 2k tokens max

**Capabilities:**
- Scope enforcement
- Permission checks
- Quota tracking
- Billing logic

```typescript
interface OrganizationAgent {
  enforceScope(query: Query, orgId: OrgId): Query
  checkPermissions(userId: UserId, action: Action): boolean
  trackUsage(orgId: OrgId, resource: Resource): Usage

  context: {
    orgPlans: Plan[] // starter, pro, enterprise
    quotaLimits: QuotaLimit[]
    permissionMatrix: Permission[][]
  }
}

// Example
const scopedQuery = await orgAgent.enforceScope(rawQuery, orgId)
// Returns query filtered to org's data only
```

#### 9. **Analytics Agent** - Metrics & Insights Expert

**Purpose:** Generate analytics from events and metrics.

**Context Budget:** 3k tokens max

**Capabilities:**
- Metric calculation
- Insight generation
- Prediction models
- Report generation

```typescript
interface AnalyticsAgent {
  calculateMetrics(orgId: OrgId, period: Period): Metrics
  generateInsights(metrics: Metrics): Insight[]
  predictTrends(history: Metrics[]): Prediction[]

  context: {
    metricDefinitions: MetricDef[]
    insightPatterns: InsightPattern[]
    predictionModels: Model[]
  }
}

// Example
const insights = await analyticsAgent.generateInsights(metrics)
// Returns actionable insights with confidence scores
```

#### 10. **Protocol Agent** - Cross-Protocol Expert

**Purpose:** Handle A2A, ACP, AP2, X402, AG-UI integrations.

**Context Budget:** 4k tokens max

**Capabilities:**
- Protocol detection
- Message formatting
- Transaction handling
- Cross-chain bridges

```typescript
interface ProtocolAgent {
  detectProtocol(request: Request): Protocol
  formatMessage(data: any, protocol: Protocol): Message
  handleTransaction(tx: Transaction, protocol: Protocol): Event

  context: {
    protocolSpecs: ProtocolSpec[] // A2A, ACP, AP2, X402, AG-UI
    networkConfigs: NetworkConfig[] // Base, Sui, Solana
  }
}

// Example
const message = await protocolAgent.formatMessage(purchase, 'acp')
// Returns ACP-formatted commerce message
```

---

## Agent Orchestration Pattern

### Sequential Coordination

```typescript
// User: "Create a fitness course and publish it to my website"

// 1. Ontology Agent routes
const intent = await ontologyAgent.parse("Create fitness course...")
// → { actions: ['create_course', 'publish_website'] }

// 2. Mutation Agent creates course
const course = await mutationAgent.create({
  thingType: 'course',
  properties: { title: '...', niche: 'fitness' }
})

// 3. Knowledge Agent embeds content
await knowledgeAgent.embed(course, ['title', 'description', 'modules'])

// 4. Frontend Agent generates page
const page = await frontendAgent.generatePage({
  thingType: 'course',
  thingId: course._id
})

// 5. Backend Agent deploys
await backendAgent.deploy(page, { domain: creator.properties.domain })

// Total context: 2k + 3k + 3k + 4k + 4k = 16k tokens
// vs Monolithic: 80k+ tokens
```

### Parallel Execution

```typescript
// User: "Analyze my creator platform performance"

// Ontology Agent routes to multiple specialists
const [metrics, insights, predictions] = await Promise.all([
  analyticsAgent.calculateMetrics(orgId, '30d'),
  analyticsAgent.generateInsights(/* ... */),
  analyticsAgent.predictTrends(/* ... */)
])

// Each agent runs in parallel with own context
// Total context: max(3k, 3k, 3k) = 3k tokens (not additive!)
```

---

## Frontend/Backend Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Astro)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │ Components  │  │    API      │    │
│  │  (SSR/SSG)  │  │   (React)   │  │   (Hono)    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                 │                 │            │
│         └─────────────────┴─────────────────┘            │
│                           ↓                               │
│                  ConvexHttpClient                         │
└────────────────────────────┬────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Convex)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Queries  │  │Mutations │  │ Actions  │  │Scheduler││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘│
│       │             │              │              │      │
│       └─────────────┴──────────────┴──────────────┘      │
│                           ↓                               │
│              ┌────────────────────────┐                  │
│              │   6-Dimension Ontology │                  │
│              │ things │ connections │  │                  │
│              │ events │  knowledge  │  │                  │
│              └────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### Context-Aware Query Pattern

**Traditional (❌ Bad):**
```typescript
// Load everything, filter in memory
const allThings = await db.query('things').collect() // 50k records
const filtered = allThings.filter(t => t.type === 'course')
```

**Context-Optimized (✅ Good):**
```typescript
// Query with index, limit results
const courses = await db
  .query('things')
  .withIndex('by_type', q => q.eq('type', 'course'))
  .take(20) // ALWAYS PAGINATE

// Load related data ONLY if needed
if (needsCreators) {
  const creatorIds = [...new Set(courses.map(c => c.properties.creatorId))]
  const creators = await db.getMany(creatorIds) // Batch fetch
}
```

### Dynamic Component Generation

**Pattern:** Generate components from ontology at build time.

```typescript
// scripts/generate-components.ts

import { ontology } from './ontology'
import { FrontendAgent } from './agents/frontend'

// Generate component for each thing type
for (const thingType of ontology.thingTypes) {
  // Generate card component
  const card = await frontendAgent.generateComponent({
    name: `${thingType}Card`,
    thingType,
    fields: ontology.getDisplayFields(thingType),
    variant: 'card'
  })

  await writeFile(`src/components/cards/${thingType}Card.tsx`, card)

  // Generate list component
  const list = await frontendAgent.generateComponent({
    name: `${thingType}List`,
    thingType,
    variant: 'list',
    pagination: true
  })

  await writeFile(`src/components/lists/${thingType}List.tsx`, list)

  // Generate detail page
  const page = await frontendAgent.generatePage({
    name: `${thingType}Detail`,
    thingType,
    sections: ['header', 'properties', 'connections', 'events']
  })

  await writeFile(`src/pages/${thingType}/[id].astro`, page)
}

// Result: 66 thing types × 3 components = 198 auto-generated components
```

### Backend Query Optimization

**Pattern:** Use indexes and batching to minimize context.

```typescript
// Convex query with index optimization
export const getCourseWithRelations = query({
  args: { courseId: v.id('things') },
  handler: async (ctx, { courseId }) => {
    // 1. Get course (1 read)
    const course = await ctx.db.get(courseId)
    if (!course) return null

    // 2. Get creator via connection (index scan, not full table)
    const ownerConn = await ctx.db
      .query('connections')
      .withIndex('to_type', q =>
        q.eq('toThingId', courseId).eq('relationshipType', 'owns')
      )
      .first()

    // 3. Get creator (1 read)
    const creator = ownerConn ? await ctx.db.get(ownerConn.fromThingId) : null

    // 4. Get lessons via connection (index scan)
    const lessonConns = await ctx.db
      .query('connections')
      .withIndex('from_type', q =>
        q.eq('fromThingId', courseId).eq('relationshipType', 'part_of')
      )
      .collect()

    // 5. Batch fetch lessons (N reads in parallel)
    const lessons = await Promise.all(
      lessonConns.map(c => ctx.db.get(c.toThingId))
    )

    // Total: 3 + N reads (vs full table scans)
    return { course, creator, lessons }
  }
})
```

---

## Dynamic Website Generation

### Concept: Organizations Create Custom Websites

**Flow:**
```
1. Organization creates account
2. Chooses template (minimal, showcase, portfolio)
3. Customizes branding (colors, logo, domain)
4. Creates content (courses, blog posts, products)
5. ONE auto-generates website at org.one.ie
```

### Implementation Strategy

#### 1. Template System

**Static Templates** (pre-built):
```typescript
// templates/minimal.ts
export const minimalTemplate: Template = {
  name: 'minimal',
  sections: ['hero', 'about', 'content', 'footer'],
  thingTypes: ['creator', 'blog_post', 'course'],
  colors: {
    primary: 'blue-600',
    secondary: 'gray-800',
    accent: 'green-500'
  }
}
```

**Dynamic Generation**:
```typescript
// Generate website for organization
export async function generateWebsite(orgId: Id<'things'>) {
  // 1. Get org preferences
  const org = await db.get(orgId)
  const template = templates[org.properties.template || 'minimal']

  // 2. Get org's things
  const things = await db
    .query('things')
    .filter(q => q.eq(q.field('properties.organizationId'), orgId))
    .collect()

  // 3. Generate pages
  const pages = []

  // Homepage
  pages.push(await frontendAgent.generatePage({
    template: 'homepage',
    sections: template.sections,
    data: { org, creators: things.filter(t => t.type === 'creator') }
  }))

  // Content pages (one per thing)
  for (const thing of things) {
    pages.push(await frontendAgent.generatePage({
      template: 'detail',
      thingType: thing.type,
      data: thing
    }))
  }

  // 4. Deploy to org.one.ie
  await deploy(pages, { domain: `${org.properties.slug}.one.ie` })
}
```

#### 2. Component-Based Pages

**Pattern:** Pages are composed of thing-based components.

```astro
---
// [orgSlug]/index.astro (auto-generated)
import { ConvexHttpClient } from 'convex/browser'
import Hero from '@/components/Hero.astro'
import CreatorCard from '@/components/cards/CreatorCard.tsx'
import CourseList from '@/components/lists/CourseList.tsx'

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL)

// Get org
const org = await convex.query(api.queries.orgs.getBySlug, {
  slug: Astro.params.orgSlug
})

// Get creators
const creators = await convex.query(api.queries.things.list, {
  type: 'creator',
  organizationId: org._id
})

// Get courses
const courses = await convex.query(api.queries.things.list, {
  type: 'course',
  organizationId: org._id,
  limit: 6
})
---

<Layout title={org.name}>
  <Hero
    title={org.name}
    subtitle={org.properties.description}
    cta="Explore Courses"
  />

  <section class="creators">
    <h2>Our Creators</h2>
    <div class="grid">
      {creators.map(creator => (
        <CreatorCard client:load creator={creator} />
      ))}
    </div>
  </section>

  <section class="courses">
    <h2>Featured Courses</h2>
    <CourseList client:load courses={courses} />
  </section>
</Layout>
```

#### 3. Real-Time Updates

**Pattern:** Components subscribe to changes.

```tsx
// components/cards/CourseCard.tsx
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function CourseCard({ courseId }: { courseId: Id<'things'> }) {
  // Real-time subscription
  const course = useQuery(api.queries.things.get, { id: courseId })

  if (!course) return <Skeleton />

  return (
    <div class="card">
      <img src={course.properties.thumbnail} alt={course.properties.title} />
      <h3>{course.properties.title}</h3>
      <p>{course.properties.description}</p>
      <span>${course.properties.price}</span>
      <button>Enroll Now</button>
    </div>
  )
}
```

**When creator updates course → Component auto-updates on all visitors' screens**

#### 4. Multi-Tenant Routing

**Pattern:** Route to correct org's website.

```typescript
// middleware/tenant.ts
export async function onRequest(context, next) {
  const url = new URL(context.request.url)

  // Extract org slug from subdomain
  const hostname = url.hostname // creator.one.ie
  const orgSlug = hostname.split('.')[0]

  // Load org context
  const org = await convex.query(api.queries.orgs.getBySlug, { slug: orgSlug })

  if (!org) {
    return new Response('Organization not found', { status: 404 })
  }

  // Inject org context into request
  context.locals.org = org
  context.locals.orgId = org._id

  return next()
}
```

---

## Code Generation Patterns

### 1. Thing → CRUD Components

**Input:** Thing type definition

**Output:** Full CRUD components

```typescript
async function generateCRUD(thingType: ThingType) {
  const definition = ontology.getDefinition(thingType)

  // Generate list component
  const list = `
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function ${pascalCase(thingType)}List({ orgId }) {
  const items = useQuery(api.queries.${thingType}.list, { orgId })

  return (
    <div class="grid gap-4">
      {items?.map(item => (
        <${pascalCase(thingType)}Card key={item._id} item={item} />
      ))}
    </div>
  )
}
`

  // Generate create form
  const form = `
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function Create${pascalCase(thingType)}() {
  const create = useMutation(api.mutations.${thingType}.create)

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      await create({
        ${definition.fields.map(f => `${f.name}: formData.get('${f.name}')`).join(',\n        ')}
      })
    }}>
      ${definition.fields.map(f => `
      <label>
        ${f.label}
        <input name="${f.name}" type="${f.inputType}" required={${f.required}} />
      </label>
      `).join('\n')}
      <button type="submit">Create</button>
    </form>
  )
}
`

  // Generate backend mutations
  const mutations = `
import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const create = mutation({
  args: {
    ${definition.fields.map(f => `${f.name}: v.${f.vType}()`).join(',\n    ')}
  },
  handler: async (ctx, args) => {
    // Create thing
    const id = await ctx.db.insert('things', {
      type: '${thingType}',
      name: args.${definition.nameField || 'name'},
      properties: args,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    // Log event
    await ctx.db.insert('events', {
      type: 'entity_created',
      actorId: ctx.auth.userId,
      targetId: id,
      timestamp: Date.now(),
      metadata: { thingType: '${thingType}' }
    })

    return id
  }
})
`

  return { list, form, mutations }
}
```

### 2. Connection → Relationship Components

**Input:** Connection type definition

**Output:** Relationship management UI

```typescript
async function generateRelationshipUI(connectionType: ConnectionType) {
  // Generate "Add Connection" button
  const addButton = `
export function Add${pascalCase(connectionType)}({ fromId, toType }) {
  const [open, setOpen] = useState(false)
  const createConnection = useMutation(api.mutations.connections.create)

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Add {connectionType}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <ThingPicker
          type={toType}
          onSelect={async (toId) => {
            await createConnection({
              fromThingId: fromId,
              toThingId: toId,
              relationshipType: '${connectionType}'
            })
            setOpen(false)
          }}
        />
      </Dialog>
    </>
  )
}
`

  // Generate "Show Connections" list
  const list = `
export function ${pascalCase(connectionType)}List({ thingId }) {
  const connections = useQuery(api.queries.connections.list, {
    fromThingId: thingId,
    relationshipType: '${connectionType}'
  })

  return (
    <div>
      <h3>{connectionType}s</h3>
      {connections?.map(conn => (
        <ConnectionCard key={conn._id} connection={conn} />
      ))}
    </div>
  )
}
`

  return { addButton, list }
}
```

### 3. Event → Analytics Dashboard

**Input:** Event types for org

**Output:** Analytics dashboard

```typescript
async function generateAnalyticsDashboard(orgId: Id<'things'>) {
  // Get all event types used by this org
  const eventTypes = await db
    .query('events')
    .filter(q => q.eq(q.field('metadata.organizationId'), orgId))
    .collect()
    .then(events => [...new Set(events.map(e => e.type))])

  // Generate metrics for each event type
  const dashboard = `
export function AnalyticsDashboard({ orgId }) {
  ${eventTypes.map(type => `
  const ${camelCase(type)}Count = useQuery(api.queries.analytics.count, {
    orgId,
    eventType: '${type}',
    period: '30d'
  })
  `).join('\n')}

  return (
    <div class="dashboard">
      ${eventTypes.map(type => `
      <MetricCard
        title="${titleCase(type)}"
        value={${camelCase(type)}Count}
        change={calculateChange(${camelCase(type)}Count)}
      />
      `).join('\n')}
    </div>
  )
}
`

  return dashboard
}
```

---

## Performance Optimization

### 1. Context Budget Management

**Rule:** Every agent has a max context budget.

```typescript
class Agent {
  maxContextTokens = 5000
  currentContext: any[] = []

  async addContext(item: any) {
    const tokens = estimateTokens(item)

    if (this.totalTokens() + tokens > this.maxContextTokens) {
      // Evict least recently used context
      this.evictLRU()
    }

    this.currentContext.push({ item, tokens, lastUsed: Date.now() })
  }

  totalTokens() {
    return this.currentContext.reduce((sum, c) => sum + c.tokens, 0)
  }

  evictLRU() {
    this.currentContext.sort((a, b) => a.lastUsed - b.lastUsed)
    this.currentContext.shift()
  }
}
```

### 2. Query Result Caching

**Pattern:** Cache query results to avoid redundant DB reads.

```typescript
// Convex query with caching
export const getCourseWithRelations = query({
  args: { courseId: v.id('things') },
  handler: async (ctx, { courseId }) => {
    // Check cache first
    const cacheKey = `course:${courseId}`
    const cached = await ctx.db.get(/* cache table */)

    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data
    }

    // Fetch from DB
    const data = await fetchCourseWithRelations(ctx, courseId)

    // Cache result
    await ctx.db.insert('cache', {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000
    })

    return data
  }
})
```

### 3. Lazy Loading

**Pattern:** Load data only when visible.

```tsx
export function ThingGrid({ things }: { things: Thing[] }) {
  return (
    <div class="grid">
      {things.map(thing => (
        <LazyLoad key={thing._id} offset={100}>
          <ThingCard thingId={thing._id} />
        </LazyLoad>
      ))}
    </div>
  )
}

function ThingCard({ thingId }: { thingId: Id<'things'> }) {
  // Only queries when visible
  const thing = useQuery(api.queries.things.get, { id: thingId })

  if (!thing) return <Skeleton />
  return <Card {...thing} />
}
```

### 4. Batch Operations

**Pattern:** Batch creates/updates to reduce mutations.

```typescript
// Instead of N mutations
for (const lesson of lessons) {
  await createLesson(lesson) // N calls
}

// Batch into 1 mutation
export const createLessonsBatch = mutation({
  args: { lessons: v.array(v.any()) },
  handler: async (ctx, { lessons }) => {
    const ids = []

    for (const lesson of lessons) {
      const id = await ctx.db.insert('things', {
        type: 'lesson',
        name: lesson.title,
        properties: lesson,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      ids.push(id)
    }

    // Single event for batch
    await ctx.db.insert('events', {
      type: 'entity_created',
      actorId: ctx.auth.userId,
      timestamp: Date.now(),
      metadata: {
        thingType: 'lesson',
        batchSize: lessons.length,
        ids
      }
    })

    return ids
  }
})
```

---

## Summary: Engineering Principles

### 1. **Minimal Context is Beautiful**
- Never load full ontology
- Query-first, load-on-demand
- Cache frequently used patterns
- Evict stale context aggressively

### 2. **Specialist Agents Win**
- 10 small experts beat 1 generalist
- Each agent has focused context
- Agents compose via orchestration
- Parallel execution when possible

### 3. **Ontology Drives Everything**
- Schema generation from ontology
- Component generation from thing types
- Query optimization from indexes
- Analytics from event types

### 4. **Dynamic is Better Than Static**
- Generate components at build time
- Generate pages from org content
- Real-time updates via subscriptions
- Multi-tenant routing

### 5. **Performance Through Design**
- Index-first queries
- Batch operations
- Lazy loading
- Result caching

---

## Next Steps

1. **Implement Core Agents**
   - Start with Ontology Agent (router)
   - Add Query Agent (most used)
   - Add Mutation Agent (critical path)

2. **Build Code Generators**
   - Thing → CRUD components
   - Connection → Relationship UI
   - Event → Analytics dashboards

3. **Create Template System**
   - 3 base templates (minimal, showcase, portfolio)
   - Component library
   - Deployment pipeline

4. **Optimize Context Usage**
   - Measure token usage per operation
   - Set budgets per agent
   - Monitor and optimize

5. **Scale Testing**
   - 100 orgs × 1000 things each
   - Context usage under load
   - Query performance
   - Real-time subscription limits

---

**Philosophy:** Context is expensive. Intelligence is cheap when focused. The ontology is our compression algorithm.

**Result:** Build infinitely complex systems with minimal context by leveraging specialist agents and dynamic generation from a stable 6-dimension ontology.

---

**END OF ONTOLOGY ENGINEERING SPECIFICATION**

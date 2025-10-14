# ONE Ontology Documentation

**Version 1.0 - 6-Dimension Architecture**

---

## The Flow

```
Groups → People → Things → Connections → Events → Knowledge
  ↓         ↓         ↓           ↓            ↓          ↓
Scope   Authorize  Create     Relate      Log &      Power
& Own   with AI    Entities   Entities    Track    Intelligence
```

---

## Documentation Structure

### Core Concepts (Start Here)

1. **[groups.md](../groups/groups.md)** - Multi-tenant containers

   - Groups own things
   - Hierarchical nesting (6 types)
   - Track usage & quotas
   - Manage billing & revenue sharing

2. **[people.md](./people.md)** - Creators, owners & users

   - Platform owner (Anthony - 100% ownership)
   - Org owners (manage organizations)
   - Org users (work within organizations)
   - Customers (consume content)

3. **[things.md](./things.md)** - 66 entity types

   - If you can point at it, it's a thing
   - Core, agents, content, products, community, tokens, etc.
   - Summary with patterns (full details in Ontology.md)

4. **[connections.md](./connections.md)** - 25 relationship types

   - Thing-to-thing relationships
   - Ownership, membership, transactions
   - Protocol-agnostic design
   - Summary with patterns (full details in Ontology.md)

5. **[events.md](./events.md)** - 67 event types

   - Time-stamped actions
   - Complete audit trail
   - Inference & revenue tracking
   - Summary with patterns (full details in Ontology.md)

6. **[knowledge.md](./knowledge.md)** - Vectors & inference
   - **The intelligence layer**
   - Embeddings for semantic search
   - RAG (Retrieval-Augmented Generation)
   - Inference quotas & revenue flows
   - Labels replace legacy tags

### Knowledge Subdirectory

- **[knowledge/score.md](./knowledge/score.md)** - Inference score tracker
  - Measures ontology stability
  - Lower is better
  - Goal: < 20 modifications per month

---

## The Complete Specification

**[Ontology.md](./ontology.md)** - The single source of truth

- Complete technical specification
- All 66 thing types with properties
- All 25 connection types with metadata patterns
- All 67 event types with examples
- Protocol integration examples (A2A, ACP, AP2, X402, AGUI)
- Migration guides & validation rules
- Performance optimization & indexing

---

## Quick Start Guide

### For AI Agents

1. Read **[Ontology.md](./ontology.md)** (complete spec)
2. Understand the 6-dimension universe:
   - **Things** - entities
   - **Connections** - relationships
   - **Events** - actions
   - **Knowledge** - vectors + inference
3. Follow patterns in consolidated files
4. Everything maps to these 6 dimensions (organizations, people, things, connections, events, knowledge)

### For Developers

1. Start with **[groups.md](../groups/groups.md)** - Understand multi-tenancy & hierarchical groups
2. Read **[people.md](./people.md)** - Understand roles & permissions
3. Skim **[things.md](./things.md)** - See what entities exist
4. Review **[connections.md](./connections.md)** - See how things relate
5. Check **[events.md](./events.md)** - See what gets logged
6. Dive into **[knowledge.md](./knowledge.md)** - Understand the intelligence layer
7. Reference **[Ontology.md](./ontology.md)** for complete details

### For Product Managers

1. **[groups.md](../groups/groups.md)** - How customers are isolated
2. **[people.md](./people.md)** - How users, roles & permissions work
3. **[knowledge.md](./knowledge.md)** - How AI inference generates revenue
4. **[events.md](./events.md)** - What gets tracked & analyzed

---

## Key Principles

### 1. Six Dimensions

Everything in ONE exists in one of 6 dimensions:

- **groups** - multi-tenant isolation (hierarchical containers with 6 types)
- **people** - authorization & governance (who can do what)
- **things** - entities (66 types)
- **connections** - relationships (25 types)
- **events** - actions (67 types)
- **knowledge** - vectors + labels (4 types)

### 2. Knowledge-Last

Knowledge is now the last primitive:

- Tags
- Describes
- Adds vector embeddings for semantic search
- Powers RAG for context-aware generation
- Tracks inference usage & revenue

### 3. Protocol-Agnostic

All protocols map TO the ontology via metadata:

- `metadata.protocol` identifies the protocol (a2a, acp, ap2, x402, agui)
- `metadata.network` identifies blockchain (sui, solana, base)
- Core ontology remains stable
- Infinite protocol extensibility

### 4. Group-Scoped

Multi-tenant isolation:

- Every resource belongs to a group
- Permissions enforced via membership connections
- Usage tracked per group
- Revenue sharing configurable per group

### 5. Event-Driven

Complete audit trail:

- Every action logs an event
- Every state change is immutable
- Time-stamped with actor
- Queryable for analytics

---

## The Loop

```
┌─────────────────────────────────────────────────┐
│  1. Group Scope                                  │
│     Define the context for all operations        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  2. Person Authorization                         │
│     Check permissions & role                     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  3. User Request                                 │
│     "Create a fitness course"                    │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  4. Vector Search (Knowledge)                    │
│     Find relevant chunks + labels                │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  5. RAG Context Assembly                         │
│     Crawls using vectors and ontology → Context  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  6. LLM Generation                               │
│     Context + Prompt → Generated content         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  7. Create Thing + Connections + Events          │
│     Course entity + ownership + logs             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  8. Embed New Content (Knowledge)                │
│     Course → chunks → embeddings                 │
└─────────────────────────────────────────────────┘
```

Knowledge makes generation **context-aware**, groups make it **multi-tenant**, and people make it **governed**.

---

## Design Philosophy

**Simplicity is the ultimate sophistication.**

- **6 dimensions** (not 50+ tables)
- **Groups** partition the space (6 types, hierarchical)
- **People** authorize and govern
- **66 thing types** (covers everything)
- **25 connection types** (all relationships)
- **67 event types** (complete tracking)
- **Metadata for variance** (not enum explosion)
- **Protocol-agnostic core** (infinite extensibility)

This ontology proves you don't need complexity to build a complete AI-native platform that scales from children's lemonade stands to global enterprises.

---

## Implementation

### Convex Schema

```typescript
// things table
defineTable({
  type: v.string(), // ThingType
  name: v.string(),
  properties: v.any(), // Flexible JSON
  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"]);

// connections table
defineTable({
  fromThingId: v.id("things"),
  toThingId: v.id("things"),
  relationshipType: v.string(),
  metadata: v.optional(v.any()),
  strength: v.optional(v.number()),
  validFrom: v.optional(v.number()),
  validTo: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("from_type", ["fromThingId", "relationshipType"])
  .index("to_type", ["toThingId", "relationshipType"])
  .index("bidirectional", ["fromThingId", "toThingId"]);

// events table
defineTable({
  type: v.string(), // EventType
  actorId: v.id("things"),
  targetId: v.optional(v.id("things")),
  timestamp: v.number(),
  metadata: v.any(),
})
  .index("type_time", ["type", "timestamp"])
  .index("actor_time", ["actorId", "timestamp"])
  .index("thing_type_time", ["targetId", "type", "timestamp"]);

// knowledge table
defineTable({
  knowledgeType: v.string(), // 'label' | 'document' | 'chunk' | 'vector_only'
  text: v.optional(v.string()),
  embedding: v.optional(v.array(v.number())),
  embeddingModel: v.optional(v.string()),
  embeddingDim: v.optional(v.number()),
  sourceThingId: v.optional(v.id("things")),
  sourceField: v.optional(v.string()),
  chunk: v.optional(v.any()),
  labels: v.optional(v.array(v.string())),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})
  .index("by_type", ["knowledgeType"])
  .index("by_source", ["sourceThingId"])
  .index("by_created", ["createdAt"]);
// Vector index (provider-specific)

// thingKnowledge junction table
defineTable({
  thingId: v.id("things"),
  knowledgeId: v.id("knowledge"),
  role: v.optional(v.string()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_thing", ["thingId"])
  .index("by_knowledge", ["knowledgeId"]);
```

---

## Roadmap

### Phase 1: Foundation ✅

- Ontology complete
- Knowledge system designed
- Documentation organized

### Phase 2: Implementation (Current)

- Convex schema migration
- Embedding pipeline
- Vector search
- Inference tracking

### Phase 3: Scale

- Multi-tenant dashboards
- Revenue sharing automation
- Cross-chain bridges
- Protocol integrations

---

## Contributing

When adding features:

1. **Map to ontology first** - Which things/connections/events?
2. **Use existing types** - Don't create new types unless necessary
3. **Metadata for variance** - Protocol/network in metadata, not new enums
4. **Log events** - Every action creates an event
5. **Embed content** - Text content → knowledge chunks
6. **Update inference score** - Track ontology modifications

**Stability = Beauty**

---

**Welcome to ONE. Where groups contain, people customize, and knowledge powers everything.**

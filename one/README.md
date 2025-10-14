# The ONE Ontology

> **Every intelligent system needs a coherent model of reality.**

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

   https://one.ie  •  npx oneie

The ONE Ontology gives AI agents—and the humans who direct them—a complete, scalable architecture for understanding **who owns what, who can do what, what happened, and what it all means.**

[![License](https://img.shields.io/badge/license-FREE-blue.svg)](../LICENSE.md)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](./knowledge/ontology.md)
[![Dimensions](https://img.shields.io/badge/dimensions-6-orange.svg)](#the-6-dimensions)

---

## 🌟 Why the ONE Ontology

Traditional systems create tables for features, pollute schemas with temporary concepts, and end up with hundreds of entities nobody understands. The ONE Ontology takes a different approach:

**Model reality in six core dimensions and map everything to them.**

```
┌─────────────────────────────────────────────────────────────┐
│  Groups → People → Things → Connections → Events → Knowledge │
│                                                               │
│  Everything flows through these six dimensions.               │
│  Everything scales without schema changes.                   │
│  Everything is queryable, composable, and intelligent.        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 The 6 Dimensions

### 1. 👥 Groups
**Hierarchical containers that organize people and things**

Groups can nest infinitely—from intimate friend circles to massive organizations. Each group owns its own graph of people, things, connections, events, and knowledge, creating perfect isolation at any scale.

**6 Group Types:**
- `friend_circle` - Small, intimate groups
- `business` - Commercial organizations
- `community` - Interest-based collectives
- `dao` - Token-governed groups
- `government` - Public institutions
- `organization` - Generic groups

**URL-Based Creation:**
```
one.ie/group/cooldao → creates "cooldao" group
one.ie/group/cooldao/treasury → creates nested "treasury" group
one.ie/group/emmas-birthday → creates "emmas-birthday" group
```

**Hierarchical Nesting Example:**
```
groups/acme-corp (business)
  ├─ groups/engineering (organization)
  │   ├─ groups/backend-team (organization)
  │   └─ groups/frontend-team (organization)
  ├─ groups/marketing (organization)
  └─ groups/sales (organization)

groups/emmas-friends (friend_circle)
  ├─ groups/birthday-party (friend_circle)
  └─ groups/game-night (friend_circle)

groups/cool-dao (dao)
  ├─ groups/treasury (dao)
  └─ groups/governance (dao)
```

---

### 2. 🙋 People
**Authorization & governance - WHO can do what**

People are the prime movers. Every decision, transaction, and relationship traces back to human intent. People link to organizations through membership connections, creating clear authorization chains.

**4 Roles:**
- `platform_owner` - Platform-level control
- `org_owner` - Organization-level control
- `org_user` - Organization member
- `customer` - End user

**Properties:**
- Identity (name, email, wallet)
- Authentication credentials
- Role within organization
- Permissions and authorization
- Preferences and settings

**Why it matters:**
- ✓ Human authorization required
- ✓ Clear governance
- ✓ Audit trails
- ✓ Intent and accountability
- ✓ AI serves people, not the other way around

---

### 3. 📦 Things
**Entities - WHAT exists in your system**

Things are discrete entities with properties, types, and states. They can be agents, products, audiences, tokens, mandates, contracts—anything you need to model. Every thing belongs to exactly one group.

**66 Thing Types** organized in categories:

**Core:**
- `creator`, `audience_member`, `workspace`, `organization_settings`

**Agents:**
- `intelligence_agent`, `business_agent`, `personal_assistant`, `data_analyst`, `writer`, `researcher`, `moderator`, `customer_support`, `sales_rep`, `code_reviewer`, `qa_tester`, `task_automator`

**Content:**
- `video_content`, `text_content`, `audio_content`, `image_content`, `course`, `curriculum`, `module`, `lesson`, `quiz`, `certificate`, `podcast`, `newsletter`, `live_stream`, `blog_post`

**Products:**
- `token`, `nft`, `digital_product`, `offer`, `subscription_tier`, `bundle`, `access_pass`

**Community:**
- `community`, `forum`, `discussion`, `announcement`, `poll`

**Knowledge:**
- `knowledge_base`, `knowledge_chunk`, `topic`, `recommendation`, `insight`, `summary`

**Platform:**
- `ai_clone`, `voice_clone`, `personality_profile`, `mandate`, `delegation`, `workflow`, `automation`, `integration`, `webhook`

**Business:**
- `lead`, `deal`, `invoice`, `payment_method`, `payout_config`

---

### 4. 🔗 Connections
**Relationships - HOW things relate to each other**

Connections are first-class relationships with their own properties. They express ownership, membership, governance, authorization, dependencies, transactions, and more. Connections make the implicit explicit.

**25 Connection Types:**

**Ownership & Authorization:**
- `owns` - Ownership relationship
- `can_read` - Read access
- `can_write` - Write access
- `can_execute` - Execution permission

**Governance:**
- `governed_by` - Governed by mandate
- `delegated_to` - Delegation chain
- `member_of` - Membership

**Content & Knowledge:**
- `authored` - Created content
- `taught_by` - Teaching relationship
- `enrolled_in` - Course enrollment
- `contains` - Hierarchical containment

**Social:**
- `following` - Social following
- `subscribed_to` - Subscription
- `holds_tokens` - Token ownership

**Consolidated Types (with metadata):**
- `transacted` - Financial transactions (metadata.protocol: stripe | sui | blockchain)
- `communicated` - Messages/interactions (metadata.channel: email | chat | voice)
- `delegated` - Delegated authority (metadata.permissions: [...])
- `governed` - Governance (metadata.constraints: [...])
- `powered` - Dependency (metadata.config: {...})
- `related` - Generic relationship (metadata.relationshipType: custom)
- `licensed_to` - Licensing (metadata.terms: {...})

---

### 5. ⚡ Events
**Actions - WHAT happened, when, and why**

Events are immutable records of every action in your system. They create an audit trail, enable time-travel queries, feed analytics, and power learning loops. Events are the memory of your system.

**67 Event Types** organized in categories:

**Thing Lifecycle:**
- `thing_created`, `thing_updated`, `thing_deleted`, `thing_published`, `thing_archived`

**User Actions:**
- `user_signup`, `user_login`, `user_logout`, `profile_updated`, `preferences_changed`

**AI/Agent:**
- `agent_created`, `agent_executed`, `agent_completed`, `agent_failed`, `clone_created`, `clone_interaction`, `voice_cloned`, `personality_analyzed`

**Inference Events:**
- `inference_request`, `inference_completed`, `inference_failed`, `inference_quota_exceeded`, `inference_revenue_collected`, `org_revenue_generated`, `revenue_share_distributed`

**Token/NFT:**
- `token_created`, `tokens_purchased`, `tokens_transferred`, `tokens_burned`, `nft_minted`, `nft_transferred`

**Blockchain:**
- `tokens_bridged`, `contract_deployed`, `treasury_withdrawal`

**Content:**
- `content_created`, `content_published`, `content_viewed`, `content_liked`, `content_shared`, `course_enrolled`, `lesson_completed`, `quiz_submitted`, `certificate_earned`

**Knowledge:**
- `knowledge_indexed`, `embedding_generated`, `search_performed`, `recommendation_generated`

**Consolidated Events (with metadata):**
- `communicated` (metadata.protocol: email | sms | chat)
- `transacted` (metadata.protocol: stripe | sui | blockchain)
- `content_engaged` (metadata.engagement_type: view | like | share)
- Others...

---

### 6. 🧠 Knowledge
**Intelligence - WHAT it all means**

Knowledge captures semantics—labels, chunks, embeddings, and structured insights—that give agents the context they need to act intelligently. Knowledge transforms raw events and properties into queryable, composable intelligence.

**12 Tag Categories:**

1. **skill** - typescript, react, python, design, video-editing
2. **industry** - fitness, education, finance, healthcare
3. **topic** - ai, blockchain, marketing, sales, analytics
4. **format** - video, text, audio, code, interactive
5. **goal** - learn, earn, build, grow, teach
6. **audience** - beginners, professionals, students, developers
7. **technology** - astro, react-19, convex, sui, solana
8. **status** - draft, published, deprecated, featured
9. **capability** - image-gen, analysis, trading, refactoring
10. **protocol** - a2a, acp, ap2, x402, ag-ui
11. **payment** - stripe, crypto, x402, ap2
12. **network** - sui, solana, base, ethereum

**Features:**
- Labels for categorization
- Chunks for semantic search
- Embeddings for vector similarity
- Relationships for knowledge graphs
- Licensing for IP protection
- Provenance for trust
- Tokenization for markets

---

## 🎨 How The Ontology Works

### Complete Example: Fan Buys Creator Tokens

Let's see how all six dimensions work together in a real feature:

#### Step 0: **Groups** (Scope)
```typescript
groupId: "acme-corp"
// Transaction happens within this group boundary
// All entities belong to this group (can be nested)
```

#### Step 1: **People** (Authorization)
```typescript
actorId: "fan_123"
// Fan authorizes: "Buy 100 creator tokens for $10"
```

#### Step 2: **Things** (Entities Involved)
```typescript
{
  fan_123: { type: "audience_member" },
  token_456: { type: "token", symbol: "CRTR" }
}
```

#### Step 3: **Connections** (Relationship Created)
```typescript
{
  fromThingId: "fan_123",
  toThingId: "token_456",
  relationshipType: "holds_tokens",
  metadata: { balance: 100 }
}
```

#### Step 4: **Events** (Action Recorded)
```typescript
{
  type: "tokens_purchased",
  actorId: "fan_123",
  targetId: "token_456",
  metadata: { amount: 100, usd: 10 },
  timestamp: Date.now()
}
```

#### Step 5: **Knowledge** (Context Added)
```typescript
// Labels give downstream agents context
tags: ["payment_method:stripe", "status:completed", "audience:engaged"]
```

**Result:** One intent now touches every dimension—organizational scope, authorization, entities, relationships, events, and context—ready for agents to reuse.

---

## 📐 Data Flow Through The Ontology

```
0. Groups (Isolation Layer)
   ↓ Establishes scope for all operations (with optional nesting)

1. People (Policy Layer)
   ↓ Humans set outcomes, attach limits, approve execution

2. Things (Entity Layer)
   ↓ System resolves intent into typed entities

3. Connections (Relationship Layer)
   ↓ Defines how value moves—ownership, membership, authority

4. Events (Audit Layer)
   ↓ Records what happened, when, by whom

5. Knowledge (Intelligence Layer)
   ↓ Adds labels, embeddings, summaries for AI agents
```

**Together:** Groups partition for scale (with infinite hierarchy), People authorize for governance, Things exist for substance, Connections relate for structure, Events record for memory, Knowledge learns for intelligence.

---

## 💡 Plain English DSL

### Write Features in English. The System Builds Everything.

Describe what you want in plain English. The compiler checks every line against the ontology, generates TypeScript and tests, and deploys to the edge.

**Example: Chat with AI Clone**

```
FEATURE: Let fans chat with my AI clone

WHEN a fan sends a message
  CHECK they own tokens
  GET conversation history
  CALL OpenAI with my personality
  RECORD the interaction
  REWARD fan with 10 tokens
  GIVE AI response to fan
```

**What maps to ontology:**

- **Things Touched:** fan, ai_clone, message, token — all typed rows
- **Connections Updated:** fan `holds_tokens` token, fan `interacted_with` clone with metadata
- **Events Logged:** message_sent, tokens_earned, clone_interaction with timestamps
- **Knowledge Indexed:** Clone personality, embeddings, conversation history for retrieval

**5 Core Commands:**

| Command | Purpose | Example |
|---------|---------|---------|
| `CREATE` | Add typed Things into the graph | `CREATE ai clone WITH voice ID` |
| `CONNECT` | Define relationships with metadata | `CONNECT fan to token as holder` |
| `RECORD` | Append immutable Events | `RECORD tokens purchased BY fan` |
| `CALL` | Invoke services and persist outputs | `CALL Stripe to charge payment` |
| `CHECK` | Enforce guardrails before action | `CHECK user has tokens` |

See [language.md](./knowledge/language.md) for complete DSL specification.

---

## 🚀 What This Unlocks

### Zero-Trust Authorization
Every action traces back through explicit connections to a person in an organization. Perfect auditability. No implicit permissions. Authorization is data, not code.

### Identity-Aware Intelligence
Agents don't just retrieve facts—they understand organizational context, provenance, licensing, governance, and strategic constraints.

### Event-Driven Compounding
Every action generates events that create knowledge that enriches future actions. The system gets smarter with every interaction.

### Protocol-Agnostic Integration
Same ontology, different protocols—all via metadata. Query across Stripe, SUI, and any future protocol with unified patterns.

### Cross-Organization Collaboration
Resources can be shared without transferring ownership. Perfect for knowledge marketplaces with trustless licensing.

### Tokenization with SUI
SUI's object-centric model maps naturally to ONE's thing-centric ontology. Knowledge as tradeable, licensable assets.

---

## 📈 Built for Scale

### Current Scale
- ✅ 1M+ things per organization
- ✅ 10M+ connections (optimized indexes)
- ✅ 100M+ events (time-partitioned)
- ✅ 1M+ knowledge chunks (vector search)

### Performance
- 🚀 Graph caching (ownership chains)
- 🚀 Materialized views (common queries)
- 🚀 Event archival (cold storage)
- 🚀 Token budgeting (context aware)

### Future Scale
- 🔮 Shard by organization (>10M things)
- 🔮 Streaming events (Kafka)
- 🔮 Distributed vectors (Weaviate)
- 🔮 Regional databases (CDC replication)

---

## 📚 Documentation Structure

This repository contains **41 documentation files** organized in **8 layers**:

### 1. Strategy Layer (Vision & Revenue)
- [vision.md](./groups/vision.md) - Platform vision
- [revenue.md](./groups/revenue.md) - Revenue strategy
- [one.md](./groups/one.md) - Platform organization

### 2. Ontology Layer (Core Model)
- [ontology.md](./knowledge/ontology.md) - Complete 6-dimension spec (Version 1.0.0)
- [groups.md](./groups/groups.md) - Groups dimension
- [things.md](./things/things.md) - Things dimension
- [connections.md](./connections/connections.md) - Connections dimension
- [events.md](./events/events.md) - Events dimension
- [knowledge.md](./knowledge/knowledge.md) - Knowledge dimension

### 3. Protocols Layer (A2A, ACP, AP2, X402, AG-UI)
- [protocols.md](./connections/protocols.md) - Protocol overview
- [a2a.md](./connections/a2a.md), [acp.md](./connections/acp.md), [ap2.md](./connections/ap2.md), [x402.md](./connections/x402.md), [agui.md](./connections/agui.md)

### 4. Services Layer (Effect.ts)
- [service-layer.md](./connections/service-layer.md) - Effect.ts patterns
- [service-providers.md](./things/service-providers.md) - External API providers

### 5. Implementation Layer (Frontend, Patterns)
- [frontend.md](./knowledge/frontend.md) - Frontend architecture
- [architecture.md](./knowledge/architecture.md) - System architecture
- [patterns.md](./connections/patterns.md) - Code patterns

### 6. Integration Layer (ElizaOS, CopilotKit, MCP, N8N)
- [elizaos.md](./connections/elizaos.md) - ElizaOS integration
- [copilotkit.md](./connections/copilotkit.md) - CopilotKit integration
- [mcp.md](./connections/mcp.md) - Model Context Protocol
- [n8n.md](./connections/n8n.md) - N8N workflow automation

### 7. Examples Layer (Use Cases)
- [lemonade-stand.md](./things/examples/children/lemonade-stand.md) - Simple for children
- Enterprise CRM examples

### 8. Plans Layer (Future & Technical Debt)
- Various planning documents

**Use targeted reading:** Don't read everything - follow the critical path for your specific feature type.

See [files.md](./knowledge/files.md) for complete file location guide.

---

## 🎯 Getting Started

### For Developers

1. **Understand the Ontology**
   ```bash
   # Read these in order:
   - knowledge/ontology.md (complete 6-dimension spec)
   - knowledge/rules.md (golden rules)
   - connections/workflow.md (development flow)
   - connections/patterns.md (code patterns)
   ```

2. **Map Your Feature**
   - Which **groups** are involved? (organizational scope, with potential nesting)
   - Which **people** are involved? (authorization)
   - Which **things** are involved? (entities)
   - Which **connections** are needed? (relationships)
   - Which **events** should be logged? (actions)
   - Which **knowledge** should be captured? (context)

3. **Generate Code**
   - Use Effect.ts for business logic
   - Create Convex wrappers for database operations
   - Build React components for UI
   - Write tests to validate behavior

### For AI Agents

**Before generating ANY code:**

1. Read `knowledge/ontology.md` (understand the 6 dimensions)
2. Read `knowledge/rules.md` (golden rules for AI agents)
3. Read `connections/workflow.md` (6-phase development workflow)
4. Map feature to: groups, people, things, connections, events, knowledge
5. Design types and errors (tagged unions)
6. Generate Effect.ts service (pure business logic)
7. Create Convex wrapper (thin layer)
8. Build React component (UI)
9. Write tests (unit + integration)
10. Update documentation

**Critical:** Never skip reading documentation. Never use `any` type except in entity `properties`. Always write tests.

### For Content Creators

Use the Plain English DSL:

```
FEATURE: Create my AI voice clone

INPUT:
  - video links (at least 3)

OUTPUT:
  - clone ID
  - voice ID

FLOW:
  CALL ElevenLabs to clone voice
  CALL OpenAI to analyze personality
  CREATE ai clone WITH voice and personality
  CONNECT creator to clone as owner
  RECORD clone created
  GIVE clone ID and voice ID
```

See [language.md](./knowledge/language.md) for complete DSL reference.

---

## 🏗️ Architecture Principles

### 1. Clarity Scales
Everything maps to the 6 dimensions. No exceptions. If it doesn't map, rethink your approach.

### 2. Groups Partition for Scale
From friend circles (2 people) to governments (billions) without schema changes. Infinite hierarchical nesting supported.

### 3. People Authorize for Governance
Every action traces back to human intent. AI serves people, not the other way around.

### 4. Things Exist for Substance
66 thing types capture everything you need to model. Flexible `properties` field for type-specific data.

### 5. Connections Relate for Structure
25 connection types make the implicit explicit. Relationships are first-class with metadata.

### 6. Events Record for Memory
67 event types create immutable audit trail. Time-travel queries and analytics built-in.

### 7. Knowledge Learns for Intelligence
Tags, chunks, embeddings, and relationships give AI agents context to act intelligently.

---

## 💎 Philosophy

**Beauty = Stability.** The ontology is not just a schema—it's a shared mental model between humans, AI agents, and code. Every feature should feel intentional because it maps cleanly to reality.

**Simple enough for children. Powerful enough for enterprises.** A lemonade stand and a Fortune 500 company use the same 6 dimensions.

**The ontology holds the contracts. The DSL speaks those contracts.** Together they give everyone the same, inspectable source of truth.

**Clarity scales.** Your DSL features, agent playbooks, and analytics dashboards stay in sync because they pull from the same ontology.

**Map your domain to these dimensions. Everything else is just data.**

---

## 📊 Statistics

### Ontology Size
- **6 Dimensions** (groups, people, things, connections, events, knowledge)
- **6 Group Types** (friend_circle, business, community, dao, government, organization)
- **4 Roles** (platform_owner, org_owner, org_user, customer)
- **66 Thing Types** (across 13 categories)
- **25 Connection Types** (18 specific + 7 consolidated)
- **67 Event Types** (including inference & blockchain events)
- **12 Tag Categories** (industry, skill, topic, format, goal, audience, technology, status, capability, protocol, payment, network)

### Coverage
- ✅ **100% Protocol Agnostic** - Stripe, SUI, Solana, any blockchain via metadata
- ✅ **100% Type Safe** - Every entity, connection, and event is typed
- ✅ **100% AI Understandable** - Plain English DSL compiles to ontology
- ✅ **100% Auditable** - Immutable event log for every action

---

## 🔗 Quick Links

### Core Documentation
- [📖 Complete Ontology Specification](./knowledge/ontology.md) - Version 1.0.0
- [🎨 Plain English DSL](./knowledge/language.md) - Write features in English
- [🏗️ Architecture Guide](./knowledge/architecture.md) - System architecture
- [📝 Development Workflow](./connections/workflow.md) - 6-phase process
- [🎯 Code Patterns](./connections/patterns.md) - Proven patterns
- [⚡ Golden Rules](./knowledge/rules.md) - Rules for AI agents
- [📁 File Locations](./knowledge/files.md) - Where everything goes

### Integrations
- [🤖 ElizaOS](./connections/elizaos.md) - Multi-agent communication
- [🎨 CopilotKit](./connections/copilotkit.md) - Generative UI
- [🔌 MCP](./connections/mcp.md) - Model Context Protocol
- [⚙️ N8N](./connections/n8n.md) - Workflow automation

### Examples
- [🍋 Lemonade Stand](./things/examples/children/lemonade-stand.md) - Simple for children
- Enterprise CRM (coming soon)

---

## 🤝 Contributing

We welcome contributions! Before submitting:

1. Read [knowledge/ontology.md](./knowledge/ontology.md) to understand the 6 dimensions
2. Read [knowledge/rules.md](./knowledge/rules.md) for golden rules
3. Map your contribution to the ontology
4. Follow the patterns in [connections/patterns.md](./connections/patterns.md)
5. Write tests
6. Update documentation

---

## 📜 License

Copyright © 2025 ONE Platform
Licensed under the FREE License with Commercial Attribution

See [LICENSE.md](../LICENSE.md) for details.

---

## 🌐 Links

- **Website:** [one.ie](https://one.ie)
- **GitHub:** [github.com/one-ie/ontology](https://github.com/one-ie/ontology)
- **Documentation:** [docs.one.ie](https://docs.one.ie)
- **NPM:** `npx oneie@latest`

---

<div align="center">

**ONE Ontology. Infinite Systems.**

*Built with clarity, simplicity, and infinite scale in mind.*

[Explore the Platform](https://one.ie) • [View on GitHub](https://github.com/one-ie/stack) • [Read the Docs](https://docs.one.ie)

</div>

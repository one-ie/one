# ONE Ontology Product

> **The complete architecture for AI-native systems. Simple enough for children. Powerful enough for enterprises.**

## Overview

The ONE Ontology is a **six-dimension data model** that provides AI agents—and the humans who direct them—with a complete, scalable architecture for understanding **who owns what, who can do what, what happened, and what it all means.**

Every intelligent system needs a coherent model of reality. Traditional systems create tables for features, pollute schemas with temporary concepts, and end up with hundreds of entities nobody understands. The ONE Ontology takes a different approach: **model reality in six core dimensions and map everything to them.**

**Version:** 1.0.0 (Implementation-Ready)
**Status:** Production-Ready
**Implementation:** 5-table database schema (organizations, things, connections, events, knowledge)

---

## The Six Dimensions

### 1. Organizations
**Multi-tenant isolation boundary**

- Perfect data isolation for SaaS multi-tenancy
- Each org has independent data, billing, quotas, and customization
- No data leakage between organizations
- Plans: starter, pro, enterprise

**Properties:**
- Name and identity
- Ownership chain
- Subscription plan and billing
- Usage quotas and limits
- Status (active, suspended, trial)

**Why it matters:**
- Multi-tenant isolation
- Resource limits
- Billing boundaries
- White-label deployment
- Enterprise readiness

---

### 2. People
**Authorization & governance layer**

- **4 roles**: platform_owner, org_owner, org_user, customer
- Every action traces back to human intent
- AI serves people, not the other way around
- Represented as things with `type: 'creator'` and `properties.role`

**Properties:**
- Identity (name, email, wallet)
- Authentication credentials
- Role within organization
- Permissions and authorization
- Preferences and settings

**Why it matters:**
- Human authorization required
- Clear governance
- Audit trails
- Intent and accountability
- AI serves people

**AI Customization:** Your preferences, writing style, brand voice, and approval rules teach agents how to work exactly the way you want.

---

### 3. Things
**All nouns in your system**

- **66+ entity types** defined in schema
- Users, agents, content, tokens, courses, products, audiences
- Flexible `properties` field for type-specific data
- Status lifecycle: draft → active → published → archived
- Every thing belongs to an organization

**Entity Categories:**
- **Core** (8 types): creator, audience_member, ai_clone, clone_engine, content, token, etc.
- **Business Agents** (7 types): sales_agent, support_agent, content_agent, research_agent, etc.
- **Content** (8 types): video, audio, article, image, thread, newsletter, etc.
- **Products** (6 types): course, token, nft, subscription, template, marketplace_offer
- **Community** (7 types): community, channel, event, post, message, etc.
- **Knowledge** (9 types): knowledge_bundle, training_data, embedding, mandate, etc.
- **Platform** (8 types): workflow, notification, scheduled_task, etc.
- **Tokenization** (5 types): nft_collection, token_drop, staking_pool, etc.
- **External** (4 types): external_service, external_agent, external_credential, etc.
- **Protocol** (4 types): a2a_agent, mcp_server, ap2_identity, x402_endpoint

**AI Customization:** Rich properties store context about each entity—sales agent knows lead history, content agent knows top topics, support agent knows customer issues.

---

### 4. Connections
**All relationships between entities**

- **25+ connection types**: owns, authored, holds_tokens, enrolled_in, etc.
- **7 consolidated types** with rich metadata: transacted, communicated, delegated, etc.
- Bidirectional with temporal validity (validFrom/validTo)
- Scoped to organizations
- Make the implicit explicit

**Connection Types:**
- **Ownership**: owns, authored, created_by
- **Access**: can_execute, can_read, governed_by
- **Membership**: member_of, following, enrolled_in
- **Transactions**: transacted, licensed_to, subscribed_to
- **Communication**: communicated (metadata.protocol: a2a, mcp, ap2, x402)
- **Delegation**: delegated (agent relationships)
- **Knowledge**: powers (knowledge → agent), taught_by

**AI Customization:** Relationship metadata reveals engagement levels, loyalty patterns, collaboration history—agents prioritize hot leads, reward superfans, coordinate team workflows.

---

### 5. Events
**All actions and state changes over time**

- **67+ event types** including inference and blockchain events
- Complete audit trail with actor (person), target (thing), timestamp
- **Consolidated event families** with metadata.protocol for multi-protocol support
- Scoped to organizations
- Immutable timeline for analytics, compliance, and automation

**Event Categories:**
- **Thing lifecycle**: thing_created, thing_updated, thing_published, thing_archived, thing_deleted
- **User actions**: purchased, enrolled, completed, rated, shared, bookmarked
- **AI/Agent**: clone_voice_created, inference_request, inference_completed, agent_trained
- **Token/NFT**: tokens_purchased, tokens_earned, tokens_transferred, nft_minted, nft_transferred
- **Content**: content_viewed, content_liked, content_commented, scheduled, published
- **Knowledge**: knowledge_indexed, knowledge_linked, prompt_template_created
- **Analytics**: revenue_received, subscription_renewed
- **Blockchain**: contract_deployed, tokens_bridged, treasury_withdrawal

**AI Customization:** Event streams reveal behavior patterns—what content performs best, which features drive engagement, when users convert. Agents learn and adapt continuously.

---

### 6. Knowledge
**Labels, embeddings, and semantic search**

- Vector storage for RAG (Retrieval-Augmented Generation)
- Linked to things via junction table
- Supports categorization and taxonomy
- Scoped to organizations
- Transforms raw events into queryable intelligence

**Knowledge Types:**
- Labels and categories
- Chunks and embeddings
- Relationships and provenance
- Licensing and tokenization
- Semantic search capabilities

**AI Customization:** Vector embeddings power semantic search, document understanding, intelligent recommendations. Your knowledge base becomes liquid intelligence agents can query instantly.

---

## Complete Data Flow Example

### Use Case: Fan Purchases Creator Tokens

**0. Organizations (Scope)**
```
orgId: acme-corp → scope: all entities in this transaction
```

**1. People (Authorization)**
```
actorId: fan_123 → intent: purchase_tokens
```

**2. Things (Entities Involved)**
```
fan_123: type: audience_member
token_456: type: token
```

**3. Connections (Relationship Created)**
```
fan_123 → token_456
relationshipType: holds_tokens
metadata: { balance: 100 }
```

**4. Events (Action Recorded)**
```
type: tokens_purchased
actorId: fan_123
targetId: token_456
metadata: { amount: 100, usd: 10 }
```

**5. Knowledge (Context Added)**
```
Labels: payment_method:stripe, status:completed, audience:engaged
```

**Result:** One intent now touches every dimension—organizational scope, authorization, entities, relationships, events, and context—ready for agents to reuse.

---

## How Context Flows Through the Ontology

### The Generative Chain

Everything begins with identity and organizational scope. This isn't just metadata—it's the foundation that makes every AI operation context-aware, authorized, and intelligent.

### Ownership Hierarchy Example

```
groups/acme-corp (the container - type: organization)
  ├─ owned_by → people/anthony-o-connell (the owner)
  ├─ member_of → people/sarah-thompson (member, role: analyst)
  │
  └─ owns → things/strategy-agent
      ├─ governed_by → things/business-strategy-mandate
      ├─ can_read → knowledge/market-research-bundle
      ├─ can_read → knowledge/competitor-landscape
      └─ can_execute → people/anthony-o-connell (owner)
      └─ can_execute → people/sarah-thompson (delegated)
```

### Context Propagation in Action

When you ask your Strategy Agent a question, the system automatically enriches the prompt with your identity graph:

1. **Organizational context** - Which org is asking?
2. **Authorization** - Who can access what?
3. **Accessible resources** - What knowledge is available?
4. **Recent events** - What happened recently?
5. **Relevant knowledge** - Semantic match from embeddings
6. **Mandates/constraints** - What rules apply?

**The agent knows:**
- WHO is asking
- WHAT scope to operate in
- WHAT it can access
- WHAT happened recently
- WHAT constraints apply
- WHAT it already knows

---

## Plain English DSL Integration

### Write Features in English, Deploy in Minutes

The ONE Ontology isn't just a database schema—it's a **generative architecture** that compiles plain English commands into production code.

### 15 Core Commands

| Command | Dimension | Purpose |
|---------|-----------|---------|
| `CREATE` | Things | Add typed entities to the graph |
| `CONNECT` | Connections | Define relationships with metadata |
| `RECORD` | Events | Append immutable action logs |
| `CALL` | Integration | Invoke external services |
| `CHECK` | Authorization | Enforce guardrails |
| `GET` | Query | Retrieve entities/relationships |
| `UPDATE` | Things | Modify properties |
| `DELETE` | Things | Archive/remove entities |
| `SEARCH` | Knowledge | Semantic vector search |
| `LABEL` | Knowledge | Add categorization |
| `WHEN` | Trigger | Event-driven automation |
| `IF` | Condition | Conditional logic |
| `FOR EACH` | Loop | Iteration |
| `DO TOGETHER` | Parallel | Concurrent execution |
| `GIVE` | Response | Return data to user |

### Example: Chat with AI Clone

**Plain English:**
```
FEATURE: Let fans chat with my AI

WHEN a fan sends a message
  CHECK they own tokens
  GET conversation history
  CALL OpenAI with my personality
  RECORD the interaction
  REWARD fan with 10 tokens
  GIVE AI response to fan
```

**What Maps to Ontology:**
- **Things Touched**: fan, ai_clone, message, token (all typed rows)
- **Connections Updated**: fan holds_tokens token, fan interacted_with clone with metadata
- **Events Logged**: message_sent, tokens_earned, clone_interaction with timestamps
- **Knowledge Indexed**: Clone personality, embeddings, conversation history for retrieval

**System Generates:**
- Backend API endpoints (Convex mutations/queries)
- React UI components (with loading/error states)
- Complete test suite (unit + integration)
- Database schema updates (type-safe)
- Edge deployment config
- Full documentation

---

## What This Unlocks

### 1. Zero-Trust Authorization
Every action traces back through explicit connections to a person in an organization. Perfect auditability. No implicit permissions. Authorization is data, not code.

### 2. Identity-Aware Intelligence
Agents don't just retrieve facts—they understand organizational context, provenance, licensing, governance, and strategic constraints.

### 3. Event-Driven Compounding
Every action generates events that create knowledge that enriches future actions. The system gets smarter with every interaction.

### 4. Protocol-Agnostic Integration
Same ontology, different protocols—all via metadata. Query across Stripe, SUI, and any future protocol with unified patterns.

**Supported Protocols:**
- **A2A** (Agent-to-Agent): Multi-agent coordination
- **ACP** (Agent Communication Protocol): Standardized messaging
- **AP2** (ActivityPub 2): Social graphs
- **X402** (Payment Protocol): Micropayments
- **AG-UI**: Agent-generated interfaces
- **MCP** (Model Context Protocol): AI context sharing

### 5. Cross-Organization Collaboration
Resources can be shared without transferring ownership. Perfect for knowledge marketplaces with trustless licensing.

### 6. Tokenization with SUI
SUI's object-centric model maps naturally to ONE's thing-centric ontology. Knowledge as tradeable, licensable assets.

---

## Scale & Performance

### Current Scale (Production-Ready)
- **1M+ things** per organization
- **10M+ connections** with optimized indexes
- **100M+ events** with time-partitioned storage
- **1M+ knowledge chunks** with vector search

### Performance Optimizations
- **Graph caching** for ownership chains
- **Materialized views** for common queries
- **Event archival** to cold storage
- **Token budgeting** for context-aware AI

### Future Scale (Enterprise-Ready)
- **Shard by organization** (>10M things)
- **Streaming events** via Kafka
- **Distributed vectors** via Weaviate
- **Regional databases** with CDC replication

---

## Implementation Details

### Database Schema (5 Tables)

```typescript
// organizations table
{
  _id: Id<"organizations">,
  name: string,
  slug: string,
  ownerId: Id<"things">, // person who owns org
  plan: "starter" | "pro" | "enterprise",
  status: "active" | "suspended" | "trial",
  properties: any, // flexible metadata
  createdAt: number,
  updatedAt: number
}

// things table (entities)
{
  _id: Id<"things">,
  organizationId: Id<"organizations">,
  type: string, // 66+ types
  name: string,
  properties: any, // type-specific data
  status: "draft" | "active" | "published" | "archived",
  createdAt: number,
  updatedAt: number
}

// connections table (relationships)
{
  _id: Id<"connections">,
  organizationId: Id<"organizations">,
  fromThingId: Id<"things">,
  toThingId: Id<"things">,
  relationshipType: string, // 25+ types
  metadata: any, // relationship-specific data
  validFrom?: number,
  validTo?: number,
  createdAt: number
}

// events table (audit trail)
{
  _id: Id<"events">,
  organizationId: Id<"organizations">,
  eventType: string, // 67+ types
  thingId: Id<"things">, // target of event
  actorId?: Id<"things">, // person who triggered
  metadata: any, // event-specific data
  timestamp: number
}

// knowledge table (AI context)
{
  _id: Id<"knowledge">,
  organizationId: Id<"organizations">,
  type: "label" | "chunk" | "embedding",
  content: string,
  embedding?: number[], // vector for semantic search
  metadata: any,
  createdAt: number
}
```

### Indexes (Optimized for Graph Queries)

```typescript
// things indexes
by_organization: ["organizationId"]
by_type: ["organizationId", "type"]
by_status: ["organizationId", "status"]

// connections indexes
from_type: ["fromThingId", "relationshipType"]
to_type: ["toThingId", "relationshipType"]
org_relationships: ["organizationId", "relationshipType"]

// events indexes
by_thing: ["thingId", "timestamp"]
by_actor: ["actorId", "timestamp"]
by_type: ["organizationId", "eventType", "timestamp"]

// knowledge indexes
by_type: ["organizationId", "type"]
vector_search: custom vector index
```

---

## Why This Works

### Traditional Approach (Fails)
```
Hundreds of tables → Complex joins → N+1 queries → Technical debt
```

### ONE Ontology Approach (Scales)
```
6 dimensions → 5 tables → Graph queries → Infinite composability
```

### Benefits

1. **Consistency** - Every feature follows same pattern
2. **Type Safety** - Compiler catches errors
3. **Testability** - Pure functions are easy to test
4. **Composability** - Services combine cleanly
5. **AI-Friendly** - Explicit patterns AI can learn
6. **Protocol-Agnostic** - Metadata adapts to any protocol
7. **Multi-Tenant** - Perfect isolation via organizations
8. **Event-Driven** - Complete audit trail built-in

**Result:** Code quality IMPROVES as codebase grows because AI learns from proven patterns.

---

## Use Cases

### For Individual Creators
- Clone your voice/personality
- Automate content generation
- Build token economy
- Grow engaged audience
- Monetize knowledge

### For Businesses
- Multi-agent workflows
- Customer relationship management
- Sales automation
- Support automation
- Knowledge management

### For Enterprises
- Multi-tenant SaaS
- White-label deployment
- Compliance & governance
- Cross-organization collaboration
- Protocol integration

### For Developers
- Type-safe development
- Plain English DSL
- Effect.ts services
- Protocol-agnostic APIs
- AI-native architecture

---

## Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/one-ie/stack
cd stack

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your keys
```

### 2. Understanding the Ontology

Read these documents in order:
1. **one/knowledge/ontology.md** - Complete 6-dimension specification
2. **one/connections/workflow.md** - Development workflow
3. **one/connections/patterns.md** - Proven code patterns
4. **one/knowledge/rules.md** - Golden rules

### 3. Map Your Feature to Dimensions

Ask yourself:
- What **organizations** are involved? (scope)
- What **people** need authorization? (who can do what)
- What **things** exist? (entities)
- What **connections** relate them? (relationships)
- What **events** should be logged? (actions)
- What **knowledge** needs to be learned? (context)

### 4. Write in Plain English

```
FEATURE: Create AI sales agent

CREATE sales_agent
CONNECT owner owns sales_agent
CONNECT sales_agent can_read knowledge_base
WHEN lead sends message:
  GET lead's history
  CALL OpenAI to qualify intent
  RECORD interaction
  IF hot lead: NOTIFY owner
```

### 5. System Generates Code

The compiler:
1. Validates against ontology
2. Generates TypeScript services
3. Creates Convex functions
4. Builds React components
5. Generates test suite
6. Deploys to edge

---

## Philosophy

**Simple enough for children. Powerful enough for enterprises.**

The ONE Ontology proves that you don't need hundreds of tables or complex schemas to build intelligent systems. You need six dimensions that model reality:

- **Organizations** partition for scale
- **People** authorize for governance
- **Things** exist for substance
- **Connections** relate for structure
- **Events** record for memory
- **Knowledge** learns for intelligence

**Map your domain to these dimensions. Everything else is just data.**

---

## Statistics

- **66+ thing types** - Comprehensive entity coverage
- **25+ connection types** - Rich relationship modeling
- **67+ event types** - Complete action tracking
- **12+ tag categories** - Flexible categorization
- **5 database tables** - Simple, scalable schema
- **100% Effect.ts** - Pure functional business logic
- **Protocol-agnostic** - Works with any communication protocol
- **Multi-tenant ready** - Perfect isolation by default
- **AI-native** - Built for autonomous agents
- **Type-safe** - Compiler-enforced correctness

---

## Comparison with Alternatives

### Traditional Database Design
- ❌ Hundreds of tables
- ❌ Complex foreign keys
- ❌ Technical debt accumulates
- ❌ Hard to extend
- ❌ AI agents struggle

### ONE Ontology
- ✅ 5 tables
- ✅ Graph-based relationships
- ✅ Quality improves with scale
- ✅ Infinitely extensible
- ✅ AI agents thrive

### Traditional Development
- Feature request → Design schema → Write code → Debug → Deploy
- **Time to production:** Weeks/months

### ONE Development
- Feature request → Map to ontology → Write plain English → Deploy
- **Time to production:** Minutes/hours

---

## Support & Resources

### Documentation
- **Complete Ontology Spec**: `/one/knowledge/ontology.md`
- **Development Workflow**: `/one/connections/workflow.md`
- **Code Patterns**: `/one/connections/patterns.md`
- **File Structure**: `/one/things/files.md`
- **Golden Rules**: `/one/knowledge/rules.md`

### Protocol Integration
- **Protocol Overview**: `/one/connections/protocols.md`
- **Integration Patterns**: `/one/knowledge/specifications.md`
- **A2A Protocol**: `/one/connections/A2A.md`
- **MCP Protocol**: `/one/connections/MCP.md`
- **ActivityPub 2**: `/one/connections/AP2.md`

### External Integrations
- **ElizaOS**: `/one/connections/ElizaOS.md`
- **CopilotKit**: `/one/things/copilotkit.md`
- **N8N**: `/one/connections/N8N.md`

### Community
- GitHub: https://github.com/one-ie/stack
- Documentation: https://one.ie/docs
- Discord: https://discord.gg/one

---

## License

Maximum freedom. Zero restrictions.

- ✅ Unlimited commercial use
- ✅ Modify and distribute
- ✅ Sell and resell
- ✅ White-label deployment
- ✅ Keep 100% revenue
- ✅ No royalty fees
- ✅ Perpetual license

**One requirement:** Display "Powered by ONE" in your footer.

---

## Roadmap

### Current (v1.0.0)
- ✅ 6-dimension ontology
- ✅ 5-table implementation
- ✅ 66 thing types
- ✅ 25 connection types
- ✅ 67 event types
- ✅ Plain English DSL
- ✅ Multi-tenant organizations
- ✅ Protocol-agnostic architecture

### Next (v1.1.0)
- 🔄 Enhanced vector search
- 🔄 Real-time collaboration
- 🔄 Advanced permissions
- 🔄 Audit dashboard
- 🔄 Performance analytics

### Future (v2.0.0)
- 📋 Distributed sharding
- 📋 Multi-region deployment
- 📋 Advanced AI reasoning
- 📋 Blockchain integration
- 📋 Knowledge marketplace

---

## Conclusion

The ONE Ontology is more than a database schema—it's a **generative architecture** for AI-native systems.

**It answers the fundamental questions every intelligent system must answer:**

- **Organizations**: What is the scope?
- **People**: Who is authorized?
- **Things**: What exists?
- **Connections**: How do they relate?
- **Events**: What happened?
- **Knowledge**: What does it mean?

**This isn't theory. This is production-ready architecture** that scales from solo creator to global enterprise without schema changes.

**Download free. Deploy now. Own forever.**

---

*Built with clarity, simplicity, and infinite scale in mind.*

**Powered by ONE** • https://one.ie

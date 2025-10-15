# ONE

      ██████╗ ███╗   ██╗███████╗
      ██╔═══██╗████╗  ██║██╔════╝
      ██║   ██║██╔██╗ ██║█████╗
      ██║   ██║██║╚██╗██║██╔══╝
      ╚██████╔╝██║ ╚████║███████╗
       ╚═════╝ ╚═╝  ╚═══╝╚══════╝

      Bring your ideas to life

     https://one.ie  •  npx oneie

## Architecture Overview

ONE separates concerns while enabling exponential growth:

```
/Users/toc/Server/ONE/
├── .claude/         # Shared Claude Code commands, hooks, and agents
│   ├── commands/    # Slash commands: /push-ontology, /push-frontend, etc.
│   └── hooks/       # Shared git hooks and automations
├── one/             # Universal Schema - Ontology documentation (git: one-ie/one-ontology)
│   ├── people/      # Individuals, teams, organizations
│   ├── things/      # Products, tools, assets, agents, plans
│   ├── connections/ # Relationships, workflows, integrations
│   ├── events/      # Milestones, triggers, achievements
│   └── knowledge/   # Documentation, architecture, guides
├── frontend/        # Edge Distribution (git: one-ie/frontend)
├── backend/         # API Layer (git: one-ie/backend)
├── apps/            # Application repos
│   ├── bullfm/      # (git: bull-fm/bullfm)
│   ├── stack/       # (git: one-ie/stack)
│   └── ...
└── ONE.md           # This file - Architecture documentation
```

### Installation

```bash
# Install CLI globally
npm install -g oneie

# Or use directly with npx
npx oneie init              # Creates .claude/ and one/ structure
npx oneie clone frontend    # Clones one-ie/frontend into ./frontend
npx oneie clone backend     # Clones one-ie/backend into ./backend
```

### Repository Structure

- **Root workspace**: NOT a git repo - just a workspace directory
- **Independent repos**: Each subdirectory (`one/`, `frontend/`, `backend/`) is its own git repo
- **Shared tooling**: `.claude/` contains commands and hooks used across all repos
- **No submodules**: Simple, elegant - just clone repos where needed

## Repository Map

### Core Systems

| Path        | Repository            | Visibility | Purpose                                              | URLs               |
| ----------- | --------------------- | ---------- | ---------------------------------------------------- | ------------------ |
| `.claude/`  | Shared tooling        | Private    | Claude Code commands, hooks, agents (not a git repo) | -                  |
| `one/`      | `one-ie/one-ontology` | Private    | Canonical ontology and knowledge graph               | -                  |
| `frontend/` | `one-ie/frontend`     | Public     | Primary marketing/knowledge experience               | https://one.ie     |
| `backend/`  | `one-ie/backend`      | Private    | Knowledge API (Convex + Hono)                        | https://api.one.ie |

### Applications

| Path                 | Repository            | Visibility | Purpose                            | URLs                        |
| -------------------- | --------------------- | ---------- | ---------------------------------- | --------------------------- |
| `apps/bullfm/`       | `bull-fm/bullfm`      | Private    | Bull FM product (fork of frontend) | https://bull.fm             |
| `apps/stack/`        | `one-ie/stack`        | Private    | Full-stack starter template        | https://stack.one.ie        |
| `apps/astro-shadcn/` | `one-ie/astro-shadcn` | Public     | Astro + shadcn showcase            | https://astro-shadcn.one.ie |
| `apps/astro-email/`  | `one-ie/astro-email`  | Public     | Email toolkit                      | https://astro-email.one.ie  |

### Access Model

- **Private**: Ontology (`one/`), backend (`backend/`), Bull FM, Stack starter
- **Public**: Frontend (`frontend/`), Astro Shadcn, Astro Email
- **Shared Tooling**: `.claude/` directory contains commands and hooks used across all repos

### Git Workflow

Each repo has its own git remote and can be pushed independently:

```bash
# Push ontology changes
cd one && git push

# Push frontend changes
cd frontend && git push

# Push backend changes
cd backend && git push

# Or use Claude Code commands
/push-ontology     # Pushes one/ to one-ie/one-ontology
/push-frontend     # Pushes frontend/ to one-ie/frontend
/push-backend      # Pushes backend/ to one-ie/backend
```

### Why Not Submodules?

- **Simplicity**: No submodule complexity, just regular git repos
- **Independence**: Each repo can evolve independently
- **Flexibility**: Easy to add/remove repos without affecting others
- **Tooling**: Claude Code commands provide unified workflow
- **Clarity**: Clear separation of concerns, no nested git issues

---

## 1. /one - Universal Schema

**The core ontology that connects everything**

### Structure

```
one/
├── people/       # Individuals, teams, organizations, relationships
├── things/       # Products, tools, assets, resources, technologies
├── connections/  # Relationships, links, associations between entities
├── events/       # Milestones, triggers, moments, achievements
└── knowledge/    # Documentation, guides, insights, wisdom
```

### Philosophy

- **Everything is a node**: People, things, events, knowledge
- **Everything can connect**: Connections create meaning and value
- **Everything evolves**: Events track change and progress over time
- **Everything compounds**: Knowledge builds on knowledge exponentially

### Data Model

Every entity in `/one` follows this structure:

```yaml
entity:
  id: unique_identifier
  type: person | thing | connection | event | knowledge
  metadata:
    created: timestamp
    updated: timestamp
    tags: []
    relationships: []
  content: markdown_body
  schema_version: "1.0.0"
```

---

## 2. /frontend - Edge Distribution

**Free ontology framework running at the edge for maximum accessibility**

### Purpose

- **Public Knowledge Sharing**: Give away the ontology and methodology for free
- **Edge Computing**: Fast, globally distributed via Cloudflare/Vercel edge
- **Interactive Experience**: Visualize CASCADE, explore connections, learn methodology
- **Open Source**: The framework is the gift; your data stays private

### Tech Stack

- **Astro 5**: Static site generation with islands architecture
- **Shadcn UI**: Beautiful, accessible component library
- **Edge Runtime**: Deploy to Cloudflare Workers or Vercel Edge
- **Bun**: Package manager and runtime for development workflows
- **Client Integration**: Optionally connects to backend API for authenticated users

### What's Free

1. Vision CASCADE methodology and ontology
2. Test-driven development framework
3. Interactive CASCADE visualizer
4. Public documentation and guides
5. Template structures and schemas
6. Open source agent definitions

### What's Private

- Your personal knowledge base (served via backend API)
- Your agents and prompts (112+ from ONE-Import)
- Your proprietary data and insights
- Your company foundation and strategies

---

## 3. /backend - API Layer

**Private knowledge API powered by Hono + Convex**

### Purpose

- **Data Storage**: Convex database for all entities from `/one`
- **API Layer**: Hono HTTP framework for custom routes and logic
- **Authentication**: Secure access to private knowledge
- **Real-time Sync**: Convex real-time subscriptions
- **Edge Compatible**: Can run on Cloudflare Workers

### Tech Stack

- **Convex**: Real-time database with built-in auth and queries
- **Hono**: Ultra-fast, lightweight HTTP framework for edge
- **Bun**: Unified runtime for scripts and tooling
- **TypeScript**: Full type safety across frontend/backend
- **Edge Deployment**: Runs on Cloudflare Workers alongside frontend

### Schema (Convex)

```typescript
// backend/convex/schema.ts

// CORE ENTITIES - Map to /one structure
people: {
  id: string
  name: string
  role: string
  bio: markdown
  connections: string[] // IDs of related entities
  metadata: object
}

things: {
  id: string
  name: string
  type: string // tool, product, asset, technology
  description: markdown
  connections: string[]
  metadata: object
}

connections: {
  id: string
  from_entity: string // ID of source entity
  to_entity: string // ID of target entity
  relationship_type: string // "uses", "knows", "created", "influences"
  strength: number // 1-10
  metadata: object
}

events: {
  id: string
  type: string // milestone, trigger, achievement
  entity_id: string // Related entity
  timestamp: date
  description: markdown
  impact: object
  metadata: object
}

knowledge: {
  id: string
  title: string
  category: string // guide, insight, playbook, story, mission
  content: markdown
  tags: string[]
  related_entities: string[]
  metadata: object
}

// IMPORTED KNOWLEDGE - From ONE-Import
agents: {
  id: string
  name: string
  purpose: string
  capabilities: string[]
  category: string // marketing, engineering, content, etc.
  content: markdown
  quality_gate: string
}

prompts: {
  id: string
  name: string
  category: string // business, content, marketing
  content: markdown
  tags: string[]
  use_cases: string[]
}

ontology: {
  version: string
  cascade_levels: object // idea→vision→missions→stories→events→tasks
  test_framework: object
  metrics: object
}
```

### API Routes (Hono)

```typescript
// GET /api/people/:id - Get person by ID
// GET /api/things - List all things
// GET /api/connections?from=:id - Get entity connections
// GET /api/events?entity=:id - Get entity timeline
// GET /api/knowledge/search?q=:query - Search knowledge base

// GET /api/agents - List all agents
// GET /api/agents/:category - Filter by category
// GET /api/prompts/:id - Get prompt by ID
// GET /api/ontology - Get CASCADE ontology structure
```

---

## Data Flow

### 1. Knowledge Import (ONE-Import → ONE)

```
ONE-Import (15GB, 826 files)
  ├── /one → /Users/toc/Server/ONE/one (Universal Schema)
  ├── /.claude/agents → backend/convex/agents table
  ├── /one/prompts → backend/convex/prompts table
  ├── /one/ontology.md → backend/convex/ontology table
  └── /apps → Reference knowledge, examples
```

### 2. Frontend Access (Public Edge)

```
User Request → Frontend (Edge)
  ├── Static Pages: Ontology, docs, guides (cached at edge)
  ├── Interactive Tools: CASCADE visualizer (client-side)
  └── Dynamic Data: Fetch from backend API (authenticated)
```

### 3. Backend API (Private Data)

```
API Request → Hono Router → Convex Database
  ├── Authentication: Verify user token
  ├── Query: Fetch data from Convex
  ├── Transform: Format response
  └── Return: JSON to frontend or external client
```

---

## Vision CASCADE Integration

The ONE system implements the **Test-Driven Vision CASCADE** methodology:

### 6 Levels of Transformation

```yaml
1. IDEA: Raw possibility → Feasibility tests
2. VISION: Future state → Alignment validation
3. MISSIONS: Strategic campaigns → Success criteria
4. STORIES: Engineering narratives → Acceptance testing
5. EVENTS: Milestones & triggers → Completion validation
6. TASKS: Concrete actions → Quality gates
```

### How It Maps to ONE

- **IDEAS**: Captured in `one/knowledge` as possibilities
- **VISIONS**: Defined in `one/knowledge` with alignment tests
- **MISSIONS**: Tracked in `one/events` as campaigns
- **STORIES**: Documented in `one/knowledge` as narratives
- **EVENTS**: Recorded in `one/events` as milestones
- **TASKS**: Linked in `one/connections` to `one/people` (agents)

### Agent ONE Orchestration

- **Master Orchestrator**: Coordinates 112+ specialized agents
- **Test-First**: Every level validated before progression
- **Exponential Growth**: 100x multiplication per CASCADE level
- **Quality Gates**: 4.0+ stars required at each level

---

## Import Strategy

### Phase 1: Core Structure ✅

- [x] Create trinity directories (one, frontend, backend)
- [x] Move astro-shadcn/one → /one
- [x] Move astro-shadcn → /frontend
- [x] Copy convex → /backend

### Phase 2: Knowledge Import (Next)

```bash
# Import 112+ agents from ONE-Import
one-import agents /Users/toc/Server/ONE-Import/.claude/agents

# Import 30+ prompts
one-import prompts /Users/toc/Server/ONE-Import/one/prompts

# Import ontology framework
one-import ontology /Users/toc/Server/ONE-Import/one/ontology.md

# Import playbooks and guides
one-import knowledge /Users/toc/Server/ONE-Import/one/playbooks
one-import knowledge /Users/toc/Server/ONE-Import/one/guides

# Import company/personal foundation
one-import foundation /Users/toc/Server/ONE-Import/one/company
one-import foundation /Users/toc/Server/ONE-Import/one/me
```

### Phase 3: Backend Development

```bash
# Extend Convex schema for imported data
# Build Hono API routes
# Set up authentication and authorization
# Deploy to Cloudflare Workers
```

### Phase 4: Frontend Enhancement

```bash
# Build CASCADE visualizer
# Create knowledge search interface
# Add agent directory browser
# Deploy to Cloudflare Pages
```

---

## Deployment

### Frontend (Edge)

```bash
cd frontend
bun install
bun run build
wrangler pages deploy dist
```

### Backend (Convex + Hono)

```bash
cd backend
bunx convex deploy
# Hono routes auto-deploy with Convex HTTP functions
```

---

## Philosophy

### Give Away the Framework, Keep the Knowledge Private

- **Open Source**: The ontology, methodology, and CASCADE system
- **Free Edge Distribution**: Fast, global access to the framework
- **Private Backend**: Your knowledge, agents, and data stay yours
- **Value Exchange**: Free framework builds trust and community
- **Monetization**: Premium access to your knowledge API, consulting, custom agents

### Edge-First Architecture

- **Speed**: Sub-50ms response times globally
- **Scale**: Unlimited concurrent users at edge
- **Cost**: Near-zero hosting costs with Cloudflare
- **Resilience**: Distributed across 200+ data centers
- **Privacy**: Backend API separate from public framework

### Test-Driven Everything

- **Ideas validated** before becoming visions
- **Visions tested** against alignment criteria
- **Missions verified** against success metrics
- **Stories validated** with acceptance tests
- **Events checked** for completion criteria
- **Tasks gated** by deliverable quality

---

## Next Steps

1. **Complete Knowledge Import**: Migrate 826 files from ONE-Import
2. **Enhance Backend Schema**: Add tables for all entity types
3. **Build API Routes**: CRUD operations for all entities
4. **Create Frontend UI**: Search, browse, visualize CASCADE
5. **Deploy to Edge**: Cloudflare Pages + Workers
6. **Add Authentication**: Secure private knowledge access
7. **Build Agent System**: 112+ agents accessible via API
8. **Enable Real-time Sync**: Convex subscriptions for live updates

---

## Source Data

**Import Source**: `/Users/toc/Server/ONE-Import`

- 15GB total (826 knowledge files)
- 112+ specialized AI agents
- 30+ business/content prompts
- 20+ example applications
- 30 years of accumulated wisdom

**Current Home**: `/Users/toc/Server/ONE`

- Trinity architecture implemented
- Universal schema in `/one`
- Edge frontend ready
- Backend foundation established

---

**ONE System**: Where your 30 years of knowledge becomes exponentially accessible, validated through test-driven CASCADE, and distributed at the edge for maximum impact.

_Test-first. Validate continuously. Grow exponentially._

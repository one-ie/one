<div align="center">

```
     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

   https://one.ie  •  npx oneie
```

**Version:** 2.0.0 | **Bootstrap AI-first projects in 30 seconds**

</div>

---

## ✨ Get Started

```bash
npx oneie init
```

That's it. Your complete ontology-driven platform is ready.

---

## Core Concept

The ONE CLI creates **living, ontology-driven codebases** with installation folder architecture for multi-tenancy:

```
npx oneie init
    ↓
Global Ontology + Installation Folder + Web App + Backend → Ready!
```

**Result:** A complete system where:

- `/one/` - Global ontology templates (6-dimension architecture)
- `/<installation-name>/` - Your private customizations (overrides `/one/`)
- `/web/` - Astro 5 + React 19 frontend
- `/backend/` - Convex backend with 6-dimension schema
- AI agents understand the ontology and can generate features
- Groups support hierarchical documentation

---

## Installation Folder Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  1. GLOBAL ONTOLOGY (Template)                               │
│                                                               │
│  /one/ - Global ontology documentation:                      │
│    ├── groups/         # Multi-tenancy & hierarchies         │
│    ├── people/         # Authorization & roles               │
│    ├── things/         # 66+ entity types                    │
│    ├── connections/    # 25+ relationship types              │
│    ├── events/         # 67+ event types                     │
│    └── knowledge/      # RAG, embeddings, search             │
│                                                               │
│  This is the SOURCE OF TRUTH - never edited directly         │
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│  2. INSTALLATION FOLDER (Your Customizations)                │
│                                                               │
│  /<installation-name>/ - Private docs that override /one/:   │
│    ├── README.md       # Installation overview              │
│    ├── groups/         # Hierarchical group docs            │
│    │   ├── engineering/                                      │
│    │   │   ├── frontend/    # Nested subgroup               │
│    │   │   │   └── practices.md                             │
│    │   │   └── backend/                                      │
│    │   │       └── api-patterns.md                           │
│    │   └── marketing/                                        │
│    │       └── campaign-playbook.md                          │
│    ├── people/         # People profiles                     │
│    ├── things/         # Custom entity definitions           │
│    ├── connections/    # Custom relationships                │
│    ├── events/         # Custom events                       │
│    └── knowledge/      # Custom knowledge/RAG                │
│                                                               │
│  File Resolution: installation → global fallback            │
│  Hierarchical: frontend → engineering → installation → global│
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│  3. WEB APP (Astro 5 + React 19)                            │
│                                                               │
│  /web/                                                        │
│    ├── src/                                                   │
│    │   ├── pages/*.astro       # SSR pages                  │
│    │   ├── components/ui/*     # shadcn/ui (50+)            │
│    │   ├── components/features/* # Feature components        │
│    │   ├── services/           # Effect.ts client services   │
│    │   ├── styles/global.css   # Tailwind v4                │
│    │   └── layouts/Layout.astro # Base layout               │
│    ├── public/                 # Static assets               │
│    └── astro.config.mjs        # Configuration               │
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│  4. BACKEND (Convex + Effect.ts)                            │
│                                                               │
│  /backend/                                                    │
│    └── convex/                                                │
│        ├── schema.ts           # 6-dimension schema         │
│        ├── services/           # Effect.ts business logic    │
│        ├── mutations/          # Convex mutations            │
│        ├── queries/            # Convex queries              │
│        ├── actions/            # Convex actions              │
│        └── providers/          # External integrations       │
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│  5. AI INTEGRATION                                           │
│                                                               │
│  • CLAUDE.md (Claude Code instructions)                      │
│  • AGENTS.md (Convex patterns)                               │
│  • .claude/hooks/ (pre/post hooks)                           │
│  • .mcp.json (MCP server config)                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Usage

### Bootstrap New Installation

```bash
npx oneie init
```

**Interactive prompts:**

```
✨ Welcome to ONE!

ONE is organized by groups which have their own people, things,
connections, events, and knowledge. Groups can have subgroups.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 Downloading ONE Framework...

✓ Copied 100+ ontology files from /one/
✓ Synced 12 agent definitions to .claude/agents/
✓ Copied Claude Code hooks and commands

ONE Setup Complete! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Account Setup

What's your name? Anthony O'Connell
What's your email? anthony@one.ie

✓ Created your profile in one/people/anthony-o-connell.md

Account Setup Complete! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 Organization Setup

What's your organization name? Acme Corp
Installation identifier: acme
Domain: acme.com

Creating your installation folder...
✓ /acme/groups/
✓ /acme/people/
✓ /acme/things/
✓ /acme/connections/
✓ /acme/events/
✓ /acme/knowledge/

✓ Created installation README
✓ Updated .env.local with INSTALLATION_NAME=acme

Organization Setup Complete! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Next: Create Your First Group

Visit your web app to create groups in the database:
  cd web && bun run dev

Then run this to generate group documentation:
  npx oneie create-group-docs

You're all set! 🚀
```

**Generated structure:**

```
my-project/
├── one/                  # ⭐ Global ontology (source of truth)
│   ├── groups/           # Multi-tenancy & hierarchies
│   ├── people/           # Authorization & roles
│   ├── things/           # Entity definitions
│   ├── connections/      # Relationship definitions
│   ├── events/           # Event specifications
│   └── knowledge/        # RAG, AI, embeddings
│
├── acme/                 # ⭐ Installation folder (private)
│   ├── README.md         # Installation overview
│   ├── groups/           # Hierarchical group docs
│   ├── people/           # People profiles
│   ├── things/           # Custom entities
│   ├── connections/      # Custom relationships
│   ├── events/           # Custom events
│   └── knowledge/        # Custom knowledge
│
├── web/                  # ⭐ Web application
│   ├── src/
│   │   ├── pages/        # Astro pages
│   │   ├── components/   # React components
│   │   ├── services/     # Effect.ts services
│   │   └── styles/       # CSS/Tailwind
│   └── astro.config.mjs
│
├── backend/              # ⭐ Convex backend
│   └── convex/
│       ├── schema.ts     # 6-dimension schema
│       ├── services/     # Effect.ts services
│       ├── queries/      # Convex queries
│       ├── mutations/    # Convex mutations
│       └── providers/    # External services
│
├── .claude/              # Claude Code config
├── .env.local            # Environment (INSTALLATION_NAME=acme)
├── CLAUDE.md             # AI agent instructions
├── AGENTS.md             # Convex patterns
└── package.json
```

**Key Features:**

- **Installation Folder:** `/<installation-name>/` for private customizations
- **Hierarchical Groups:** Nested folders mirror database structure
- **File Resolution:** Installation → Global fallback
- **Multi-Tenancy:** One installation serves many database groups
- **AI-Ready:** Complete documentation for offline AI

---

## Hierarchical Group Documentation

### Create Groups in Database First

```bash
# 1. Start web app
cd web && bun run dev

# 2. Visit /groups/new in browser
# 3. Create groups: "engineering", "engineering/frontend", "engineering/backend"
```

### Generate Group Documentation

```bash
npx oneie create-group-docs
```

**Interactive:**

```
Fetching groups from database...
Found 5 groups.

Select groups to create documentation for:
❯ ◉ Acme Corp (acme) → top-level
  ◉ Engineering (engineering) → subgroup
  ◉ Frontend Team (frontend) → subgroup of engineering
  ◉ Backend Team (backend) → subgroup of engineering
  ◉ Marketing (marketing) → subgroup

✓ Created /acme/groups/acme/README.md
✓ Created /acme/groups/engineering/README.md
✓ Created /acme/groups/engineering/frontend/README.md
✓ Created /acme/groups/engineering/backend/README.md
✓ Created /acme/groups/marketing/README.md

Group documentation created!
Add custom markdown files to these folders to override global templates.
```

### Add Custom Documentation

```bash
# Frontend-specific practices
mkdir -p /acme/groups/engineering/frontend
echo "# Frontend Practices" > /acme/groups/engineering/frontend/practices.md

# Engineering-wide patterns
echo "# Engineering Patterns" > /acme/groups/engineering/patterns.md
```

### File Resolution Example

When AI or web app loads `practices.md` for the frontend group:

1. `/acme/groups/engineering/frontend/practices.md` ✅ (most specific - found!)
2. `/acme/groups/engineering/practices.md` (parent group)
3. `/acme/practices.md` (installation-wide)
4. `/one/practices.md` (global fallback)

---

## Feature Generation

### Create Feature from Plain English

```bash
# Write feature spec
cat > features/token-purchase.english << 'EOF'
FEATURE: Let fans buy creator tokens

INPUT:
  - fan: who is buying
  - token: which token
  - amount: how many

OUTPUT:
  - payment ID: Stripe transaction
  - tx hash: blockchain confirmation

FLOW:

CHECK fan exists
CHECK token exists
CHECK amount is greater than 0

DO TOGETHER:
  - CALL Stripe to charge payment
  - CALL Blockchain to mint tokens

RECORD tokens_purchased
  BY fan
  WITH amount and payment ID

GIVE payment ID and tx hash
EOF

# Generate code
npx oneie generate features/token-purchase.english
```

**Generated files:**

```
backend/convex/services/token-purchase.ts    # Effect.ts service
backend/convex/mutations/tokens.ts           # Convex wrapper
web/src/components/features/TokenPurchase.tsx # React component
tests/unit/services/token-purchase.test.ts    # Tests
```

---

## Command Reference

### `npx oneie init`

Initialize new ONE installation with installation folder architecture.

```bash
npx oneie init
```

**Prompts for:**
- User name and email
- Organization name and domain
- Installation identifier

**Creates:**
- `/one/` - Global ontology
- `/<installation-name>/` - Installation folder
- `/web/` - Web application
- `/backend/` - Convex backend
- `.claude/` - AI configuration
- `.env.local` - Environment variables

---

### `npx oneie create-group-docs`

Generate markdown documentation for database groups.

```bash
npx oneie create-group-docs
```

**Features:**
- Fetches groups from Convex database
- Creates hierarchical folder structure
- Generates README with file resolution info
- Supports nested subgroups

---

### `npx oneie generate <feature>`

Generate feature from DSL.

```bash
npx oneie generate features/token-purchase.english --dry-run
```

**Options:**
- `--validate-only` - Only validate
- `--dry-run` - Show what would be generated
- `--output <dir>` - Custom output directory

---

### `npx oneie ontology sync`

Sync global ontology from upstream.

```bash
npx oneie ontology sync
```

**Preserves installation folder customizations.**

---

## Installation Folder Benefits

### 1. Multi-Tenancy

One installation serves many database groups:

```
Database:
- groups table with groupId and parentGroupId
- "acme" (parent)
  - "engineering" (child)
    - "frontend" (grandchild)

Filesystem:
- /acme/ (installation folder)
  - /groups/engineering/frontend/ (mirrors hierarchy)
```

### 2. Private Documentation

Keep internal docs separate from open-source templates:

```bash
# Global template (public)
/one/things/architecture.md

# Your private override
/acme/things/architecture.md
```

### 3. Hierarchical Resolution

Documentation inherits from parent groups:

```
Frontend team loads "sprint-guide.md":
1. /acme/groups/engineering/frontend/sprint-guide.md ✅
2. /acme/groups/engineering/sprint-guide.md (parent)
3. /acme/sprint-guide.md (installation)
4. /one/sprint-guide.md (global)
```

### 4. Git Strategy

```gitignore
# Track global templates
/one/

# Exclude private installations (or use separate repo)
/acme/
/customer-*/

# Always exclude
.env.local
```

---

## Generated Backend Schema (6-Dimension)

```typescript
// backend/convex/schema.ts
export default defineSchema({
  // DIMENSION 1: GROUPS (multi-tenancy, hierarchical)
  groups: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
    parentGroupId: v.optional(v.id("groups")),  // Hierarchical nesting
    properties: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["properties.slug"]),

  // DIMENSION 2: PEOPLE (authorization, intent)
  // (Represented as things with type: "creator" and role metadata)

  // DIMENSION 3: THINGS (all entities)
  things: defineTable({
    groupId: v.id("groups"),  // Scoped to group
    type: v.string(),  // 66+ types
    name: v.string(),
    properties: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_group", ["groupId"]),

  // DIMENSION 4: CONNECTIONS (all relationships)
  connections: defineTable({
    groupId: v.id("groups"),
    fromThingId: v.id("things"),
    toThingId: v.id("things"),
    relationshipType: v.string(),  // 25+ types
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("from_type", ["fromThingId", "relationshipType"])
    .index("to_type", ["toThingId", "relationshipType"])
    .index("by_group", ["groupId"]),

  // DIMENSION 5: EVENTS (all behavior)
  events: defineTable({
    groupId: v.id("groups"),
    type: v.string(),  // 67+ types
    actorId: v.optional(v.string()),
    targetId: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_actor", ["actorId"])
    .index("by_group", ["groupId"])
    .index("by_type", ["type"]),

  // DIMENSION 6: KNOWLEDGE (embeddings, search)
  knowledge: defineTable({
    groupId: v.id("groups"),
    text: v.string(),
    embedding: v.array(v.float64()),
    sourceThingId: v.optional(v.id("things")),
    labels: v.optional(v.array(v.string())),
  })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    })
    .index("by_group", ["groupId"]),
});
```

---

## Environment Variables

Generated `.env.local`:

```bash
# Installation
INSTALLATION_NAME=acme
INSTALLATION_ENV=dev

# Convex
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Better Auth
BETTER_AUTH_SECRET=<generate-with-openssl>
BETTER_AUTH_URL=http://localhost:4321

# OAuth (optional)
GITHUB_CLIENT_ID=<your-github-oauth>
GITHUB_CLIENT_SECRET=<your-github-secret>

# External Services (optional)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

---

## Why This Architecture Works

**Traditional approach:**

1. Manual setup (hours)
2. Configure tools (days)
3. Write boilerplate (hours per feature)
4. No multi-tenancy support
5. No hierarchical documentation

**ONE CLI approach:**

1. `npx oneie init` (5 minutes) ✅
2. Installation folder for customizations ✅
3. Hierarchical groups with documentation ✅
4. AI-ready with complete ontology ✅
5. Multi-tenant from day one ✅

**Key Innovations:**

1. **Installation Folder Architecture**
   - Global templates in `/one/`
   - Private customizations in `/<installation-name>/`
   - Hierarchical file resolution
   - Supports nested groups

2. **Database + Filesystem Sync**
   - Groups in database (runtime isolation)
   - Documentation in filesystem (AI context)
   - Hierarchical structure mirrored in both

3. **Multi-Tenancy Built-In**
   - One installation serves many groups
   - Each group has private docs folder
   - File resolution walks up hierarchy

**Result:** 100x faster, organized, multi-tenant, AI-ready, fully scalable.

---

## Roadmap

### Phase 1: Core Bootstrap (v2.0.0 - Q1 2025)

- ✅ `npx oneie init` - Installation folder setup
- ✅ Global ontology sync
- ✅ Installation folder creation
- ✅ Web app generation (Astro + React)
- ✅ Backend generation (Convex + Effect.ts)
- ✅ Hierarchical group documentation
- ✅ File resolution logic
- ✅ MCP server setup

### Phase 2: Feature Generation (Q2 2025)

- ⏳ `npx oneie generate` - DSL compilation
- ⏳ Plain English parser
- ⏳ Ontology validator
- ⏳ Multi-file generation

### Phase 3: Advanced Multi-Tenancy (Q2 2025)

- ⏳ Multi-installation support (dev/staging/prod)
- ⏳ Group documentation templates
- ⏳ Cloud sync (KV/R2 for runtime updates)

### Phase 4: Enterprise (Q3 2025)

- 📋 `npx oneie deploy` - One-command deployment
- 📋 `npx oneie upgrade` - Update ontology
- 📋 `npx oneie migrate` - Schema migrations

---

## Success Metrics

**For Developers:**

- ⏱️ 5 minutes → Project bootstrap
- 🎯 100% type-safe → Generated code
- ✅ Multi-tenant → Group isolation
- 📖 AI-ready → Complete ontology

**For Organizations:**

- 🏢 Installation folder → Private docs
- 📁 Hierarchical groups → Nested documentation
- 🔄 File resolution → Smart overrides
- 🚀 Scalable → Friend circles to governments

---

## Related Documentation

### Installation Folder Architecture

- **[Installation Folder Multi-Tenancy Plan](../plans/group-folder-multi-tenancy.md)** - Complete architecture
- **[Feature 2: CLI](../features/2-cli.md)** - Detailed implementation guide

### 6-Dimension Ontology

- **[Ontology.md](../../knowledge/ontology.md)** - 6-dimension data model
- **[Groups](../../groups/groups.md)** - Group types and hierarchies
- **[People](../../people/people.md)** - Roles and authorization
- **[Things](../../things/things.md)** - 66+ entity types
- **[Connections](../../connections/connections.md)** - 25+ relationship types
- **[Events](../../events/events.md)** - 67+ event types
- **[Knowledge](../../knowledge/knowledge.md)** - RAG and embeddings

### Development Guides

- **[Rules.md](../../knowledge/rules.md)** - Golden rules for AI agents
- **[Patterns.md](../../knowledge/patterns.md)** - Proven code patterns
- **[Workflow.md](../../connections/workflow.md)** - Development flow
- **[CLAUDE.md](../../../CLAUDE.md)** - Claude Code instructions

---

## Summary

The ONE CLI v2.0.0 introduces **installation folder architecture** for enterprise-grade multi-tenancy:

```
/one/                 → Global templates (source of truth)
/<installation-name>/ → Private customizations (overrides global)
  └── groups/         → Hierarchical documentation (mirrors database)
/web/                 → Astro 5 + React 19 frontend
/backend/             → Convex backend (6-dimension schema)
```

**Why It Matters:**

- **Multi-Tenant:** One installation serves many database groups
- **Hierarchical:** Groups can have subgroups with inherited documentation
- **Private:** Installation folder for internal docs
- **AI-Ready:** Complete ontology for offline AI operation
- **Scalable:** From friend circles (2 people) to governments (billions)

**Core Principle:** The CLI makes it **easier for AI agents to build features** than humans. When that's true, we've succeeded.

---

**Built with simplicity, clarity, and infinite scale in mind.**

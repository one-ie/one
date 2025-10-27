# ONE

```
     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real
          https://one.ie
               type
             npx oneie
             /claude
               /one
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`/now` `/next` `/todo` `/done` `/build` `/design` `/deploy` `/see`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Build apps, websites and AI agents in English and deploy at the edge. Free!**

## 📦 Quick Start

```bash
# Option 1: Bootstrap new project
npx oneie

# Option 2: Clone and develop
git clone https://github.com/one-ie/one
cd ONE
bun install
bun dev
```

**Development Commands:**

```bash
# Claude Code
claude # Start Claude
/one        # Run /one Claude command
```

```bash
# Frontend
cd web/
bun run dev        # localhost:4321
bun run build      # Production build
bunx astro check   # Type checking

# Testing
cd web/
bun test           # All tests
```

## Installation Folders (NEW)

Customize your ONE installation with organization-specific documentation and configuration.

### Initialize

```bash
npx oneie init
# Follow prompts to create your installation folder
```

### Structure

```
/acme/                        # Your installation folder
├── groups/                   # Group-specific docs (hierarchical)
│   ├── engineering/
│   │   ├── frontend/
│   │   └── backend/
│   └── marketing/
├── people/                   # Role documentation
├── things/                   # Entity specifications
├── connections/              # Workflows
├── events/                   # Deployment history
└── knowledge/                # AI training data
```

### Override Templates

Files in your installation folder override global `/one/` templates:

```bash
# Override vision document
echo "# Our Vision" > /acme/things/vision.md

# Add group-specific practices
echo "# Engineering Practices" > /acme/groups/engineering/practices.md
```

### File Resolution

The system automatically resolves files with this priority:

1. Group-specific (e.g., `/acme/groups/engineering/frontend/sprint-guide.md`)
2. Parent groups (walk up hierarchy)
3. Installation root (e.g., `/acme/things/vision.md`)
4. Global fallback (e.g., `/one/things/vision.md`)

### Learn More

- Complete guide: `/one/knowledge/installation-folders.md`
- 6-Dimension Ontology: `/one/knowledge/ontology.md`

## ✨ ONE

**Build apps, websites, and AI agents in English.** Download to your computer, run in the cloud and deploy to the edge or your own server. ONE is open source and free forever.

ONE maps everything to **6 universal dimensions**:

1. **Groups** – Who owns what (multi-tenant isolation + hierarchical nesting)
2. **People** – Who can do what (authorization & governance)
3. **Things** – What exists (66 entity types)
4. **Connections** – How they relate (25 relationship types)
5. **Events** – What happened (67 event types, complete audit trail)
6. **Knowledge** – What it means (embeddings, vectors, RAG)

**Everything else is just data.**

---

## 🚀 Why?

Traditional platforms create custom tables for every feature:

- Users table, Products table, Orders table, Messages table...
- 50+ tables, 200+ columns, endless complexity
- Schema changes break everything
- AI agents can't understand your database

**ONE's approach:**

Map every feature to the 6 dimensions → Scale infinitely without schema changes

**Examples:**

- Lemonade stand? ✅ Works
- Enterprise SaaS? ✅ Works
- Social network? ✅ Works
- E-commerce? ✅ Works
- AI agent platform? ✅ Works

Same 6 dimensions. Different properties.

---

## 🎯 Simple Enough for Children

```typescript
// Emma's Lemonade Stand

// 1. Create your group
const myStand = await createGroup({
  name: "Emma's Lemonade Stand",
  slug: "emmas-lemonade",
  type: "business",
});

// 2. You are the owner (a person)
const me = await createPerson({
  name: "Emma",
  role: "org_owner",
  groupId: myStand._id,
});

// 3. Create lemonade (a thing)
const lemonade = await createThing({
  type: "product",
  name: "Fresh Lemonade",
  groupId: myStand._id,
  properties: {
    price: 1.0,
    inventory: 20,
  },
});

// 4. Customer buys it (a connection)
await createConnection({
  from: customer._id,
  to: lemonade._id,
  type: "purchased",
  groupId: myStand._id,
});

// 5. Log the sale (an event)
await createEvent({
  type: "tokens_purchased",
  actor: customer._id,
  target: lemonade._id,
  groupId: myStand._id,
  metadata: { amount: 1.0, weather: "sunny" },
});

// 6. AI learns (knowledge)
// "Sunny days = more sales. Make 30 cups tomorrow!"
```

**That's it.** 6 dimensions model reality completely.

---

## 🏢 Powerful Enough for Enterprises

```typescript
// Acme Corporation - Enterprise SaaS with Hierarchical Groups

// Top-level organization group
const acmeCorp = await createGroup({
  name: "Acme Corporation",
  slug: "acme-corp",
  type: "organization",
  plan: "enterprise",
  limits: {
    users: 100,
    storage: 1000, // GB
    apiCalls: 1000000,
  },
});

// Department groups (nested)
const engineering = await createGroup({
  name: "Engineering",
  slug: "engineering",
  type: "department",
  parentGroupId: acmeCorp._id,
});

const backend = await createGroup({
  name: "Backend Team",
  slug: "backend",
  type: "team",
  parentGroupId: engineering._id,
});

// Role-based access control
const ceo = await createPerson({
  name: "Jane CEO",
  role: "org_owner",
  groupId: acmeCorp._id,
});

// AI sales agent (a thing)
const salesAgent = await createThing({
  type: "sales_agent",
  name: "Acme Sales AI",
  groupId: acmeCorp._id,
  properties: {
    systemPrompt: "You are a friendly sales assistant...",
    temperature: 0.7,
  },
});

// Lead management (things + connections)
const lead = await createThing({
  type: "lead",
  name: "John Smith - Enterprise Lead",
  groupId: acmeCorp._id,
  properties: {
    email: "john@enterprise.com",
    budget: 100000,
    status: "qualified",
  },
});

// AI agent follows up (connection + event)
await createConnection({
  from: salesAgent._id,
  to: lead._id,
  type: "communicated",
  groupId: acmeCorp._id,
  metadata: {
    protocol: "email",
    subject: "Following up on our conversation",
  },
});

await createEvent({
  type: "communication_event",
  actor: salesAgent._id,
  target: lead._id,
  groupId: acmeCorp._id,
  metadata: {
    protocol: "email",
    sentiment: "positive",
  },
});

// AI learns from all sales interactions (knowledge)
const context = await queryKnowledge({
  groupId: acmeCorp._id,
  query: "enterprise software objections pricing",
  k: 10,
});

const aiResponse = await generateResponse({
  context,
  prompt: "Address pricing concerns",
});
```

**Perfect data isolation. Clear governance. Hierarchical structure. Infinite scale.**

---

## 👥 Social: Friend Circles

```typescript
// Emma's Friend Circle - Social Groups

// Create friend circle
const emmasFriends = await createGroup({
  name: "Emma's Friends",
  slug: "emmas-friends",
  type: "social",
});

// Create event group (nested under friend circle)
const birthdayParty = await createGroup({
  name: "Birthday Party 2025",
  slug: "birthday-party-2025",
  type: "event",
  parentGroupId: emmasFriends._id,
  properties: {
    date: "2025-12-15",
    location: "Emma's House",
    capacity: 20,
  },
});

// Add friends to the circle
const alice = await createPerson({
  name: "Alice",
  role: "org_user",
  groupId: emmasFriends._id,
});

// Share photos (things) in the event group
const photo = await createThing({
  type: "media",
  name: "Birthday Cake Photo",
  groupId: birthdayParty._id,
  properties: {
    url: "https://cdn.example.com/photo.jpg",
    takenAt: Date.now(),
  },
});

// Track RSVPs (connections)
await createConnection({
  from: alice._id,
  to: birthdayParty._id,
  type: "member_of",
  groupId: birthdayParty._id,
  metadata: {
    rsvp: "yes",
    guestsCount: 1,
  },
});
```

**Nested groups enable rich social structures. Friends → Events → Photos → Memories.**

---

## 🪙 DAO: Decentralized Organizations

```typescript
// CoolDAO - Blockchain-Native Organization

// Create DAO group
const coolDAO = await createGroup({
  name: "CoolDAO",
  slug: "cool-dao",
  type: "dao",
  properties: {
    blockchain: "base",
    governanceToken: "COOL",
    treasuryAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  },
});

// Create treasury committee (nested)
const treasury = await createGroup({
  name: "Treasury",
  slug: "treasury",
  type: "committee",
  parentGroupId: coolDAO._id,
});

// Create governance committee (nested)
const governance = await createGroup({
  name: "Governance Committee",
  slug: "governance",
  type: "committee",
  parentGroupId: coolDAO._id,
});

// DAO member with token holdings
const member = await createPerson({
  name: "DAO Member",
  role: "org_user",
  groupId: coolDAO._id,
});

// Track token holdings (thing + connection)
const tokenHolding = await createThing({
  type: "token",
  name: "COOL Token Holding",
  groupId: coolDAO._id,
  properties: {
    symbol: "COOL",
    amount: 1000,
    chain: "base",
  },
});

await createConnection({
  from: member._id,
  to: tokenHolding._id,
  type: "holds_tokens",
  groupId: coolDAO._id,
});

// Governance proposal (thing)
const proposal = await createThing({
  type: "proposal",
  name: "Allocate 10% Treasury to Marketing",
  groupId: governance._id,
  properties: {
    proposer: member._id,
    status: "active",
    votesFor: 5000,
    votesAgainst: 2000,
    quorum: 10000,
  },
});

// Vote event
await createEvent({
  type: "vote_cast",
  actor: member._id,
  target: proposal._id,
  groupId: governance._id,
  metadata: {
    choice: "for",
    votingPower: 1000,
  },
});
```

**Groups model DAOs perfectly: Top-level DAO → Committees → Proposals → Votes.**

---

## 🛠️ Technology Stack

**Frontend:**

- Astro 5.14+ (SSR + SSG)
- React 19 (Islands architecture)
- Tailwind v4 (CSS-based config)
- shadcn/ui (50+ components)
- TypeScript 5.9+ (Strict mode)

**AI Layer:**

- Vercel AI SDK (Multi-provider)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet)
- OpenRouter (100+ models)

**Infrastructure:**

- Cloudflare Pages (Edge SSR)
- Stripe (Payments)
- Multi-chain (Sui, Base, Solana)

## 📚 Documentation

**Core Concepts:**

- [ONE Ontology](/one/knowledge/ontology.md) – Complete specification
- [Architecture](/one/knowledge/architecture.md) – How it all fits together
- [Workflow](/one/connections/workflow.md) – Development process

**Dimensions:**

- [Groups](/one/connections/groups.md) – Multi-tenancy & hierarchies
- [People](/one/connections/people.md) – Authorization & roles
- [Things](/one/connections/things.md) – 66 entity types
- [Connections](/one/connections/connections.md) – 25 relationship types
- [Events](/one/connections/events.md) – 67 event types
- [Knowledge](/one/connections/knowledge.md) – RAG & intelligence

**Implementation:**

- [Frontend Guide](/one/things/frontend.md) – UI patterns
- [Examples](/one/things/implementation-examples.md) – Real-world patterns

---

## 🧪 Testing

**6 Authentication Methods:**

1. ✅ Email & Password
2. ✅ OAuth (GitHub, Google)
3. ✅ Magic Links
4. ✅ Password Reset
5. ✅ Email Verification
6. ✅ 2FA (TOTP + Backup codes)

**50+ Test Cases** covering security, rate limiting, token expiry, and complete auth flows.

```bash
cd frontend
bun test test/auth              # All auth tests
bun test test/auth/email-password.test.ts  # Specific test
bun test --watch test/auth      # Watch mode
```

---

## 🏗️ Project Structure

```
ONE/
├── .claude/           # Claude Code agents, commands, hooks
├── one/               # 6-dimension ontology docs
├── web/               # Astro 5 + React 19 application
├── cli/               # CLI package workspace (npm: oneie)
├── apps/
│   └── one/           # Master assembly (syncs to one-ie/one)
│       ├── one/       # Synced ontology bundle
│       ├── .claude/   # Synced AI configuration
│       ├── web/       # Git subtree of one-ie/web
│       └── docs/      # Optional docs staging
├── scripts/           # Release automation and tooling
├── README.md          # Root documentation (synced downstream)
├── LICENSE.md         # License
├── AGENTS.md          # AI agent defaults
└── CLAUDE.md          # Claude Code guidance
```

---

## 🔒 Security & Compliance

- **Multi-Tenant Isolation** – Groups partition ALL data
- **Hierarchical Access Control** – Nested groups inherit permissions
- **Role-Based Access** – 4 roles (platform_owner, org_owner, org_user, customer)
- **Complete Audit Trail** – Events table logs everything
- **GDPR Compliant** – Delete all group data with single groupId filter
- **Encryption** – Group-scoped encryption keys

---

## 🎯 Philosophy

**Simplicity is the ultimate sophistication.**

You don't need hundreds of tables. You need:

1. **6 dimensions** (groups, people, things, connections, events, knowledge)
2. **66 thing types** (every "thing")
3. **25 connection types** (every relationship)
4. **67 event types** (every action)
5. **Metadata** (for protocol-specific details)

**That's it. Everything else is just data.**

### Why This Works

**Vibe Coders**

- Create new tables for every feature
- Add protocol-specific columns
- Pollute schema with temporary concepts
- End up with 50+ tables, 200+ columns
- Become unmaintainable

**ONE Context Engineering:**

- Map every feature to 6 dimensions
- Groups partition the space (with hierarchical nesting)
- People authorize and govern
- Things, connections, events flow naturally
- Knowledge understands it all
- Scale infinitely without schema changes
- Stay simple, clean, beautiful

### The Result

A database schema that:

- **Scales** from lemonade stands to global enterprises to DAOs
- **Children understand**: "I have a group, I'm the boss (person), I sell lemonade (things)"
- **Enterprises rely on**: Multi-tenant isolation, hierarchical structure, clear governance, infinite scale
- **DAOs build on**: Nested committees, transparent governance, on-chain integration
- **AI agents reason about** completely
- **Never breaks** with schema changes
- **Gets more powerful** as it grows

**This is what happens when you design for clarity first.**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. **Map your feature to the 6 dimensions**
4. Add tests if applicable
5. Submit a pull request

**Golden Rule:** If you can't map your feature to these 6 dimensions, you're thinking about it wrong.

## 📄 License

ONE Free License – see [LICENSE](LICENSE) for details.

<div align="center">

**ONE** – Where reality meets AI.

Built with simplicity, clarity, and infinite scale in mind.

Groups partition (hierarchically). People authorize. Things exist.
Connections relate. Events record. Knowledge understands.

**Everything else is just data.**

[Website](https://one.ie)

</div>

# ONE

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
                 start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/now /next /todo /done /build /design /deploy /see
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build apps, websites and AI agents in English and deploy at the edge. Free! ██████╗ ███╗ ██╗███████╗
██╔═══██╗████╗ ██║██╔════╝
██║ ██║██╔██╗ ██║█████╗
██║ ██║██║╚██╗██║██╔══╝
╚██████╔╝██║ ╚████║███████╗
╚═════╝ ╚═╝ ╚═══╝╚══════╝

         Make Your Ideas Real
            https://one.ie
                 type
               npx oneie
               /claude
                 /one
                 start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/now /next /todo /done /build /design /deploy /see
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build apps, websites and AI agents in English and deploy at the edge. Free!

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
                 start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/now /next /todo /done /build /design /deploy /see
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build apps, websites and AI agents in English and deploy at the edge. Free!

# ONE Ontology

**6 Dimensions = Complete Reality Model:**

1. **Organizations** - Multi-tenant isolation (who owns what at org level)
2. **People** - Authorization & governance (who can do what)
3. **Things** - Entities (what exists)
4. **Connections** - Relationships (how they relate)
5. **Events** - Actions (what happened)
6. **Knowledge** - Intelligence (what it means)

**Why 6 Dimensions?**

Other platforms create tables for features, pollute schemas with temporary concepts, and end up with hundreds of entities nobody understands.

ONE models reality in six dimensions, and maps everything to them.

Simple enough for children. Powerful enough for enterprises.

## For Children

```typescript
// Your lemonade stand = organization
// You = person (owner)
// Lemonade = thing
// Customer buys it = connection
// Sale happens = event
// AI learns = knowledge

// 1. Create your lemonade stand
const myStand = await createOrganization({
  name: "Emma's Lemonade Stand",
  owner: "Emma",
});

// 2. You are the owner!
const me = await createPerson({
  name: "Emma",
  role: "org_owner",
  organizationId: myStand._id,
});

// 3. Create lemonade
const lemonade = await createThing({
  type: "product",
  name: "Fresh Lemonade",
  organizationId: myStand._id,
  properties: {
    price: 1.0, // $1 per cup
    inventory: 20, // 20 cups ready
  },
});

// 4. Customer buys lemonade
const customer = await createPerson({
  name: "Alex",
  role: "customer",
});

await createConnection({
  from: customer._id,
  to: lemonade._id,
  type: "purchased",
  organizationId: myStand._id,
});

// 5. Log the sale
await createEvent({
  type: "tokens_purchased",
  actor: customer._id,
  target: lemonade._id,
  organizationId: myStand._id,
  metadata: {
    amount: 1.0,
    weather: "sunny",
  },
});

// 6. AI learns!
// The AI notices: sunny days = more sales
// Next sunny day, AI suggests: "Make more lemonade today!"
```

**What the AI Learned:**

- Sunny days → more customers
- Sweet lemonade → happier customers (higher ratings)
- After school time (3pm-5pm) → busiest time

**Your AI can now help:**

- "It's going to be sunny tomorrow - prepare 30 cups instead of 20!"
- "Customer reviews say lemonade is too sour - add more sugar"
- "You're running low on lemons - order more before the weekend rush"

This is how the 6 dimensions work together to make your lemonade stand smart!

## For Enterprises

```typescript
// Multi-tenant SaaS = organizations (perfect isolation)
// Users & roles = people (authorization & governance)
// Domain entities = things (customers, products, agents)
// Business relationships = connections (ownership, permissions)
// Audit trail = events (who did what when)
// AI intelligence = knowledge (RAG, vectors, learning)

// 1. Customer signs up
const acmeCorp = await createOrganization({
  name: "Acme Corporation",
  plan: "enterprise",
  limits: {
    users: 100,
    storage: 1000, // GB
    apiCalls: 1000000,
    inference: 500000,
  },
});

// 2. Org owner gets admin access
const ceo = await createPerson({
  name: "Jane CEO",
  email: "jane@acme.com",
  role: "org_owner",
  organizationId: acmeCorp._id,
});

// 3. Create CRM entities
const salesAgent = await createThing({
  type: "sales_agent",
  name: "Acme Sales AI",
  organizationId: acmeCorp._id,
  properties: {
    systemPrompt: "You are a friendly sales assistant...",
    temperature: 0.7,
  },
});

const lead = await createThing({
  type: "lead",
  name: "John Smith - Enterprise Lead",
  organizationId: acmeCorp._id,
  properties: {
    email: "john@enterprise.com",
    company: "Enterprise Inc",
    budget: 100000,
    status: "qualified",
  },
});

// 4. AI agent follows up
await createConnection({
  from: salesAgent._id,
  to: lead._id,
  type: "communicated",
  organizationId: acmeCorp._id,
  metadata: {
    protocol: "email",
    subject: "Following up on our conversation",
  },
});

// 5. Log all interactions
await createEvent({
  type: "communication_event",
  actor: salesAgent._id,
  target: lead._id,
  organizationId: acmeCorp._id,
  metadata: {
    protocol: "email",
    messageType: "follow_up",
    sentiment: "positive",
  },
  timestamp: Date.now(),
});

// 6. AI learns from all sales interactions
const relevantContext = await queryKnowledge({
  organizationId: acmeCorp._id,
  query: "enterprise software objections pricing",
  k: 10, // top 10 results
});

const aiResponse = await generateResponse({
  context: relevantContext,
  prompt: "Craft a response addressing pricing concerns",
});
```

**Multi-Tenancy:**

1. **Data Isolation** - Acme Corp cannot see Enterprise Inc's data
2. **Independent Scaling** - Each org has separate quotas and limits
3. **Customization** - Each org can customize their AI agents
4. **Platform Revenue** - Clear revenue attribution via events

## Documentation

**Start Here:**

- [6-Dimension Ontology](/one/knowledge/ontology.md) - Complete specification
- [Architecture](/one/knowledge/architecture.md) - How everything fits together
- [Frontend Guide](/one/things/frontend.md) - Building user interfaces
- [Backend Guide](/one/things/hono.md) - API and business logic

**Core Dimensions:**

- [Organizations](/one/connections/organisation.md) - Multi-tenant architecture
- [People](/one/connections/people.md) - Authorization & roles
- [Things](/one/connections/things.md) - 66 entity types
- [Connections](/one/connections/connections.md) - 25 relationship types
- [Events](/one/connections/events.md) - 67 event types
- [Knowledge](/one/connections/knowledge.md) - RAG & intelligence

**Learn by Example:**

- [Implementation Examples](/one/things/implementation-examples.md) - Real-world patterns
- [Workflow Guide](/one/connections/workflow.md) - Development workflow
- [API Documentation](/one/connections/api.md) - Complete API reference

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/one-platform/one
cd ONE

# 2. Install dependencies (using pnpm)
pnpm install

# 3. Set up environment
cp .env.example .env
# Add your Convex URL and other keys

# 4. Run development server
pnpm dev

# 5. Build your first app!
# See examples in one/things/implementation-examples.md
```

## Technology Stack

**Frontend Layer:**

- **Astro 5.10+**: Lightning-fast static site generation with SSR
- **React 18**: Interactive components and islands architecture
- **TypeScript**: Full type safety throughout
- **Shadcn/UI**: Beautiful, accessible UI components
- **Tailwind CSS 4.1**: Utility-first styling

**Backend Layer:**

- **Hono**: REST API routes (Cloudflare Workers compatible)
- **Convex**: Real-time database with typed functions
- **Better Auth**: Authentication with Convex adapter
- **Effect.ts**: Functional error handling and dependency injection

**AI Layer:**

- **Vercel AI SDK**: Multi-provider AI integration
- **OpenAI**: GPT-4, GPT-3.5, and other models
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **OpenRouter**: Access to 100+ models

**Infrastructure:**

- **Cloudflare**: Edge computing and livestreaming
- **Stripe**: Payment processing (fiat only)
- **Multi-Chain**: Sui, Base, Solana (blockchain providers)

## The Philosophy

**Simplicity is the ultimate sophistication.**

This ontology proves that you don't need hundreds of tables or complex schemas to build a complete AI-native platform. You need:

1. **6 dimensions** (organizations, people, things, connections, events, knowledge)
2. **66 thing types** (every "thing")
3. **25 connection types** (every relationship)
4. **67 event types** (every action)
5. **Metadata** (for protocol identity via metadata.protocol)

That's it. Everything else is just data.

### Why This Works

**Other systems:**

- Create new tables for every feature
- Add protocol-specific columns
- Pollute schema with temporary concepts
- End up with 50+ tables, 200+ columns
- Become unmaintainable nightmares

**ONE's approach:**

- Map every feature to 6 dimensions
- Organizations partition the space
- People authorize and govern
- Things, connections, events flow from there
- Knowledge understands it all
- Scale infinitely without schema changes
- Stay simple, clean, beautiful

### The Result

A database schema that:

- Scales from lemonade stands to global enterprises
- Children can understand: "I own (org), I'm the boss (person), I sell lemonade (things)"
- Enterprises can rely on: Multi-tenant isolation, clear governance, infinite scale
- AI agents can reason about completely
- Never needs breaking changes
- Grows more powerful as it grows larger

**This is what happens when you design for clarity first.**

## Project Structure

```
ONE/
├── apps/
│   ├── oneie/              # Main Astro application
│   ├── stack/              # Stack Auth integration
│   └── eliza/              # Eliza AI agent
├── one/                    # Core documentation
│   ├── connections/        # Ontology & relationships
│   ├── things/             # Architecture & patterns
│   ├── events/             # Event specifications
│   └── knowledge/          # RAG & intelligence
├── frontend/               # React components & UI
├── convex/                 # Convex database functions
└── README.md              # This file
```

## Applications

### ONE IE (apps/oneie)

Modern Astro-based AI-powered web application with:

- AI chat interfaces with multiple providers
- Professional book generation (EPUB/PDF)
- Comprehensive content management
- Real-time streaming responses

See [apps/oneie/README.md](/apps/oneie/README.md) for details.

## Development

### Prerequisites

- Node.js 20 or higher
- pnpm package manager (`npm install -g pnpm`)
- Pandoc (for book generation): `brew install pandoc` (macOS)

### Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run auth tests (frontend)
cd frontend && bun test test/auth

# Type checking
pnpm astro check

# Generate EPUB book
pnpm generate:epub
```

## Testing

### Authentication System Tests

Comprehensive test suite for the auth system at `/frontend/test/auth/`:

**6 Authentication Methods Tested:**

1. ✅ Email & Password (signup, signin, validation)
2. ✅ OAuth (GitHub, Google, account linking)
3. ✅ Magic Links (passwordless, one-time use)
4. ✅ Password Reset (secure recovery, token expiry)
5. ✅ Email Verification (24-hour expiry)
6. ✅ 2FA (TOTP, backup codes, enable/disable)

**Run Auth Tests:**

```bash
cd frontend

# Run all auth tests
bun test test/auth

# Run specific test
bun test test/auth/email-password.test.ts

# Watch mode
bun test --watch test/auth
```

**Backend Connection:**

- Frontend: `http://localhost:4321`
- Backend: `https://shocking-falcon-870.convex.cloud`
- Tests verify frontend → backend auth flows

**Test Coverage:**

- 50+ test cases across 7 files
- Security features (rate limiting, token expiry, session management)
- OAuth provider integration
- Email delivery (via Resend)
- Complete auth flow validation

See `/frontend/test/auth/README.md` for detailed documentation.

## Security & Compliance

- **Multi-Tenant Isolation**: Organizations partition ALL data
- **Role-Based Access Control**: Platform owner, org owners, org users, customers
- **Audit Trail**: Events table provides complete history
- **GDPR Compliance**: Delete all org data with single organizationId filter
- **Encryption**: Org-scoped encryption keys for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Map your feature to the 6 dimensions
4. Add tests if applicable
5. Submit a pull request

**Golden Rule:** If you can't map your feature to these 6 dimensions, you're thinking about it wrong.

## License

MIT License - see LICENSE file for details.

---

**ONE Platform** - Where reality meets AI.

Built with simplicity, clarity, and infinite scale in mind.

Organizations partition. People authorize. Things exist. Connections relate. Events record. Knowledge understands.

**Everything else is just data.**

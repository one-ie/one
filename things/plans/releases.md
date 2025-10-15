# ONE Platform - Open Source Release Timeline

**Goal:** Release incrementally, build community, establish ONE as the universal frontend-backend interface.

---

## Release Strategy

**Philosophy:**

1. **Release the interface first** - Let community build providers
2. **Working code only** - No vaporware, every release is usable
3. **Documentation-first** - Specs before implementations
4. **Progressive disclosure** - Simple → Complex over time
5. **Community-driven** - Accept provider contributions early

**Repository Structure:**

```
@oneie/
├── core              # DataProvider interface, types, errors
├── providers         # Provider implementations
│   ├── convex
│   ├── supabase
│   ├── wordpress
│   └── ...
├── sdk               # Effect.ts services, React hooks
├── cli               # CLI tools for scaffolding
└── examples          # Example apps
```

---

## Phase 1: Foundation (Week 1-2) 🚀 IMMEDIATE

**Release Date:** ASAP (can release today)

**What:** The universal interface + TypeScript types

**Packages:**

### 1. `@oneie/core` v0.1.0

**Contents:**

- `DataProvider.ts` - Universal interface for all backends
- `types.ts` - Thing, Connection, Event, Knowledge types
- `errors.ts` - Standard error types (ThingNotFoundError, etc.)
- `ontology.ts` - 66 thing types, 25 connection types, 67 event types

**Why release this first:**

- ✅ Zero dependencies (just TypeScript)
- ✅ Community can start building providers immediately
- ✅ Establishes ONE as the standard interface
- ✅ No backend coupling - pure specification

**Files to extract:**

```
frontend/src/providers/DataProvider.ts
→ packages/core/src/DataProvider.ts

one/knowledge/ontology.md (types section)
→ packages/core/src/ontology.ts

frontend/src/types/*
→ packages/core/src/types/
```

**README.md:**

```markdown
# @oneie/core

Universal data interface for connecting frontends to ANY backend.

## Install

npm install @oneie/core

## What is this?

ONE's 6-dimension ontology as a TypeScript interface. Implement
`DataProvider` for your backend, and any ONE frontend works with it.

## Supported Backends

- Convex, Supabase, Neon, PlanetScale, MongoDB, PostgreSQL
- WordPress, Strapi, Contentful, Sanity, Ghost
- Notion, Airtable, Google Sheets, Shopify, Salesforce
- Your own custom API

## Example

See `@oneie/providers` for implementations.
```

**Checklist:**

- [ ] Extract DataProvider interface
- [ ] Extract type definitions
- [ ] Extract error types
- [ ] Write README with examples
- [ ] Add LICENSE (MIT)
- [ ] Publish to npm
- [ ] Tweet/announce release

**Impact:** 🔥 HIGH - Establishes ONE as universal standard

---

### 2. `@oneie/docs` v0.1.0

**Contents:**

- Complete API documentation
- Provider implementation guide
- Migration guides
- Architecture diagrams

**Files to release:**

```
one/knowledge/ontology.md
one/knowledge/ontology-frontend.md
one/connections/any-backend.md
one/things/plans/separate.md
```

**Host on:** GitHub Pages or Cloudflare Pages

**URL:** `https://docs.one.ie` or `https://one-platform.github.io/docs`

**Checklist:**

- [ ] Convert markdown to documentation site (Astro Starlight)
- [ ] Add search functionality
- [ ] Add API reference (auto-generated from types)
- [ ] Deploy to hosting
- [ ] Add link from main repo

**Impact:** 🔥 HIGH - Developers can start building immediately

---

## Phase 2: Working Implementation (Week 3-4) 🏗️

**Release Date:** 2 weeks after Phase 1

**What:** First working provider + services

**Packages:**

### 3. `@oneie/provider-convex` v0.1.0

**Contents:**

- ConvexProvider implementation
- Wraps existing Convex backend
- Full DataProvider interface compliance
- Real-time subscriptions support

**Why Convex first:**

- ✅ You already have this working
- ✅ Demonstrates real-time capabilities
- ✅ Reference implementation for community

**Files to extract:**

```
frontend/src/providers/convex/ConvexProvider.ts
→ packages/provider-convex/src/ConvexProvider.ts
```

**README.md:**

```markdown
# @oneie/provider-convex

Convex backend provider for ONE platform.

## Features

- ✅ Real-time subscriptions
- ✅ 6-dimension ontology
- ✅ Multi-tenancy
- ✅ Type-safe queries

## Install

npm install @oneie/provider-convex convex

## Usage

import { convexProvider } from '@oneie/provider-convex'

export const ClientLayer = convexProvider({
url: process.env.PUBLIC_CONVEX_URL
})
```

**Checklist:**

- [ ] Extract ConvexProvider
- [ ] Add comprehensive tests
- [ ] Write installation guide
- [ ] Add example app
- [ ] Publish to npm

**Impact:** 🔥 CRITICAL - First working proof

---

### 4. `@oneie/sdk` v0.1.0

**Contents:**

- Effect.ts service layer (ThingService, ConnectionService, etc.)
- React hooks (useEffectRunner, useThing, useThings)
- ClientLayer composition

**Files to extract:**

```
frontend/src/services/*
→ packages/sdk/src/services/

frontend/src/hooks/useEffectRunner.ts
→ packages/sdk/src/hooks/
```

**Why this matters:**

- ✅ Frontend developers get ready-to-use services
- ✅ Abstracts backend complexity
- ✅ Type-safe Effect.ts patterns

**Checklist:**

- [ ] Extract services
- [ ] Extract React hooks
- [ ] Add tests
- [ ] Write usage guide
- [ ] Publish to npm

**Impact:** 🔥 HIGH - Developers can build apps immediately

---

### 5. `@oneie/example-todo-app`

**Contents:**

- Simple todo app using ONE
- Demonstrates CRUD operations
- Shows auth integration
- Uses ConvexProvider

**Why important:**

- ✅ Working code developers can clone
- ✅ Shows best practices
- ✅ Easy to understand

**Stack:**

- Astro + React
- @oneie/sdk
- @oneie/provider-convex
- Better Auth

**Checklist:**

- [ ] Build todo app
- [ ] Add authentication
- [ ] Deploy live demo
- [ ] Write step-by-step tutorial
- [ ] Add to examples/ directory

**Demo URL:** `https://todo.one.ie`

**Impact:** 🔥 HIGH - Shows it works end-to-end

---

## Phase 3: Ecosystem Growth (Month 2) 🌱

**Release Date:** 1 month after Phase 2

**What:** Community-focused releases

**Packages:**

### 6. `@oneie/provider-supabase` v0.1.0

**Contents:**

- Supabase provider implementation
- PostgreSQL + real-time subscriptions
- RLS (Row Level Security) support
- pgvector for knowledge search

**Why Supabase:**

- ✅ Popular open source alternative
- ✅ Shows ONE works with SQL databases
- ✅ Different architecture than Convex

**Reference:** Use Supabase example from `any-backend.md`

**Checklist:**

- [ ] Implement SupabaseProvider
- [ ] Add tests
- [ ] Create migration guide (Convex → Supabase)
- [ ] Publish to npm
- [ ] Blog post: "Using ONE with Supabase"

**Impact:** 🔥 MEDIUM - Proves backend flexibility

---

### 7. `@oneie/provider-wordpress` v0.1.0

**Contents:**

- WordPress REST API provider
- Maps WP posts → ONE things
- WooCommerce support (products)
- Read-only by default (safe for existing sites)

**Why WordPress:**

- ✅ 40% of web runs on WordPress
- ✅ Shows ONE works with existing systems
- ✅ No migration needed - use existing content

**Checklist:**

- [ ] Implement WordPressProvider
- [ ] Add WooCommerce support
- [ ] Add tests
- [ ] Create guide: "Keep WordPress, add ONE frontend"
- [ ] Publish to npm

**Impact:** 🔥 VERY HIGH - Huge addressable market

---

### 8. `@oneie/create-app` (CLI)

**Contents:**

- CLI tool for scaffolding ONE apps
- Choose provider (Convex, Supabase, WordPress, etc.)
- Generates Astro + React + ONE boilerplate
- Includes auth setup

**Commands:**

```bash
# Create new ONE app
npm create @oneie/app

# Prompts:
# ? Project name: my-app
# ? Provider: Convex / Supabase / WordPress / Custom
# ? Auth: Email / Google / GitHub / None
# ? Template: Todo / Blog / E-commerce / Blank
```

**Generates:**

```
my-app/
├── src/
│   ├── providers/
│   │   └── [chosen-provider]/
│   ├── services/
│   ├── components/
│   └── pages/
├── .env.example
├── astro.config.ts
└── package.json
```

**Checklist:**

- [ ] Build CLI with prompts
- [ ] Add templates (todo, blog, e-commerce)
- [ ] Add provider selection
- [ ] Add auth configuration
- [ ] Publish to npm

**Impact:** 🔥 CRITICAL - Lowers barrier to entry

---

### 9. `@oneie/test-utils`

**Contents:**

- MockProvider for testing
- Test fixtures (sample things, connections)
- Provider compliance test suite
- Testing helpers for Effect.ts

**Why important:**

- ✅ Community can test their providers
- ✅ Ensures provider quality
- ✅ Makes testing easier

**Example:**

```typescript
import { MockProvider, testProvider } from "@oneie/test-utils";

// Test your custom provider
testProvider(new MyCustomProvider(), {
  things: true, // Test thing operations
  connections: true, // Test connection operations
  events: true, // Test event logging
  knowledge: true, // Test vector search
});
```

**Checklist:**

- [ ] Build MockProvider
- [ ] Create test fixtures
- [ ] Create compliance test suite
- [ ] Add testing guide
- [ ] Publish to npm

**Impact:** 🔥 MEDIUM - Quality assurance for ecosystem

---

## Phase 4: Enterprise & Advanced (Month 3+) 🚀

**Release Date:** 2-3 months after Phase 1

**What:** Advanced features, enterprise support

**Packages:**

### 10. `@oneie/baas-sdk` (ONE Backend SDK)

**Contents:**

- SDK for using ONE Backend (BaaS)
- API key management
- OneBackendProvider implementation
- Rate limiting, quotas, billing

**Why important:**

- ✅ Monetization path
- ✅ Zero-config backend option
- ✅ Competes with Firebase/Supabase

**Setup:**

```typescript
import { oneBackendProvider } from "@oneie/baas-sdk";

export const ClientLayer = oneBackendProvider({
  apiKey: process.env.PUBLIC_ONE_API_KEY,
  organizationId: process.env.PUBLIC_ONE_ORG_ID,
});
```

**Checklist:**

- [ ] Implement OneBackendProvider
- [ ] Build API key management
- [ ] Add billing integration
- [ ] Create dashboard UI
- [ ] Launch one.ie signup

**Impact:** 🔥 CRITICAL - Revenue stream

---

### 11. `@oneie/provider-notion`

**Contents:**

- Notion as backend provider
- Maps Notion databases → ONE things
- Bi-directional sync
- Shows ONE works with SaaS tools

**Why Notion:**

- ✅ Popular for small teams
- ✅ No-code database option
- ✅ Unique use case

**Impact:** 🔥 MEDIUM - Expands use cases

---

### 12. `@oneie/mobile-sdk` (React Native)

**Contents:**

- React Native hooks for ONE
- Offline-first support
- Mobile-optimized providers
- Example mobile app

**Why important:**

- ✅ Mobile is critical
- ✅ Proves ONE works everywhere
- ✅ Expands addressable market

**Impact:** 🔥 HIGH - Platform expansion

---

### 13. `@oneie/desktop-sdk` (Tauri/Electron)

**Contents:**

- Desktop app integration
- Local-first sync
- Desktop-optimized providers
- Example desktop app

**Reference:** See `one/things/plans/desktop.md`

**Impact:** 🔥 MEDIUM - Completes platform story

---

## Phase 5: Ecosystem Maturity (Month 6+) 🌟

**What:** Community contributions, marketplace, premium features

**Releases:**

### 14. Provider Marketplace

**Contents:**

- Website listing all providers
- Community-contributed providers
- Provider ratings/reviews
- Installation guides

**URL:** `https://providers.one.ie`

**Features:**

- Browse providers by category (Database, CMS, SaaS, etc.)
- Search providers
- See provider stats (downloads, stars, issues)
- One-click add to project

**Impact:** 🔥 HIGH - Community growth

---

### 15. Additional Providers (Community-Driven)

**Potential providers:**

- `@oneie/provider-firebase`
- `@oneie/provider-airtable`
- `@oneie/provider-shopify`
- `@oneie/provider-salesforce`
- `@oneie/provider-strapi`
- `@oneie/provider-contentful`
- `@oneie/provider-sanity`
- `@oneie/provider-prisma`
- `@oneie/provider-hasura`

**Strategy:**

- Accept community PRs
- Provide provider template
- Offer compliance testing
- Feature in marketplace

**Impact:** 🔥 VERY HIGH - Network effects

---

### 16. Premium Features

**Potential paid add-ons:**

- `@oneie/analytics` - Built-in analytics
- `@oneie/ai` - AI assistant integration
- `@oneie/sync` - Multi-provider sync
- `@oneie/enterprise` - Enterprise support, SLAs

**Impact:** 🔥 HIGH - Sustainability

---

## Release Calendar

### Week 1-2 (IMMEDIATE)

- ✅ **Phase 1:** Release `@oneie/core` + docs
- 📢 Announcement: "ONE Platform - Universal Frontend-Backend Interface"

### Week 3-4

- ✅ **Phase 2:** Release working implementation
  - `@oneie/provider-convex`
  - `@oneie/sdk`
  - Example todo app

### Month 2

- ✅ **Phase 3:** Ecosystem growth
  - `@oneie/provider-supabase`
  - `@oneie/provider-wordpress`
  - `@oneie/create-app` (CLI)
  - `@oneie/test-utils`

### Month 3

- ✅ **Phase 4:** Enterprise & advanced
  - `@oneie/baas-sdk` (ONE Backend launch)
  - `@oneie/provider-notion`
  - `@oneie/mobile-sdk`

### Month 6+

- ✅ **Phase 5:** Ecosystem maturity
  - Provider marketplace
  - Community providers
  - Premium features

---

## Success Metrics

**Phase 1 (Foundation):**

- [ ] 1,000 npm downloads
- [ ] 100 GitHub stars
- [ ] 10 community discussions

**Phase 2 (Working Implementation):**

- [ ] 5,000 npm downloads
- [ ] 500 GitHub stars
- [ ] 3 live apps using ONE

**Phase 3 (Ecosystem Growth):**

- [ ] 20,000 npm downloads
- [ ] 2,000 GitHub stars
- [ ] 5 community-contributed providers
- [ ] 50 live apps

**Phase 4 (Enterprise):**

- [ ] 100,000 npm downloads
- [ ] 5,000 GitHub stars
- [ ] 10 paying ONE Backend customers
- [ ] 200 live apps

**Phase 5 (Maturity):**

- [ ] 500,000 npm downloads
- [ ] 10,000 GitHub stars
- [ ] 50+ providers in marketplace
- [ ] 1,000+ live apps
- [ ] Sustainable revenue from BaaS

---

## Recommended Immediate Actions (Next 48 Hours)

### Day 1: Extract & Package

**Morning:**

1. Create GitHub org: `@oneie`
2. Create monorepo structure (pnpm workspaces)
3. Extract `@oneie/core` package
4. Write README, LICENSE, CONTRIBUTING.md

**Afternoon:** 5. Extract type definitions 6. Add tests 7. Build package 8. Test locally

### Day 2: Publish & Announce

**Morning:**

1. Publish `@oneie/core` to npm
2. Create docs site (Astro Starlight)
3. Deploy docs to Cloudflare Pages

**Afternoon:** 4. Write announcement blog post 5. Tweet announcement 6. Post to Reddit r/webdev, r/javascript 7. Post to Hacker News 8. Email interested developers

---

## Community Building

**Platforms:**

- **GitHub:** Main repository, discussions, issues
- **Discord:** Real-time chat, support
- **Twitter/X:** Announcements, updates
- **YouTube:** Video tutorials, demos
- **Dev.to/Medium:** Blog posts, guides

**Content Strategy:**

- Weekly blog posts (implementation guides, use cases)
- Monthly YouTube videos (provider tutorials)
- Daily Twitter updates (progress, wins)
- Weekly Discord office hours

---

## Long-Term Vision

**Year 1:**

- 50+ providers
- 1,000+ apps using ONE
- Sustainable BaaS business
- Active open source community

**Year 2:**

- ONE as industry standard for frontend-backend interface
- Provider marketplace revenue share
- Enterprise customers
- Conference talks, workshops

**Year 3:**

- ONE Foundation (governance)
- Global community
- Multi-platform (web, mobile, desktop, IoT)
- Ubiquitous adoption

---

## Key Principles

1. **Release early, release often** - Don't wait for perfection
2. **Community first** - Accept contributions from day 1
3. **Documentation is king** - Great docs = adoption
4. **Show, don't tell** - Working examples > promises
5. **Backend agnostic** - Never favor one backend over others
6. **Open source core** - Keep core MIT licensed forever

---

## Getting Started (For You, Right Now)

**Step 1: Create GitHub Organization**

```bash
# Go to github.com
# Create new organization: @oneie
# Settings: Public, Open Source
```

**Step 2: Create Monorepo**

```bash
mkdir one-platform
cd one-platform
pnpm init
mkdir -p packages/{core,provider-convex,sdk,docs}
```

**Step 3: Extract Core Package**

```bash
cd packages/core
# Copy DataProvider interface from frontend/src/providers/
# Add package.json, README.md, tsconfig.json
pnpm build
```

**Step 4: Publish**

```bash
npm login
cd packages/core
npm publish --access public
```

**Step 5: Announce**

```bash
# Tweet: "Just released @oneie/core - Universal interface for
# connecting frontends to ANY backend. Works with Convex, Supabase,
# WordPress, Notion, and more. https://github.com/one-platform/core"
```

---

**Ready to release? Start with Phase 1 - you can publish the core interface TODAY.**

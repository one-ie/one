# ONE Platform Onboarding Workflow

**Version:** 1.0.0
**Purpose:** Complete user journey from `npx oneie init` to deployed website
**Paradigm:** Inference-based execution (not time-based)

---

## The Complete Journey

```
1. Init (1 min)
   ↓
2. Profile Setup (2 min)
   ↓
3. AI Website Analysis (30 sec)
   ↓
4. Custom Ontology Generation (30 sec)
   ↓
5. Feature Selection (2 min)
   ↓
6. Inference Plan Generation (10 sec)
   ↓
7. Landing Page Deploy (Infer 1-10, ~5 min)
   ↓
8. Full Site Build (Infer 11-100, ~30-60 min)
   ↓
9. Live Production Site ✨
```

**Total Time:** ~45-75 minutes from zero to production

---

## Phase 1: Init & Profile Setup

### Step 1: `npx oneie init`

```bash
$ npx oneie init

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Welcome! Let's build your platform.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? What's your name? › Tom O'Connor
? Organization name? › ONE Platform
? What's your current website? › https://one.ie
? What email should we use? › tom@one.ie

✨ Perfect! Starting Claude Code to analyze your website...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Launching Claude Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ claude

Claude Code initialized. Running command:
$ /one analyze https://one.ie --org "ONE Platform" --email tom@one.ie
```

**Creates:**
- `.env.local` with user details
- Installation folder: `/one-platform/`
- Initial group structure

### Step 2: Website Analysis (Claude Code + agent-onboard)

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 CLAUDE CODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running: /one analyze https://one.ie

agent-onboard is analyzing your website...

[WebFetch] Fetching https://one.ie
[WebFetch] Analyzing HTML, CSS, and content
[WebFetch] Extracting brand identity

✅ Detected:
   • Primary color: #FF6B6B (Coral)
   • Secondary color: #4ECDC4 (Teal)
   • Logo: /logo.svg
   • Brand voice: Technical, friendly, empowering
   • Target audience: Developers, creators, entrepreneurs
   • Existing platform: Yes (Astro + Convex)

✅ Extracted features:
   • Multi-tenant architecture
   • AI agent integration
   • Creator economy tools
   • Real-time collaboration
   • 6-dimension ontology

✅ Generated custom ontology:
   • Groups: Organizations, teams
   • People: Developers, creators
   • Things: Projects, content, code
   • Connections: Collaborations, integrations
   • Events: Deployments, commits, releases
   • Knowledge: Documentation, patterns

[Write] Creating /one-platform/knowledge/ontology.md
[Write] Creating /one-platform/knowledge/brand-guide.md
[Write] Creating .env.local

📁 Installation folder created: /one-platform/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**How it works:**
1. CLI runs `claude` to start Claude Code
2. CLI sends `/one analyze <url>` slash command
3. Claude Code invokes **agent-onboard**
4. agent-onboard uses WebFetch, Write, Edit tools
5. Results saved to installation folder
6. Control returns to CLI for feature selection

### Step 3: Custom Ontology Confirmation

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YOUR CUSTOM ONTOLOGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on https://one.ie, I've created a custom ontology:

GROUPS (Who organizes):
  • organizations, teams, projects

PEOPLE (Who acts):
  • platform_owner, org_owner, developer, creator

THINGS (What exists):
  • projects, websites, agents, content, features
  • deployments, repositories, integrations

CONNECTIONS (How they relate):
  • owns, collaborates_on, deployed_to, integrated_with

EVENTS (What happens):
  • project_created, feature_deployed, agent_executed
  • content_published, integration_connected

KNOWLEDGE (What's learned):
  • documentation, patterns, best_practices, lessons

? Does this match your vision? (y/n) › y
```

---

## Phase 2: Feature Selection

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ AVAILABLE FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on your ontology, here are recommended features:

FOUNDATION (Recommended)
  [x] Landing page (Infer 1-10, ~5 min)
  [x] Authentication (Infer 11-20, ~10 min)
  [x] Multi-tenant groups (Infer 21-30, ~10 min)

CREATOR FEATURES
  [ ] Content publishing (Infer 31-40, ~15 min)
  [ ] Membership tiers (Infer 41-50, ~15 min)
  [ ] Revenue tracking (Infer 51-60, ~10 min)

DEVELOPER FEATURES
  [ ] Project management (Infer 31-40, ~15 min)
  [ ] Code repositories (Infer 41-50, ~15 min)
  [ ] Deployment pipeline (Infer 51-60, ~20 min)

AI FEATURES
  [ ] AI agents (Infer 61-70, ~20 min)
  [ ] RAG knowledge base (Infer 71-80, ~15 min)
  [ ] Semantic search (Infer 81-90, ~10 min)

? Select features to build: › (Space to select)
```

### Feature Selection Output

```bash
✅ Selected Features:
   1. Landing page (Infer 1-10)
   2. Authentication (Infer 11-20)
   3. Multi-tenant groups (Infer 21-30)
   4. Project management (Infer 31-40)
   5. AI agents (Infer 61-70)

📊 Total Inferences: 50/100
⏱️  Estimated Time: ~60 minutes
💰 Estimated Cost: $0 (free tier)

? Ready to start? (y/n) › y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STARTING BUILD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Strategy: Landing page first, then iterate

Step 1: Deploy landing page (Infer 1-10)
Step 2: Add authentication (Infer 11-20)
Step 3: Add multi-tenancy (Infer 21-30)
Step 4: Add project management (Infer 31-40)
Step 5: Add AI agents (Infer 61-70)
Step 6: Final deploy & docs (Infer 91-100)
```

---

## Phase 3: Landing Page Deploy (Infer 1-10)

### Inference Sequence

```bash
🤖 Starting Infer 1-10: Landing Page MVP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infer 1/10: Validate ontology and create installation folder
  ✅ Created /one-platform/
  ✅ Created /one-platform/knowledge/ontology.md
  ✅ Validated 6-dimension structure

Infer 2/10: Map landing page to ontology
  ✅ Thing: "landing_page" entity
  ✅ Properties: { hero, features, cta, footer }
  ✅ Scoped to: groupId (ONE Platform)

Infer 3/10: Design landing page wireframe
  ✅ Hero: Logo, tagline, CTA
  ✅ Features: 3-column grid
  ✅ Footer: Links, social
  ✅ Colors: #FF6B6B, #4ECDC4

Infer 4/10: Generate Astro page
  ✅ Created: /web/src/pages/index.astro
  ✅ Using: Brand colors, logo
  ✅ Components: Hero, Features, CTA

Infer 5/10: Add Tailwind styling
  ✅ Theme: Custom colors from website
  ✅ Responsive: Mobile-first
  ✅ Typography: From brand guide

Infer 6/10: Build and test locally
  ✅ Build: Success (0 errors)
  ✅ Lighthouse: 100/100/100/100
  ✅ Test: Responsive design works

Infer 7/10: Deploy to Cloudflare Pages
  ✅ Build: Production ready
  ✅ Deploy: https://one-platform.pages.dev
  ✅ SSL: Enabled
  ✅ Edge: 330+ locations

Infer 8/10: Add custom domain
  ✅ DNS: CNAME configured
  ✅ Domain: https://one-platform.com
  ✅ SSL: Auto-provisioned

Infer 9/10: Test production deployment
  ✅ URL: Live and working
  ✅ Speed: <330ms globally
  ✅ SEO: Meta tags added

Infer 10/10: Document and notify
  ✅ Created: /one-platform/events/deploy-landing.md
  ✅ Screenshot: Saved to knowledge
  ✅ Email: Sent to tom@one.ie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ LANDING PAGE LIVE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 https://one-platform.com
⚡ <330ms average response time
📱 100/100/100/100 Lighthouse scores
🌍 Live on Cloudflare Edge (330+ locations)

Next: Add authentication (Infer 11-20)
Time: ~10 minutes

? Continue to next phase? (y/n) › y
```

---

## Phase 4: Iterative Feature Building

### Infer 11-20: Authentication

```bash
🤖 Starting Infer 11-20: Authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infer 11: Map auth to ontology
  ✅ People: user accounts
  ✅ Events: signin, signup, signout
  ✅ Knowledge: Sessions, tokens

Infer 12-14: Backend schema & mutations
  ✅ Better Auth + Convex adapter
  ✅ Mutations: signup, signin, signout
  ✅ Queries: getSession, getUser

Infer 15-17: Frontend pages
  ✅ /account/signin
  ✅ /account/signup
  ✅ /account/settings

Infer 18-19: Test & deploy
  ✅ Tests: 15/15 passing
  ✅ Deploy: Live at https://one-platform.com/account

Infer 20: Document
  ✅ Updated: /one-platform/events/auth-deployed.md

✨ Authentication LIVE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next: Multi-tenant groups (Infer 21-30)
```

### Infer 21-30: Multi-Tenant Groups

```bash
🤖 Starting Infer 21-30: Multi-Tenant Groups
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infer 21: Map groups to ontology
  ✅ Groups: Hierarchical (parent/child)
  ✅ Types: organization, team, project
  ✅ Data scoping: All entities → groupId

Infer 22-25: Backend implementation
  ✅ Schema: groups table with parentGroupId
  ✅ Mutations: createGroup, updateGroup
  ✅ Queries: listGroups, getGroupHierarchy

Infer 26-28: Frontend dashboard
  ✅ /dashboard/groups
  ✅ /dashboard/groups/[id]
  ✅ Group switcher in nav

Infer 29: Test & deploy
  ✅ Tests: 25/25 passing
  ✅ Deploy: Live

Infer 30: Document
  ✅ Updated: /one-platform/events/groups-deployed.md

✨ Multi-Tenancy LIVE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next: Project management (Infer 31-40)
```

---

## Phase 5: Specialized Agents

### Agent Coordination

Each feature type gets handled by specialized agents:

```typescript
const AGENT_MAPPING = {
  // Backend features
  "authentication": "agent-backend",
  "multi-tenant-groups": "agent-backend",
  "data-schema": "agent-backend",

  // Frontend features
  "landing-page": "agent-frontend",
  "dashboard": "agent-frontend",
  "user-profile": "agent-frontend",

  // Design features
  "wireframes": "agent-designer",
  "component-library": "agent-designer",
  "brand-guide": "agent-designer",

  // Integration features
  "stripe-payments": "agent-integrator",
  "discord-community": "agent-integrator",
  "email-marketing": "agent-integrator",

  // AI features
  "rag-knowledge": "agent-backend", // Convex vector search
  "semantic-search": "agent-backend",
  "ai-agents": "agent-builder",
};
```

---

## Phase 6: Complete Build (Infer 31-100)

### Example: Project Management Feature

```bash
🤖 Starting Infer 31-40: Project Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assigned to: agent-backend, agent-frontend

Infer 31: Map to ontology
  ✅ Things: projects, tasks, milestones
  ✅ Connections: assigned_to, depends_on
  ✅ Events: project_created, task_completed

Infer 32-34: Backend (agent-backend)
  ✅ Schema: things table extensions
  ✅ Mutations: createProject, updateTask
  ✅ Queries: listProjects, getProjectTasks

Infer 35-37: Frontend (agent-frontend)
  ✅ Pages: /projects, /projects/[id]
  ✅ Components: ProjectCard, TaskList
  ✅ Islands: Interactive task board

Infer 38: Tests (agent-quality)
  ✅ Unit: 20/20 passing
  ✅ Integration: 10/10 passing

Infer 39: Deploy (agent-ops)
  ✅ Backend: Convex deployed
  ✅ Frontend: Cloudflare deployed

Infer 40: Document (agent-documenter)
  ✅ Updated: /one-platform/events/projects-deployed.md
  ✅ Knowledge: Usage patterns captured

✨ Project Management LIVE!
```

---

## Key Features of This Workflow

### 1. Immediate Value
- **Landing page in 5 minutes** - User sees progress immediately
- **Live URL from Infer 10** - Something to share right away
- **Iterative deployment** - Each feature goes live as it's built

### 2. AI-Driven Personalization
- **Website analysis** - Extracts colors, brand, features automatically
- **Custom ontology** - Generated from existing website/business
- **Smart feature recommendations** - Based on detected patterns

### 3. Transparent Progress
- **Inference-based** - Clear progress (Infer 23/100)
- **Time estimates** - Per-feature and total
- **Real-time updates** - See what's happening

### 4. Modular & Extensible
- **Pick features** - Only build what you need
- **Add later** - Resume from any inference
- **Custom features** - Extend with your own ontology

### 5. Multi-Agent Coordination
- **agent-onboard** - Website analysis & ontology generation
- **agent-director** - Feature planning & agent coordination
- **agent-backend** - Convex schema, mutations, queries
- **agent-frontend** - Astro pages, React components
- **agent-designer** - Wireframes, brand system
- **agent-quality** - Testing & validation
- **agent-ops** - Deployment & monitoring
- **agent-documenter** - Knowledge capture

---

## Implementation Steps

### 1. Create agent-onboard

```typescript
// .claude/agents/agent-onboard.md
# Agent: Onboard

**Purpose:** Analyze existing website and generate custom ontology

**Responsibilities:**
1. Fetch and analyze website URL
2. Extract brand colors, logo, fonts
3. Detect existing features and tools
4. Identify target audience and tone
5. Generate custom 6-dimension ontology
6. Create installation folder structure
7. Populate initial documentation

**Tools:** WebFetch, Read, Write, Edit

**Output:**
- `/[installation-name]/knowledge/ontology.md`
- `/[installation-name]/groups/[group-name]/`
- `.env.local` with configuration
```

### 2. Update agent-director

```typescript
// Add to agent-director responsibilities:
- Coordinate with agent-onboard for initial setup
- Map user feature selections to inference ranges
- Generate 100-inference plan based on selections
- Assign features to appropriate specialists
- Track progress and notify user
```

### 3. Create CLI commands

```bash
# cli/bin/oneie.js
#!/usr/bin/env node

import { Command } from 'commander';
import { init, build, deploy } from '../src/commands/index.js';

const program = new Command();

program
  .name('oneie')
  .description('ONE Platform CLI - Make Your Ideas Real')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize new ONE platform')
  .action(init);

program
  .command('build')
  .description('Build features using 100-inference plan')
  .option('-f, --features <features...>', 'Features to build')
  .action(build);

program
  .command('deploy')
  .description('Deploy to production')
  .action(deploy);

program.parse();
```

### 4. Feature Library

```typescript
// cli/src/features/library.ts
export const FEATURES = {
  "landing-page": {
    name: "Landing Page",
    description: "Beautiful landing page with hero, features, CTA",
    inferences: [1, 10],
    duration: "~5 min",
    cost: "$0",
    requires: [],
    specialist: "agent-frontend",
  },
  "authentication": {
    name: "Authentication",
    description: "Email/password + OAuth (6 methods)",
    inferences: [11, 20],
    duration: "~10 min",
    cost: "$0",
    requires: ["landing-page"],
    specialist: "agent-backend",
  },
  "multi-tenant": {
    name: "Multi-Tenant Groups",
    description: "Hierarchical groups with data scoping",
    inferences: [21, 30],
    duration: "~10 min",
    cost: "$0",
    requires: ["authentication"],
    specialist: "agent-backend",
  },
  // ... more features
};
```

---

## Success Metrics

- [ ] `npx oneie init` creates installation folder
- [ ] agent-onboard extracts brand from website
- [ ] Custom ontology generated automatically
- [ ] Feature selection UI shows inferences + time
- [ ] Landing page deploys in <10 minutes
- [ ] Each feature goes live incrementally
- [ ] User receives email after each phase
- [ ] Full site built via 100-inference plan

---

## Example End-to-End Flow

```bash
# User runs init
$ npx oneie init

# Answers prompts
? Name: Tom O'Connor
? Org: ONE Platform
? Website: https://one.ie
? Email: tom@one.ie

# AI analyzes website (30 seconds)
✅ Brand extracted
✅ Custom ontology created
✅ Features recommended

# User selects features
[x] Landing page (Infer 1-10)
[x] Authentication (Infer 11-20)
[x] Multi-tenant (Infer 21-30)
[x] Project management (Infer 31-40)

# Build starts automatically
🚀 Starting 40-inference build...

# 5 minutes later
✨ Landing page live: https://one-platform.com

# 10 minutes later
✨ Authentication added: /account/signin

# 20 minutes later
✨ Multi-tenancy working: /dashboard/groups

# 35 minutes later
✨ Projects live: /projects

# Final notification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 YOUR PLATFORM IS LIVE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 https://one-platform.com
📱 /account - Authentication
🏢 /dashboard/groups - Organizations
📊 /projects - Project management

📊 Stats:
   • Inferences: 40/100 complete
   • Time: 35 minutes
   • Cost: $0
   • Speed: <330ms globally

Want to add more features? Run:
$ npx oneie build --features ai-agents rag-knowledge

📚 Docs: https://docs.one.ie
💬 Support: https://discord.gg/one
```

---

**This is inference-based onboarding done right!** 🚀

Fast. Transparent. Incremental. Personal. Perfect.

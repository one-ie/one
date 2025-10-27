# /one - ONE Platform Command Center

🌟 **Transform Ideas into Production-Ready Code with agent-director**

The `/one` command launches the ONE Platform orchestration system powered by agent-director and 15 specialized agents.

## Quick Start

When user types `/one`, display the ONE Platform welcome screen.

### Step 1: Check Status (< 1 second)

Run quick parallel checks:

```bash
find . -maxdepth 2 -name ".onboarding.json" -type f 2>/dev/null | head -1 && \
lsof -ti:4321 2>/dev/null
```

**Parse output:**
- Line 1: Path to `.onboarding.json` (if exists)
- Line 2: Server PID (if running)

### Step 2: Read Onboarding Data (if exists)

If `.onboarding.json` found, read to extract:
- `user.name`
- `organization.name`
- `website.url`

### Step 3: Display Welcome Screen

**WITH onboarding data:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

    ONE Platform v1.0.0
  Transform Ideas into Code

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome back, [user.name]!

Organization: [organization.name]
Website: [website.url]
Dev Server: http://localhost:4321 [✓ Running / ⭕ Stopped]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 QUICK START: Your Idea → Full Implementation Plan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Tell me your idea:
   "I want to build a course platform with AI tutors"

2. Create a plan:
   /plan convert [your-idea]
   → Generates 100-inference plan
   → Assigns tasks to agents
   → Shows timeline + dependencies

3. Execute with agents:
   /now              - See current inference
   /next             - Advance to next task
   /done             - Mark task complete
   /build            - Start building with specialists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ORCHESTRATION & PLANNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Plan Management:
• /plan                    - View current 100-inference plan
• /plan convert [idea]     - Convert idea to full task plan
• /plan show               - Display plan with agent assignments
• /plan export             - Export plan (markdown, json, csv)
• /plan dependencies       - Show task dependencies
• /plan filter --agent     - Filter tasks by agent

Inference Workflow:
• /now                     - Show current inference & task
• /next                    - Advance to next inference
• /done                    - Mark inference complete & learn
• /goto [N]                - Jump to inference N

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AGENT COMMAND CENTER (15 Specialists, agent-director Leads)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Orchestration:
• /agent director          - View orchestrator dashboard
• /agent dashboard         - See all agents' current work
• /agent delegate [task]   - Manually delegate to agent

Core Specialists:
• /agent backend           - Backend specialist (Convex, mutations, queries)
• /agent frontend          - Frontend specialist (Astro, React, pages)
• /agent designer          - Design specialist (wireframes, tokens)
• /agent quality           - Quality specialist (tests, validation)

Support Specialists:
• /agent builder           - Feature builder (coordinates implementation)
• /agent problem-solver    - Problem solver (analyzes failures)
• /agent documenter        - Documenter (writes docs, captures lessons)
• /agent ops               - Operations (deployment, CI/CD)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  DEVELOPMENT TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server & Environment:
• /server start            - Start development server
• /server stop             - Stop development server
• /server status           - Check server status

Onboarding & Analysis:
• /onboard                 - Analyze website & extract brand identity

Build & Deploy (Frontend-First by Default):
• /build                   - Build features using existing /web components
• /build [feature]         - Build specific frontend feature
• /build backend [feature] - Build custom backend (when explicitly needed)
• /build list              - See available components in /web
• /build help              - Full build documentation
• /deploy                  - Deploy to production

Analytics:
• /see                     - View analytics & explore insights

Existing Features Ready to Use:
• Shop (ecommerce): /web/src/pages/shop.astro
• Blog (content): /web/src/pages/blog/
• Portfolio: /web/src/pages/portfolio.astro
• More: Explore /web/src/pages/ for available components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHAT WOULD YOU LIKE TO BUILD?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Just describe your frontend feature:
• "Add a course shop page (we have shop.astro)"
• "Create a blog with featured articles"
• "Build a portfolio gallery with filtering"
• "Add product recommendation system"
• "Create a testimonials showcase section"

Or customize existing features:
• "Redesign the shop page with new branding"
• "Add advanced filtering to portfolio"
• "Create course preview pages"
• "Build instructor profile pages"

Or request custom backend (when needed):
• "build backend AI tutor integration"
• "build backend token economy system"
• "build backend custom analytics"

Start with: /plan convert [your-idea]

Then I'll:
1. Check existing /web components for reuse
2. Plan frontend modifications needed
3. Assign to frontend agent if backend not needed
4. Execute step-by-step with /now, /next, /done

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**WITHOUT onboarding data:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

    ONE Platform v1.0.0
  Make Your Ideas Real

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dev Server: http://localhost:4321 [✓ Running / ⭕ Stopped]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 QUICK START: Turn Your Idea Into a Detailed Task Plan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Start your idea:
   /plan convert "I want to build a course platform"

   This will:
   ✅ Create a 100-inference plan
   ✅ Assign tasks to 15 specialists
   ✅ Show dependencies and timeline
   ✅ List all ontology dimensions involved

2. Execute step-by-step:
   /now                 - See current task
   /next                - Move to next inference
   /done                - Mark complete & advance

3. See your agents working:
   /agent dashboard     - See all agents' current work
   /agent [name]        - View specific agent's tasks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ESSENTIAL COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Planning:
  /plan convert [idea]     - Convert idea to 100-inference plan
  /plan show              - Show current plan with agent assignments
  /plan dependencies      - Show task dependencies

Execution:
  /now                    - View current inference & task
  /next                   - Advance to next inference
  /done                   - Mark complete & advance
  /build [feature]        - Build with specialists

Agents:
  /agent dashboard        - See all agents at work
  /agent director         - View orchestrator status
  /agent [name]           - View specific agent

Setup:
  /server start           - Start dev server
  /onboard                - Analyze your website

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ READY TO TRANSFORM YOUR IDEA?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Start here:
  /plan convert "Your idea here"

Examples:
  • /plan convert "Build a course platform with AI tutors"
  • /plan convert "Create a blog with SEO and analytics"
  • /plan convert "Add real-time notifications to my app"

Then:
  • /plan show              - See your full plan
  • /now                    - Start executing
  • /agent dashboard        - Watch your agents work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Implementation Notes

**DO NOT:**
- Start server automatically
- Launch agent-onboard automatically
- Block waiting for processes

**DO:**
- Show current status (server, onboarding)
- Guide users to `/plan convert [idea]` as first step
- Reference cascade system for orchestration
- Show agent-director as central coordinator
- Highlight 15-specialist availability

**Key Integration Points:**
- `/plan convert` merges CASCADE planning into plan command
- Agent assignments are automatic based on inference type
- Dependencies are calculated and shown
- Quality loop is visualized in task breakdown

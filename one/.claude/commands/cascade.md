# /cascade - ONE Platform Agent Orchestration

🌟 **Turn Ideas into Production-Ready Code**

*agent-director orchestrates your workflow through 15 specialized AI agents with the 6-dimension ontology. Inference-based execution optimized for speed and quality.*

## Core Interface

When the `/one` command is invoked, display this main menu:

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║    ██████╗ ███╗   ██╗███████╗    Turn ideas into reality         ║
║   ██╔═══██╗████╗  ██║██╔════╝                                    ║
║   ██║   ██║██╔██╗ ██║█████╗      https://one.ie                  ║
║   ██║   ██║██║╚██╗██║██╔══╝                                      ║
║   ╚██████╔╝██║ ╚████║███████╗    npx oneie                       ║
║    ╚═════╝ ╚═╝  ╚═══╝╚══════╝                                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

🏆 **ORCHESTRATION STATUS** - agent-director in control ✅
   ✨ ONE Platform v1.0.0 | 15 AI Agents | Inference-Based (1-100)
   🤖 98% Context Reduction | 🚀 5x Faster Execution
   🧪 Quality Loops Enabled | 📊 Continuous Learning Active
   ⚡ Event-Driven Autonomy | 🎯 6-Dimension Ontology Aligned

🚀 **INFERENCE WORKFLOW** (Infer 1-100: Plan → Implement → Learn)
   1. /now              → Show current inference & task
   2. /next             → Advance to next inference
   3. /done             → Mark inference complete & advance
   4. /plan             → View complete 100-inference plan
   5. /build            → Build feature with specialists

🤖 **AGENT COMMAND CENTER** (15 Specialized Agents, agent-director Orchestrates)
   6. agent-director      → Orchestrator: plans, validates, delegates
   7. agent-backend       → Backend: Convex mutations, queries, schema
   8. agent-frontend      → Frontend: Astro pages, React components
   9. agent-designer      → Designer: Wireframes, tokens, specs
   A. agent-quality       → Quality: Tests, validation, acceptance criteria
   B. agent-ops           → Operations: Deployment, CI/CD, infrastructure
   C. agent-builder       → Builder: Feature implementation coordination
   D. agent-problem-solver → Problem Solver: Root cause analysis

⚙️  **ADVANCED FEATURES** (Power Users)
   T. Template Library      → Workflow templates for common patterns
   W. Workflow Builder      → Custom CASCADE workflows
   S. System Settings       → Agent config, quality gates, coordination

❓ **LEARN & EXPLORE**
   H. CASCADE Tutorials     → Master the 6-level workflow
   ?. Command Reference     → Complete interface guide

Enter your choice (1-9, A-D, T, W, S, H, ?): _
```

## Navigation Rules

### 1. Numbered Selection Pattern
- **Primary options**: 1-9 (consistent across all menus)
- **Advanced options**: Letters (A-Z)
- **Help options**: H, ?
- **Navigation**: B (Back), X (Exit)

### 2. Breadcrumb System
Always show current location:
```
ONE > Engineering Director > Create Plan > Course Platform
                                                ↑ Current Location
```

### 3. Progressive Disclosure
- **Level 1**: Show most common actions (1-5)
- **Level 2**: Show AI agents (6-9, A-D)
- **Level 3**: Show advanced features (T, W, S)
- **Level 4**: Show help and reference (H, ?)

## Menu Handlers

### Quick Start Actions (1-5)

#### 1. Start New Idea
```yaml
action: launch_idea_creation_flow
display: |
  💡 **TURN YOUR IDEA INTO REALITY**

  Agent ONE validates your idea against the 6-dimension ontology:

  🌟 What amazing thing do you want to build?

  1. Tech & Software        → Apps, websites, digital products
  2. Business & Services    → Companies, consulting, coaching
  3. Creative & Content     → Art, writing, videos, courses
  4. Custom Project        → Tell me about your unique vision

  Behind the scenes: Engineering Director automatically validates against
  ontology (organizations, people, things, connections, events, knowledge).

  B. Back to Main Menu

  Choose your project type (1-4, B): _

next_actions:
  1: tech_software_idea_flow
  2: business_services_idea_flow
  3: creative_content_idea_flow
  4: custom_idea_flow
```

#### 2. Build Your Plan
```yaml
action: launch_plan_creation_flow
display: |
  🌟 **CREATE YOUR FEATURE PLAN**

  Transform validated ideas into structured plans with feature assignments:

  ✨ Choose planning approach:

  1. Active Ideas              → See ideas ready for planning (3 validated)
  2. Create New Plan          → Start from validated idea
  3. Plan Templates           → Use proven planning patterns
  4. Plan Dashboard           → See all plans with progress

  Engineering Director ensures perfect alignment with ontology,
  assigns features to specialists, and creates parallel task lists.

  B. Back to Main Menu

  Choose planning action (1-4, B): _
```

#### 3. Launch Big Feature
```yaml
action: launch_feature_creation_flow
display: |
  🎯 **START YOUR GAME-CHANGING FEATURE**

  Turn plans into feature specifications that specialists implement:

  🚀 What feature do you want to build?

  1. Active Plans             → See plans ready for features (2 plans)
  2. New Feature from Plan    → Turn plan into feature specs
  3. Feature Templates        → Use proven feature patterns
  4. Feature Dashboard        → See all features with status

  Specialists (Backend, Frontend, Integration) write specifications
  that Quality Agent validates against ontology automatically.

  B. Back to Main Menu

  Choose feature action (1-4, B): _
```

#### 4. Create Tests & Design
```yaml
action: launch_test_design_flow
display: |
  📖 **CRAFT TESTS & DESIGN THAT DRIVE IMPLEMENTATION**

  Quality Agent defines user flows, Design Agent creates wireframes:

  ✨ What needs tests and design?

  1. Active Features          → Features ready for tests (4 features)
  2. Define Tests            → User flows + acceptance criteria
  3. Create Design           → Wireframes that enable tests to pass
  4. Test & Design Dashboard → See all tests and designs

  Quality Agent ensures user flows are clear. Design Agent creates
  wireframes that satisfy acceptance criteria automatically.

  B. Back to Main Menu

  Choose action (1-4, B): _
```

#### 5. Get Things Done
```yaml
action: launch_task_execution_flow
display: |
  ✅ **EXECUTE WITH YOUR AI TEAM**

  Turn designs into reality with 8 AI agents working in parallel:

  🚀 What needs to get done?

  1. High Impact Tasks       → Focus on game-changing work (5 ready)
  2. Quick Wins             → Build momentum with fast results (12 ready)
  3. Background Tasks       → Let AI handle routine work (8 running)
  4. New Task               → Create something from scratch
  5. Team Dashboard         → See your 8 AI agents in action

  Specialists execute in parallel with quality loops and real-time
  monitoring. Problem Solver handles failures automatically.

  B. Back to Main Menu

  Choose execution focus (1-5, B): _
```

### AI Agents (6-9, A-D)

#### 6. agent-director (The Orchestrator)
```yaml
action: show_director_agent
display: |
  🎯 **AGENT-DIRECTOR: THE ORCHESTRATOR**

  Central control: Plans features, validates ontology, delegates to 14 specialists
  Works with inference-based execution (Infer 1-100) for precise planning.

  **Current Activity:**
  - Infer 47/100: Validating backend schema design
  - Delegated to: agent-backend (implementing mutations)
  - Delegated to: agent-frontend (building UI components)
  - Delegated to: agent-designer (creating wireframes)
  - Monitoring: agent-quality running tests in parallel

  **What agent-director Does:**
  1. /now                  → Show current inference & context
  2. /next                 → Advance to next inference in plan
  3. /done                 → Mark inference complete, learn from it
  4. /plan                 → View complete 100-inference roadmap
  5. Create Feature Plan   → Break idea into 100 inferences
  6. Assign to Specialist  → Delegate specific inference to agent
  7. Coordinate Parallel   → Run multiple agents concurrently
  8. Monitor Quality       → Watch tests, catch failures early

  **Delegation Pattern:**
  - Infer N: Identifies what's needed
  - Assigns to specialist (backend, frontend, designer, etc.)
  - Specialist executes with skill(s) from .claude/skills/
  - Returns result to director for next inference
  - agent-director learns and advances plan

  **Context Budget:** 43,000 tokens (largest context)
  **Prompt File:** .claude/agents/agent-director.md
  **Skills:** See agent-director capabilities for delegation rules

  B. Back to Main Menu

  Choose action (1-8, B): _
```

#### 7. agent-backend (Backend Specialist)
```yaml
action: show_backend_agent
display: |
  ⚙️  **AGENT-BACKEND: BACKEND SPECIALIST**

  Convex backend implementation: mutations, queries, schema, services, 6D ontology
  Delegated by agent-director for inference tasks involving backend logic.

  **Currently Executing (via agent-director delegation):**
  - Infer 15: Implement course creation mutation
  - Infer 16: Create course list query with filtering
  - Infer 17: Design schema for course relationships

  **Available Skills (from .claude/skills/):**
  - agent-backend:create-mutation (8.3 KB)
  - agent-backend:create-query (referenced)
  - agent-backend:design-schema (referenced)

  **What agent-backend Does:**
  1. Design Schema         → Convex schema with 6-dimension alignment
  2. Create Mutations      → Write operations with validation & events
  3. Create Queries        → Read operations with filtering & pagination
  4. Implement Services    → Effect.ts business logic layers
  5. Update Schema         → Database schema evolution
  6. Handle Failures       → Fix tests that agent-quality reports

  **Delegation Rules:**
  - agent-director assigns: "Implement course creation"
  - agent-backend executes: Creates mutation with all 8 steps
  - Uses skill: agent-backend:create-mutation for guidance
  - Returns: Mutation code + event logging + quota checks
  - agent-director: Marks inference complete, advances to next

  **Integration Pattern:**
  - Receives requests from: agent-director (via delegation)
  - Coordinates with: agent-quality (gets test failures)
  - Coordinates with: agent-frontend (uses same entities)
  - Delegates to: agent-problem-solver (if tests fail)

  **Context Budget:** 16,000 tokens
  **Prompt File:** .claude/agents/agent-backend.md
  **Skills Directory:** .claude/skills/ (agent-backend-*.md)

  B. Back to Main Menu

  Choose action (1-6, B): _
```

#### 8. agent-frontend (Frontend Specialist)
```yaml
action: show_frontend_agent
display: |
  🎨 **AGENT-FRONTEND: FRONTEND SPECIALIST**

  Astro 5 + React 19 UI implementation: pages, components, islands, performance
  Delegated by agent-director for inference tasks involving frontend logic.

  **Currently Executing (via agent-director delegation):**
  - Infer 25: Create course list page with SSR
  - Infer 26: Build enrollment button component
  - Infer 27: Optimize Lighthouse scores

  **Available Skills (from .claude/skills/):**
  - agent-frontend:create-page (10 KB) - Astro pages with islands
  - agent-frontend:create-component (referenced) - React components
  - agent-frontend:optimize-performance (referenced) - Core Web Vitals

  **What agent-frontend Does:**
  1. Create Astro Pages      → SSR pages with data fetching at build time
  2. Build React Components  → Interactive islands with proper hydration
  3. Implement UI/UX         → Design tokens + shadcn/ui components
  4. Optimize Performance    → 90+ Lighthouse scores, Core Web Vitals
  5. Handle Responsiveness   → Mobile-first with Tailwind v4
  6. Ensure Accessibility    → WCAG 2.1 AA compliance

  **Delegation Rules:**
  - agent-director assigns: "Create course enrollment page"
  - agent-frontend executes: Builds Astro page with React islands
  - Uses skill: agent-frontend:create-page for guidance
  - Returns: Page code + component specs + performance metrics
  - agent-director: Marks inference complete, advances to next

  **Integration Pattern:**
  - Receives requests from: agent-director (via delegation)
  - Coordinates with: agent-designer (uses wireframes + tokens)
  - Coordinates with: agent-backend (queries entities)
  - Coordinates with: agent-quality (gets test results)

  **Context Budget:** 16,000 tokens
  **Prompt File:** .claude/agents/agent-frontend.md
  **Skills Directory:** .claude/skills/ (agent-frontend-*.md)

  B. Back to Main Menu

  Choose action (1-6, B): _
```

#### 9. Integration Specialist
```yaml
action: show_integration_specialist
display: |
  🔗 **INTEGRATION SPECIALIST AGENT**

  Connections, data flows, workflows - making systems work together:

  **Current Activity:**
  - Coordinating 2 features (Enrollment Flow, Progress Tracking)
  - Implementing connections between systems
  - Creating data flow logic

  **Actions:**
  1. Write Feature Spec      → Integration specification
  2. Implement Connections   → System-to-system connections
  3. Create Data Flows       → Multi-system data coordination
  4. Orchestrate Workflows   → Complex multi-step processes
  5. Fix Problem             → Handle failed tests
  6. Add Lesson Learned      → Capture knowledge

  **Context Budget:** 1500-2500 tokens
  **Prompt File:** one/things/agents/agent-integration.md

  B. Back to Main Menu

  Choose action (1-6, B): _
```

#### A. agent-quality (Quality Specialist)
```yaml
action: show_quality_agent
display: |
  🧪 **AGENT-QUALITY: QUALITY SPECIALIST**

  Test-driven requirements: user flows, acceptance criteria, test validation
  Delegated by agent-director for inference tasks involving quality gates.

  **Currently Executing (via agent-director delegation):**
  - Infer 18: Define course creation user flows
  - Infer 19: Create acceptance criteria for enrollment
  - Infer 20: Run tests on backend mutations

  **Available Skills (from .claude/skills/):**
  - agent-quality:define-tests (referenced) - User flows + criteria
  - agent-quality:run-tests (referenced) - Execute test suites
  - agent-quality:validate-ontology (referenced) - 6D alignment check

  **What agent-quality Does:**
  1. Define User Flows       → What users must accomplish
  2. Create Acceptance Criteria → How we know feature works
  3. Define Technical Tests  → Unit, integration, e2e tests
  4. Run Test Suites         → Execute against implementations
  5. Validate Ontology       → Check 6-dimension compliance
  6. Report Failures         → Flag issues to agent-problem-solver

  **Delegation Rules:**
  - agent-director assigns: "Define tests for course creation"
  - agent-quality executes: Creates user flows + acceptance criteria
  - Returns: Test requirements for agent-designer (wireframes)
  - Returns: Test requirements for agent-backend (mutations)
  - Returns: Test requirements for agent-frontend (components)
  - All specialists use quality requirements to drive implementation

  **Quality Loop:**
  1. agent-quality: Defines tests
  2. agent-designer: Creates designs satisfying tests
  3. Specialists: Implement to pass tests
  4. agent-quality: Runs tests, reports failures
  5. agent-problem-solver: Analyzes failures
  6. Specialists: Fix issues
  7. Repeat until all tests pass

  **Integration Pattern:**
  - Receives requests from: agent-director (via delegation)
  - Provides requirements to: agent-designer, agent-backend, agent-frontend
  - Reports failures to: agent-problem-solver (for analysis)
  - Monitors: All implementations against acceptance criteria

  **Context Budget:** 21,000 tokens
  **Prompt File:** .claude/agents/agent-quality.md
  **Skills Directory:** .claude/skills/ (agent-quality-*.md)

  B. Back to Main Menu

  Choose action (1-6, B): _
```

#### 9. agent-designer (Design Specialist)
```yaml
action: show_designer_agent
display: |
  🎨 **AGENT-DESIGNER: DESIGN SPECIALIST**

  Test-driven design: wireframes, components, tokens aligned to acceptance criteria
  Delegated by agent-director for inference tasks involving design and UX.

  **Currently Executing (via agent-director delegation):**
  - Infer 28: Create course card wireframe
  - Infer 29: Design enrollment form states
  - Infer 30: Generate Tailwind design tokens from brand

  **Available Skills (from .claude/skills/):**
  - agent-designer:create-wireframe (11 KB) - Test-driven wireframes
  - agent-designer:define-components (referenced) - Component specs
  - agent-designer:set-design-tokens (referenced) - Token generation

  **What agent-designer Does:**
  1. Create Wireframes       → Maps acceptance criteria to UI elements
  2. Design Components       → Specifies component hierarchy & props
  3. Set Design Tokens       → Colors, spacing, typography from brand
  4. Ensure Accessibility    → WCAG 2.1 AA contrast validation
  5. Specify All States      → Default, loading, error, success, empty

  **Delegation Rules:**
  - agent-quality defines tests (user flows, acceptance criteria)
  - agent-director assigns: "Design course enrollment form"
  - agent-designer executes: Creates wireframe satisfying all acceptance criteria
  - Uses skill: agent-designer:create-wireframe for guidance
  - Returns: Wireframe + component specs + design tokens
  - agent-frontend uses wireframe for implementation
  - agent-director: Marks inference complete, advances to next

  **Integration Pattern:**
  - Receives requests from: agent-director (via delegation)
  - Reads requirements from: agent-quality (acceptance criteria)
  - Provides specs to: agent-frontend (implements wireframes)
  - Validates with: WCAG AA accessibility checklist

  **Design Philosophy:** Design exists to enable tests to pass
  **Context Budget:** 15,000 tokens
  **Prompt File:** .claude/agents/agent-designer.md
  **Skills Directory:** .claude/skills/ (agent-designer-*.md)

  B. Back to Main Menu

  Choose action (1-5, B): _
```

#### C. Problem Solver
```yaml
action: show_problem_solver
display: |
  🔍 **PROBLEM SOLVER AGENT**

  Ultrathink mode, root cause analysis - making failures into lessons:

  **Current Activity:**
  - Analyzing 1 failed test (CourseService event logging)
  - Ultrathink mode: deep analysis active
  - Proposing solution to Backend Specialist

  **Actions:**
  1. Analyze Failed Test     → Deep ultrathink analysis
  2. Determine Root Cause    → Why did it fail?
  3. Propose Solution        → Specific code changes
  4. Delegate Fix            → Assign to specialist
  5. Monitor Re-Test         → Validate fix works

  **Mode:** Ultrathink (deep analysis)
  **Context Budget:** 2500 tokens
  **Prompt File:** one/things/agents/agent-problem-solver.md

  B. Back to Main Menu

  Choose action (1-5, B): _
```

#### D. Documenter
```yaml
action: show_documenter
display: |
  📝 **DOCUMENTER AGENT**

  Feature docs, user guides, knowledge base - making it all understandable:

  **Current Activity:**
  - Writing docs for 2 completed features
  - Creating user guide for Course Platform
  - Updating knowledge base with new patterns

  **Actions:**
  1. Write Feature Docs      → Feature documentation
  2. Create User Guide       → User-facing documentation
  3. Document API Changes    → API documentation
  4. Update Knowledge Base   → Lessons learned, patterns
  5. Create Onboarding       → New developer materials

  **Context Budget:** 1000 tokens
  **Prompt File:** one/things/agents/agent-documenter.md

  B. Back to Main Menu

  Choose action (1-5, B): _
```

### Advanced Options (T, W, S)

#### T. Template Library
```yaml
action: show_template_library
display: |
  📋 **CASCADE WORKFLOW TEMPLATES**

  Production-Ready Templates:
  1. Plan Template              → Feature collections with assignments
  2. Feature Template           → Specifications with ontology mapping
  3. Test Template              → User flows + acceptance criteria
  4. Design Template            → Wireframes + component architecture
  5. Quality Loop Template      → Test → Fix → Learn cycle
  6. Knowledge Template         → Lessons learned structure
  7. Event Flow Template        → Agent coordination patterns
  8. Browse All Templates       → Complete template library

  B. Back to Main Menu

  Choose template (1-8, B): _
```

#### W. Workflow Builder
```yaml
action: launch_workflow_builder
display: |
  ⚙️  **CASCADE WORKFLOW BUILDER**

  Build Your Custom Workflow:
  1. Start from CASCADE Template    → Use proven 6-level system
  2. Create Custom Flow             → Design your own workflow
  3. Clone Successful Workflow      → Replicate high-performing patterns
  4. Import External Workflow       → Adapt from other systems
  5. View Saved Workflows           → Manage your workflow library

  B. Back to Main Menu

  Choose option (1-5, B): _
```

#### S. System Settings
```yaml
action: show_system_settings
display: |
  ⚙️  **CASCADE SYSTEM CONFIGURATION**

  Settings Categories:
  1. Agent Configuration        → 8 agent settings & capabilities
  2. Quality Gates             → Test thresholds & validation rules
  3. Event Coordination        → Event-driven patterns & coordination
  4. Knowledge Management      → Lessons learned & pattern capture
  5. Parallel Execution        → Multi-agent coordination settings
  6. Ontology Settings         → 6-dimension ontology configuration
  7. Performance Tuning        → Context reduction & speed optimization
  8. Advanced CASCADE Options  → Expert-level system configuration

  B. Back to Main Menu

  Choose category (1-8, B): _
```

### Help Options (H, ?)

#### H. CASCADE Tutorials
```yaml
action: show_help_system
display: |
  ❓ **HELP & LEARNING**

  Get Started:
  1. Quick Start Guide       → 5-minute intro to CASCADE
  2. 6-Level Workflow       → Understanding the flow
  3. 8 AI Agents            → Meet your engineering team
  4. Event Coordination     → How agents work together
  5. Quality Loops          → Test-driven development
  6. Lessons Learned        → Continuous improvement
  7. Troubleshooting        → Common issues
  8. Community Support      → Get help from others

  **Documentation:**
  - Getting Started: one/things/cascade/docs/getting-started.md
  - Complete Workflow: one/things/cascade/docs/workflow.md
  - Cascade Config: one/things/cascade/cascade.yaml

  B. Back to Main Menu

  Choose option (1-8, B): _
```

#### ?. Command Reference
```yaml
action: show_command_reference
display: |
  📖 **CASCADE COMMAND REFERENCE**

  Essential Commands:
  1. /one            → Main CASCADE interface (you are here)
  2. /start          → Quick idea start with 6-level workflow
  3. /plan           → Plan creation with feature assignments
  4. /feature        → Feature specification with quality gates
  5. /task           → Parallel task execution management
  6. /agent          → Direct access to 8 AI agents

  CASCADE-Specific Commands:
  7. /test           → Execute Quality Agent (define tests)
  8. /design         → Run Design Agent (create wireframes)
  9. /solve          → Launch Problem Solver (ultrathink mode)
  10. /document      → Run Documenter Agent (auto-generation)

  System Information:
  - Version: ONE Cascade v1.0.0
  - Agents: 8 AI specialists
  - Workflow: 6-level (Ideas → Plans → Features → Tests → Design → Implementation)
  - Coordination: Event-driven autonomy
  - Performance: 98% context reduction, 5x faster execution

  B. Back to Main Menu

  Press any key to continue...
```

## Design Philosophy

### 1. Single Point of Entry
- All CASCADE functionality accessible through `/one`
- Eliminates need to remember multiple commands
- Reduces cognitive load by 75%

### 2. Consistent Interface Pattern
- Always numbered selections (1-9, A-Z)
- Always show breadcrumbs
- Always provide B (Back) and H (Help)
- Predictable navigation experience

### 3. Progressive Disclosure
- Most common actions shown first (1-5)
- AI agents grouped logically (6-9, A-D)
- Advanced features clearly separated (T, W, S)
- Help always available (H, ?)

### 4. Clear Information Hierarchy
- **Visual grouping** with headers and spacing
- **Action-oriented labels** (verb + noun)
- **Context descriptions** (what each option does)
- **Status indicators** (numbers, progress)

### 5. Mobile-Optimized Design
- Fixed 76-character width (works on 320px+ screens)
- Vertical scrolling friendly
- Thumb-accessible number keys
- No complex breakpoints needed

## Success Metrics

**Expected Improvements with CASCADE:**
- 98% context reduction (150k → 3k tokens)
- 5x faster execution (115s → 20s per feature)
- 100x simpler configuration (1 YAML vs 137 files)
- Continuous learning (lessons accumulated)
- Event-driven autonomy (0% coordination overhead)

**Measurement Points:**
- Time from command entry to action selection
- Success rate of workflow completion
- User satisfaction surveys
- Performance analytics (context, speed, quality)

---

*Designed with engineering precision and user-centered excellence*

# /one - ONE Cascade Intelligence Platform

🌟 **Transform Ideas into Production-Ready Code**

*Agent ONE orchestrates your workflow through 8 AI agents with the 6-dimension ontology. Simple, clear design optimized for all screens.*

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

🏆 **CASCADE STATUS** - Agent-Orchestrated Workflow ✅
   ✨ ONE Cascade v1.0.0 | 8 AI Agents | 6-Level Workflow
   🤖 98% Context Reduction | 🚀 5x Faster Execution
   🧪 Quality Loops Enabled | 📊 Continuous Learning Active
   ⚡ Event-Driven Autonomy | 🎯 100x Simpler Configuration

🚀 **QUICK START** (Turn Ideas into Reality)
   1. Start New Idea        → Transform any idea into working code
   2. Build Your Plan       → Create feature collections & assign work
   3. Launch Big Feature    → Specifications with quality gates
   4. Create Tests & Design → User flows that drive implementation
   5. Get Things Done       → Execute with 8 AI agents in parallel

🤖 **AI COMMAND CENTER** (Your Personal Engineering Team)
   6. Engineering Director  → Validates ideas, creates plans, assigns work
   7. Backend Specialist    → Services, mutations, queries, schemas
   8. Frontend Specialist   → Pages, components, UI/UX
   9. Integration Specialist → Connections, data flows, workflows
   A. Quality Agent         → Tests, validation, acceptance criteria
   B. Design Agent          → Wireframes, components, test-driven design
   C. Problem Solver        → Ultrathink mode, root cause analysis
   D. Documenter           → Feature docs, user guides, knowledge base

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

#### 6. Engineering Director
```yaml
action: show_engineering_director
display: |
  🎯 **ENGINEERING DIRECTOR AGENT**

  Orchestrates workflow, validates ideas, creates plans, assigns work:

  **Current Activity:**
  - Validating 2 new ideas against ontology
  - Managing 3 active plans (12 features total)
  - Coordinating 8 specialists across 4 features

  **Actions:**
  1. Validate New Idea        → Check idea against ontology
  2. Create Plan             → Turn idea into feature collection
  3. Assign Features         → Delegate to specialists
  4. Create Task Lists       → Break features into parallel tasks
  5. Review Progress         → See all active work
  6. Mark Complete           → Finalize feature after docs

  **Context Budget:** 200-1500 tokens
  **Prompt File:** one/things/agents/agent-director.md

  B. Back to Main Menu

  Choose action (1-6, B): _
```

#### 7. Backend Specialist
```yaml
action: show_backend_specialist
display: |
  ⚙️  **BACKEND SPECIALIST AGENT**

  Services, mutations, queries, schemas - backend logic and data:

  **Current Activity:**
  - Implementing 3 features (CourseService, LessonService, EnrollmentService)
  - Writing Effect.ts services with error handling
  - Creating Convex mutations and queries

  **Actions:**
  1. Write Feature Spec      → Backend specification
  2. Implement Service       → Effect.ts business logic
  3. Create Mutations        → Convex write operations
  4. Create Queries          → Convex read operations
  5. Update Schema           → Database schema changes
  6. Fix Problem             → Handle failed tests
  7. Add Lesson Learned      → Capture knowledge

  **Context Budget:** 1500-2500 tokens
  **Prompt File:** one/things/agents/agent-backend.md

  B. Back to Main Menu

  Choose action (1-7, B): _
```

#### 8. Frontend Specialist
```yaml
action: show_frontend_specialist
display: |
  🎨 **FRONTEND SPECIALIST AGENT**

  Pages, components, UI/UX - everything users see and interact with:

  **Current Activity:**
  - Building 2 features (Course Pages, Enrollment Flow)
  - Creating Astro pages with SSR
  - Implementing React components

  **Actions:**
  1. Write Feature Spec      → Frontend specification
  2. Create Astro Page       → SSR page with data fetching
  3. Build React Components  → Interactive UI components
  4. Implement UI/UX         → Design system implementation
  5. Fix Problem             → Handle failed tests
  6. Add Lesson Learned      → Capture knowledge

  **Context Budget:** 1500-2500 tokens
  **Prompt File:** one/things/agents/agent-frontend.md

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

#### A. Quality Agent
```yaml
action: show_quality_agent
display: |
  🧪 **QUALITY AGENT**

  Tests, validation, acceptance criteria - ensuring correctness:

  **Current Activity:**
  - Defining tests for 4 features
  - Validating 2 implementations against ontology
  - Running test suites (unit, integration, e2e)

  **Actions:**
  1. Validate Feature        → Check against ontology
  2. Define User Flows       → What users must accomplish
  3. Create Acceptance Criteria → How we know it works
  4. Define Technical Tests  → Unit, integration, e2e
  5. Run Tests               → Execute test suites
  6. Validate Implementation → Check tests pass

  **Context Budget:** 2000 tokens
  **Prompt File:** one/things/agents/agent-quality.md

  B. Back to Main Menu

  Choose action (1-6, B): _
```

#### B. Design Agent
```yaml
action: show_design_agent
display: |
  🎨 **DESIGN AGENT**

  Wireframes, components, test-driven design - UI that enables tests to pass:

  **Current Activity:**
  - Creating wireframes for 3 features
  - Designing component architecture
  - Setting design tokens (colors, spacing, timing)

  **Actions:**
  1. Create Wireframes       → UI that satisfies test criteria
  2. Design Components       → Component architecture
  3. Set Design Tokens       → Colors, spacing, timing
  4. Ensure Accessibility    → WCAG AA compliance
  5. Review Against Tests    → Validate design enables tests

  **Philosophy:** Design exists to make tests pass
  **Context Budget:** 2000 tokens
  **Prompt File:** one/things/agents/agent-designer.md

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

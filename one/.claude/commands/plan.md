# /plan - Convert Ideas to Implementation Plans with CASCADE

**Purpose:** Transform ideas into detailed 100-inference plans with automatic agent assignment and task breakdown.

## Core Functionality

### Convert Idea to Full Plan

```bash
/plan convert "Build a course platform with AI tutors"
```

Generates:
- ✅ 100-inference execution plan
- ✅ Automatic agent assignments
- ✅ Task dependencies & timeline
- ✅ 6-dimension ontology mapping
- ✅ Quality loop workflow
- ✅ Estimated tokens & budget

## Quick Usage

### Plan Conversion (CASCADE Integration)

```bash
/plan convert [idea]                    # Convert idea to full plan
/plan show                              # Show current plan with assignments
/plan export [format]                   # Export plan (md, json, csv)
```

### Execution Management

```bash
/now                                    # Show current inference & task
/next                                   # Advance to next inference
/done                                   # Mark complete & advance
/goto [N]                              # Jump to inference N
```

### Plan Filtering & Analysis

```bash
/plan filter --agent=[name]            # Filter by agent (backend, frontend, etc)
/plan filter --dimension=[name]        # Filter by dimension (things, connections, etc)
/plan filter --status=[status]         # Filter by status (completed, pending, blocked)
/plan dependencies                      # Show task dependencies
/plan timeline                          # Show gantt-style timeline
/plan stats                             # Show plan statistics
```

## Example: Converting an Idea to a Plan

### Input

```
/plan convert "Build a course platform where creators can:
- Upload courses with lessons and quizzes
- Set up AI tutors that answer student questions
- Earn tokens that students can buy/trade
- Access analytics on student progress
- Build a community with forums and discussions"
```

### Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 IDEA CONVERTED TO IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Idea: Course Platform with AI Tutors & Token Economy
Status: ✅ Plan generated | 100 inferences | 15 agents assigned

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PLAN OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Inferences:     100
Estimated Duration:   90 days
Estimated Tokens:     ~500K
Quality Loops:        4
Agent Teams:          15 specialists

6-Dimension Coverage:
  ✅ Groups (multi-tenant orgs)
  ✅ People (roles & permissions)
  ✅ Things (entities: courses, lessons, tokens)
  ✅ Connections (relationships between entities)
  ✅ Events (audit trail, activity log)
  ✅ Knowledge (RAG for AI tutors)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AGENT ASSIGNMENTS (Automatic)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lead Orchestrator:
  🤖 agent-director (infers 1-10, coordinates all specialists)

Foundation Phase (Infer 1-10):
  📊 Validation, mapping, planning with agent-director
  ✅ All done by orchestrator + planning

Backend Phase (Infer 11-30):
  ⚙️ agent-backend: Schema, mutations, queries, services
  - Infer 11-20: Convex schema design (groups, entities, connections, events)
  - Infer 21-30: Core mutations (create, update, delete)
  - Infer 41-50: Advanced queries (filtering, pagination, relationships)

Frontend Phase (Infer 31-50):
  🎨 agent-frontend: Pages, components, UI/UX
  - Infer 31-40: Astro pages (course list, detail, creator dashboard)
  - Infer 51-60: React components (course card, lesson player, forum)
  - Infer 71-80: Performance optimization

Design Phase (Infer 21-40):
  🎭 agent-designer: Wireframes, tokens, specs
  - Infer 21-30: Wireframes (acceptance criteria → UI elements)
  - Infer 31-40: Design tokens (brand colors, spacing, typography)
  - Infer 41-50: Component specifications

Quality Phase (Infer 41-60):
  🧪 agent-quality: Tests, validation, requirements
  - Infer 41-50: User flows & acceptance criteria
  - Infer 51-60: Test suite execution
  - Infer 61-70: Quality loop (test → fix → verify)

Support Specialists (Throughout):
  🔧 agent-problem-solver: Analyzes test failures, proposes fixes
  📝 agent-documenter: Writes docs, captures lessons
  🚀 agent-ops: Sets up CI/CD, prepares deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PHASE BREAKDOWN (100 Inferences)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infer 1-10:   Foundation & Understanding
  - Validate idea against 6-dimension ontology
  - Map entity types (courses, lessons, tokens, users)
  - Identify connection types (owns, enrolls, holds_tokens)
  - List event types (course_created, quiz_completed, token_earned)
  - Determine knowledge requirements (RAG for AI tutors)
  - Identify org scope (multi-tenant per creator)
  - Define people roles (creator, student, admin)
  - Create vision document
  - Break down features
  - Create 100-inference plan ← You are here!

Infer 11-20: Backend Schema & Services
  - Design Convex schema (groups, things, connections, events, knowledge)
  - Define entity types (course, lesson, quiz, token, user, ai_clone)
  - Create relationship types (owns, enrolled_in, holds_tokens)
  - Plan service layer (CourseService, TokenService, AITutorService)
  - Define mutations (createCourse, enrollStudent, earnToken)
  - Plan queries (listCourses, getStudent, checkTokenBalance)

Infer 21-30: Frontend Pages & Wireframes
  - Design course list page (SSR with server data)
  - Design course detail page (interactive lessons)
  - Design creator dashboard (analytics, course management)
  - Design AI tutor chat interface
  - Create wireframes satisfying acceptance criteria
  - Plan component hierarchy
  - Design token system UI

Infer 31-40: Design Tokens & System
  - Extract brand colors (from onboarding)
  - Create typography scale
  - Define spacing system
  - Generate Tailwind v4 tokens
  - Ensure WCAG AA contrast
  - Create component specs with props

Infer 41-50: Quality & Testing
  - Define user flows (creator: upload course, student: take course)
  - Create acceptance criteria (all features testable)
  - Define test suite (unit, integration, e2e)
  - Start test implementation
  - Run tests against schema

Infer 51-60: Backend Implementation
  - Implement Convex mutations (createCourse, enrollStudent)
  - Implement queries (listCourses, getProgress)
  - Create Effect.ts services (business logic)
  - Add event logging (complete audit trail)
  - Implement multi-tenant isolation

Infer 61-70: Frontend Implementation
  - Implement Astro pages (SSR + React islands)
  - Build React components (course cards, lesson player)
  - Integrate Convex queries (useQuery, useMutation)
  - Add loading/error states
  - Optimize performance (90+ Lighthouse)

Infer 71-80: AI Tutor Integration
  - Integrate Claude API for responses
  - Implement RAG (Retrieval-Augmented Generation)
  - Connect knowledge base (course content → embeddings)
  - Create AI personality system
  - Test tutor quality

Infer 81-90: Quality Assurance
  - Run full test suite
  - Fix failing tests
  - Performance testing (Core Web Vitals)
  - Security testing
  - Accessibility audit (WCAG AA)

Infer 91-100: Deployment & Documentation
  - Write user documentation
  - Create API documentation
  - Set up CI/CD pipeline
  - Deploy to Cloudflare Pages (frontend)
  - Deploy to Convex Cloud (backend)
  - Write deployment guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 AGENT TASK ASSIGNMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

agent-backend assigned:
  - Infer 11-20: Schema design
  - Infer 41-50: Queries design
  - Infer 51-60: Mutation implementation
  - Skills: agent-backend:create-mutation, create-query, design-schema

agent-frontend assigned:
  - Infer 21-30: Page wireframes
  - Infer 61-70: Component implementation
  - Infer 81-90: Performance optimization
  - Skills: agent-frontend:create-page, create-component, optimize-performance

agent-designer assigned:
  - Infer 21-30: Wireframe generation
  - Infer 31-40: Token & spec definition
  - Skills: agent-designer:create-wireframe, define-components, set-design-tokens

agent-quality assigned:
  - Infer 41-50: Test definition
  - Infer 61-70: Test execution
  - Infer 81-90: Full quality suite
  - Skills: agent-quality:define-tests, run-tests, validate-ontology

agent-problem-solver assigned:
  - Throughout: Monitor test failures
  - When needed: Analyze root causes
  - Delegate fixes to specialists

agent-ops assigned:
  - Infer 91-100: CI/CD setup
  - Deployment configuration
  - Production monitoring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 DEPENDENCIES & TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sequential (Cannot run in parallel):
  1-10 (Foundation) → All other phases

Parallel Tracks (Can run simultaneously after Foundation):
  Backend Track:   Infer 11-20 → 41-50 → 51-60
  Frontend Track:  Infer 21-30 → 61-70
  Design Track:    Infer 21-30 → 31-40
  Quality Track:   Infer 41-50 → 61-70 → 81-90
  Integration:     Infer 71-80 (after backend + frontend core)

Critical Path:
  Foundation → Backend Schema → Mutations → Frontend Implementation
  (28 days minimum, parallelization can reduce)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. View full plan:
   /plan show

2. See task assignments:
   /plan filter --agent=backend

3. Start execution:
   /now              - See Infer 1 context
   /next             - Move through plan
   /done             - Mark complete & advance

4. Monitor agents:
   /agent dashboard  - See all agents working
   /agent [name]     - View specific agent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Advanced Features

### Plan Filtering

```bash
# Filter by agent
/plan filter --agent=backend               # Shows backend inferences
/plan filter --agent=frontend              # Shows frontend inferences
/plan filter --agent=designer              # Shows design inferences

# Filter by dimension
/plan filter --dimension=things            # Entity-related tasks
/plan filter --dimension=connections       # Relationship-related tasks
/plan filter --dimension=events            # Event-related tasks

# Filter by status
/plan filter --status=pending              # Not started
/plan filter --status=completed            # Already done
/plan filter --status=blocked              # Dependencies unmet
```

### Plan Analysis

```bash
# View dependencies
/plan dependencies                         # Show all task dependencies

# Show timeline
/plan timeline                            # Show gantt chart of phases

# Get statistics
/plan stats                               # Show plan metrics
  - Total inferences: 100
  - Agents assigned: 15
  - Estimated duration: 90 days
  - Parallel tracks: 5
  - Quality loops: 4
```

### Export Plan

```bash
# Export to different formats
/plan export markdown                     # one/plans/[feature-name].md
/plan export json                        # .claude/state/plan.json
/plan export csv                         # plan.csv (for spreadsheets)
/plan export timeline                    # project timeline format

# Share plan
/plan share                              # Generate shareable link
```

## Plan Structure

Each plan includes:

### 1. Idea Validation
- Maps to 6-dimension ontology
- Identifies entity types
- Lists required connections
- Determines event types

### 2. 100-Inference Breakdown
- Foundation (Infer 1-10)
- Backend (Infer 11-50)
- Frontend (Infer 21-80)
- Quality (Infer 41-90)
- Operations (Infer 91-100)

### 3. Agent Assignments
- Each agent gets specific inferences
- Skills listed for each task
- Dependencies documented

### 4. Quality Loop
- Tests defined before design/implementation
- Design created to satisfy tests
- Implementation validates against tests
- Failures trigger root cause analysis

### 5. Timeline & Dependencies
- Parallel work identified
- Critical path highlighted
- Gantt chart generated

## Usage Examples

### Example 1: Convert Idea to Plan

```bash
/plan convert "Build an e-commerce store with product recommendations"

Output:
✅ Plan generated: 100 inferences
✅ Agents assigned: 15 specialists
✅ Quality loops: 3
✅ Dependencies: 24
```

### Example 2: View Plan with Agent Filter

```bash
/plan filter --agent=backend

Output:
Shows only backend inferences:
- Infer 11-20: Schema design
- Infer 41-50: Queries
- Infer 51-60: Mutations
```

### Example 3: Export and Share

```bash
/plan export markdown

Output:
📄 Created: one/plans/ecommerce-store.md
📊 Statistics: 100 inferences, 15 agents, 90 days
🔗 Share: /plan share
```

## Inference Workflow Integration

Once plan is created, use these commands:

```bash
/now                    # Show current inference (Infer 1)
/next                   # Advance to next inference
/done                   # Mark complete, capture lessons
/goto [N]              # Jump to specific inference
/build                 # Start building with agents
```

## Key Principles

1. **Ideas → Plans:** Convert any idea into actionable 100-inference plan
2. **Automatic Assignment:** Agent assignments happen automatically based on inference type
3. **Quality First:** Tests defined before implementation
4. **Parallel Execution:** Maximize agent parallelization
5. **Complete Tracking:** Every inference tracked with status, dependencies, lessons
6. **Continuous Learning:** Capture lessons after each inference

---

## See Also

- [CASCADE System](./cascade.md) - Full agent orchestration
- [Inference Workflow](../commands/done.md) - Mark inferences complete
- [Agent Dashboard](./one.md) - View all agents

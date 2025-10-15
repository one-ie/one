# Getting Started with ONE Cascade

**Transform ideas into reality using 8 AI agents and a 6-dimension ontology**

---

## What is ONE Cascade?

ONE Cascade is an agent-orchestrated workflow system that turns your ideas into production-ready code with:

- **8 specialized AI agents** working in parallel
- **6-level workflow**: Ideas → Plans → Features → Tests → Design → Implementation
- **98% context reduction** (from 150k → 3k tokens)
- **5x faster execution** (from 115s → 20s per feature)
- **Quality loops** with automatic problem solving
- **Continuous learning** through lessons learned

**Result:** 100x simpler, 5x faster, production-ready code with tests and documentation.

---

## Quick Start (5 Minutes)

### 1. Run the `/one` Command

```bash
# In Claude Code
/one
```

You'll see the CASCADE main menu with:

- Quick Start actions (1-5)
- Specialist Teams (6-9)
- Templates (T), Workflow Builder (W), Settings (S)
- Help (H) and Reference (?)

### 2. Start with an Idea

Choose **"1. Start New Idea"** and describe what you want to build:

```
Example: "I want creators to sell courses, students to enroll and track progress"
```

### 3. CASCADE Orchestrates Automatically

**Director Agent** validates your idea against the ontology:

- ✅ Entities: creator, course, lesson, student
- ✅ Connections: owns, part_of, enrolled_in
- ✅ Events: course_created, lesson_completed, progress_tracked

Creates **Plan 2: Course Platform** with 4 features assigned to specialists.

### 4. Agents Execute in Parallel

**Week 1: Plans → Features**

- Director creates feature specs
- Assigns to Backend, Frontend, Integration specialists

**Week 2: Features → Tests → Design**

- Quality Agent defines user flows and acceptance criteria
- Design Agent creates wireframes that enable tests to pass

**Week 3: Implementation**

- Specialists build in parallel (backend, frontend, integration)
- Quality validates against tests
- Problem Solver handles failures
- Documenter writes docs

### 5. Get Working Code

After 2-3 weeks:

- ✅ Working backend (services, mutations, queries, schemas)
- ✅ Working frontend (pages, components, UI/UX)
- ✅ Passing tests (unit, integration, e2e)
- ✅ Complete documentation
- ✅ Lessons learned captured

---

## The 6-Level Workflow

### Level 1: IDEAS

**What:** User describes what they want to build

**Agent:** Engineering Director

**Output:** Validated idea → becomes a plan

**Example:**

```markdown
# Idea: Course Platform

Creators sell courses, students enroll and track progress.

## Ontology Validation

- ✅ Entities: creator, course, lesson, student
- ✅ Connections: owns, part_of, enrolled_in
- ✅ Events: course_created, lesson_completed

Next: Plan 2-course-platform
```

### Level 2: PLANS

**What:** Collection of features with team assignments

**Agent:** Engineering Director

**Output:** Plan with feature assignments

**Example:**

```markdown
# Plan 2: Course Platform

## Features

- 2-1-course-crud (Backend Specialist)
- 2-2-lesson-management (Backend Specialist)
- 2-3-course-pages (Frontend Specialist)
- 2-4-enrollment-flow (Integration Specialist)

## Team

- Director: Engineering Director Agent
- Backend: Backend Specialist
- Frontend: Frontend Specialist
- Integration: Integration Specialist
```

### Level 3: FEATURES

**What:** Specifications for what to build (not how)

**Agents:** Specialists (in parallel)

**Output:** Feature specifications

**Example:**

```markdown
# Feature 2-1: Course CRUD

**What:** Allow creators to manage courses (create, read, update, delete)

**Ontology Types:**

- Thing: `course` (title, description, price)
- Connection: `owns` (creator → course)
- Events: `course_created`, `course_updated`, `course_deleted`

**Scope:**

- Backend: CourseService, mutations, queries
- Frontend: Course management UI
- Integration: Creator ↔ Course relationship
```

### Level 4: TESTS

**What:** User flows and acceptance criteria (definition of done)

**Agent:** Quality Agent

**Output:** User flows + acceptance criteria + technical tests

**Example:**

```markdown
# Tests for Feature 2-1: Course CRUD

## User Flow 1: Create a Course

**User goal:** Create course in < 10 seconds

**Steps:**

1. Navigate to "Create Course"
2. Enter title (required)
3. Enter description (optional)
4. Set price
5. Click "Create"
6. Course appears in list

**Acceptance Criteria:**

- [ ] User can create with just title
- [ ] Creation takes < 10 seconds
- [ ] User sees success confirmation
- [ ] User can immediately edit
```

### Level 5: DESIGN

**What:** Wireframes and component architecture that enable tests to pass

**Agent:** Design Agent

**Output:** Wireframes + component architecture + design tokens

**Example:**

````markdown
# Design for Feature 2-1: Course CRUD

## Decision 1: Single-Page Form (satisfies "< 10 seconds" test)

**Test requirement:** Create course in < 10 seconds

**Design solution:**

- Single-screen form (no pagination)
- Only title required
- Auto-focus on title field
- Large "Create Course" button

## Wireframe

```
┌─────────────────────────────────────┐
│ Create Course × │
├─────────────────────────────────────┤
│ Course Title \* │
│ ┌─────────────────────────────┐ │
│ │ [cursor here] │ │
│ └─────────────────────────────┘ │
│ │
│ [ Create Course ] [Cancel] │
└─────────────────────────────────────┘
```
````

### Level 6: IMPLEMENTATION

**What:** Working code that implements design and passes tests

**Agents:** Specialists → Quality → Problem Solver → Documenter

**Output:** Working code + passing tests + documentation

**Flow:**

```
Specialists build → Quality validates → Tests run
  → PASS: Documenter writes docs → Complete
  → FAIL: Problem solver analyzes → Proposes fix → Specialist fixes
        → Add to lessons learned → Re-test
```

---

## The 8 AI Agents

### 1. Engineering Director

**Role:** Orchestrates workflow, validates ideas, creates plans

**Responsibilities:**

- Validate ideas against ontology
- Create plans with feature assignments
- Review and refine specifications
- Create parallel task lists
- Mark features complete

### 2. Backend Specialist

**Role:** Services, mutations, queries, schemas

**Responsibilities:**

- Implement Effect.ts services
- Create Convex mutations/queries
- Update database schemas
- Fix backend problems

### 3. Frontend Specialist

**Role:** Pages, components, UI/UX

**Responsibilities:**

- Create Astro pages with SSR
- Build React components
- Implement UI/UX designs
- Fix frontend problems

### 4. Integration Specialist

**Role:** Connections, data flows, workflows

**Responsibilities:**

- Implement system connections
- Create data flow logic
- Coordinate multi-system features
- Fix integration problems

### 5. Quality Agent

**Role:** Defines tests, validates implementations

**Responsibilities:**

- Define user flows and acceptance criteria
- Create technical tests (unit, integration, e2e)
- Validate implementations
- Ensure ontology alignment

### 6. Design Agent

**Role:** Creates wireframes from test criteria

**Responsibilities:**

- Create wireframes that enable tests to pass
- Design component architecture
- Set design tokens
- Ensure accessibility

### 7. Problem Solver

**Role:** Analyzes failures using ultrathink mode

**Responsibilities:**

- Analyze failed tests
- Determine root cause
- Propose solutions
- Delegate fixes to specialists

### 8. Documenter

**Role:** Writes documentation after features complete

**Responsibilities:**

- Write feature documentation
- Create user guides
- Document API changes
- Update knowledge base

---

## Event-Driven Coordination

Agents coordinate autonomously via events (no complex handoffs):

```typescript
// Events table IS the message bus

// Director logs:
{ type: 'plan_started', actorId: 'director', targetId: '2-course-platform' }
{ type: 'feature_assigned', targetId: '2-1-course-crud', metadata: { assignedTo: 'backend-specialist' } }

// Specialist logs:
{ type: 'feature_started', actorId: 'backend-specialist', targetId: '2-1-course-crud' }
{ type: 'implementation_complete', actorId: 'backend-specialist', targetId: '2-1-course-crud' }

// Quality logs:
{ type: 'test_passed', actorId: 'quality', targetId: '2-1-course-crud' }

// Documenter logs:
{ type: 'documentation_complete', actorId: 'documenter', targetId: '2-1-course-crud' }

// Director marks complete:
{ type: 'feature_complete', actorId: 'director', targetId: '2-1-course-crud' }
```

**Benefits:**

- No handoff protocols
- No dependency graphs
- 0% coordination overhead
- Complete audit trail
- Parallel execution by default

---

## Quality Loops

Failed tests automatically trigger problem solving:

```
Implementation → Tests run
  → FAIL: Problem solver analyzes (ultrathink mode)
        → Proposes solution
        → Specialist fixes
        → Adds to lessons learned
        → Re-test (loop back)
```

**Knowledge accumulates in `one/knowledge/lessons-learned.md`:**

```markdown
# Lessons Learned

## Backend Patterns

### Always Log Events After Entity Creation

- **Problem:** Forgot to log course_created event
- **Solution:** Add event logging after db.insert()
- **Rule:** All thing creations trigger events
- **Example:** await ctx.db.insert('events', { type: 'course_created', ... })
```

---

## File Structure

```
one/
├── things/
│   ├── cascade/
│   │   ├── cascade.yaml          # Orchestrator configuration
│   │   ├── docs/
│   │   │   ├── getting-started.md  # This file
│   │   │   ├── workflow.md         # Complete workflow spec
│   │   │   └── examples/           # Usage examples
│   │   └── templates/              # Workflow templates
│   ├── agents/                     # 8 agent prompts
│   ├── ideas/                      # Generated ideas
│   ├── plans/                      # Generated plans
│   └── features/                   # Generated features
├── knowledge/
│   ├── patterns/                   # Implementation patterns
│   ├── lessons-learned.md         # Accumulated knowledge
│   └── ontology-minimal.yaml      # Source of truth
├── events/
│   ├── workflow/                   # Real-time event log
│   └── completed/                  # Completion events
└── connections/
    └── ontology-minimal.yaml       # Ontology
```

---

## Next Steps

### 1. Run Your First Idea

```bash
/one → "1. Start New Idea"
```

Describe what you want to build and let CASCADE handle the rest.

### 2. Explore Templates

```bash
/one → "T. Template Library"
```

Browse 37+ CASCADE workflow templates for common patterns.

### 3. Customize Your Workflow

```bash
/one → "W. Workflow Builder"
```

Create custom workflows or clone successful patterns.

### 4. Deep Dive

- **Complete workflow spec:** `one/things/cascade/docs/workflow.md`
- **Agent prompts:** `one/things/agents/`
- **Ontology:** `one/knowledge/ontology-minimal.yaml`
- **Patterns:** `one/knowledge/patterns/`

---

## Philosophy

**Core Principles:**

1. **The ontology IS the workflow** - Types define structure, patterns define implementation
2. **Agents collaborate autonomously** - Events coordinate everything
3. **Quality loops ensure correctness** - Failed tests trigger problem solving
4. **Knowledge accumulates continuously** - Lessons learned prevent repeated mistakes
5. **Parallel by default** - Sequential only when required
6. **Test-driven at every level** - From user flows to unit tests

**Result:**

- 100x simpler (1 YAML file vs 137 config files)
- 5x faster (20s vs 115s per feature)
- 98% context reduction (3k vs 150k tokens)
- Continuous learning (lessons learned accumulate)

---

## Support

- **Documentation:** `one/things/cascade/docs/`
- **Examples:** `one/things/cascade/docs/examples/`
- **Help:** Run `/one → H. Help & Tutorials`
- **Reference:** Run `/one → ?. Command Reference`

---

**Built with clarity, simplicity, and infinite scale in mind.**

Ready to turn your ideas into reality? Run `/one` and let's get started! 🚀

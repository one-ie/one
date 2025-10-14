# Plan 1: Agent-Based Ontology-Driven Workflow System

**Director:** Engineering Director Agent (agent-director.md)
**Team:**

- Backend Specialist (agent-backend.md) - orchestrator, event system
- Integration Specialist (agent-integration.md) - coordination, knowledge management
- Quality Agent (agent-quality.md) - test definition, validation
- Problem Solver (agent-problem-solver.md) - ultrathink analysis, fixes
- Documenter (agent-documenter.md) - documentation

**Duration:** 4-6 weeks
**Status:** In Progress
**Created from:** `ideas/1-create-workflow.md`

---

## Executive Summary

Build the complete workflow system that enables agents to autonomously:

1. Validate ideas against ontology
2. Create plans and assign features
3. Write specifications and define tests
4. Design wireframes that enable tests to pass
5. Implement code and validate quality
6. Solve problems and accumulate knowledge

**Goal:** 100x simpler, 5x faster, continuous learning, YAML-configurable

---

## Features Overview

### 1-1: Agent Prompts System

**Owner:** Backend Specialist
**Priority:** Critical
**Dependencies:** None

Define prompts for 8 agent roles:

- Engineering Director (agent-director.md) - validates ideas, creates plans, assigns work
- Backend Specialist (agent-backend.md) - services, mutations, queries, schemas
- Frontend Specialist (agent-frontend.md) - pages, components, UI/UX
- Integration Specialist (agent-integration.md) - connections, data flows, workflows
- Quality Agent (agent-quality.md) - defines tests, validates implementations
- Design Agent (agent-designer.md) - creates wireframes from test criteria
- Problem Solver (agent-problem-solver.md) - ultrathink mode for failures
- Documenter (agent-documenter.md) - writes documentation

Each prompt specifies:

- Role and responsibilities
- Input/output expectations
- Context requirements (token budget)
- Decision-making framework
- Communication patterns

**Files:**

- `one/things/agents/agent-director.md` ✅
- `one/things/agents/agent-backend.md` ✅
- `one/things/agents/agent-frontend.md` (enhance existing)
- `one/things/agents/agent-integration.md` ✅
- `one/things/agents/agent-quality.md` ✅
- `one/things/agents/agent-designer.md` (enhance existing)
- `one/things/agents/agent-problem-solver.md` ✅
- `one/things/agents/agent-documenter.md` ✅

---

### 1-2: YAML-Driven Orchestrator

**Owner:** Backend Specialist
**Priority:** Critical
**Dependencies:** 1-1 (needs agent definitions)

Build the orchestrator that:

- Reads workflow configuration from `ontology-minimal.yaml`
- Executes 6-level flow (ideas → plans → features → tests → design → implementation)
- Routes work to appropriate agents
- Manages parallel execution
- Monitors progress via events

**Target:** ~150 lines of TypeScript (vs 15,000+ in old system)

**Key components:**

- `AgentOrchestrator` class
- `loadWorkflowConfig()` - reads YAML
- `executeStage()` - runs each workflow level
- `runAgent()` - executes agent with context
- `runAgentParallel()` - parallel execution

**Files:**

- `one/workflows/orchestrator.ts`
- `one/knowledge/ontology-minimal.yaml` (workflow section)

---

### 1-3: Event Coordination System

**Owner:** Backend Specialist
**Priority:** High
**Dependencies:** 1-2 (orchestrator needs events)

Implement event-driven coordination:

- Events table as message bus
- 20+ workflow event types
- Agents query events to coordinate
- Complete audit trail
- No external coordination system needed

**Event types:**

- `plan_started`, `feature_assigned`, `feature_started`
- `implementation_complete`, `quality_check_started`, `quality_check_complete`
- `test_started`, `test_passed`, `test_failed`
- `problem_analysis_started`, `solution_proposed`
- `fix_started`, `fix_complete`, `lesson_learned_added`
- `documentation_started`, `documentation_complete`
- `feature_complete`

**Files:**

- `one/events/workflow/` (event log directory)
- `one/events/completed/` (completion events)
- Event type definitions in ontology YAML

---

### 1-4: Knowledge Management System

**Owner:** Integration Specialist
**Priority:** High
**Dependencies:** 1-5 (problem solver adds lessons)

Build knowledge accumulation system:

- `lessons-learned.md` structure
- Pattern library organization
- Lesson capture after fixes
- Knowledge search for agents
- Continuous learning loop

**Structure:**

```markdown
# Lessons Learned

## Backend Patterns

### Pattern Name

- Problem: What went wrong
- Solution: How it was fixed
- Rule: Principle to follow
- Example: Code snippet

## Frontend Patterns

...

## Testing Patterns

...
```

**Files:**

- `one/knowledge/lessons-learned.md`
- `one/knowledge/patterns/backend/`
- `one/knowledge/patterns/frontend/`
- `one/knowledge/patterns/design/`
- `one/knowledge/patterns/test/`

---

### 1-5: Quality Loops and Problem Solving

**Owner:** Backend Specialist + Documentation Specialist
**Priority:** High
**Dependencies:** 1-1, 1-3 (needs quality agent + events)

Implement quality validation and problem solving:

- Quality agent validates against ontology
- Defines user flows and acceptance criteria
- Runs tests after implementation
- Problem solver analyzes failures (ultrathink)
- Proposes solutions, delegates fixes
- Captures lessons learned

**Flow:**

```
Implementation → Quality validates → Tests run
  → PASS: Documenter writes docs
  → FAIL: Problem solver analyzes → Proposes fix → Specialist fixes
    → Add to lessons learned → Re-test
```

**Files:**

- Quality agent logic in orchestrator
- Problem solver prompt (ultrathink mode)
- Test execution framework
- Fix delegation system

---

### 1-6: Numbering and File Structure

**Owner:** Integration Specialist
**Priority:** Medium
**Dependencies:** 1-2 (orchestrator creates files)

Implement hierarchical numbering system:

- Plans: `1-plan-name`
- Features: `1-1-feature-name`, `1-2-feature-name`
- Task lists: `1-1-feature-name-tasks`
- Individual tasks: `1-1-task-1`, `1-1-task-2`
- Events: `events/1-1-feature-name-complete.md`

**Directory structure:**

```
one/
├── things/
│   ├── agents/          # Agent prompts
│   ├── ideas/           # Generated ideas
│   ├── plans/           # Generated plans
│   └── features/        # Generated features
├── knowledge/
│   ├── patterns/        # Implementation patterns
│   └── lessons-learned.md
├── events/
│   ├── workflow/        # Real-time event log
│   └── completed/       # Completion events
├── connections/
│   └── ontology-minimal.yaml
└── workflows/
    └── orchestrator.ts
```

**Benefits:**

- Clear hierarchy
- Easy tracking
- Git-friendly
- Searchable
- Scalable

---

### 1-7: Package ONE Cascade for Distribution

**Owner:** Integration Specialist
**Priority:** High
**Dependencies:** 1-1 through 1-6 (complete system needs to exist)

Package the complete ONE Cascade system for universal distribution and adoption:

**Objectives:**

1. Consolidate all CASCADE files into `/one` directory structure
2. Create production-ready `cascade.yaml` orchestrator configuration
3. Build Claude Code slash command interface (`/one`)
4. Enable anyone to use CASCADE workflow instantly
5. Make system self-documenting and discoverable

**Key Components:**

1. **Move Orchestrator to ONE Directory**
   - Rename: `orchestrator.ts` → `cascade.yaml`
   - Location: `one/things/cascade/cascade.yaml`
   - Reason: YAML-based configuration is simpler than TypeScript
   - Include: Complete workflow definition (6 levels, 8 agents, coordination)

2. **Copy Essential Documentation**
   - From: `one/things/plans/*` (all plan files)
   - To: `one/things/cascade/docs/`
   - Files: workflow.md, agent prompts, examples
   - Purpose: Complete package with all context

3. **Create Claude Code Command**
   - File: `.claude/commands/one.md`
   - Inspiration: `/Users/toc/Server/ONE/import/ONE-Import/.claude/commands/one.md`
   - Interface: Interactive CLI with numbered selection (1-9, A-Z)
   - Features:
     - Main menu with CASCADE status display
     - Quick start actions (1-5): Ideas → Plans → Features → Tasks
     - Specialist teams (6-9): Quality, Testing, Documentation
     - Advanced features (T, W, S): Templates, Workflow Builder, Settings
     - Help system (H, ?)
   - Design: 76-character ASCII, mobile-optimized, progressive disclosure

4. **Package Structure**

```
one/
├── things/
│   ├── cascade/                    # ONE Cascade System
│   │   ├── cascade.yaml           # Main orchestrator config
│   │   ├── docs/
│   │   │   ├── workflow.md        # Complete workflow spec
│   │   │   ├── getting-started.md # Quick start guide
│   │   │   └── examples/          # Usage examples
│   │   └── templates/             # Workflow templates
│   ├── agents/                     # 8 agent prompts (existing)
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
    └── ontology-minimal.yaml       # Ontology (existing)

.claude/
└── commands/
    └── one.md                      # Claude Code slash command
```

5. **CASCADE.yaml Specification**

```yaml
# one/things/cascade/cascade.yaml
name: ONE Cascade
version: 1.0.0
description: Agent-orchestrated workflow using 6-dimension ontology

# The 6-Level Flow
stages:
  1_ideas:
    agent: director
    output: validated idea → plan
    context_tokens: 200
  2_plans:
    agent: director
    output: plan with features collection
    context_tokens: 1500
  3_features:
    agent: specialist
    output: feature specifications
    context_tokens: 1500
    parallel: true
  4_tests:
    agent: quality
    output: user flows + acceptance criteria
    context_tokens: 2000
  5_design:
    agent: design
    output: wireframes + component architecture
    context_tokens: 2000
  6_implementation:
    agents: [specialist, quality, problem-solver, documenter]
    output: working code + documentation
    context_tokens: 2500
    quality_loops: true

# Agent Roles
agents:
  director:
    role: Engineering Director
    responsibilities:
      - Validate ideas against ontology
      - Create plans and assign features
      - Review and refine
      - Create parallel task lists
      - Mark features complete
    prompt_file: one/things/agents/agent-director.md

  specialist:
    role: Implementation Specialist
    types: [backend, frontend, integration]
    responsibilities:
      - Write feature specifications
      - Implement tasks in parallel
      - Fix problems when tests fail
      - Add lessons learned
    prompt_files:
      backend: one/things/agents/agent-backend.md
      frontend: one/things/agents/agent-frontend.md
      integration: one/things/agents/agent-integration.md

  quality:
    role: Quality Agent
    responsibilities:
      - Validate features against ontology
      - Define user flows and acceptance criteria
      - Define technical tests (unit, integration, e2e)
      - Validate implementations
    prompt_file: one/things/agents/agent-quality.md

  design:
    role: Design Agent
    responsibilities:
      - Create wireframes from test criteria
      - Design UI that enables tests to pass
      - Define component architecture
      - Set design tokens
    prompt_file: one/things/agents/agent-designer.md

  problem-solver:
    role: Problem Solver
    responsibilities:
      - Analyze failed tests (ultrathink mode)
      - Determine root cause
      - Propose solutions
      - Delegate fixes to specialists
    prompt_file: one/things/agents/agent-problem-solver.md

  documenter:
    role: Documenter
    responsibilities:
      - Write feature documentation
      - Create user guides
      - Document API changes
      - Update knowledge base
    prompt_file: one/things/agents/agent-documenter.md

# Workflow Events (coordination via events table)
workflow_events:
  - plan_started
  - feature_assigned
  - feature_started
  - implementation_complete
  - quality_check_started
  - quality_check_complete
  - test_started
  - test_passed
  - test_failed
  - problem_analysis_started
  - solution_proposed
  - fix_started
  - fix_complete
  - lesson_learned_added
  - documentation_started
  - documentation_complete
  - feature_complete

# Numbering System
numbering:
  plan: "{plan_number}-{plan-name}"
  feature: "{plan_number}-{feature_number}-{feature-name}"
  task_list: "{plan_number}-{feature_number}-{feature-name}-tasks"
  task: "{plan_number}-{feature_number}-task-{task_number}"
  event: "events/{plan_number}-{feature_number}-{feature-name}-complete.md"

# Coordination Pattern
coordination:
  method: event_driven
  message_bus: events_table
  parallel_execution: true
  quality_loops: enabled
  knowledge_capture: lessons-learned.md
```

6. **Command Interface Highlights**

Based on `/Users/toc/Server/ONE/import/ONE-Import/.claude/commands/one.md`:

- **Main Menu**: ASCII art logo + CASCADE status (Mission 1 COMPLETE: 4.4/5⭐)
- **Quick Start (1-5)**: Turn ideas into reality flow
- **Specialist Teams (6-9)**: Quality & Testing team featured
- **Templates (T)**: 37+ CASCADE workflow templates
- **Workflow Builder (W)**: Custom workflow creation
- **System Settings (S)**: Quality gates, agent config
- **Help (H, ?)**: Tutorials and command reference
- **Design**: 76-char width, mobile-optimized, no responsivity needed

**Files to Create:**

- `one/things/cascade/cascade.yaml` (complete orchestrator config)
- `one/things/cascade/docs/getting-started.md` (quick start guide)
- `one/things/cascade/docs/workflow.md` (copy from `one/things/plans/workflow.md`)
- `one/things/cascade/templates/` (directory for workflow templates)
- `.claude/commands/one.md` (slash command interface)

**Migration Steps:**

1. Create `one/things/cascade/` directory
2. Create `cascade.yaml` with complete workflow specification
3. Copy relevant docs from `one/things/plans/*`
4. Create `.claude/commands/` directory
5. Create `one.md` command file with full interface
6. Test `/one` command functionality
7. Validate all agent prompts accessible
8. Ensure workflow executes end-to-end

**Success Criteria:**

- [ ] Complete CASCADE system in `/one` directory
- [ ] `cascade.yaml` defines entire workflow (no code needed)
- [ ] `/one` command provides intuitive interface
- [ ] All 8 agent prompts accessible from system
- [ ] Workflow executes: ideas → plans → features → tests → design → implementation
- [ ] Quality loops work (failed tests trigger problem solver)
- [ ] Knowledge accumulates in lessons-learned.md
- [ ] System is self-documenting and discoverable
- [ ] Anyone can `git clone` and use CASCADE immediately

**Benefits:**

- ✅ Universal distribution (copy `/one` directory + `.claude/commands/one.md`)
- ✅ Zero setup required (complete package)
- ✅ Self-documenting (docs included)
- ✅ Production-ready (tested workflow)
- ✅ Extensible (YAML-based configuration)
- ✅ Developer-friendly (slash command interface)
- ✅ Complete system (agents, workflow, docs, templates)

---

## Architecture (from Ontology)

### Things

- `agent`, `idea`, `plan`, `feature`, `test`, `design`, `task`, `lesson`

### Connections

- `validates`, `creates`, `assigns_to`, `part_of`, `tests_for`, `designs_for`
- `implements`, `reviews`, `solves`, `documents`

### Events

- 20+ workflow event types for coordination
- Events table IS the message bus
- No external coordination needed

### Knowledge

- Agent prompts (behavior definitions)
- Pattern library (implementation guidance)
- Lessons learned (institutional knowledge)
- Event history (audit trail)

---

## Success Metrics

### Phase 1 (Weeks 1-2): Foundation

- [ ] 6 agent prompts written and tested
- [ ] Basic orchestrator reads YAML and executes
- [ ] Numbering system creates files correctly
- [ ] Events logged to track progress
- [ ] Can complete simple idea → plan → feature flow

### Phase 2 (Weeks 2-3): Quality Loops

- [ ] Quality agent defines tests
- [ ] Design agent creates wireframes
- [ ] Tests run and validate implementations
- [ ] Problem solver handles failures
- [ ] Lessons learned captured

### Phase 3 (Weeks 3-4): Integration

- [ ] Complete workflow idea → implementation works
- [ ] Parallel execution of tasks
- [ ] Event-driven coordination autonomous
- [ ] Knowledge base accumulates patterns
- [ ] 5x faster than manual process

### Phase 4 (Week 4): Packaging

- [ ] CASCADE packaged in `/one` directory
- [ ] `cascade.yaml` orchestrator complete
- [ ] `/one` command interface functional
- [ ] Documentation copied and organized
- [ ] Getting-started guide written
- [ ] Template library created

### Phase 5 (Weeks 5-6): Testing & Refinement

- [ ] Test on real features
- [ ] Measure context reduction (target: 98%)
- [ ] Measure speed improvement (target: 5x)
- [ ] Test universal distribution (git clone → use)
- [ ] Gather developer feedback
- [ ] Iterate and improve
- [ ] Documentation complete
- [ ] Ready for public release

---

## Implementation Order

### Week 1: Agent Prompts + Basic Orchestrator

1. **1-1 (Agent Prompts):** Write all 8 agent role prompts
2. **1-6 (File Structure):** Set up directory structure
3. **1-2 (Orchestrator):** Build basic flow (ideas → plans → features)

### Week 2: Events + Quality

4. **1-3 (Events):** Implement event coordination
5. **1-5 (Quality):** Add quality validation and testing

### Week 3: Problem Solving + Knowledge

6. **1-5 (Problem Solver):** Ultrathink mode for failures
7. **1-4 (Knowledge):** Lessons learned system

### Week 4: Packaging + Distribution

8. **1-7 (Package CASCADE):** Create production-ready distribution
   - Create `cascade.yaml` orchestrator configuration
   - Copy docs to `one/things/cascade/docs/`
   - Build `.claude/commands/one.md` slash command interface
   - Create getting-started guide and templates

### Week 5-6: Testing + Refinement

9. Test complete workflow on sample features
10. Measure performance and quality
11. Test `/one` command interface
12. Validate universal distribution package
13. Iterate based on real usage
14. Write final documentation

---

## Parallel Execution

**Tasks that can run in parallel:**

Week 1:

- 1-1 (Agent Prompts) + 1-6 (File Structure) can run simultaneously
- 1-2 (Orchestrator) depends on both

Week 2:

- 1-3 (Events) + 1-5 (Quality basics) can run simultaneously

Week 3:

- 1-5 (Problem Solver) + 1-4 (Knowledge) can run simultaneously

---

## Risk Management

### Risk: Complexity Creep

**Mitigation:** Keep orchestrator under 200 lines. If more complex, simplify workflow.

### Risk: Agents Don't Coordinate Well

**Mitigation:** Use simple event patterns. Add more event types if needed.

### Risk: Knowledge Base Not Used

**Mitigation:** Make problem solver always reference lessons learned. Show value immediately.

### Risk: Too Slow

**Mitigation:** Measure at each phase. Optimize context loading. Parallelize aggressively.

### Risk: Developers Reject It

**Mitigation:** Get feedback early. Make it optional. Prove value with metrics.

---

## Next Steps

1. **Feature 1-1:** Create agent prompt specifications
2. **Feature 1-6:** Set up file structure
3. **Feature 1-2:** Build basic orchestrator
4. **Feature 1-3:** Add event coordination
5. **Feature 1-5:** Implement quality loops
6. **Feature 1-4:** Build knowledge management
7. **Feature 1-7:** Package CASCADE for distribution

Each feature will have:

- Feature specification (what we're building)
- Tests (user flows + acceptance criteria)
- Design (structure and components)
- Implementation (working code)

**Final Deliverable:** Complete ONE Cascade system that anyone can use by:
1. `git clone` the repository
2. Run `/one` command in Claude Code
3. Start turning ideas into reality with 8 AI agents

---

## References

- **Idea:** `one/things/ideas/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md`
- **Ontology:** `one/knowledge/ontology-minimal.yaml`

---

**Status:** Ready to proceed to Feature specs (Level 3)

**Director note:** This plan uses the workflow system to build itself. Each feature follows the 6-level flow. We're bootstrapping our way to infinity.

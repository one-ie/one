# Design for Feature 1-6: Numbering Structure and File Organization

**Feature:** 1-6-numbering-structure
**Status:** Design → Implementation
**Design Agent:** agent-designer.md

---

## Design Goal

Enable intuitive hierarchical organization using sequential numbering without building parsing infrastructure. Design focuses on how Claude Code naturally understands and uses the numbering convention.

---

## CLI Context

**Numbering is implicit** - Claude understands hierarchy naturally:
- `1` = Plan 1
- `1-1` = Feature 1 of Plan 1
- `1-1-task-3` = Task 3 of Feature 1-1

**Commands work with any level:**
```bash
/one plan 1                        # Work on Plan 1
/one feature 1-1                   # Work on Feature 1-1
/one task 1-1-task-3               # Work on Task 3
/one show 1                        # Show Plan 1 hierarchy
/one show 1-1                      # Show Feature 1-1 breakdown
```

---

## Design Decisions (Test-Driven)

### Decision 1: Convention Over Code - AI Understands Numbers
**Test requirement:** Claude parses IDs in < 10ms without code
**Design solution:**
- Numbering pattern: `{N}`, `{N}-{M}`, `{N}-{M}-task-{K}`
- File paths follow pattern: `one/things/plans/{N}-{name}.md`
- Claude understands pattern from documentation
- No parser code needed

**Reasoning:** Claude's natural language understanding > regex parsing.

---

### Decision 2: Hierarchy Visible in File Paths
**Test requirement:** Users can navigate filesystem intuitively
**Design solution:**
```
one/things/
├── plans/
│   ├── 1-create-workflow.md          ← Plan level
│   ├── 2-course-platform.md
│   └── 3-creator-tools.md
├── features/
│   ├── 1-1-agent-prompts.md          ← Feature level (Plan 1)
│   ├── 1-2-yaml-orchestrator.md
│   ├── 2-1-course-crud.md            ← Feature level (Plan 2)
│   ├── 2-2-lesson-management.md
│   └── 1-1-agent-prompts/            ← Feature subdirectory
│       ├── tests.md
│       ├── design.md
│       └── tasks/                    ← Task level
│           ├── 1-1-task-1-create-director.md
│           ├── 1-1-task-2-create-backend.md
│           └── 1-1-task-3-create-frontend.md
```

**Reasoning:** Filesystem structure mirrors logical hierarchy. No database needed.

---

### Decision 3: Numbers Are Sequential and Auto-Assigned
**Test requirement:** Users don't manually track numbers
**Design solution:**
```
User: /one plan "Create workflow system"

Claude: [Checks existing plans: ls one/things/plans/]
        [Finds: 0 plans exist]
        [Assigns: Plan 1]

Creating Plan 1: Create Workflow System...

User: /one feature "Agent prompts"

Claude: [Checks current plan: 1]
        [Checks existing features for plan 1: ls one/things/features/1-*.md]
        [Finds: 0 features exist]
        [Assigns: Feature 1-1]

Creating Feature 1-1: Agent Prompts...

User: /one feature "Orchestrator"

Claude: [Checks plan 1 features]
        [Finds: 1-1 exists]
        [Assigns: Feature 1-2]

Creating Feature 1-2: Orchestrator...
```

**Reasoning:** Automatic numbering prevents conflicts and reduces cognitive load.

---

### Decision 4: Hierarchy Commands Show Structure
**Test requirement:** User can visualize plan/feature breakdown
**Design solution:**
```
$ /one show 1

Claude Code:
Plan 1: Create Workflow System

Hierarchy:
📋 Plan 1: Create Workflow System
├── 📝 Feature 1-1: Agent Prompts System
│   ├── 📄 1-1-task-1: Create director agent
│   ├── 📄 1-1-task-2: Create backend agent
│   ├── 📄 1-1-task-3: Create frontend agent
│   ├── 📄 1-1-task-4: Create integration agent
│   ├── 📄 1-1-task-5: Create quality agent
│   ├── 📄 1-1-task-6: Create designer agent
│   ├── 📄 1-1-task-7: Create problem solver agent
│   └── 📄 1-1-task-8: Create documenter agent
├── 📝 Feature 1-2: YAML Orchestrator
│   ├── 📄 1-2-task-1: Document workflow stages
│   └── 📄 1-2-task-2: Create workflow guide
├── 📝 Feature 1-3: Event Coordination
├── 📝 Feature 1-4: Knowledge Management
├── 📝 Feature 1-5: Quality Loops
└── 📝 Feature 1-6: Numbering Structure

Status:
  Completed: 1-1 ✅, 1-2 ✅, 1-3 ✅, 1-4 ✅, 1-5 ✅
  In Progress: 1-6 🔄
  Not Started: None

Progress: 83% (5/6 features complete)
```

**Reasoning:** Visual hierarchy helps users understand scope and progress.

---

### Decision 5: Cross-References Use Numbering
**Test requirement:** Easy to reference related work
**Design solution:**
```markdown
# Feature 1-2: YAML Orchestrator

**Dependencies:**
- Feature 1-1: Agent Prompts (must exist to orchestrate)

**References:**
- See Plan 1: one/things/plans/1-create-workflow.md
- See Feature 1-3: Event coordination for event types
- See Feature 1-6: Numbering structure for file paths

**Related Tasks:**
- 1-2-task-1: Document workflow stages
- 1-2-task-2: Create workflow guide
```

**Reasoning:** Numbers provide stable, short references. No UUIDs needed.

---

## Component Architecture

### 1. Numbering Convention (Claude's Mental Model)

```typescript
// Conceptual - Claude understands this pattern naturally

Level 1: Plans        → {N}-{plan-name}.md
Level 2: Features     → {N}-{M}-{feature-name}.md
Level 3: Tasks        → {N}-{M}-task-{K}-{task-name}.md

Examples:
  1-create-workflow.md              (Plan 1)
  1-1-agent-prompts.md              (Plan 1, Feature 1)
  1-1-task-1-create-director.md     (Plan 1, Feature 1, Task 1)
  2-course-platform.md              (Plan 2)
  2-1-course-crud.md                (Plan 2, Feature 1)
  2-1-task-1-create-service.md      (Plan 2, Feature 1, Task 1)

Pattern matching:
  /^(\d+)$/                        → Plan
  /^(\d+)-(\d+)$/                  → Feature
  /^(\d+)-(\d+)-task-(\d+)$/       → Task
```

**No regex needed** - Claude matches patterns naturally from examples.

---

### 2. File Path Convention

```
one/things/
├── ideas/                         (Optional - validation records)
│   └── {N}-{idea-name}.md
├── plans/                         (Level 1: Plans)
│   └── {N}-{plan-name}.md
├── features/                      (Level 2: Features)
│   ├── {N}-{M}-{feature-name}.md
│   └── {N}-{M}-{feature-name}/   (Feature subdirectory)
│       ├── tests.md               (Stage 4: Test criteria)
│       ├── design.md              (Stage 5: Design spec)
│       ├── lessons.md             (Optional: Lessons from this feature)
│       └── tasks/                 (Level 3: Tasks)
│           └── {N}-{M}-task-{K}-{task-name}.md
└── knowledge/
    ├── lessons-learned.md         (Global lessons)
    └── patterns/                  (Pattern templates)
```

**Claude navigates using ls/Read/Write tools** - No filesystem abstraction needed.

---

### 3. Auto-Assignment Logic (AI-Native)

```markdown
# How Claude assigns numbers

User: /one plan "Course platform"

Claude thinks:
1. List existing plans: ls one/things/plans/*.md
2. Extract numbers: 1-create-workflow.md → 1
3. Find highest: max(1) = 1
4. Assign next: 1 + 1 = 2
5. Create: 2-course-platform.md

User: /one feature "Course CRUD"

Claude thinks:
1. Determine current plan: 2 (from context or user specified)
2. List features for plan 2: ls one/things/features/2-*.md
3. Extract numbers: None found (first feature)
4. Assign: 2-1
5. Create: 2-1-course-crud.md

User: /one task "Create service"

Claude thinks:
1. Determine current feature: 2-1 (from context)
2. List tasks: ls one/things/features/2-1-course-crud/tasks/*.md
3. Extract numbers: None found (first task)
4. Assign: 2-1-task-1
5. Create: 2-1-task-1-create-service.md
```

**No counter database** - Just filesystem + natural language understanding.

---

## Wireframes (CLI Outputs)

### Wireframe 1: First Plan Assignment

```
$ /one plan "Create workflow system"

Claude Code (Engineering Director):
Assigning plan number...

[Checks: ls one/things/plans/*.md]
[Found: 0 existing plans]
[Assigns: Plan 1]

Creating Plan 1: Create Workflow System...

✅ Plan 1 created!
   File: one/things/plans/1-create-workflow.md
   Features: 6 planned
   Duration: 4-6 weeks

Next: Create feature specs
  /one feature 1-1
  /one feature 1-2
  ... etc
```

---

### Wireframe 2: Sequential Feature Assignment

```
$ /one feature "Agent prompts"

Claude Code (Backend Specialist):
Assigning feature number for Plan 1...

[Checks: ls one/things/features/1-*.md]
[Found: 0 features for plan 1]
[Assigns: Feature 1-1]

Creating Feature 1-1: Agent Prompts System...

✅ Feature 1-1 created!
   File: one/things/features/1-1-agent-prompts.md
   Plan: 1 (Create Workflow System)

$ /one feature "Orchestrator"

Claude Code (Backend Specialist):
Assigning feature number for Plan 1...

[Checks: ls one/things/features/1-*.md]
[Found: 1-1-agent-prompts.md]
[Latest: 1-1]
[Assigns: Feature 1-2]

Creating Feature 1-2: YAML Orchestrator...

✅ Feature 1-2 created!
   File: one/things/features/1-2-yaml-orchestrator.md
   Plan: 1 (Create Workflow System)
```

---

### Wireframe 3: Task Breakdown

```
$ /one tasks 1-1

Claude Code (Engineering Director):
Breaking down Feature 1-1 (Agent Prompts) into tasks...

Creating tasks:
  1-1-task-1: Create director agent (agent-director.md)
  1-1-task-2: Create backend agent (agent-backend.md)
  1-1-task-3: Create frontend agent (agent-frontend.md)
  1-1-task-4: Create integration agent (agent-integration.md)
  1-1-task-5: Create quality agent (agent-quality.md)
  1-1-task-6: Create designer agent (agent-designer.md)
  1-1-task-7: Create problem solver agent (agent-problem-solver.md)
  1-1-task-8: Create documenter agent (agent-documenter.md)

✅ 8 tasks created!
   Directory: one/things/features/1-1-agent-prompts/tasks/

Progress tracking:
  /one show 1-1        (view task status)
  /one task 1-1-task-1 (work on specific task)
```

---

### Wireframe 4: Hierarchy Visualization

```
$ /one show 1

Claude Code:
Plan 1: Create Workflow System

📋 Plan 1: Create Workflow System (4-6 weeks)
│
├─ 📝 Feature 1-1: Agent Prompts System ✅ Complete
│  ├─ 📄 1-1-task-1: Create director agent ✅
│  ├─ 📄 1-1-task-2: Create backend agent ✅
│  ├─ 📄 1-1-task-3: Create frontend agent ✅
│  ├─ 📄 1-1-task-4: Create integration agent ✅
│  ├─ 📄 1-1-task-5: Create quality agent ✅
│  ├─ 📄 1-1-task-6: Create designer agent ✅
│  ├─ 📄 1-1-task-7: Create problem solver agent ✅
│  └─ 📄 1-1-task-8: Create documenter agent ✅
│
├─ 📝 Feature 1-2: YAML Orchestrator ✅ Complete
│  ├─ 📄 1-2-task-1: Document workflow stages ✅
│  └─ 📄 1-2-task-2: Create workflow guide ✅
│
├─ 📝 Feature 1-3: Event Coordination ✅ Complete
│  └─ 📄 1-3-task-1: Document event conventions ✅
│
├─ 📝 Feature 1-4: Knowledge Management ✅ Complete
│  ├─ 📄 1-4-task-1: Create lesson template ✅
│  └─ 📄 1-4-task-2: Create pattern templates ✅
│
├─ 📝 Feature 1-5: Quality Loops ✅ Complete
│  ├─ 📄 1-5-task-1: Document quality workflow ✅
│  └─ 📄 1-5-task-2: Create test templates ✅
│
└─ 📝 Feature 1-6: Numbering Structure 🔄 In Progress
   ├─ 📄 1-6-task-1: Document numbering conventions ✅
   └─ 📄 1-6-task-2: Create hierarchy visualization 🔄

Summary:
  Features: 6 total
  Completed: 5 (83%)
  In Progress: 1 (17%)
  Tasks: 18 total
  Completed: 17 (94%)
  In Progress: 1 (6%)

Estimated completion: 95% done
Remaining work: ~30 minutes
```

---

### Wireframe 5: Cross-Reference Navigation

```
$ /one show 1-2

Claude Code:
Feature 1-2: YAML Orchestrator

📝 Feature 1-2: YAML Orchestrator ✅ Complete
   Plan: 1 (Create Workflow System)
   Assigned to: Backend Specialist
   Status: Documentation-only (simplified approach)

Files:
   Spec: one/things/features/1-2-yaml-orchestrator.md
   Tests: one/things/features/1-2-yaml-orchestrator/tests.md
   Design: one/things/features/1-2-yaml-orchestrator/design.md

Tasks:
   ✅ 1-2-task-1: Document workflow stages
   ✅ 1-2-task-2: Create workflow guide

Dependencies:
   ← Feature 1-1: Agent Prompts (completed ✅)
   → Used by all features (workflow guide)

References:
   Mentioned in: 1-1, 1-3, 1-4, 1-5, 1-6

Duration: 30 minutes
Completed: 2025-01-15

View:
  /one show 1              (Plan hierarchy)
  /one show 1-1            (Previous feature)
  /one show 1-3            (Next feature)
```

---

### Wireframe 6: Multi-Plan Overview

```
$ /one plans

Claude Code:
All Plans Overview

📋 Plans:

Plan 1: Create Workflow System ✅ Complete
  Features: 6/6 (100%)
  Duration: 4 weeks (estimated 4-6 weeks)
  Completed: 2025-01-20

Plan 2: Course Platform 🔄 In Progress
  Features: 4/5 (80%)
  Duration: 2 weeks (estimated 2-3 weeks)
  Progress:
    ✅ 2-1: Course CRUD
    ✅ 2-2: Lesson Management
    ✅ 2-3: Course UI
    ✅ 2-4: Student Enrollment
    🔄 2-5: Payment Processing

Plan 3: Creator Tools ⏳ Not Started
  Features: 0/7 (0%)
  Planned start: 2025-02-01

Summary:
  Total plans: 3
  Completed: 1
  In progress: 1
  Not started: 1
  Total features: 18
  Completed: 15 (83%)

Commands:
  /one show 1    (Plan 1 details)
  /one show 2    (Plan 2 details)
  /one show 3    (Plan 3 details)
```

---

## Design Tokens

### Hierarchy Icons
```
📋 Plan level (top level)
📝 Feature level (plan breakdown)
📄 Task level (feature breakdown)
```

### Status Icons
```
✅ Complete
🔄 In Progress
⏳ Not Started
⚠️  Blocked
❌ Failed
```

### Tree Structure
```
├─ Branch continues
└─ Last branch
│  Vertical connection
```

---

## Accessibility

### Screen Reader Friendly
- Hierarchy levels spoken clearly
- Numbers pronounced with context ("Plan 1", "Feature 1-1", "Task 1-1-task-1")
- Tree structure described logically
- Status indicators have text equivalents

### Keyboard Navigation
- All numbering commands text-based
- No mouse required for hierarchy navigation
- Tab completion: `/one show [tab]` suggests valid IDs

### Error Recovery
- Invalid ID: "Feature 1-9 not found. Valid features for Plan 1: 1-1, 1-2, 1-3, 1-4, 1-5, 1-6"
- Missing plan: "Plan 5 doesn't exist. Existing plans: 1, 2, 3"
- Suggestions for typos: "Did you mean 1-1 instead of 11?"

---

## Success Criteria from Tests

### User Flows
- ✅ User creates plan (auto-assigned number)
- ✅ User creates features (sequential numbering)
- ✅ User breaks down into tasks (nested numbering)
- ✅ User navigates hierarchy easily
- ✅ User references work by number

### Acceptance Criteria
- ✅ Number parsing: < 10ms (pattern matching)
- ✅ Auto-assignment: Correct sequential numbers
- ✅ File organization: Mirrors logical hierarchy
- ✅ Navigation: Intuitive filesystem structure
- ✅ Cross-references: Stable, short IDs

---

## Implementation Notes

**No numbering infrastructure to build** - Just conventions:
1. Numbering pattern documented ✅ (in Feature 1-6 spec)
2. File path convention ✅ (mirrors hierarchy)
3. Auto-assignment logic ✅ (filesystem + AI)
4. Hierarchy visualization ✅ (tree structure)

**Claude Code handles numbering** by:
- Checking filesystem for existing numbers (ls)
- Understanding pattern from documentation
- Assigning next sequential number
- Creating files in conventional locations

---

## Next Steps

Ready for Level 6 (Implementation):
- Numbering convention documented ✅ (Feature 1-6 spec)
- File organization structure ✅ (this document)
- Hierarchy visualization ✅ (CLI wireframes)
- Implementation is using conventions

---

**Status:** ✅ Design Complete

**Key Design Insights:**
1. **Convention over code** - AI understands patterns without parsing
2. **Filesystem mirrors logic** - Directory structure = hierarchy
3. **Sequential auto-assignment** - No manual number tracking
4. **Stable references** - Numbers don't change, no UUIDs
5. **Visual hierarchy** - Tree structure shows relationships

**The design is sequential numbering + filesystem organization + AI pattern understanding.** 🎯

**Numbering in action:**
```
User: /one plan "Build X"
Claude: [Checks filesystem] → Assigns Plan 1

User: /one feature "Do Y"
Claude: [Knows plan 1, checks features] → Assigns Feature 1-1

User: /one task "Implement Z"
Claude: [Knows feature 1-1, checks tasks] → Assigns Task 1-1-task-1

Result: Clean hierarchy, intuitive navigation, stable references
```

**No parsing code. Just conventions + AI understanding.** 🔢

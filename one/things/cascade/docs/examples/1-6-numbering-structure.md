# Feature 1-6: Numbering and File Structure

**Assigned to:** Integration Specialist Agent (agent-integration.md)
**Status:** ⚠️ SIMPLIFIED - Convention over code
**Plan:** 1-create-workflow
**Priority:** Low (mostly documentation)
**Dependencies:** None (AI agents handle this naturally)

---

## Simplified Approach: Convention over Code

**Key Insight:** AI agents can read, understand, and follow numbering conventions without complex infrastructure.

### Why No Code Needed

1. **AI reads existing files**
   ```bash
   ls one/things/features/
   # Output: 1-1-agent-prompts.md, 1-2-yaml-orchestrator.md
   # AI: "Pattern is {plan}-{feature}-{name}, next is 1-3-..."
   ```

2. **AI understands hierarchy naturally**
   - Sees `1-1-agent-prompts.md` → knows it's Plan 1, Feature 1
   - Sees `1-2-yaml-orchestrator.md` → knows next is `1-3-*`
   - No parsing code needed

3. **AI creates files with correct naming**
   - Prompt: "Create next feature for plan 1"
   - AI: Checks directory, sees 1-1, 1-2, creates 1-3
   - Uses Write tool with correct path

4. **Markdown is self-documenting**
   - File header contains metadata
   - Relationships clear from content
   - No database needed

**What we actually need:** Documentation of conventions (this file), not implementation code.

---

## Feature Specification

### What We're Documenting

A hierarchical numbering and file structure convention that:
1. **Numbers** plans, features, and tasks in a clear hierarchy
2. **Organizes** files in a consistent, searchable structure
3. **Scales** from 1 plan to 1000+ without confusion
4. **Integrates** with git (filenames sort naturally)

**Philosophy:** Convention over code. AI agents follow patterns, not parsers.

---

## Ontology Types

### Things
- `plan` - Collection of features
  - Numbering: `{N}-{plan-name}` (e.g., `1-create-workflow`)
- `feature` - Specification of what to build
  - Numbering: `{N}-{M}-{feature-name}` (e.g., `1-1-agent-prompts`)
- `task` - Individual unit of work
  - Numbering: `{N}-{M}-task-{K}` (e.g., `1-1-task-1`)

### Connections
- `part_of` - Feature is part of plan, task is part of feature
- `follows` - Sequential ordering within hierarchy

### Events
- `plan_numbered` - Plan assigned number
  - Metadata: `planId`, `planNumber`
- `feature_numbered` - Feature assigned number
  - Metadata: `featureId`, `planId`, `featureNumber`
- `task_numbered` - Task assigned number
  - Metadata: `taskId`, `featureId`, `taskNumber`

---

## Numbering System

### Hierarchy Levels

```
Plan level:       N-plan-name           (e.g., 1-create-workflow)
Feature level:    N-M-feature-name      (e.g., 1-1-agent-prompts)
Task list level:  N-M-feature-name-tasks (e.g., 1-1-agent-prompts-tasks)
Task level:       N-M-task-K            (e.g., 1-1-task-1)
```

### Numbering Rules

1. **Plans start at 1** and increment sequentially
   - `1-create-workflow`
   - `2-course-platform`
   - `3-auth-system`

2. **Features inherit plan number** and add feature number
   - Plan 1: `1-1-first-feature`, `1-2-second-feature`
   - Plan 2: `2-1-first-feature`, `2-2-second-feature`

3. **Task lists** add `-tasks` suffix to feature ID
   - Feature `1-1-agent-prompts` → Task list `1-1-agent-prompts-tasks`

4. **Tasks** use feature number + task number
   - Task list `1-1-agent-prompts-tasks` → `1-1-task-1`, `1-1-task-2`

5. **Events** use full feature or task ID
   - `events/completed/1-1-agent-prompts-complete.md`
   - `events/completed/1-1-task-1-complete.md`

---

## File Structure

### Directory Layout

```
one/
├── things/
│   ├── agents/              # Agent prompts (no numbers, reusable)
│   │   ├── agent-director.md
│   │   ├── agent-backend.md
│   │   ├── agent-frontend.md
│   │   ├── agent-integration.md
│   │   ├── agent-quality.md
│   │   ├── agent-designer.md
│   │   ├── agent-problem-solver.md
│   │   ├── agent-documenter.md
│   │   ├── agent-builder.md
│   │   ├── agent-sales.md
│   │   ├── agent-clean.md
│   │   └── agent-clone.md
│   │
│   ├── ideas/               # Validated ideas (optional)
│   │   ├── 1-create-workflow.md
│   │   ├── 2-course-platform.md
│   │   └── ...
│   │
│   ├── plans/               # Plans with feature collections
│   │   ├── 1-create-workflow.md
│   │   ├── 2-course-platform.md
│   │   └── ...
│   │
│   └── features/            # Feature specifications
│       ├── 1-1-agent-prompts.md
│       ├── 1-2-yaml-orchestrator.md
│       ├── 1-3-event-coordination.md
│       ├── 1-4-knowledge-base.md
│       ├── 1-5-quality-system.md
│       ├── 1-6-numbering-structure.md
│       ├── 1-1-agent-prompts/   # Feature subdirectory (if needed)
│       │   ├── tests.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── ...
│
├── knowledge/
│   ├── patterns/            # Implementation patterns (category-based)
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── design/
│   │   └── test/
│   └── lessons-learned.md   # Accumulated knowledge
│
├── events/
│   ├── workflow/            # Real-time event log (timestamped) - future
│   │   ├── 1705315800000-feature_started-1-1-agent-prompts.md
│   │   └── ...
│   └── completed/           # Completion milestones (feature-based) - future
│       ├── 1-1-agent-prompts-complete.md
│       └── ...
│
├── connections/
│   ├── ontology.md          # Complete ontology specification
│   └── ontology-minimal.yaml # Minimal YAML reference (if needed)
│
└── workflows/               # Future implementation area
    ├── orchestrator.ts      # YAML-driven orchestrator (Feature 1-2)
    ├── events/              # Event coordination (Feature 1-3)
    ├── quality/             # Quality system (Feature 1-5)
    └── knowledge/           # Knowledge base (Feature 1-4)
```

---

## Numbering Assignment

### Process

#### 1. Plan Numbering (Director Agent)

**When:** Idea validated and approved as plan

**Process:**
1. Query existing plans: `SELECT MAX(planNumber) FROM plans`
2. Increment: `nextPlanNumber = maxPlanNumber + 1`
3. Assign: `planId = "${nextPlanNumber}-${planName}"`
4. Create: `one/things/plans/${planId}.md`
5. Log event: `plan_numbered`

**Example:**
```typescript
// Existing plans: 0 (none yet)
ideaName = "create-workflow"
planNumber = 1
planId = "1-create-workflow"
// Creates: one/things/plans/1-create-workflow.md
```

#### 2. Feature Numbering (Director Agent)

**When:** Director breaks plan into features

**Process:**
1. Get plan number from plan ID: `planNumber = 1`
2. Query existing features for this plan: `SELECT MAX(featureNumber) FROM features WHERE planId = "1-*"`
3. Increment: `nextFeatureNumber = maxFeatureNumber + 1`
4. Assign: `featureId = "${planNumber}-${nextFeatureNumber}-${featureName}"`
5. Create: `one/things/features/${featureId}.md`
6. Log event: `feature_numbered`

**Example:**
```typescript
// Plan: 1-create-workflow
// Existing features for plan 1: 2 (1-1, 1-2)
featureName = "event-coordination"
planNumber = 1
featureNumber = 3
featureId = "1-3-event-coordination"
// Creates: one/things/features/1-3-event-coordination.md
```

#### 3. Task Numbering (Director Agent)

**When:** Director creates tasks for feature implementation

**Process:**
1. Get feature ID: `featureId = "1-1-agent-prompts"`
2. Create task list ID: `taskListId = "${featureId}-tasks"`
3. For each task:
   - Assign: `taskId = "${planNumber}-${featureNumber}-task-${taskNumber}"`
   - Create: Entry in task list file
4. Create: `one/things/features/${featureId}/tasks.md`
5. Log event: `tasks_created`

**Example:**
```typescript
// Feature: 1-1-agent-prompts
// Tasks: 6
taskIds = [
  "1-1-task-1",  // Create director prompt
  "1-1-task-2",  // Create specialist prompts
  "1-1-task-3",  // Create quality prompt
  "1-1-task-4",  // Create design prompt
  "1-1-task-5",  // Create problem solver prompt
  "1-1-task-6",  // Create documenter prompt
]
// Creates: one/things/features/1-1-agent-prompts/tasks.md
```

---

## File Naming Conventions

### Markdown Files

#### Ideas
- Format: `{N}-{idea-name}.md`
- Example: `1-create-workflow.md`
- Location: `one/things/ideas/`

#### Plans
- Format: `{N}-{plan-name}.md`
- Example: `1-create-workflow.md`
- Location: `one/things/plans/`

#### Features
- Format: `{N}-{M}-{feature-name}.md`
- Example: `1-1-agent-prompts.md`
- Location: `one/things/features/`

#### Feature Subdirectories (optional)
- Format: `{N}-{M}-{feature-name}/`
- Contains: `tests.md`, `design.md`, `tasks.md`
- Example: `one/things/features/1-1-agent-prompts/tests.md`

#### Events
- **Workflow events:** `{timestamp}-{event_type}-{targetId}.md`
  - Example: `1705315800000-feature_started-1-1-agent-prompts.md`
  - Location: `one/events/workflow/`

- **Completion events:** `{featureId}-complete.md`
  - Example: `1-1-agent-prompts-complete.md`
  - Location: `one/events/completed/`

---

## How AI Agents Use This

### Pattern Recognition (No Code Needed)

**When creating a new feature:**
1. Agent reads this doc to understand convention
2. Agent runs `ls one/things/features/` to see existing files
3. Agent identifies pattern: `{plan}-{feature}-{name}.md`
4. Agent finds highest feature number for the plan
5. Agent increments and creates next file

**Example:**
```
AI sees: 1-1-agent-prompts.md, 1-2-yaml-orchestrator.md
AI understands: Plan 1, features 1 and 2 exist
AI creates: 1-3-event-coordination.md (next in sequence)
```

### Validation (Natural Language)

AI agents validate by:
- Checking file exists before referencing
- Ensuring numbers match pattern
- Verifying parent exists (plan before features)
- Following conventions from this document

**No code needed** - AI understands from examples and patterns.

---

## Benefits

### 1. Clear Hierarchy
```
1-create-workflow               ← Plan 1
├── 1-1-agent-prompts           ← Feature 1 of Plan 1
│   ├── 1-1-task-1              ← Task 1 of Feature 1-1
│   └── 1-1-task-2              ← Task 2 of Feature 1-1
└── 1-2-yaml-orchestrator       ← Feature 2 of Plan 1
    ├── 1-2-task-1              ← Task 1 of Feature 1-2
    └── 1-2-task-2              ← Task 2 of Feature 1-2
```

### 2. Easy Tracking
- `grep "1-1-" -r .` → Find everything related to feature 1-1
- `ls one/things/features/1-*.md` → All features from plan 1
- `cat one/events/completed/1-1-*.md` → All completions for feature 1-1

### 3. Git-Friendly
- Files sort naturally: `1-1-*.md` before `1-2-*.md`
- Numbered commits: `feat: implement 1-1-agent-prompts`
- Branches: `feature/1-1-agent-prompts`
- PRs: `[1-1] Agent Prompts System`

### 4. Scalable
- Handles 999 plans (unlikely to exceed)
- Handles 999 features per plan (more than enough)
- Handles 999 tasks per feature (extreme)
- Clear even at 100+ features

### 5. Searchable
- ID in any context reveals hierarchy
- `1-1-task-3` → Plan 1, Feature 1, Task 3
- No ambiguity
- No need to check parent references

---

## Scope

### In Scope (Documentation Only)
- ✅ Numbering rules and conventions (documented below)
- ✅ File structure and organization (documented below)
- ✅ Examples agents can reference
- ✅ File naming patterns
- ✅ Directory layout conventions

### Out of Scope (Don't Build)
- ❌ TypeScript numbering logic (AI does this naturally)
- ❌ ID parsing libraries (AI understands from context)
- ❌ Validation functions (AI validates from patterns)
- ❌ File system utilities (AI uses Read/Write/Glob tools)
- ❌ Migration from old system (no old system yet)
- ❌ Renumbering after deletions (keep gaps for history)
- ❌ Custom numbering schemes (stick to hierarchy)

---

## Files to Create

**None.** This is a convention document, not an implementation.

AI agents reference this document to understand numbering conventions when creating files.

**Optional:** Simple bash helpers for manual use (not required for AI workflow)
```bash
# bin/next-feature-number.sh
ls one/things/features/ | grep "^${1}-" | tail -1 | cut -d'-' -f2

# Usage: ./bin/next-feature-number.sh 1
# Output: 2 (if 1-1 exists, next is 1-2)
```

---

## Integration Points (Convention-based)

### With Feature 1-1 (Agent Prompts)
- ✅ Agent files use `agent-{role}.md` pattern (not numbered, reusable)
- ✅ Located in `one/things/agents/`
- ✅ 12 agent files implemented

### With Feature 1-2 (Orchestrator)
- Orchestrator references conventions when creating files
- AI agent assigns numbers by checking existing files
- Natural validation through pattern understanding

### With Feature 1-3 (Events)
- Events will include feature/task IDs in metadata
- Completion events will use feature ID in filename pattern
- Event files will use timestamp + target ID

### With Feature 1-4 (Knowledge)
- Lessons will reference feature IDs
- Patterns not numbered (category-based structure)
- Knowledge queries can filter by feature ID pattern

### With Feature 1-5 (Quality)
- Tests will reference feature ID
- Problems will reference task ID
- Lessons will reference feature ID where issue occurred

**Key:** All integrations work through conventions, not code dependencies.

---

## Success Criteria

### Immediate (Documentation)
- [x] Numbering system documented (this file)
- [x] File structure defined (Directory Layout section)
- [x] Examples provided for agents to reference
- [x] Patterns clear from existing files
- [ ] Agents successfully follow conventions

### Near-term (Usage)
- [ ] AI agents assign numbers correctly without code
- [ ] Files created in right locations naturally
- [ ] Hierarchy clear from IDs
- [ ] No numbering conflicts

### Long-term (Scale)
- [ ] System scales to 100+ features
- [ ] Searching by ID fast and accurate
- [ ] Git history clean and organized
- [ ] New developers/agents understand structure immediately

---

## Examples

### Example 1: Plan Creation
```
User idea: "Create course platform"
→ Director validates
→ Assigns plan number: 2
→ Creates: one/things/plans/2-course-platform.md
→ Logs: plan_numbered (planId: 2-course-platform)
```

### Example 2: Feature Breakdown
```
Plan: 2-course-platform
→ Director breaks into 4 features:
  - 2-1-course-crud
  - 2-2-lesson-management
  - 2-3-enrollment-flow
  - 2-4-progress-tracking
→ Creates: one/things/features/2-{1,2,3,4}-*.md
→ Logs: feature_numbered × 4
```

### Example 3: Task Assignment
```
Feature: 2-1-course-crud
→ Director creates 6 tasks:
  - 2-1-task-1: Create CourseService
  - 2-1-task-2: Create mutations
  - 2-1-task-3: Create queries
  - 2-1-task-4: Create CourseForm component
  - 2-1-task-5: Create CourseList component
  - 2-1-task-6: Write tests
→ Creates: one/things/features/2-1-course-crud/tasks.md
→ Logs: tasks_created (taskCount: 6)
```

### Example 4: Completion Tracking
```
Specialist completes 2-1-task-1
→ Logs: task_completed (2-1-task-1)
→ Quality validates
→ All 6 tasks complete
→ Logs: feature_complete (2-1-course-crud)
→ Creates: one/events/completed/2-1-course-crud-complete.md
```

---

## Testing Strategy (AI-Native)

### Manual Verification
- Check file naming follows conventions
- Verify hierarchy is clear from filenames
- Ensure no duplicate numbers
- Confirm git sorting works naturally

### Agent Validation
- Agents reference this doc when creating files
- Agents verify pattern before creating
- Agents check for existing files to avoid conflicts

### No Unit Tests Needed
- No code to test
- Conventions verified by usage
- Patterns self-evident from examples

---

## Error Handling (AI-Native)

### Numbering Errors
- **Duplicate number** → AI checks existing files first, won't create duplicates
- **Invalid format** → AI follows documented pattern, won't generate invalid
- **Missing parent** → AI verifies plan exists before creating features

### File System Errors
- **Directory doesn't exist** → AI creates with mkdir or uses Write tool
- **File already exists** → AI reads first, decides whether to overwrite
- **Invalid filename** → AI follows conventions, naturally valid

**Key insight:** AI agents are smart enough to avoid most errors by understanding context and patterns.

---

## Next Steps

**None.** This feature is complete as documentation.

**Usage:**
- AI agents reference this document when creating numbered files
- Humans reference this document to understand structure
- Update this doc if conventions evolve

**No implementation needed** - conventions work through understanding, not code.

---

## References

- **Plan:** `one/things/plans/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md` (Numbering System section)
- **Feature 1-2:** Orchestrator references these conventions (no hard dependency)
- **Examples:** This feature itself demonstrates numbering (1-6)

---

**Status:** ✅ COMPLETE (Documentation-only feature)

**Key insights:**
1. **Good numbering is invisible** - you never think about it, but it makes everything easier
2. **AI > Code** - agents understand conventions better than parsing logic would
3. **Convention over code** - markdown files + clear patterns beat complex infrastructure
4. **Self-documenting** - filenames reveal hierarchy without databases
5. **Git-friendly** - natural sorting, easy searching, clean history

**Outcome:** AI agents can read existing files, understand patterns, and create correctly numbered files without any implementation code. This document serves as the reference guide.

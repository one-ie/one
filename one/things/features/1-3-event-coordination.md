# Feature 1-3: Event Coordination System

**Assigned to:** Backend Specialist Agent (agent-backend.md)
**Status:** ⚠️ SIMPLIFIED - Events are just markdown files
**Plan:** 1-create-workflow
**Priority:** Low (optional, documentation-only)
**Dependencies:** None (Claude Code writes files naturally)

---

## Simplified Approach: Events as Markdown Files

**Key Insight:** We don't need event infrastructure. Claude Code can write markdown files for events and search them naturally.

### Why No Code Needed

1. **Claude can write events**
   - Uses Write tool to create `one/events/workflow/{timestamp}-{type}-{targetId}.md`
   - Follows event file format template
   - Includes metadata naturally

2. **Claude can query events**
   - Uses Grep to search for event types: `grep "test_failed" one/events/workflow/`
   - Uses Read to check specific events
   - Understands timestamps and can filter recent events

3. **Claude can react to events**
   - Agent prompts specify "when X event happens, do Y"
   - Claude checks for events when needed
   - No subscription system needed - just check files

4. **Events are self-documenting**
   - Markdown format is human-readable
   - Complete audit trail in git
   - Easy debugging (just read the files)

**What we actually need:** Event file format conventions (this document) + event type list.

---

## Feature Specification

### What We're Documenting

An event-driven coordination approach where agents create markdown event files when work completes. Other agents check for these events and react appropriately. The file system IS the message bus.

**Philosophy:** Events ARE files. Markdown IS the protocol. Claude Code IS the event system.

---

## Ontology Types

### Things
- `event` - State change in workflow
  - Properties: `type`, `actorId`, `targetId`, `metadata`, `timestamp`
  - Already exists in ontology

### Connections
- `triggers` - Event triggers agent action
- `logs` - Agent logs event
- `monitors` - Agent monitors for events

### Events (20+ workflow-specific event types)

#### Workflow lifecycle
- `workflow_started` - Orchestrator begins execution
- `workflow_completed` - Full workflow finishes
- `stage_started` - New workflow stage begins
- `stage_completed` - Stage finishes

#### Planning events
- `idea_validated` - Director approved idea
- `plan_started` - Director begins plan
- `plan_completed` - Plan finished
- `feature_assigned` - Specialist receives feature

#### Feature development
- `feature_started` - Specialist begins work
- `feature_spec_complete` - Specification written
- `implementation_started` - Code writing begins
- `implementation_complete` - Code written

#### Quality events
- `quality_check_started` - Quality begins review
- `quality_check_complete` - Review finished
- `test_started` - Test execution begins
- `test_passed` - Test succeeded
- `test_failed` - Test failed

#### Problem solving
- `problem_analysis_started` - Problem solver investigates
- `solution_proposed` - Fix identified
- `fix_started` - Specialist begins fix
- `fix_complete` - Fix implemented
- `lesson_learned_added` - Knowledge captured

#### Documentation
- `documentation_started` - Documenter begins
- `documentation_complete` - Docs written

#### Completion
- `feature_complete` - Feature finished (milestone)
- `task_started` - Individual task begins
- `task_completed` - Individual task finishes

---

## How Claude Code Uses Events

### Creating Events (Simple Write)

**When to create an event:**
- After completing a significant workflow step
- When an error occurs
- When a milestone is reached
- When another agent needs to know something happened

**How Claude creates an event:**
1. Determine event type from list below
2. Create filename: `{timestamp}-{type}-{targetId}.md`
3. Write markdown file using template (see Event File Format section)
4. File goes to: `one/events/workflow/`

**Example:**
```bash
# Claude uses Write tool to create:
# one/events/workflow/1736958600000-feature_started-1-1-agent-prompts.md
```

---

### Querying Events (Simple Grep/Read)

**When to check for events:**
- Before starting work (check if prerequisites complete)
- When deciding what to do next (check for pending work)
- When debugging (review event sequence)

**How Claude queries events:**
```bash
# Find all test failures
grep "test_failed" one/events/workflow/*.md

# Check if feature 1-1 started
ls one/events/workflow/*-feature_started-1-1-*.md

# Read latest quality check
ls -t one/events/workflow/*-quality_check_complete-*.md | head -1
```

---

### Reacting to Events (Check & Act)

**Agent prompts specify reactions:**
- Example from agent-quality.md: "After implementation_complete event, start quality check"
- Example from agent-problem-solver.md: "When test_failed event occurs, analyze failure"
- Example from agent-documenter.md: "After feature_complete event, write documentation"

**No subscription system needed** - Agent prompts tell Claude when to check for events and what to do.

---

### Event Metadata Standards

**Purpose:** Ensure events contain useful information

**Standard metadata by event type:**

```typescript
// feature_assigned
{
  featureId: string
  assignedTo: string  // specialist type (backend/frontend/integration)
  planId: string
}

// implementation_complete
{
  featureId: string
  filesChanged: string[]
  linesAdded: number
  linesRemoved: number
}

// test_failed
{
  testName: string
  testType: 'unit' | 'integration' | 'e2e'
  error: string
  stackTrace: string
  featureId: string
}

// solution_proposed
{
  problemId: string
  rootCause: string
  proposedSolution: string
  assignedTo: string  // specialist to fix
  priority: 'low' | 'medium' | 'high'
}

// lesson_learned_added
{
  lessonId: string
  category: string  // backend/frontend/testing/etc
  problem: string
  solution: string
  pattern: string
}
```

---

## Agent Coordination Patterns

### Pattern 1: Sequential Work (Feature Development)

```
Director: feature_assigned → feature:1-1, assignedTo:backend
    ↓ (Backend Specialist monitors for feature_assigned)
Backend: feature_started → feature:1-1
Backend: feature_spec_complete → feature:1-1
    ↓ (Quality Agent monitors for feature_spec_complete)
Quality: quality_check_started → feature:1-1
Quality: quality_check_complete → feature:1-1, status:approved
    ↓ (Director monitors for quality_check_complete)
Director: tasks_created → feature:1-1-tasks, taskCount:6
```

### Pattern 2: Parallel Execution (Multiple Features)

```
Director: feature_assigned → feature:1-1, assignedTo:backend
Director: feature_assigned → feature:1-2, assignedTo:backend
Director: feature_assigned → feature:1-3, assignedTo:frontend

    ↓ (All specialists work in parallel)

Backend: feature_started → feature:1-1
Backend: feature_started → feature:1-2
Frontend: feature_started → feature:1-3

    ↓ (All complete independently)

Backend: feature_spec_complete → feature:1-1
Frontend: feature_spec_complete → feature:1-3
Backend: feature_spec_complete → feature:1-2
```

### Pattern 3: Error Recovery (Test Failure Loop)

```
Quality: test_failed → feature:1-1, error:"Event not logged"
    ↓ (Problem Solver monitors for test_failed)
Problem Solver: problem_analysis_started → feature:1-1
Problem Solver: solution_proposed → feature:1-1, assignedTo:backend
    ↓ (Backend Specialist monitors for solution_proposed)
Backend: fix_started → feature:1-1
Backend: fix_complete → feature:1-1
Backend: lesson_learned_added → knowledge/lessons-learned
    ↓ (Quality Agent monitors for fix_complete)
Quality: test_started → feature:1-1, retry:1
Quality: test_passed → feature:1-1
```

### Pattern 4: Completion Milestone (Feature Done)

```
Quality: test_passed → feature:1-1 (all tests)
    ↓ (Documenter monitors for all tests passed)
Documenter: documentation_started → feature:1-1
Documenter: documentation_complete → feature:1-1
    ↓ (Director monitors for documentation_complete)
Director: feature_complete → feature:1-1
    ↓ (Log to events/completed/ for permanent record)
```

---

## Scope

### In Scope (Documentation Only)

- ✅ 20+ workflow event type definitions (listed in this doc)
- ✅ Event file format template (markdown)
- ✅ Event metadata standards (what each event should contain)
- ✅ When to create/check events (documented in agent prompts)
- ✅ File naming conventions

### Out of Scope (Don't Build)

- ❌ Event logger TypeScript class (Claude uses Write tool)
- ❌ Event query system (Claude uses Grep/Read tools)
- ❌ Event subscription system (Claude checks when needed)
- ❌ Event handler infrastructure (Agent prompts specify reactions)
- ❌ Agent implementation (Feature 1-1, already exists)
- ❌ Orchestrator implementation (Feature 1-2, simplified)
- ❌ Event visualization UI (future, optional)

---

## Files to Create

**None.** This is a convention document for event files.

Claude Code creates event files when needed:
```
one/events/
├── workflow/                 # Event files (created by Claude as needed)
│   ├── {timestamp}-{type}-{targetId}.md
│   └── ...
└── completed/                # Completion milestones (optional)
    ├── {featureId}-complete.md
    └── ...
```

**Note:** Directory should be created if it doesn't exist, but no code infrastructure needed.

---

## Event File Format

```markdown
# Event: feature_started

**Type:** feature_started
**Event ID:** evt_1705315800000_abc123
**Timestamp:** 2025-01-15T10:30:00Z
**Actor:** backend-specialist
**Target:** 1-1-agent-prompts

## Metadata

```json
{
  "featureId": "1-1-agent-prompts",
  "planId": "1-create-workflow",
  "assignedTo": "backend-specialist"
}
```

## Context

Backend Specialist began work on Feature 1-1 (Agent Prompts System).
Feature is part of Plan 1 (Create Workflow System).

## Related Events

- Previous: `feature_assigned` at 2025-01-15T10:25:00Z
- Next: `feature_spec_complete` (expected)
```

---

## Success Criteria

### Immediate (Documentation)
- [x] 20+ event types defined with clear purposes
- [x] Event file format template documented
- [x] Metadata standards specified per event type
- [x] File naming conventions clear
- [ ] Claude successfully creates events when needed

### Near-term (Usage)
- [ ] Claude writes event files naturally during workflow
- [ ] Claude queries events using Grep/Read tools
- [ ] Claude reacts to events based on agent prompts
- [ ] Complete audit trail in git

### Long-term (Scale)
- [ ] Event-based coordination works for all features
- [ ] Easy debugging via event file review
- [ ] System scales to 100+ features
- [ ] Events provide valuable workflow insights

---

## Performance Characteristics

### Advantages of File-Based Events

- **No infrastructure overhead** - Just file I/O
- **Git integration** - Events tracked in version control
- **Human readable** - Anyone can review event log
- **Grep-friendly** - Fast searching with standard tools
- **Simple debugging** - Just read the markdown files

### Expected Performance

- **Event creation:** Fast (single file write)
- **Event queries:** Fast (grep is optimized for this)
- **Storage:** Minimal (< 5KB per event, markdown compresses well)
- **Scalability:** Excellent (file systems handle millions of files)

---

## Integration Points (Convention-Based)

### With Feature 1-1 (Agent Prompts)
- ✅ Agent prompts specify when to create/check events
- ✅ Example: agent-quality.md says "After implementation_complete event, start quality check"
- ✅ No code dependencies - just documented conventions

### With Feature 1-2 (Orchestrator/Workflow Guide)
- Optional: Claude can log events at each workflow stage
- Optional: Claude can check events for status tracking
- Not required - workflow works without events

### With Feature 1-4 (Knowledge) - Future
- `lesson_learned_added` events can be tracked
- Event history provides learning context
- Pattern discovery from event sequences

### With Feature 1-5 (Quality) - Future
- Quality logs test results as events
- Problem solver checks for test_failed events
- Fix completion creates fix_complete event

---

## Testing Strategy (AI-Native)

### Manual Verification
- Ask Claude to create an event → Verify file created correctly
- Ask Claude to find events → Verify grep/read works
- Check event format matches template

### Agent Validation
- Agent prompts contain event reaction logic
- Claude follows agent prompt instructions
- Natural error correction through understanding

### No Unit Tests Needed
- No code to test
- File I/O is reliable
- Claude validates event structure naturally

---

## Error Handling (AI-Native)

### Invalid Events
- Claude follows event file template → Naturally valid
- If mistakes happen, easy to spot in markdown
- Git history shows what went wrong

### Query Errors
- Grep/Read failures give clear messages
- Claude understands and retries with corrections
- No events found is clear from empty results

### Missing Events
- If expected event doesn't exist, Claude recognizes this
- Can create event if needed
- Or wait/retry if appropriate

**Key insight:** File-based events are simple enough that errors are rare and easy to debug.

---

## Next Steps

**None.** This feature is complete as documentation.

**Usage:**
- Events are **optional** - workflow works without them
- When useful, Claude creates event files using Write tool
- Claude queries events using Grep/Read tools
- Agent prompts specify when to check/create events

**To test:** Ask Claude to create a `feature_started` event for a test feature and verify the markdown file is created correctly.

---

## References

- **Plan:** `one/things/plans/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md` (Agent Coordination section)
- **Feature 1-1:** Agent prompts (specify when to create/check events)
- **Feature 1-2:** Workflow guide (optional event logging)
- **Ontology:** Events in 6-dimension ontology (events dimension)

---

**Status:** ✅ COMPLETE (Documentation-only feature, optional)

**Key insights:**

1. **Events ARE files** - No event system infrastructure needed
2. **Markdown IS the protocol** - Human-readable audit trail
3. **Claude Code IS the event bus** - Write tool creates, Grep tool queries
4. **Optional but useful** - Workflow works without events, but they add value for:
   - Audit trails (who did what when)
   - Debugging (review sequence of operations)
   - Coordination (check if prerequisite completed)
   - Analytics (understand workflow patterns)

**How it works:**
```
Claude completes feature spec → Creates feature_spec_complete.md event
Claude (as quality agent) → Greps for feature_spec_complete events
Claude finds feature 1-1 ready → Reads event, starts quality check
Claude logs quality_check_started.md → Audit trail complete
```

**No event infrastructure code. Just markdown files + conventions.** 🎯

# Design for Feature 1-3: Event Coordination

**Feature:** 1-3-event-coordination
**Status:** Design → Implementation
**Design Agent:** agent-designer.md

---

## Design Goal

Enable optional event logging for workflow coordination and audit trails. Design focuses on how Claude Code naturally creates and queries event files (markdown) without building event infrastructure.

---

## CLI Context

**Events are optional** - workflow works without them, but they add value for:
- Audit trails (who did what when)
- Debugging (review sequence of operations)
- Coordination (check if prerequisite completed)
- Analytics (understand workflow patterns)

**No explicit event commands** - Claude creates events naturally when useful.

---

## Design Decisions (Test-Driven)

### Decision 1: Events Are Markdown Files, Not Infrastructure
**Test requirement:** Claude can create and query events in < 100ms
**Design solution:**
- Event file format: `{timestamp}-{type}-{targetId}.md`
- Location: `one/events/workflow/`
- Claude uses Write tool to create events
- Claude uses Grep/Read tools to query events
- No event system code needed

**Reasoning:** File-based events are simple, git-trackable, human-readable, and fast.

---

### Decision 2: Event Creation Is Invisible to User
**Test requirement:** Events don't clutter CLI output
**Design solution:**
```
Claude Code (Backend Specialist):
Implementing feature 1-1-agent-prompts...
  ✓ Created 12 agent prompt files
  ✓ All tests passing
  ✓ Documentation complete

✅ Feature 1-1 complete!

[Claude silently creates: 1736958600000-feature_complete-1-1.md]
```

**Reasoning:** Events are implementation detail. User sees clean workflow output.

---

### Decision 3: Event Queries Are Tool-Based, Not Commands
**Test requirement:** Claude can find relevant events when needed
**Design solution:**
- Claude uses Grep: `grep "test_failed" one/events/workflow/*.md`
- Claude uses ls: `ls one/events/workflow/*-feature_started-*.md`
- Claude uses Read: Reads specific event for details
- No query API needed

**Reasoning:** Standard tools are fast and familiar. No custom query language.

---

### Decision 4: Event Types Are Well-Defined
**Test requirement:** Consistent event metadata across features
**Design solution:**
20+ event types documented with required metadata:
- `feature_started` → `{featureId, planId, assignedTo}`
- `test_failed` → `{testName, error, stackTrace, featureId}`
- `solution_proposed` → `{problemId, rootCause, proposedSolution, assignedTo}`
- `lesson_learned_added` → `{lessonId, category, problem, solution}`

**Reasoning:** Consistent metadata makes events queryable and useful.

---

### Decision 5: Event Visualization Via CLI (Optional)
**Test requirement:** User can optionally see event timeline
**Design solution:**
```
$ /one events 1-1

Claude Code:
Event timeline for Feature 1-1 (Agent Prompts):

[2025-01-15 10:25] feature_assigned → Backend Specialist
[2025-01-15 10:30] feature_started → 1-1-agent-prompts
[2025-01-15 10:45] feature_spec_complete → 1-1-agent-prompts
[2025-01-15 10:50] quality_check_started → 1-1-agent-prompts
[2025-01-15 10:52] quality_check_complete → status: approved
[2025-01-15 11:00] implementation_started → 1-1-agent-prompts
[2025-01-15 11:15] test_failed → "Event logging missing"
[2025-01-15 11:16] problem_analysis_started → Problem Solver
[2025-01-15 11:18] solution_proposed → "Add event after db.insert()"
[2025-01-15 11:20] fix_started → Backend Specialist
[2025-01-15 11:22] fix_complete → All tests passing
[2025-01-15 11:23] lesson_learned_added → "Always log events"
[2025-01-15 11:25] documentation_complete → 1-1-agent-prompts
[2025-01-15 11:25] feature_complete → 1-1-agent-prompts

Duration: 1 hour
Events: 14
Issues: 1 (resolved in 7 minutes)
```

**Reasoning:** Optional event timeline helpful for debugging and retrospectives.

---

## Component Architecture

### 1. Event File Format (Markdown Template)

```markdown
# Event: feature_started

**Type:** feature_started
**Event ID:** evt_1736958600000_abc123
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

**Claude creates this using Write tool** - No code needed.

---

### 2. Event Types (20+ Workflow Events)

```typescript
// Conceptual - Claude understands these types naturally

Workflow lifecycle:
- workflow_started, workflow_completed
- stage_started, stage_completed

Planning events:
- idea_validated, plan_started, plan_completed, feature_assigned

Feature development:
- feature_started, feature_spec_complete
- implementation_started, implementation_complete

Quality events:
- quality_check_started, quality_check_complete
- test_started, test_passed, test_failed

Problem solving:
- problem_analysis_started, solution_proposed
- fix_started, fix_complete, lesson_learned_added

Documentation:
- documentation_started, documentation_complete

Completion:
- feature_complete, task_started, task_completed
```

**No enum to define** - Claude knows these from documentation.

---

### 3. Query Patterns (Grep-Based)

```bash
# How Claude queries events naturally

# Find all test failures
grep "test_failed" one/events/workflow/*.md

# Check if feature 1-1 started
ls one/events/workflow/*-feature_started-1-1-*.md

# Get latest quality check
ls -t one/events/workflow/*-quality_check_complete-*.md | head -1

# Find all events for feature 1-1
ls one/events/workflow/*-*-1-1-*.md

# Count events by type
grep -l "feature_complete" one/events/workflow/*.md | wc -l
```

**No query system to build** - Standard Unix tools work perfectly.

---

## Wireframes (CLI Outputs)

### Wireframe 1: Event Creation (Invisible)

```
$ /one implement 1-1

Claude Code (Backend Specialist):
Implementing feature 1-1-agent-prompts...

[Claude silently creates: 1736958600000-implementation_started-1-1.md]

Creating agent prompt files...
  ✓ agent-director.md (39KB)
  ✓ agent-backend.md (7.5KB)
  ✓ agent-frontend.md (47KB)
  ✓ agent-integration.md (6.6KB)
  ✓ agent-quality.md (7.4KB)
  ✓ agent-designer.md (54KB)
  ✓ agent-problem-solver.md (10KB)
  ✓ agent-documenter.md (9.5KB)

[Claude silently creates: 1736958900000-implementation_complete-1-1.md]

✅ Implementation complete!
   Files created: 8 agent prompts (303KB total)
   Duration: 5 minutes

[Claude silently creates: 1736959000000-feature_complete-1-1.md]
```

**User sees:** Clean workflow output
**Behind the scenes:** 3 events created for audit trail

---

### Wireframe 2: Event Timeline (Optional Command)

```
$ /one events 1-1

Claude Code:
Querying events for Feature 1-1...

[Claude runs: ls one/events/workflow/*-*-1-1-*.md | sort]
[Claude reads each event file for details]

Event Timeline for Feature 1-1 (Agent Prompts):

📋 [10:25] feature_assigned
   Assigned to: Backend Specialist
   Plan: 1-create-workflow

🔄 [10:30] feature_started
   Agent: Backend Specialist
   Context loaded: 1000 tokens

✅ [10:45] feature_spec_complete
   File: one/things/features/1-1-agent-prompts.md
   Size: 4.2KB

🧪 [10:50] quality_check_started
   Agent: Quality Agent
   Review type: Specification

✅ [10:52] quality_check_complete
   Status: Approved
   Issues: 0

🔧 [11:00] implementation_started
   Agent: Backend Specialist
   Files to create: 8

❌ [11:15] test_failed
   Test: "Event emission test"
   Error: "Invalid metadata structure"

🔍 [11:16] problem_analysis_started
   Agent: Problem Solver
   Mode: Ultrathink

💡 [11:18] solution_proposed
   Root cause: Event metadata example incorrect
   Solution: Update agent-director.md event examples
   Assigned to: Backend Specialist

🔧 [11:20] fix_started
   Agent: Backend Specialist

✅ [11:22] fix_complete
   Tests: All passing (12/12)

📚 [11:23] lesson_learned_added
   Lesson: Event metadata consistency
   File: one/knowledge/lessons-learned.md

📝 [11:25] documentation_complete
   Agent: Documenter

🎉 [11:25] feature_complete
   Duration: 1 hour
   Files created: 8 + 1 lesson
   Events: 14

Summary:
  Total duration: 1 hour
  Issues encountered: 1
  Time to fix: 7 minutes
  Lessons captured: 1
```

---

### Wireframe 3: Event-Based Coordination (Implicit)

```
$ /one implement 1-1

Claude Code (Backend Specialist):
Implementing feature 1-1...

[Implementation completes, event created]

Claude Code (Quality Agent):
[Checking for implementation_complete events...]
[Found: 1-1 implementation complete]

Starting quality validation for 1-1...
Running tests...
  ✓ Prompt loading works
  ✓ Context assembly within budget
  ✗ Event emission test failed

Claude Code (Problem Solver):
[Checking for test_failed events...]
[Found: Event emission test failed for 1-1]

Analyzing failure with ultrathink mode...

Root cause: Invalid metadata structure in agent-director.md
Proposing fix...

[Claude continues coordination via event checks]
```

**User sees:** Seamless agent coordination
**Behind the scenes:** Agents check for events and react

---

### Wireframe 4: Event Debugging

```
$ /one debug 1-1

Claude Code:
Debug mode for Feature 1-1...

Checking events:
  ✓ feature_started: 2025-01-15T10:30:00Z
  ✓ feature_spec_complete: 2025-01-15T10:45:00Z
  ✓ quality_check_complete: 2025-01-15T10:52:00Z (approved)
  ✓ implementation_complete: 2025-01-15T11:00:00Z
  ⚠️  test_failed: 2025-01-15T11:15:00Z
      Error: "Invalid metadata structure"
      Stack trace available in event file
  ✓ solution_proposed: 2025-01-15T11:18:00Z
  ✓ fix_complete: 2025-01-15T11:22:00Z
  ✓ feature_complete: 2025-01-15T11:25:00Z

Issue Timeline:
  11:15 - Test failed (Event emission test)
  11:16 - Problem solver activated
  11:18 - Solution proposed (2 min analysis)
  11:20 - Fix started
  11:22 - Fix complete (2 min implementation)
  11:23 - Lesson captured

Result: Issue resolved in 7 minutes

Event files: one/events/workflow/*-*-1-1-*.md
```

---

### Wireframe 5: Workflow Retrospective

```
$ /one retro plan-1

Claude Code:
Retrospective for Plan 1 (Create Workflow)...

[Claude reads all events for plan 1 features]

Plan 1 Metrics:
  Features: 6
  Total duration: 4 hours
  Events logged: 84

Feature Performance:
  1-1: 1h 00m (14 events, 1 issue resolved)
  1-2: 0h 30m (12 events, 0 issues)
  1-3: 0h 40m (11 events, 0 issues)
  1-4: 0h 45m (13 events, 0 issues)
  1-5: 0h 50m (15 events, 2 issues resolved)
  1-6: 0h 35m (19 events, 0 issues)

Issue Resolution:
  Total issues: 3
  Average resolution time: 8 minutes
  Lessons captured: 3

Quality Metrics:
  First-try pass rate: 50% (3/6 features)
  Average fix iterations: 1.5
  Test coverage: 100% (all features have tests)

Insights:
  - Features with similar patterns: 1-2, 1-3, 1-4, 1-6
  - Quality loop worked well (3 issues → 3 lessons)
  - Pattern emerged: Always log events after entity creation

Event files: one/events/workflow/
```

---

## Design Tokens

### Event Type Icons
```
📋 Planning events (idea_validated, plan_created, feature_assigned)
🔄 Work started (feature_started, implementation_started)
✅ Completion (feature_complete, quality_check_complete)
🧪 Testing (test_started, test_passed)
❌ Failure (test_failed)
🔍 Analysis (problem_analysis_started)
💡 Solution (solution_proposed)
🔧 Fix (fix_started, fix_complete)
📚 Learning (lesson_learned_added)
📝 Documentation (documentation_complete)
🎉 Milestone (feature_complete, workflow_complete)
```

### Event Timeline Formatting
```
[HH:MM] event_type
   Key detail 1: Value
   Key detail 2: Value
```

---

## Accessibility

### Screen Reader Friendly
- Event types spoken clearly
- Timestamps in readable format
- Event details listed with labels
- Timeline has logical structure

### Keyboard Navigation
- Event commands text-based
- No mouse required for event queries
- Tab completion for `/one events [tab]`

### Error Recovery
- Missing events: "No events found for feature X"
- Invalid event format: Claude reads naturally, handles variations
- Event query failures: Clear error with suggested fix

---

## Success Criteria from Tests

### User Flows
- ✅ Claude creates events naturally (< 50ms per event)
- ✅ Claude queries events with grep (< 100ms)
- ✅ User can view event timeline
- ✅ Events enable debugging
- ✅ Events provide retrospective insights

### Acceptance Criteria
- ✅ Event creation: < 50ms (file write)
- ✅ Event queries: < 100ms (grep)
- ✅ Event format: Markdown, human-readable
- ✅ Event location: `one/events/workflow/`
- ✅ Git integration: Events tracked in version control

---

## Implementation Notes

**No event infrastructure to build** - Just conventions:
1. Event file format defined ✅ (in Feature 1-3 spec)
2. Event types documented ✅ (20+ types)
3. Metadata standards ✅ (per event type)
4. Query patterns ✅ (grep examples)

**Claude Code handles events** by:
- Writing markdown files when useful
- Using grep/read for queries
- Following event format template
- Creating audit trail naturally

---

## Next Steps

Ready for Level 6 (Implementation):
- Event format documented ✅ (Feature 1-3 spec)
- Event types defined ✅ (20+ types)
- CLI patterns documented ✅ (this document)
- Implementation is using events optionally

---

**Status:** ✅ Design Complete

**Key Design Insights:**
1. **Events are optional** - Workflow works without them
2. **Invisible to user** - Events created behind the scenes
3. **File-based simplicity** - No event system infrastructure
4. **Standard tools** - Grep/read for queries
5. **Valuable for debugging** - Event timeline shows what happened

**The design is markdown event files + grep queries + optional timeline visualization.** 🎯

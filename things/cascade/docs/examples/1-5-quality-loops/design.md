# Design for Feature 1-5: Quality Loops and Problem Solving

**Feature:** 1-5-quality-loops
**Status:** Design → Implementation
**Design Agent:** agent-designer.md

---

## Design Goal

Enable continuous quality improvement through test-driven validation and intelligent problem solving. Design focuses on how Claude Code naturally follows the quality loop (test → validate → analyze → fix → learn) without building quality infrastructure.

---

## CLI Context

**Quality is a workflow, not infrastructure.** Claude:
- Defines tests before implementation
- Runs tests naturally (using Bash tool)
- Analyzes failures with ultrathink mode
- Implements fixes and retests
- Captures lessons automatically

**Commands:**
```bash
/one test 1-1                      # Define tests (Stage 4)
/one implement 1-1                 # Implement + validate (Stage 6)
/one validate 1-1                  # Explicitly run validation
/one fix 1-1                       # Analyze + fix failures
```

---

## Design Decisions (Test-Driven)

### Decision 1: Tests ARE Markdown Files, Not Test Code
**Test requirement:** Quality agent defines tests in < 5 minutes
**Design solution:**
- Test document: `one/things/features/{N}-{M}/tests.md`
- Contains: User flows + acceptance criteria + technical tests
- Claude reads this to know what success looks like
- Claude runs actual test commands: `bun test`, `npm test`, etc.

**Reasoning:** Markdown tests define "what", existing test runners handle "how".

---

### Decision 2: Quality Loop Visible to User
**Test requirement:** User understands validation process
**Design solution:**
```
Claude Code (Backend Specialist):
Implementing feature 1-1...
  ✓ Created files
  ✓ Running tests...

🧪 Test Results:
  ✓ Prompt loading works (12/12)
  ✓ Context assembly within budget (5/5)
  ✗ Event emission test failed (0/3)

Claude Code (Problem Solver - Ultrathink Mode):
Analyzing failure...
  Root cause: Invalid metadata structure
  Solution: Update event examples in agent-director.md
  Expected fix time: < 5 minutes

Claude Code (Backend Specialist):
Implementing fix...
  ✓ Updated agent-director.md
  ✓ Re-running tests...
  ✓ All tests passing (20/20)

Capturing lesson learned...
  ✓ Lesson: Event metadata consistency

✅ Feature 1-1 complete!
```

**Reasoning:** Transparent quality process builds confidence and understanding.

---

### Decision 3: Problem Solver Uses Ultrathink Mode
**Test requirement:** Root cause analysis in < 2 minutes
**Design solution:**
- Problem solver reads failure details
- Activates deep thinking mode
- Searches lessons learned for similar issues
- Analyzes root cause systematically
- Proposes specific solution

**Example ultrathink process:**
```
1. What is the actual error?
   → "Expected event not found in events table"

2. Why did it fail?
   → CourseService.create() calls db.insert() but doesn't log event

3. Is this a known issue?
   → [Searches lessons-learned.md]
   → Found 2 similar: Feature 1-1, Feature 2-1 (same issue!)

4. What pattern was missed?
   → backend/event-logging.md: Always log after db.insert()

5. Propose solution:
   → Add event logging after line 15 in CourseService.create()
   → Specific code example provided
```

**Reasoning:** Systematic analysis beats trial-and-error guessing.

---

### Decision 4: Fix Loop Has Retry Limit
**Test requirement:** Don't loop forever on persistent failures
**Design solution:**
```
Attempt 1: Test fails → Analyze → Fix → Retest
  ↓ Still failing
Attempt 2: Test fails → Analyze deeper → Fix → Retest
  ↓ Still failing
Attempt 3: Test fails → Analyze with more context → Fix → Retest
  ↓ Still failing
Escalate: Notify user, request human intervention
```

**Limit:** 3 attempts per test failure
**Escalation message:**
```
⚠️  Unable to resolve test failure after 3 attempts

Feature: 2-1-course-crud
Test: CourseService.create() should complete in < 10 seconds
Issue: Performance target not met (15.3s observed)

Attempted fixes:
  1. Parallelized API calls → Still 12s
  2. Client-side validation → Still 11s
  3. Removed redundant checks → Still 10.5s (close but not met)

This may require architectural changes.
Manual review recommended.

Debug info: one/things/features/2-1-course-crud/debug.md
```

**Reasoning:** Infinite loops waste time. Human judgment needed for complex issues.

---

### Decision 5: Quality Improves Measurably Over Time
**Test requirement:** Track improvement metrics
**Design solution:**
```
Month 1: 80% first-try pass rate (learning phase)
Month 2: 87% first-try pass rate (patterns emerging)
Month 3: 94% first-try pass rate (patterns applied consistently)

Average fix time:
Month 1: 15 minutes (figuring out patterns)
Month 2: 8 minutes (applying known patterns)
Month 3: 5 minutes (mostly automated by patterns)

Repeated problems:
Month 1: 12 repeated issues
Month 2: 5 repeated issues (7 patterns promoted)
Month 3: 1 repeated issue (4 more patterns promoted)
```

**Reasoning:** Measurable improvement validates the quality loop approach.

---

## Component Architecture

### 1. Quality Loop Flow (Claude's Mental Model)

```
Stage 4: Tests (Quality Agent)
  ↓
Define tests (user flows + acceptance + technical)
Create: one/things/features/{N}-{M}/tests.md
  ↓
Stage 6: Implementation (Specialist)
  ↓
Write code according to spec + design
Run tests (bun test, npm test, etc.)
  ↓
Tests pass? → Yes: Capture lesson (if learned), document, complete
           → No: Quality Loop
  ↓
Problem Solver (Ultrathink Mode)
  ↓
Analyze failure:
  - What's the error?
  - Why did it fail?
  - Is this known? (search lessons)
  - What pattern applies?
  - Propose specific fix
  ↓
Specialist Implements Fix
  ↓
Re-run tests
  ↓
Tests pass? → Yes: Capture lesson, continue
           → No: Retry loop (max 3 attempts)
  ↓
After 3 failures → Escalate to human
```

**No code needed** - Claude follows this flow naturally from agent prompts.

---

### 2. Test Definition Template (Markdown)

**File:** `one/things/features/{N}-{M}/tests.md`

**Structure:**
```markdown
# Tests for Feature {N}-{M}: {Name}

## User Flows

### Flow 1: {Goal}
**User goal:** {What user wants to achieve}
**Time budget:** {Expected completion time}
**Steps:**
1. {Action 1}
2. {Action 2}
3. {Expected result}

**Acceptance Criteria:**
- [ ] {Specific measurable criterion}
- [ ] {Performance criterion with metric}

## Acceptance Criteria

### Functional
- [ ] {Feature works correctly}
- [ ] {Edge cases handled}

### Performance
- [ ] {Operation completes in < X seconds}

### Quality
- [ ] {Code follows ontology structure}
- [ ] {All events logged}

## Technical Tests

### Unit Tests
- [ ] {Service}.{method}() {expected behavior}

### Integration Tests
- [ ] API: {METHOD} /{path} → {status} + {response}

### E2E Tests
- [ ] Complete Flow 1 in < {time budget}
```

**Claude creates this using agent-quality.md instructions** - No test framework needed for definition.

---

### 3. Problem Analysis Output (Markdown)

**Created when tests fail:** `one/things/features/{N}-{M}/problem-{timestamp}.md`

**Structure:**
```markdown
# Problem: {Test Name} Failed

**Feature:** {N}-{M}-{name}
**Test:** {Test name}
**Error:** {Error message}
**Stack Trace:** {If available}

## Root Cause (Ultrathink Analysis)

{Detailed analysis of why it failed}

### Similar Issues Found
{References to lessons learned if found}

### Pattern to Apply
{Reference to relevant pattern if applicable}

## Proposed Solution

{Specific fix with code examples}

### Expected Changes
- File: {path}
- Lines: {line numbers}
- Change: {what to modify}

### Test After Fix
{Which tests should pass after fix}

## Delegation

- **Assigned to:** {Specialist type}
- **Priority:** {Low/Medium/High}
- **Expected fix time:** {Estimate}
```

**Claude creates this using agent-problem-solver.md instructions** - No bug tracker needed.

---

## Wireframes (CLI Outputs)

### Wireframe 1: Test Definition (Stage 4)

```
$ /one test 1-1

Claude Code (Quality Agent - Stage 4: Tests):
Defining tests for Feature 1-1 (Agent Prompts)...

Creating test criteria:

User Flows (5):
  1. Agent understands role in < 5 seconds ✓
  2. Agent coordinates via events in < 1 second ✓
  3. Agent uses context within budget (1500 tokens) ✓
  4. Agent makes decisions using framework ✓
  5. Agent captures examples correctly ✓

Acceptance Criteria (12):
  ✓ Functional requirements (8)
  ✓ Performance requirements (2)
  ✓ Quality requirements (2)

Technical Tests (15):
  ✓ Unit tests (8): Prompt loading, context assembly, events
  ✓ Integration tests (5): Agent coordination, workflow execution
  ✓ E2E tests (2): Complete workflow flows

✅ Tests defined!
   File: one/things/features/1-1-agent-prompts/tests.md
   User flows: 5
   Acceptance criteria: 12
   Technical tests: 15

Next: Stage 5 (Design) or Stage 6 (Implementation)
  /one design 1-1
  /one implement 1-1
```

---

### Wireframe 2: Implementation with Quality Loop (Success)

```
$ /one implement 1-1

Claude Code (Backend Specialist - Stage 6: Implementation):
Implementing feature 1-1-agent-prompts...

Loading context:
  ✓ Feature spec
  ✓ Tests (5 flows, 12 criteria, 15 tests)
  ✓ Design
  ✓ Backend patterns

Creating files:
  ✓ one/things/agents/agent-director.md (39KB)
  ✓ one/things/agents/agent-backend.md (7.5KB)
  ✓ one/things/agents/agent-frontend.md (47KB)
  ✓ one/things/agents/agent-integration.md (6.6KB)
  ✓ one/things/agents/agent-quality.md (7.4KB)
  ✓ one/things/agents/agent-designer.md (54KB)
  ✓ one/things/agents/agent-problem-solver.md (10KB)
  ✓ one/things/agents/agent-documenter.md (9.5KB)

Running tests...

🧪 Test Results:
  User Flows:
    ✓ Flow 1: Agent understands role (2.1s < 5s budget) ✅
    ✓ Flow 2: Agent coordinates via events (0.3s < 1s budget) ✅
    ✓ Flow 3: Agent uses context (1200 tokens < 1500 budget) ✅
    ✓ Flow 4: Agent makes decisions ✅
    ✓ Flow 5: Agent captures examples ✅

  Acceptance Criteria:
    ✓ All 12 criteria met ✅

  Technical Tests:
    ✓ Unit tests: 8/8 passing ✅
    ✓ Integration tests: 5/5 passing ✅
    ✓ E2E tests: 2/2 passing ✅

✅ All tests passing (20/20)!

Writing documentation...
  ✓ AGENTS.md updated

✅ Feature 1-1 complete!
   Duration: 15 minutes
   Tests: 20/20 passing (100%)
   Files created: 8 + 1 doc
   First-try success: Yes ✅
```

---

### Wireframe 3: Quality Loop with Fix (Test Failure)

```
$ /one implement 2-1

Claude Code (Backend Specialist):
Implementing feature 2-1-course-crud...

Creating files:
  ✓ backend/services/CourseService.ts
  ✓ backend/schema.ts (added course schema)
  ✓ backend/mutations/courses.ts
  ✓ backend/queries/courses.ts

Running tests...

🧪 Test Results:
  ✓ CourseService.create() creates course ✅
  ✓ CourseService.list() filters by creator ✅
  ✗ CourseService.create() should log course_created event ❌
  ✓ CourseService.delete() checks ownership ✅

Tests: 3/4 passing (75%)

Claude Code (Problem Solver - Ultrathink Mode):
🔍 Analyzing test failure...

Error: Expected event not found in events table
Test: CourseService.create() should log course_created event

Root Cause Analysis:
  1. CourseService.create() calls db.insert() ✓
  2. Returns course ID ✓
  3. But doesn't log event ✗

Searching lessons learned...
  Found 2 similar issues:
    - Feature 1-1: Forgot agent_prompt_created event
    - Feature 1-8: Forgot user_created event

Pattern Identified: backend/event-logging.md
  "Always log {entity}_created after db.insert()"

Proposed Solution:
  File: backend/services/CourseService.ts
  Line: After line 15 (after db.insert)
  Add event logging:

  ```typescript
  await ctx.db.insert('events', {
    type: 'course_created',
    actorId: course.creatorId,
    targetId: id,
    metadata: { title: course.title }
  })
  ```

Expected fix time: < 5 minutes

Claude Code (Backend Specialist):
Implementing fix...
  ✓ Added event logging after course creation
  ✓ Followed event-logging pattern

Re-running tests...

🧪 Test Results:
  ✓ CourseService.create() creates course ✅
  ✓ CourseService.list() filters by creator ✅
  ✓ CourseService.create() should log course_created event ✅
  ✓ CourseService.delete() checks ownership ✅

✅ All tests passing (4/4)!

Capturing lesson learned...
  ✓ Appended to one/knowledge/lessons-learned.md

Lesson: Always log events after entity creation (3rd occurrence)
Note: This pattern should be promoted to default context

✅ Feature 2-1 complete!
   Duration: 12 minutes
   Tests: 4/4 passing (100%)
   Fix time: 4 minutes
   Lesson captured: Yes ✅
```

---

### Wireframe 4: Multiple Fix Attempts

```
$ /one implement 2-3

Claude Code (Backend Specialist):
Implementing feature 2-3-course-ui...

[Implementation]

Running tests...
  ✗ Flow 1: Create course in < 10 seconds
      Observed: 15.3 seconds (53% over budget)

Claude Code (Problem Solver - Attempt 1/3):
Analyzing performance issue...

Root cause: 3 sequential API calls (creator check, validation, create)
Solution: Parallelize calls

Claude Code (Frontend Specialist):
Implementing fix (attempt 1)...
  ✓ Parallelized API calls

Re-running tests...
  ✗ Flow 1: 12.0 seconds (20% over budget)

Claude Code (Problem Solver - Attempt 2/3):
Deeper analysis...

Root cause: Validation call unnecessary (auth already validates)
Solution: Remove validation call, client-side only

Claude Code (Frontend Specialist):
Implementing fix (attempt 2)...
  ✓ Moved validation to client side

Re-running tests...
  ✗ Flow 1: 10.5 seconds (5% over budget - close!)

Claude Code (Problem Solver - Attempt 3/3):
Final analysis...

Root cause: Creator check redundant (auth provides creator)
Solution: Remove creator check

Claude Code (Frontend Specialist):
Implementing fix (attempt 3)...
  ✓ Removed redundant creator check

Re-running tests...
  ✓ Flow 1: 8.7 seconds (13% under budget) ✅

✅ All tests passing!

Capturing lesson learned...
  Lesson: Minimize API roundtrips for tight time budgets
  Context: 3 calls → 1 call, 15s → 8.7s (42% improvement)

✅ Feature 2-3 complete!
   Fix attempts: 3/3 (finally resolved)
   Lesson: Validate client-side, minimize API calls
```

---

### Wireframe 5: Escalation After 3 Failures

```
$ /one implement 2-5

[Implementation and testing]

Running tests...
  ✗ Flow 1: Process payment in < 5 seconds
      Observed: 8.2 seconds

Claude Code (Problem Solver - Attempt 1/3):
[Analysis and fix]
Re-running tests...
  ✗ Still 7.8 seconds

Claude Code (Problem Solver - Attempt 2/3):
[Deeper analysis and fix]
Re-running tests...
  ✗ Still 7.1 seconds

Claude Code (Problem Solver - Attempt 3/3):
[Final analysis and fix]
Re-running tests...
  ✗ Still 6.9 seconds (better, but not < 5s)

⚠️  Unable to resolve after 3 attempts

Feature: 2-5-payment-processing
Test: Flow 1 - Process payment in < 5 seconds
Issue: Performance target not met

Progress:
  Initial: 8.2s
  After attempt 1: 7.8s (-5%)
  After attempt 2: 7.1s (-13%)
  After attempt 3: 6.9s (-16%)
  Target: 5.0s (still 38% over)

This may require:
  - Payment API optimization (external dependency)
  - Caching strategy
  - Background processing
  - Or relaxed time budget (consider 7s target?)

Manual review recommended.

Debug info saved: one/things/features/2-5-payment-processing/debug.md
Lessons saved: one/knowledge/lessons-learned.md

Next steps:
  1. Review debug.md for analysis details
  2. Decide: Optimize further OR adjust time budget
  3. Continue: /one fix 2-5 (after manual changes)
```

---

### Wireframe 6: Quality Metrics Over Time

```
$ /one quality stats

Claude Code (Quality Agent):
Quality Statistics

Overall Quality (Quarter 1):
  Features completed: 45
  First-try pass rate: 91% (41/45)
  Average test coverage: 97%
  Average fix time: 6.2 minutes

Quality Improvement Over Time:

Month 1 (Features 1-15):
  First-try pass: 80% (12/15)
  Average fix time: 14.3 minutes
  Repeated issues: 8
  Patterns applied: 2

Month 2 (Features 16-30):
  First-try pass: 93% (14/15)
  Average fix time: 7.1 minutes
  Repeated issues: 3
  Patterns applied: 8

Month 3 (Features 31-45):
  First-try pass: 100% (15/15)
  Average fix time: 0 minutes (no fixes needed!)
  Repeated issues: 0
  Patterns applied: 15

Learning Impact:
  Lessons captured: 23
  Patterns promoted: 11
  Known issues avoided: 31 (via lessons)

Test Failure Analysis:
  Missing event logs: 5 failures → Pattern promoted (Month 1)
  Ownership validation: 3 failures → Pattern promoted (Month 2)
  Performance issues: 4 failures → Best practices documented
  Other: 2 failures → Unique issues, lessons captured

Velocity Impact:
  Month 1: Avg 42 min/feature
  Month 2: Avg 28 min/feature (-33%)
  Month 3: Avg 18 min/feature (-57% from Month 1)

Quality loop is working! 📈
Every failure became knowledge.
Knowledge became speed.
```

---

## Design Tokens

### Quality Status Icons
```
🧪 Testing
✅ All tests passing
❌ Test failed
🔍 Analyzing failure (ultrathink mode)
💡 Solution proposed
🔧 Implementing fix
🔄 Re-running tests
📚 Capturing lesson
⚠️  Escalation (after 3 attempts)
📊 Quality metrics
📈 Improvement trend
```

### Test Result Formatting
```
Test Results:
  ✓ {Test name} ✅
  ✗ {Test name} ❌
      {Error details}

Tests: {passed}/{total} passing ({percentage}%)
```

---

## Accessibility

### Screen Reader Friendly
- Test results spoken clearly
- Pass/fail explicit (not just colors)
- Problem analysis narrated
- Fix attempts numbered

### Keyboard Navigation
- All quality commands text-based
- No mouse required for validation
- Tab completion for commands

### Error Recovery
- Clear error messages with context
- Suggestions for fixes
- Escalation path after retries
- Help available (`/one help quality`)

---

## Success Criteria from Tests

### User Flows
- ✅ Quality agent defines tests (< 5 minutes)
- ✅ Tests validate implementation correctly
- ✅ Problem solver analyzes failures (< 2 minutes)
- ✅ Fix loop executes and retests automatically
- ✅ System improves continuously (measurable)

### Acceptance Criteria
- ✅ Test definition: < 5 minutes per feature
- ✅ Test execution: < 2 minutes per feature
- ✅ Problem analysis: < 2 minutes per issue
- ✅ Fix implementation: < 15 minutes average
- ✅ Quality improvement: 80%→90%→95%+ over time

---

## Implementation Notes

**No quality infrastructure to build** - Just workflow:
1. Test templates defined ✅ (Feature 1-5 spec)
2. Quality loop documented ✅ (this document)
3. Problem solver workflow ✅ (agent-problem-solver.md)
4. Lesson capture workflow ✅ (Feature 1-4)

**Claude Code handles quality** by:
- Reading test criteria from tests.md
- Running tests using Bash tool (existing runners)
- Following problem-solver prompt for analysis
- Implementing fixes and retesting
- Capturing lessons automatically

---

## Next Steps

Ready for Level 6 (Implementation):
- Test templates complete ✅ (Feature 1-5 spec)
- Quality loop workflow documented ✅ (this document)
- Agent prompts ready ✅ (quality + problem-solver)
- Implementation is following quality loop

---

**Status:** ✅ Design Complete

**Key Design Insights:**
1. **Tests are markdown** - Define success criteria, not test code
2. **Bash runs tests** - Use existing test runners, no framework
3. **Ultrathink analyzes** - Systematic root cause analysis
4. **Fix loop transparent** - User sees validation process
5. **Quality compounds** - Every failure becomes lesson

**The design is test definitions + validation loop + ultrathink problem solving.** 🎯

**Quality loop in action:**
```
Month 1: 80% first-try → 15 min fix time → Learning
Month 2: 90% first-try → 7 min fix time → Patterns emerging
Month 3: 95% first-try → 3 min fix time → Excellence
Year 1: 97% first-try → 1 min fix time → Mastery
```

**Every test failure makes the system smarter.** 🧠

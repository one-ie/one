# Feature 1-5: Quality Loops and Problem Solving

**Assigned to:** Quality Agent (agent-quality.md) + Problem Solver (agent-problem-solver.md)
**Status:** ⚠️ SIMPLIFIED - Quality loop is workflow, not infrastructure
**Plan:** 1-create-workflow
**Priority:** Medium (mostly documentation)
**Dependencies:** 1-1 (Agent prompts define quality/problem-solver behavior)

---

## Simplified Approach: Quality Loop as Workflow

**Key Insight:** We don't need quality infrastructure. Claude Code already has everything needed for quality loops.

### Why No Code Needed

1. **Test Definition = markdown file**
   - Claude (as quality agent) reads agent-quality.md
   - Creates tests.md with user flows + acceptance criteria + technical tests
   - Uses Write tool, follows template

2. **Test Execution = Bash commands**
   - Claude runs tests using Bash tool: `bun test`, `npm run test`, `bunx astro check`
   - Sees pass/fail output naturally
   - No test runner infrastructure needed

3. **Failure Analysis = ultrathink + agent prompt**
   - Claude reads agent-problem-solver.md
   - Analyzes failure in deep thinking mode
   - Searches lessons-learned.md (grep) for similar issues
   - Proposes solution naturally

4. **Fix Loop = natural iteration**
   - Claude implements fix (reads specialist prompt)
   - Re-runs tests (Bash)
   - If fail → analyzes again
   - If pass → appends lesson, moves on

5. **Lesson Capture = markdown append**
   - Claude appends lesson to lessons-learned.md (Edit tool)
   - Future iterations benefit automatically

**What we actually need:** Test templates + problem-solving workflow documentation (mostly done in agent prompts).

---

## Feature Specification

### What We're Documenting

A quality validation and problem-solving workflow where Claude:
1. Defines tests (reads quality agent prompt, creates tests.md)
2. Runs tests (uses Bash tool)
3. Analyzes failures (reads problem-solver prompt, uses ultrathink)
4. Fixes issues (reads specialist prompt, implements fix)
5. Captures lessons (appends to lessons-learned.md)

**Philosophy:** Quality is a loop, not code. Claude follows the workflow naturally.

---

## Ontology Types

### Things
- `test` - Validation criteria (user flow, acceptance, technical)
  - Properties: `type`, `name`, `criteria`, `status`
- `problem` - Issue identified by quality agent
  - Properties: `testId`, `error`, `rootCause`, `solution`

### Connections
- `tests_for` - Test validates feature
- `validates` - Quality agent validates implementation
- `solves` - Problem solver fixes issue
- `learns_from` - Lesson captured from problem

### Events
- `quality_check_started` - Quality begins review
- `quality_check_complete` - Review finished
  - Metadata: `status` (approved/rejected), `testsCreated`, `issuesFound`
- `test_started` - Test execution begins
- `test_passed` - Test succeeded
- `test_failed` - Test failed
  - Metadata: `testName`, `error`, `stackTrace`
- `problem_analysis_started` - Problem solver investigates
- `solution_proposed` - Fix identified
  - Metadata: `rootCause`, `solution`, `assignedTo`
- `fix_started` - Specialist begins fix
- `fix_complete` - Fix implemented
- `lesson_learned_added` - Knowledge captured

---

## Core Components

### 1. Quality Agent (Test Definition)

**Purpose:** Define what success looks like before implementation

**Process:**
1. Receives feature specification
2. Defines **user flows** (what users must accomplish)
3. Defines **acceptance criteria** (how we know it works)
4. Defines **technical tests** (implementation validation)
5. Creates test document

**User Flow Template:**
```markdown
### Flow [N]: [Goal]
**User goal:** [What user wants to achieve]
**Time budget:** [Expected completion time]
**Steps:**
1. [Action 1]
2. [Action 2]
3. [Expected result]

**Acceptance Criteria:**
- [ ] [Specific, measurable criterion]
- [ ] [Another criterion]
- [ ] [Performance criterion with metric]
```

**Technical Test Template:**
```markdown
### Unit Tests
- [ ] [ServiceName].[method]() [expected behavior]
- [ ] [Another test case]

### Integration Tests
- [ ] API: [METHOD] /[path] → [status code] + [response]
- [ ] [Another API test]

### E2E Tests
- [ ] Complete Flow [N] in < [time budget]
- [ ] [Another flow]
```

**Output:** `[featureId]/tests.md` file

---

### 2. Quality Agent (Validation)

**Purpose:** Verify implementation meets all criteria

**Process:**
1. Receives implementation complete event
2. Reviews code against ontology structure
3. Runs user flows (manual or automated)
4. Checks acceptance criteria
5. Executes technical tests
6. Logs results

**Validation checklist:**
- [ ] Code follows ontology structure (correct types, connections, events)
- [ ] All user flows work as specified
- [ ] All acceptance criteria met
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All e2e tests pass
- [ ] Design matches specifications
- [ ] Accessibility requirements met
- [ ] Performance targets achieved

**Outcomes:**
- **PASS:** Log `quality_check_complete` (status: approved) → Documenter writes docs
- **FAIL:** Log `quality_check_complete` (status: rejected) → Problem Solver analyzes

---

### 3. Problem Solver Agent (Ultrathink Mode)

**Purpose:** Analyze failures and propose solutions

**Activation:** Subscribes to `test_failed` events

**Process (Ultrathink):**

1. **Gather context:**
   - Failed test details (name, error, stack trace)
   - Implementation code
   - Feature specification
   - Test criteria
   - Ontology structure
   - Recent lessons learned (search for similar issues)

2. **Analyze root cause:**
   - What is the actual error?
   - Why did it fail? (logic error, missing dependency, wrong pattern, etc.)
   - Is this a known issue? (check lessons learned)
   - What pattern was missed?

3. **Propose solution:**
   - Minimum fix required
   - Specific code changes
   - Which pattern to apply
   - Which specialist should fix

4. **Create solution document:**
   ```markdown
   # Problem: [Test Name] Failed

   **Feature:** [Feature ID]
   **Test:** [Test name]
   **Error:** [Error message]

   ## Root Cause (Ultrathink Analysis)

   [Detailed analysis of why it failed]

   ## Similar Issues

   [References to lessons learned if found]

   ## Proposed Solution

   [Specific fix with code examples]

   ## Delegation

   - **Assigned to:** [Specialist type]
   - **Priority:** [Low/Medium/High]
   - **Expected fix time:** [Estimate]

   ## Pattern to Apply

   [Reference to relevant pattern if applicable]
   ```

5. **Log events:**
   - `problem_analysis_started`
   - `solution_proposed` (with metadata)

---

### 4. Fix Loop

**Purpose:** Execute fixes and re-validate

**Flow:**
```
Test Failed
    ↓
Problem Solver analyzes (ultrathink)
    ↓
Solution proposed → Event logged
    ↓
Specialist receives solution (subscribes to solution_proposed)
    ↓
Specialist implements fix
    ↓
Specialist captures lesson learned
    ↓
Events logged: fix_started, fix_complete, lesson_learned_added
    ↓
Quality Agent re-runs tests (subscribes to fix_complete)
    ↓
Tests pass? → Yes: Continue to documentation
           → No: Loop back to Problem Solver
```

**Retry limit:** 3 attempts per test
- After 3 failures, escalate to human developer
- Log escalation event

---

### 5. Lesson Capture Integration

**Purpose:** Ensure every fix adds to knowledge base

**Process:**
1. Specialist implements fix
2. Tests pass
3. **Before marking fix_complete:**
   - Specialist adds lesson to `knowledge/lessons-learned.md`
   - Uses template from Feature 1-4
   - References problem, solution, pattern
4. Log `lesson_learned_added` event
5. Mark fix complete

**Enforcement:**
- Problem Solver checks for lesson in knowledge base
- If lesson not added, remind specialist
- Quality metrics track lesson capture rate

---

## Quality Loop Examples

### Example 1: Missing Event Log

**Test fails:**
```
Test: CourseService.create() should log course_created event
Error: Expected event not found in events table
```

**Problem Solver analyzes:**
```markdown
# Problem: Event Logging Missing

## Root Cause
CourseService.create() calls db.insert() but doesn't log event.
Missing: await ctx.db.insert('events', { type: 'course_created', ... })

## Similar Issues
Found 2 similar issues in lessons learned:
- Feature 1-1: Forgot agent_prompt_created event
- Feature 2-1: Same issue with lesson_created

## Pattern to Apply
backend/event-logging.md: Always log {entity}_created after db.insert()

## Proposed Solution
Add event logging after line 15 in CourseService.create():

```typescript
async create(course: Course) {
  const id = await ctx.db.insert('courses', course)

  // ADD THIS:
  await ctx.db.insert('events', {
    type: 'course_created',
    actorId: course.creatorId,
    targetId: id,
    metadata: { title: course.title }
  })

  return id
}
```

## Delegation
- Assigned to: Backend Specialist
- Priority: High (blocking quality)
- Expected fix time: 5 minutes
```

**Specialist fixes:**
1. Adds event logging code
2. Tests pass
3. **Adds lesson:**
   ```markdown
   ### Always Log Events After Entity Creation
   **Date:** 2025-01-15
   **Feature:** 2-1-course-crud
   **Problem:** Forgot to log course_created event
   **Solution:** Added event logging after db.insert()
   **Pattern:** Every entity creation must log corresponding event
   **Context:** All thing_created events are mandatory per ontology
   **Example:** See backend/event-logging.md pattern
   **Related:** Similar to features 1-1 and 2-1 issues
   ```
4. Logs `fix_complete` and `lesson_learned_added` events

**System now smarter:**
- Lesson captured (3rd occurrence of same issue)
- Pattern reinforced
- Future features less likely to miss this
- Eventually, pattern becomes automatic context for all backend work

---

### Example 2: Performance Failure

**Test fails:**
```
Test: Complete Flow 1 (Create Course) in < 10 seconds
Error: Flow took 15.3 seconds (53% over budget)
```

**Problem Solver analyzes:**
```markdown
# Problem: Performance Target Missed

## Root Cause
1. Course form makes 3 sequential API calls (creator check, validation, create)
2. Each call: 4-5 seconds = 15 seconds total
3. Could be parallelized or eliminated

## Analysis
- Creator check: Unnecessary (auth already validates)
- Validation: Could be client-side
- Create: Required

## Proposed Solution
1. Remove creator check (already done by auth)
2. Move validation to client side
3. Single API call: Create course

Expected time: ~5 seconds (50% under budget)

## Delegation
- Assigned to: Frontend Specialist
- Priority: Medium (quality criterion not met)
- Expected fix time: 20 minutes
```

**Specialist fixes, captures lesson:**
```markdown
### Validate Client-Side Before API Calls
**Date:** 2025-01-15
**Feature:** 2-1-course-crud
**Problem:** Sequential API calls caused 15s delay (10s budget)
**Solution:** Moved validation to client, eliminated redundant check
**Pattern:** Validate locally first, minimize API roundtrips
**Context:** When performance budgets are tight (< 10s)
**Example:** Reduced 3 calls to 1 call, 15s → 5s
**Related:** See pattern frontend/form-validation.md
```

---

## Scope

### In Scope (Documentation)

- ✅ Quality agent test definition workflow (documented in agent-quality.md)
- ✅ Quality agent validation workflow (documented in agent-quality.md)
- ✅ Problem solver ultrathink analysis (documented in agent-problem-solver.md)
- ✅ Fix loop workflow (iteration pattern)
- ✅ Lesson capture workflow (append to lessons-learned.md)
- ✅ Test templates (user flows + acceptance criteria + technical tests)

### Out of Scope (Don't Build)

- ❌ Quality validation TypeScript infrastructure (Claude follows prompts)
- ❌ Problem solver TypeScript code (Claude uses ultrathink naturally)
- ❌ Fix loop coordination code (Claude iterates naturally)
- ❌ Test runner infrastructure (use existing: bun test, npm test, etc.)
- ❌ Automated test execution framework (Bash tool runs tests)
- ❌ Event system for quality events (optional, Feature 1-3)
- ❌ Performance monitoring tools (use existing)

---

## Files to Create

**Test definition templates** (markdown):
```
one/knowledge/patterns/test/
├── user-flow-template.md        # How to write user flows
├── acceptance-criteria-template.md  # How to write acceptance criteria
└── technical-test-template.md   # How to write technical tests
```

**Per-feature test files** (created by Claude):
```
one/things/features/[featureId]/
└── tests.md                     # Created by quality agent
```

**No TypeScript infrastructure needed** - Claude follows agent prompts and uses existing test runners.

---

## Integration Points

### With Feature 1-1 (Agent Prompts)
- Quality agent prompt defines validation criteria
- Problem solver prompt defines analysis approach
- Specialist prompts include fix responsibilities

### With Feature 1-3 (Events)
- All quality events logged
- Problem solver subscribes to test_failed
- Specialists subscribe to solution_proposed
- Quality subscribes to fix_complete

### With Feature 1-4 (Knowledge)
- Problem solver searches lessons learned
- Specialists apply patterns
- Lesson capture after every fix
- Pattern discovery from repeated lessons

### With Feature 1-2 (Orchestrator)
- Orchestrator invokes quality at stages 4 and 6
- Orchestrator manages fix loop retries
- Orchestrator escalates after 3 failures

---

## Success Criteria

### Immediate
- [ ] Quality agent can define tests for features
- [ ] Quality agent can validate implementations
- [ ] Problem solver analyzes failures correctly
- [ ] Fix loop executes and re-tests
- [ ] Lessons captured after fixes

### Near-term (Month 1)
- [ ] 90%+ tests pass on first try (learning effect)
- [ ] Average fix time < 15 minutes
- [ ] 100% lesson capture rate
- [ ] Repeated problems decrease over time

### Long-term (Quarter 1)
- [ ] 95%+ tests pass on first try
- [ ] Average fix time < 5 minutes
- [ ] Problems rarely repeat (3rd occurrence triggers pattern)
- [ ] Quality improves continuously
- [ ] Developer confidence in system high

---

## Performance Requirements

### Quality Validation
- Test definition: < 5 minutes per feature
- Validation execution: < 2 minutes per feature
- Pass/fail determination: < 30 seconds

### Problem Solving
- Analysis (ultrathink): < 2 minutes per problem
- Solution proposal: < 1 minute
- Total problem → solution: < 5 minutes

### Fix Loop
- Average fix time: < 15 minutes (target)
- Re-test time: < 2 minutes
- Total loop: < 20 minutes

---

## Testing Strategy

### Unit Tests
- Quality agent creates valid test documents
- Problem solver identifies root causes correctly
- Fix loop coordinates events properly
- Lesson capture validates format

### Integration Tests
- Complete quality loop (fail → analyze → fix → re-test → pass)
- Multiple failures handled correctly
- Lessons integrated into knowledge base
- Patterns referenced in solutions

### Long-term Tests
- Track quality improvement over time
- Measure repeated problem reduction
- Measure fix time reduction
- Measure lesson capture rate

---

## Error Handling

### Test Definition Errors
- Invalid test format → Validation error
- Missing criteria → Warning + default
- Unclear criteria → Request clarification

### Validation Errors
- Test execution fails → Log error, retry
- Timeout → Escalate after 5 minutes
- Unclear results → Request specialist review

### Problem Solving Errors
- Can't determine root cause → Escalate to human
- No similar lessons found → Document as new issue
- Solution unclear → Propose investigation tasks

### Fix Loop Errors
- Fix doesn't work (3x) → Escalate to human
- Lesson not captured → Reminder + block completion
- Re-test fails → Back to problem solver

---

## Metrics to Track

### Quality Metrics
- Tests passing on first try (% over time)
- Average test definition time
- Average validation time
- Issues found per feature

### Problem Solving Metrics
- Average analysis time
- Average fix time
- Fix success rate (1st attempt)
- Repeated problems (count over time)

### Learning Metrics
- Lessons captured per week
- Patterns promoted from lessons
- Knowledge search frequency
- Pattern application rate

---

## Next Steps

**Create test templates** (3 markdown files):
1. `one/knowledge/patterns/test/user-flow-template.md`
2. `one/knowledge/patterns/test/acceptance-criteria-template.md`
3. `one/knowledge/patterns/test/technical-test-template.md`

**Already implemented:**
- ✅ agent-quality.md (defines test creation + validation workflow)
- ✅ agent-problem-solver.md (defines failure analysis + solution workflow)
- ✅ Specialist agent prompts (implement fixes)

**Workflow ready to use** - Claude can follow quality loop workflow now.

---

## References

- **Plan:** `one/things/plans/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md` (Quality Loops section)
- **Feature 1-1:** Agent prompts (quality + problem solver already exist)
- **Feature 1-4:** Knowledge management (lessons-learned.md for lesson capture)
- **Feature 1-2:** Workflow guide (Stage 4: Tests, Stage 6: Implementation with validation)

---

**Status:** ⚠️ REQUIRES SETUP (Create 3 test template files)

**Key insights:**

1. **Tests ARE markdown files** - User flows + acceptance criteria + technical tests
2. **Bash IS the test runner** - `bun test`, `npm test`, existing tools
3. **Ultrathink IS problem solving** - Claude's deep analysis mode
4. **Iteration IS the fix loop** - Claude naturally retries after fixes
5. **Quality IS a workflow** - Not infrastructure, just following agent prompts

**How the quality loop works:**
```
Claude (as quality agent) → Creates tests.md → Defines pass criteria
Claude (as specialist) → Implements feature → Runs tests (Bash)
Tests fail → Claude (as problem-solver) → Analyzes with ultrathink
Searches lessons-learned.md → Finds/doesn't find similar issue
Proposes fix → Implements fix → Re-runs tests
Tests pass → Appends lesson to lessons-learned.md → Done
Next time → Similar problem avoided (lesson found) → Faster, better
```

**This is how continuous quality improvement works - every failure becomes institutional knowledge.** 🎯

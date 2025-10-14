# Quality Loop Process

**Version:** 1.0.0
**Status:** Implementation Ready

---

## Overview

The Quality Loop ensures every feature meets standards through test-driven validation and problem-solving when tests fail.

**Philosophy:** Tests define quality. If tests pass, quality is achieved. If tests fail, we analyze, fix, learn.

---

## The Loop

```
Implementation
    ↓
Quality Validates → Tests Run
    ↓               ↓
  PASS            FAIL
    ↓               ↓
Document        Problem Solver Analyzes (Ultrathink)
    ↓               ↓
  DONE          Proposes Solution
                    ↓
                Delegates to Specialist
                    ↓
                Specialist Fixes
                    ↓
                Add Lesson Learned
                    ↓
                Re-test → Loop
```

---

## Agents Involved

### Quality Agent
- **Defines tests** - User flows, acceptance criteria, technical tests
- **Runs validation** - Executes tests against implementation
- **Reports results** - Pass/fail with detailed information

### Problem Solver Agent
- **Analyzes failures** - Uses ultrathink mode for deep analysis
- **Searches knowledge** - References lessons-learned.md
- **Proposes solutions** - Specific, minimal fixes
- **Delegates fixes** - Assigns to appropriate specialist

### Specialist Agents
- **Implement fixes** - Based on problem solver's solution
- **Re-test** - Verify fix resolves the issue
- **Document lessons** - Capture what was learned

---

## Phase 1: Quality Validation

### Input
- Feature implementation (code files)
- Test specification (user flows, acceptance criteria)
- Design specification (wireframes, components)

### Quality Agent Process

1. **Load test specification**
   - User flows (what users want to accomplish)
   - Acceptance criteria (specific requirements)
   - Technical tests (implementation validation)

2. **Run tests**
   - Unit tests (isolated functions)
   - Integration tests (multiple components)
   - E2E tests (full user journeys)

3. **Validate against ontology**
   - Check entities map to correct types
   - Verify connections use correct relationship types
   - Ensure events are logged properly
   - Confirm knowledge integration works

4. **Generate report**
   ```json
   {
     "passed": false,
     "results": {
       "userFlows": {
         "total": 3,
         "passed": 2,
         "failed": 1,
         "failures": [
           {
             "flow": "User enrolls in course",
             "step": "Course appears in My Courses",
             "error": "Course not found in query results"
           }
         ]
       },
       "acceptanceCriteria": {
         "total": 8,
         "passed": 6,
         "failed": 2
       },
       "technicalTests": {
         "total": 15,
         "passed": 13,
         "failed": 2
       }
     }
   }
   ```

### Output
- Quality report (passed/failed with details)
- Event: `quality_check_complete` or `test_failed`

---

## Phase 2: Problem Solving (When Tests Fail)

### Input
- Failed test report
- Implementation code
- Test specification
- Ontology structure
- Lessons learned (previous fixes)

### Problem Solver Process

1. **Activate ultrathink mode**
   - Deep analysis with extended context
   - Search for patterns in failures
   - Reference similar past problems

2. **Root cause analysis**
   - Why did this specific test fail?
   - What code/logic is incorrect?
   - What pattern was missed or misapplied?

3. **Search lessons learned**
   ```bash
   # Search for similar problems
   grep -i "enrollment" one/knowledge/lessons-learned.md
   grep -i "query not returning" one/knowledge/lessons-learned.md
   ```

4. **Propose solution**
   ```json
   {
     "rootCause": "Enrollment mutation not triggering real-time update",
     "pattern": "Convex real-time subscription pattern",
     "solution": {
       "change": "Add invalidation after enrollment mutation",
       "files": ["backend/convex/mutations/enrollment.ts"],
       "fix": "await ctx.db.insert(...); // Then trigger invalidation"
     },
     "delegateTo": "backend",
     "lesson": {
       "title": "Real-time Updates After Mutations",
       "problem": "Mutations don't automatically trigger query updates",
       "solution": "Convex automatically invalidates, but async timing can cause race conditions",
       "rule": "Always verify query subscriptions update after mutations",
       "example": "See backend/convex/mutations/enrollment.ts"
     }
   }
   ```

5. **Emit event**
   - Event: `solution_proposed`
   - Metadata: { rootCause, delegateTo }

### Output
- Solution proposal (specific fix)
- Delegation (which specialist)
- Lesson to be captured

---

## Phase 3: Fix Implementation

### Input
- Solution proposal from problem solver
- Original failing test
- Context about the failure

### Specialist Process

1. **Review solution**
   - Understand root cause
   - Verify proposed fix
   - Check for side effects

2. **Implement fix**
   - Make minimal changes
   - Follow solution proposal
   - Add comments explaining fix

3. **Verify locally**
   - Run failing test
   - Confirm it now passes
   - Check no regressions

4. **Emit event**
   - Event: `fix_complete`
   - Metadata: { featureId, filesChanged }

### Output
- Fixed implementation
- Event: `fix_complete`

---

## Phase 4: Lesson Capture

### Input
- Lesson from problem solver's solution
- Fixed implementation
- Test results (now passing)

### Process

1. **Format lesson**
   ```markdown
   ### Real-time Updates After Mutations
   **Date:** 2025-10-12
   **Feature:** 2-1-course-enrollment
   **Problem:** Enrollment mutation completed but course didn't appear in "My Courses" list
   **Solution:** Convex automatically invalidates queries, but async timing caused race condition. Added explicit wait for query subscription update.
   **Pattern:** After mutations that affect list queries, verify real-time updates complete
   **Context:** Applies to any mutation → query flow with real-time subscriptions
   **Example:**
   ```typescript
   // backend/convex/mutations/enrollment.ts
   export const enroll = mutation({
     handler: async (ctx, args) => {
       await ctx.db.insert("enrollments", {...});
       // Convex handles invalidation automatically
       // But for critical flows, add explicit verification
     }
   });
   ```
   **Related:** [Convex Real-time Pattern](../patterns/backend/convex-realtime.md)
   ```

2. **Append to lessons-learned.md**
   - Add to appropriate category
   - Link to related patterns
   - Include code example

3. **Update pattern library** (if new pattern discovered)
   - Create pattern file if needed
   - Link from lessons learned

4. **Emit event**
   - Event: `lesson_learned_added`
   - Metadata: { category, title }

### Output
- Updated lessons-learned.md
- Optional: New pattern file
- Event: `lesson_learned_added`

---

## Phase 5: Re-validation

After fix is implemented and lesson is captured:

1. **Quality agent re-runs tests**
2. **All tests must pass**
3. **If still failing → Back to Phase 2** (problem solver)
4. **If passing → Proceed to documentation**

---

## Success Criteria

### Immediate
- [ ] Tests defined before implementation
- [ ] Failed tests trigger problem solving
- [ ] Root cause analysis completed
- [ ] Fixes are minimal and targeted
- [ ] Lessons captured after every fix

### Near-term
- [ ] 90%+ tests pass on first try
- [ ] Problem solver finds solutions in < 5 minutes
- [ ] Lessons learned reduces repeat issues
- [ ] Fix cycle completes in < 15 minutes

### Long-term
- [ ] Zero repeat issues (lessons prevent them)
- [ ] Test-driven development is automatic
- [ ] Quality loop runs autonomously
- [ ] Knowledge base grows continuously

---

## Integration with Orchestrator

The orchestrator handles quality loop coordination:

```typescript
// From orchestrator.ts

private async validateImplementation(
  feature: Feature,
  tests: Test,
  implementation: any
): Promise<any> {
  // Quality validation
  const result = await this.runAgent('quality', 'validate', ...);

  if (result.passed) {
    // Success path
    await this.generateDocumentation(...);
    this.emitEvent('feature_complete', ...);
    return { success: true, result };
  } else {
    // Problem solving path
    this.emitEvent('test_failed', ...);
    return this.solveProblem(feature, tests, implementation, result);
  }
}

private async solveProblem(...): Promise<any> {
  // Analyze with ultrathink
  const solution = await this.runAgent('problem_solver', 'analyze_failures', ...);

  // Delegate fix
  const fix = await this.runAgent(solution.delegateTo, 'implement_fix', ...);

  // Capture lesson
  this.addLessonLearned(solution.lesson);

  // Re-validate
  return this.validateImplementation(feature, tests, fix);
}
```

---

## Events Generated

Quality loop generates these workflow events:

- `quality_check_started` - Quality agent begins validation
- `quality_check_complete` - All tests passed
- `test_started` - Individual test begins
- `test_passed` - Individual test succeeded
- `test_failed` - Individual test failed (triggers problem solving)
- `problem_analysis_started` - Problem solver begins ultrathink
- `solution_proposed` - Problem solver has a fix
- `fix_started` - Specialist begins implementing fix
- `fix_complete` - Fix is implemented
- `lesson_learned_added` - Lesson captured in knowledge base

---

## Best Practices

1. **Tests first, always** - Never implement without tests
2. **Minimal fixes** - Smallest change that makes tests pass
3. **Capture lessons** - Every fix adds to knowledge base
4. **Reference lessons** - Always search before solving
5. **Ultrathink for hard problems** - Use deep analysis mode

---

## Common Patterns

### Pattern: Test Isolation
**Problem:** Tests fail due to order dependence
**Solution:** Each test creates and cleans up its own data
**Rule:** Never depend on test execution order

### Pattern: Async Timing
**Problem:** Tests fail intermittently due to timing
**Solution:** Use Convex's built-in consistency guarantees
**Rule:** Trust Convex's real-time subscriptions, avoid manual timing

### Pattern: Ontology Validation
**Problem:** Wrong entity type causes query failures
**Solution:** Validate types against ontology before mutations
**Rule:** Always check ontology.yaml for correct types

---

## Related Documentation

- [Agent Prompts](../things/agents/) - All agent role definitions
- [Lessons Learned](./lessons-learned.md) - Institutional knowledge
- [Pattern Library](./patterns/) - Implementation patterns
- [Orchestrator](../../backend/convex/orchestrator.ts) - Workflow automation

---

**Status:** Ready for implementation in Plan 1, Feature 1-5

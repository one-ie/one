# Tests for Feature 1-5: Quality Loops and Problem Solving

**Feature:** 1-5-quality-loops
**Status:** Tests Defined → Design Phase
**Quality Agent:** agent-quality.md

---

## User Flows

### Flow 1: Define Tests for Feature
**User goal:** Quality agent creates test criteria before implementation
**Time budget:** < 5 minutes per feature
**Steps:**
1. Quality agent receives feature spec
2. Quality agent identifies user goals
3. Quality agent writes user flows (what users must accomplish)
4. Quality agent defines acceptance criteria (specific, measurable)
5. Quality agent defines technical tests (unit, integration, e2e)
6. Test document created

**Acceptance Criteria:**
- [ ] User flows written (1-3 flows per feature)
- [ ] Each flow has time budget
- [ ] Acceptance criteria specific and measurable
- [ ] Technical tests comprehensive
- [ ] Total time: < 5 minutes
- [ ] Test document ready for design phase

---

### Flow 2: Validate Implementation
**User goal:** Quality agent checks if implementation meets all criteria
**Time budget:** < 10 minutes per feature
**Steps:**
1. Quality agent receives `implementation_complete` event
2. Quality agent loads test document
3. Quality agent runs user flows (manual or automated)
4. Quality agent checks acceptance criteria
5. Quality agent runs technical tests
6. Quality agent logs result (approved/rejected)

**Acceptance Criteria:**
- [ ] All user flows tested
- [ ] All acceptance criteria checked
- [ ] All technical tests run
- [ ] Pass/fail decision clear
- [ ] Issues documented with details
- [ ] Total validation time: < 10 minutes

---

### Flow 3: Problem Analysis (Ultrathink)
**User goal:** Problem solver identifies root cause of test failure
**Time budget:** < 2 minutes per problem
**Steps:**
1. Problem solver receives `test_failed` event
2. Problem solver loads failed test details
3. Problem solver loads implementation code
4. Problem solver searches lessons learned
5. Problem solver analyzes root cause (ultrathink mode)
6. Problem solver proposes specific solution
7. Problem solver logs `solution_proposed` event

**Acceptance Criteria:**
- [ ] Root cause correctly identified
- [ ] Similar issues found in lessons (if exist)
- [ ] Solution specific with code examples
- [ ] Correct specialist assigned
- [ ] Analysis time: < 2 minutes
- [ ] Solution actionable

---

### Flow 4: Fix Implementation Loop
**User goal:** Specialist fixes problem and re-tests pass
**Time budget:** < 15 minutes per fix
**Steps:**
1. Specialist receives `solution_proposed` event
2. Specialist reads solution proposal
3. Specialist implements fix
4. Specialist captures lesson learned
5. Specialist logs `fix_complete` event
6. Quality agent re-runs tests
7. Tests pass

**Acceptance Criteria:**
- [ ] Fix implemented correctly
- [ ] Lesson captured (problem + solution + pattern)
- [ ] Fix complete: < 15 minutes
- [ ] Tests pass on re-run
- [ ] Knowledge base updated
- [ ] No regression introduced

---

### Flow 5: Continuous Quality Improvement
**User goal:** System learns from mistakes, quality improves over time
**Time budget:** Ongoing
**Steps:**
1. Month 1: 80% tests pass first try, 20% need fixes
2. Month 3: 90% tests pass first try (lessons help)
3. Quarter 1: 95% tests pass first try (patterns prevent)
4. Average fix time decreases (15min → 5min)
5. Repeated problems eliminated

**Acceptance Criteria:**
- [ ] Month 1: 80% first-try pass rate
- [ ] Month 3: 90% first-try pass rate
- [ ] Quarter 1: 95% first-try pass rate
- [ ] Fix time decreases over time
- [ ] Repeated problems tracked and eliminated
- [ ] Knowledge base grows continuously

---

## Technical Tests

### Unit Tests

**Test Definition:**
- [ ] Quality agent creates valid test documents
- [ ] User flows have required fields
- [ ] Acceptance criteria are measurable
- [ ] Technical tests are comprehensive

**Validation:**
- [ ] Quality agent checks ontology alignment
- [ ] Quality agent runs all tests
- [ ] Quality agent reports pass/fail correctly
- [ ] Quality agent logs events

**Problem Analysis:**
- [ ] Problem solver loads correct context (2500 tokens)
- [ ] Problem solver searches lessons learned
- [ ] Problem solver identifies root cause
- [ ] Problem solver proposes solution

**Fix Loop:**
- [ ] Specialist receives solution
- [ ] Specialist implements fix
- [ ] Specialist captures lesson
- [ ] Quality re-runs tests

---

### Integration Tests

**Complete Quality Loop:**
- [ ] Implementation → Quality validates
- [ ] Test fails → Problem solver analyzes
- [ ] Solution proposed → Specialist fixes
- [ ] Lesson captured → Knowledge updated
- [ ] Re-test → Tests pass
- [ ] Documentation → Feature complete

**Parallel Testing:**
- [ ] Multiple features validated simultaneously
- [ ] Test results independent
- [ ] No interference between tests

**Retry Logic:**
- [ ] Failed test triggers analysis
- [ ] Fix attempted (1st try)
- [ ] Re-test fails → 2nd try
- [ ] Re-test fails → 3rd try
- [ ] After 3 failures → Escalate to human

---

### E2E Tests

**Simple Feature (No Failures):**
- [ ] Quality defines tests (5 min)
- [ ] Implementation complete
- [ ] Quality validates (10 min)
- [ ] All tests pass first try
- [ ] Documentation written
- [ ] Feature complete

**Complex Feature (With Failures):**
- [ ] Quality defines tests
- [ ] Implementation complete
- [ ] Quality validates → 2 tests fail
- [ ] Problem solver analyzes both (< 4 min)
- [ ] Specialists fix both (< 30 min)
- [ ] Lessons captured (2 lessons)
- [ ] Re-test → All pass
- [ ] Feature complete

**Quality Improvement Over Time:**
- [ ] Track pass rates over 3 months
- [ ] Month 1: 80% pass first try
- [ ] Month 3: 90% pass first try
- [ ] Average fix time: 15min → 5min
- [ ] Repeated problems: 20% → 5%

---

## Definition of Done

- [ ] Quality agent defines tests correctly
- [ ] Quality agent validates implementations
- [ ] Problem solver analyzes failures (ultrathink)
- [ ] Fix loop executes and re-tests
- [ ] Lessons captured after every fix
- [ ] Quality improves over time
- [ ] All tests pass

---

**Next:** Design phase - Quality validation workflow and problem-solving architecture

# Tests for Feature 1-1: Agent Prompts System

**Feature:** 1-1-agent-prompts
**Status:** Tests Defined → Design Phase
**Quality Agent:** agent-quality.md

---

## User Flows (What Users Must Accomplish)

### Flow 1: Agent Understands Its Role
**User goal:** Agent receives work and knows what to do
**Time budget:** < 5 seconds to parse prompt and context
**Steps:**
1. Agent receives feature assignment event
2. Agent loads prompt from file
3. Agent understands role, responsibilities, inputs, outputs
4. Agent knows what decisions to make
5. Agent begins work correctly

**Acceptance Criteria:**
- [ ] Agent loads correct prompt file (< 100ms)
- [ ] Agent parses role and responsibilities clearly
- [ ] Agent identifies required inputs from event metadata
- [ ] Agent knows what outputs to produce
- [ ] Agent understands decision framework
- [ ] Total prompt comprehension: < 5 seconds

---

### Flow 2: Agent Coordinates via Events
**User goal:** Agents communicate through events without manual intervention
**Time budget:** < 1 second per event emission/reception
**Steps:**
1. Agent completes work
2. Agent emits appropriate event with metadata
3. Other agents monitoring for that event receive it
4. Receiving agents act on event automatically
5. No manual coordination needed

**Acceptance Criteria:**
- [ ] Agent emits events with correct type and metadata
- [ ] Events logged to events table (< 50ms)
- [ ] Subscribing agents receive events (< 500ms)
- [ ] Agents trigger correct actions based on events
- [ ] No missed events (100% delivery)
- [ ] Complete coordination cycle: < 5 seconds

---

### Flow 3: Agent Uses Context Correctly
**User goal:** Agent loads exactly what it needs within token budget
**Time budget:** < 2 seconds to assemble context
**Steps:**
1. Agent receives assignment
2. Agent determines what context needed
3. Agent loads ontology types (if needed)
4. Agent loads patterns (if needed)
5. Agent loads recent lessons (if needed)
6. Agent stays within token budget
7. Agent has sufficient context to execute

**Acceptance Criteria:**
- [ ] Context loading: < 2 seconds
- [ ] Token count within budget (director: 200, specialist: 1500, quality: 2000, problem-solver: 2500, documenter: 1000)
- [ ] Includes all necessary information
- [ ] Excludes unnecessary information
- [ ] Context prioritizes recent/relevant items
- [ ] Agent can execute successfully with loaded context

---

### Flow 4: Agent Makes Correct Decisions
**User goal:** Agent follows decision framework consistently
**Time budget:** < 10 seconds per decision
**Steps:**
1. Agent encounters decision point
2. Agent references decision framework from prompt
3. Agent evaluates options against criteria
4. Agent makes decision
5. Agent documents reasoning
6. Decision aligns with framework

**Acceptance Criteria:**
- [ ] Agent references decision framework
- [ ] Agent evaluates all decision criteria
- [ ] Agent makes consistent decisions (same inputs → same outputs)
- [ ] Agent documents reasoning in output
- [ ] Decisions align with role responsibilities
- [ ] Decision time: < 10 seconds

---

### Flow 5: Agent Captures Examples from Prompt
**User goal:** Agent learns from examples in prompt
**Time budget:** Instant (examples part of prompt)
**Steps:**
1. Agent reads prompt with examples
2. Agent identifies example patterns
3. Agent applies example patterns to current work
4. Agent output matches example format
5. Consistency across similar tasks

**Acceptance Criteria:**
- [ ] Agent output format matches prompt examples
- [ ] Agent applies patterns from examples
- [ ] Consistent structure across outputs
- [ ] Examples inform agent behavior
- [ ] New situations handled similarly to examples

---

## Technical Tests (Implementation Validation)

### Unit Tests

**Prompt Loading:**
- [ ] `loadAgentPrompt(role)` loads correct .md file
- [ ] `loadAgentPrompt(role)` caches after first load
- [ ] `loadAgentPrompt(role)` returns error if file missing
- [ ] `loadAgentPrompt(role)` handles all 8 agent types

**Context Assembly:**
- [ ] `assembleContext(role, input)` stays within token budget
- [ ] `assembleContext("director")` loads 200 tokens (ontology types)
- [ ] `assembleContext("backend-specialist")` loads 1500 tokens (types + patterns)
- [ ] `assembleContext("quality")` loads 2000 tokens (ontology + feature + UX)
- [ ] `assembleContext("problem-solver")` loads 2500 tokens (tests + code + ontology)
- [ ] `assembleContext("documenter")` loads 1000 tokens (feature + tests)

**Decision Framework:**
- [ ] Agents parse decision framework from prompt
- [ ] Agents apply framework to inputs
- [ ] Same inputs → same decisions (consistency)

**Event Communication:**
- [ ] Agent emits correct event types
- [ ] Event metadata includes required fields
- [ ] Events logged to events table
- [ ] Agent subscriptions trigger correctly

---

### Integration Tests

**Complete Agent Execution:**
- [ ] Director agent: Validates idea → creates plan
- [ ] Backend specialist: Writes feature spec → implements code
- [ ] Frontend specialist: Writes UI spec → implements components
- [ ] Integration specialist: Connects systems → validates flow
- [ ] Quality agent: Defines tests → validates implementation
- [ ] Design agent: Creates wireframes → defines architecture
- [ ] Problem solver: Analyzes failure → proposes solution
- [ ] Documenter: Writes docs → updates knowledge base

**Agent Coordination:**
- [ ] Director assigns → Specialist receives
- [ ] Specialist completes → Quality validates
- [ ] Quality fails → Problem solver analyzes
- [ ] Problem solver proposes → Specialist fixes
- [ ] Specialist fixes → Quality re-validates
- [ ] Quality passes → Documenter writes
- [ ] Documenter completes → Director marks done

**Context Management:**
- [ ] All agents stay within token budgets
- [ ] Context includes necessary information
- [ ] Context loading performant (< 2s)

---

### E2E Tests

**Complete Workflow (Idea → Implementation):**
- [ ] Director validates idea (Flow 1)
- [ ] Director creates plan with features
- [ ] Director assigns features to specialists
- [ ] Specialists write specs using prompts
- [ ] Quality defines tests
- [ ] Design creates wireframes
- [ ] Specialists implement
- [ ] Quality validates
- [ ] Documenter writes docs
- [ ] Director marks complete
- [ ] Total time: < 1 hour for simple feature

**Agent Coordination (No Manual Intervention):**
- [ ] Agents coordinate via events only
- [ ] No manual handoffs needed
- [ ] Parallel execution works (multiple features)
- [ ] Error handling works (test failures → problem solver)
- [ ] Knowledge capture works (lessons learned added)

**Prompt Quality:**
- [ ] All 8 prompts contain required sections
- [ ] Prompts are clear and unambiguous
- [ ] Examples are helpful and accurate
- [ ] Decision frameworks are complete
- [ ] Communication patterns are defined

---

## Definition of Done

- [ ] All 8 agent prompt files created
- [ ] All user flows work as specified
- [ ] All acceptance criteria met
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All e2e tests pass
- [ ] Agents coordinate autonomously via events
- [ ] Context budgets respected
- [ ] Decision frameworks applied consistently
- [ ] Examples in prompts inform agent behavior

---

## Test Priority

**Critical (Must Pass):**
- Agent loads correct prompt
- Context stays within token budget
- Agents emit events correctly
- Basic coordination works (assign → receive)

**High (Should Pass):**
- All user flows work
- Decision framework applied consistently
- Complete workflow (idea → implementation)

**Medium (Nice to Have):**
- Performance targets met (< 2s context, < 5s decisions)
- Advanced coordination (error handling, parallel execution)

---

## Test Execution Plan

### Phase 1: Unit Tests (Week 1)
- Test prompt loading
- Test context assembly
- Test decision framework parsing
- Test event emission

### Phase 2: Integration Tests (Week 2)
- Test agent execution (one agent at a time)
- Test agent coordination (pairs: director → specialist)
- Test context management

### Phase 3: E2E Tests (Week 3)
- Test complete workflow (simple feature)
- Test error handling (test failures)
- Test parallel execution
- Test knowledge capture

### Phase 4: Refinement (Week 4)
- Fix failing tests
- Optimize performance
- Improve prompt clarity
- Add missing examples

---

**Next:** Design phase - Structure prompt templates and context loading system

# Tests for Feature 1-2: YAML-Driven Orchestrator

**Feature:** 1-2-yaml-orchestrator
**Status:** Tests Defined → Design Phase
**Quality Agent:** agent-quality.md

---

## User Flows

### Flow 1: Load Workflow Configuration
**User goal:** Orchestrator reads YAML and understands workflow
**Time budget:** < 100ms
**Steps:**
1. Orchestrator starts
2. Reads `ontology-minimal.yaml`
3. Parses workflow section
4. Validates configuration structure
5. Ready to execute

**Acceptance Criteria:**
- [ ] Reads YAML file successfully
- [ ] Parses workflow.stages (6 levels)
- [ ] Parses workflow.agents (8 agents)
- [ ] Validates required fields present
- [ ] Load time: < 100ms
- [ ] Clear error if YAML invalid

---

### Flow 2: Execute Complete Workflow
**User goal:** Orchestrator runs idea → implementation
**Time budget:** < 1 hour for simple feature
**Steps:**
1. User provides idea
2. Orchestrator executes Stage 1 (Ideas) - Director validates
3. Orchestrator executes Stage 2 (Plans) - Director creates plan
4. Orchestrator executes Stage 3 (Features) - Specialists write specs
5. Orchestrator executes Stage 4 (Tests) - Quality defines tests
6. Orchestrator executes Stage 5 (Design) - Design creates wireframes
7. Orchestrator executes Stage 6 (Implementation) - Specialists implement
8. Feature complete

**Acceptance Criteria:**
- [ ] All 6 stages execute in order
- [ ] Each stage produces expected output
- [ ] Context passed correctly between stages
- [ ] Events logged at each step
- [ ] Total time: < 1 hour (simple feature)
- [ ] No manual intervention needed

---

### Flow 3: Invoke Agent with Context
**User goal:** Orchestrator loads agent and provides correct context
**Time budget:** < 5 seconds per agent invocation
**Steps:**
1. Orchestrator determines which agent needed
2. Loads agent prompt from file
3. Assembles context within token budget
4. Invokes AI assistant with prompt + context
5. Receives agent output
6. Logs event

**Acceptance Criteria:**
- [ ] Correct agent selected for stage
- [ ] Agent prompt loaded (< 100ms)
- [ ] Context assembled within budget
- [ ] AI assistant invoked successfully
- [ ] Output captured completely
- [ ] Event logged with metadata
- [ ] Total time: < 5 seconds

---

### Flow 4: Handle Parallel Execution
**User goal:** Multiple features execute simultaneously
**Time budget:** Same as sequential (parallelization = free performance)
**Steps:**
1. Orchestrator reaches Stage 3 (Features)
2. Multiple features assigned to specialists
3. Specialists work in parallel
4. Orchestrator waits for all to complete
5. Proceeds to next stage

**Acceptance Criteria:**
- [ ] Multiple agents invoked in parallel
- [ ] All agents complete successfully
- [ ] Results collected from all agents
- [ ] No race conditions
- [ ] Performance gain (3 features in parallel = ~1x time, not 3x)

---

### Flow 5: Recover from Errors
**User goal:** Orchestrator handles failures gracefully
**Time budget:** < 30 seconds to detect and respond
**Steps:**
1. Orchestrator invokes agent
2. Agent throws error (network, timeout, invalid output)
3. Orchestrator catches error
4. Orchestrator retries (up to 3x)
5. If still failing, logs error and escalates
6. User notified with helpful message

**Acceptance Criteria:**
- [ ] Errors caught and logged
- [ ] Retry up to 3x
- [ ] Exponential backoff between retries
- [ ] Clear error messages to user
- [ ] State saved (can resume)
- [ ] Escalation after 3 failures

---

## Technical Tests

### Unit Tests

**Configuration Loading:**
- [ ] `loadWorkflowConfig()` parses YAML correctly
- [ ] `loadWorkflowConfig()` validates required fields
- [ ] `loadWorkflowConfig()` returns error on invalid YAML
- [ ] `loadWorkflowConfig()` caches configuration

**Stage Execution:**
- [ ] `executeStage("1_ideas", input)` calls director agent
- [ ] `executeStage("2_plans", input)` calls director agent
- [ ] `executeStage("3_features", input)` calls specialists (parallel)
- [ ] `executeStage("4_tests", input)` calls quality agent
- [ ] `executeStage("5_design", input)` calls design agent
- [ ] `executeStage("6_implementation", input)` calls specialists + quality

**Agent Invocation:**
- [ ] `runAgent(role, task, context)` loads correct prompt
- [ ] `runAgent(role, task, context)` assembles context
- [ ] `runAgent(role, task, context)` invokes AI assistant
- [ ] `runAgent(role, task, context)` logs event
- [ ] `runAgent(role, task, context)` returns output

**Parallel Execution:**
- [ ] `runAgentParallel(role, task, contexts)` invokes multiple agents
- [ ] `runAgentParallel()` waits for all to complete
- [ ] `runAgentParallel()` collects all results
- [ ] `runAgentParallel()` handles partial failures

**Context Assembly:**
- [ ] `assembleContext(role, input)` loads ontology types
- [ ] `assembleContext(role, input)` loads patterns
- [ ] `assembleContext(role, input)` stays within budget
- [ ] `assembleContext(role, input)` prioritizes recent lessons

---

### Integration Tests

**Complete Workflow Execution:**
- [ ] Idea → Plan → Features → Tests → Design → Implementation
- [ ] All stages execute successfully
- [ ] Context passed correctly
- [ ] Events logged at each step
- [ ] Output files created in correct locations

**Multi-Feature Parallel Execution:**
- [ ] Plan with 3 features executes
- [ ] Features execute in parallel at Stage 3
- [ ] All features complete
- [ ] Results collected correctly

**Error Handling:**
- [ ] Agent failure triggers retry
- [ ] 3 retries attempted
- [ ] Escalation after 3 failures
- [ ] State saved for resume

**Event Integration:**
- [ ] All workflow events logged
- [ ] Events contain correct metadata
- [ ] Events enable coordination
- [ ] Complete audit trail available

---

### E2E Tests

**Simple Feature (End-to-End):**
- [ ] User provides: "Add password reset"
- [ ] Orchestrator validates idea (Stage 1)
- [ ] Orchestrator creates plan (Stage 2)
- [ ] Orchestrator assigns to specialists (Stage 3)
- [ ] Quality defines tests (Stage 4)
- [ ] Design creates wireframes (Stage 5)
- [ ] Specialists implement (Stage 6)
- [ ] Feature complete
- [ ] Total time: < 1 hour

**Complex Feature (Multiple Specialists):**
- [ ] User provides: "Build course platform"
- [ ] Orchestrator creates plan with 4 features
- [ ] Features execute in parallel
- [ ] All specialists coordinate
- [ ] Quality validates all features
- [ ] All features complete
- [ ] Total time: < 4 hours

**Performance:**
- [ ] Configuration load: < 100ms
- [ ] Agent invocation: < 5 seconds
- [ ] Stage execution: < 10 minutes per stage
- [ ] Total workflow: < 1 hour (simple feature)

---

## Definition of Done

- [ ] Orchestrator reads YAML configuration
- [ ] All 6 stages execute correctly
- [ ] Agents invoked with correct context
- [ ] Parallel execution works
- [ ] Error handling and retry logic works
- [ ] Events logged throughout
- [ ] Code under 200 lines total
- [ ] All tests pass

---

**Next:** Design phase - Orchestrator architecture and class structure

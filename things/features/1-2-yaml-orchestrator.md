# Feature 1-2: YAML-Driven Orchestrator

**Assigned to:** Backend Specialist Agent (agent-backend.md)
**Status:** ⚠️ SIMPLIFIED - Claude Code IS the orchestrator
**Plan:** 1-create-workflow
**Priority:** Low (documentation-only)
**Dependencies:** 1-1 (Agent Prompts System)

---

## Simplified Approach: Claude Code IS the Orchestrator

**Key Insight:** We don't need to build an orchestrator. Claude Code already orchestrates by reading instructions and using tools.

### Why No Code Needed

1. **Claude Code can read agent prompts**
   - Uses Read tool to load `one/things/agents/agent-*.md`
   - Understands role, responsibilities, decision framework
   - Follows instructions naturally

2. **Claude Code can route work**
   - Reads workflow guide (this document)
   - Determines which agent to "become" for each task
   - Switches context by reading appropriate agent prompt

3. **Claude Code can execute stages**
   - Validates ideas (reads director prompt)
   - Creates plans (reads director prompt)
   - Writes features (reads specialist prompts)
   - Defines tests (reads quality prompt)
   - Creates designs (reads designer prompt)
   - Implements code (reads specialist prompts)

4. **Claude Code can log events**
   - Uses Write tool to create event files
   - Follows naming conventions from Feature 1-6
   - Creates markdown records naturally

**What we actually need:** A workflow guide (this document) that tells Claude Code which agent prompt to read at each stage.

---

## Feature Specification

### What We're Documenting

A workflow guide that helps Claude Code orchestrate the 6-level agent-based workflow by reading agent prompts and following their instructions. No orchestrator code - just clear documentation of which agent does what, when.

**Philosophy:** Claude Code > Custom Code. Why build an orchestrator when Claude Code can read instructions?

---

## Ontology Types

### Things

- `orchestrator` - Workflow execution engine
  - Properties: `configPath`, `currentStage`, `activeAgents[]`
  - Methods: `execute()`, `executeStage()`, `runAgent()`, `runAgentParallel()`

### Connections

- `executes` - Orchestrator executes workflow stages
- `routes_to` - Orchestrator routes work to agents
- `monitors` - Orchestrator monitors progress via events

### Events

- `workflow_started` - Orchestrator begins execution
  - Metadata: `ideaId`, `timestamp`
- `stage_started` - New workflow stage begins
  - Metadata: `stage` (ideas/plans/features/tests/design/implementation)
- `agent_invoked` - Agent receives work
  - Metadata: `agentRole`, `task`, `contextTokens`
- `stage_completed` - Stage finishes
  - Metadata: `stage`, `duration`, `output`
- `workflow_completed` - Full workflow finishes
  - Metadata: `ideaId`, `duration`, `featuresCompleted`

---

## The 6-Stage Workflow Guide

This guide tells Claude Code which agent prompt to read at each stage and what to do.

### How Claude Code Uses This Guide

**When user provides an idea:**
1. Read this guide to understand workflow stages
2. For each stage, read the appropriate agent prompt
3. Follow that agent's instructions
4. Move to next stage when complete

**No orchestrator code needed** - Claude Code reads and follows instructions naturally.

---

## Stage-by-Stage Instructions

### Stage 1: Ideas (Validation)

**What to do:**
1. Read `one/things/agents/agent-director.md`
2. Follow Director agent's "Validate Idea" instructions
3. Check if idea maps to ontology types (organizations, people, things, connections, events, knowledge)
4. Decide: Is this a single feature or a plan (multiple features)?

**Input:** User's raw idea text

**Output:**
- Valid → Move to Stage 2 (Plans)
- Invalid → Explain why, suggest ontology alignment

**File to create:** `one/things/ideas/{N}-{idea-name}.md` (optional)

---

### Stage 2: Plans (Feature Breakdown)

**What to do:**
1. Read `one/things/agents/agent-director.md`
2. Follow Director agent's "Create Plan" instructions
3. Break validated idea into features
4. Assign each feature to specialist (backend/frontend/integration)
5. Use numbering conventions from Feature 1-6

**Input:** Validated idea

**Output:** Plan file with feature list + assignments

**File to create:** `one/things/plans/{N}-{plan-name}.md`

---

### Stage 3: Features (Specification)

**What to do:**
1. For each feature in plan, read appropriate specialist prompt:
   - Backend features → Read `one/things/agents/agent-backend.md`
   - Frontend features → Read `one/things/agents/agent-frontend.md`
   - Integration features → Read `one/things/agents/agent-integration.md`
2. Follow specialist's "Write Feature Spec" instructions
3. Map feature to ontology types
4. Reference patterns from `one/knowledge/patterns/`
5. Use numbering conventions: `{N}-{M}-{feature-name}.md`

**Input:** Feature assignment from plan

**Output:** Feature specification (Level 3)

**Files to create:** `one/things/features/{N}-{M}-{feature-name}.md` (one per feature)

**Note:** Can be done in parallel for multiple features

---

### Stage 4: Tests (Quality Criteria)

**What to do:**
1. Read `one/things/agents/agent-quality.md`
2. Follow Quality agent's "Define Tests" instructions
3. Define three levels:
   - **User flows:** What users accomplish
   - **Acceptance criteria:** How we know it works
   - **Technical tests:** Unit/integration/e2e
4. Start from user perspective first

**Input:** Feature specification

**Output:** Test criteria

**File to create:** `one/things/features/{N}-{M}-{feature-name}/tests.md`

**Note:** Can be done in parallel for multiple features

---

### Stage 5: Design (Wireframes)

**What to do:**
1. Read `one/things/agents/agent-designer.md`
2. Follow Designer agent's "Create Design" instructions
3. Design to make tests pass (test-driven design)
4. Create:
   - Wireframes (visual structure)
   - Component architecture
   - Design tokens (colors, spacing, timing)
5. Every design decision references a test criterion

**Input:** Feature spec + test criteria

**Output:** Design specification

**File to create:** `one/things/features/{N}-{M}-{feature-name}/design.md`

**Note:** Can be done in parallel for multiple features

---

### Stage 6: Implementation (Code)

**What to do:**
1. Read appropriate specialist prompt (backend/frontend/integration)
2. Follow specialist's "Implement Feature" instructions
3. Write code according to design spec
4. Run tests (read quality agent for validation approach)
5. If tests fail:
   - Read `one/things/agents/agent-problem-solver.md`
   - Follow problem solver's "Analyze & Fix" instructions
   - Implement fix, retest
6. When tests pass:
   - Read `one/things/agents/agent-documenter.md`
   - Follow documenter's "Write Docs" instructions

**Input:** Feature spec + tests + design

**Output:** Working implementation + documentation + lessons learned

**Files to create:**
- Implementation code (varies by feature)
- `one/things/features/{N}-{M}-{feature-name}/lessons.md` (if problems solved)
- Documentation (varies by feature)

**Note:** Sequential per feature (implement → test → fix → document), but multiple features can be done in parallel

---

## Scope

### In Scope (Documentation Only)

- ✅ 6-stage workflow guide (this document)
- ✅ Instructions for which agent to read at each stage
- ✅ Input/output specifications per stage
- ✅ File naming conventions per stage
- ✅ Parallel execution guidance

### Out of Scope (Don't Build)

- ❌ TypeScript orchestrator code (Claude Code handles this)
- ❌ YAML configuration parser (not needed)
- ❌ Agent invocation logic (Claude Code reads prompts naturally)
- ❌ Context assembly utilities (Claude Code manages context)
- ❌ Event system implementation (Feature 1-3, future)
- ❌ Agent prompt files (Feature 1-1, already exists)
- ❌ Knowledge management (Feature 1-4, future)
- ❌ Quality validation logic (Feature 1-5, future)

---

## Files to Create

**None.** This is a workflow guide document, not an implementation.

Claude Code uses this guide by:
1. Reading this document when user provides an idea
2. Following stage-by-stage instructions
3. Reading agent prompts as directed
4. Creating files using tools (Write, Edit, etc.)

**Optional:** Simple reference card for quick lookup
```markdown
# one/workflows/quick-reference.md
Stage 1: Read agent-director.md → Validate idea
Stage 2: Read agent-director.md → Create plan
Stage 3: Read agent-{specialist}.md → Write specs
Stage 4: Read agent-quality.md → Define tests
Stage 5: Read agent-designer.md → Create design
Stage 6: Read agent-{specialist}.md → Implement code
```

---

## Architecture Diagram (AI-Native)

```
User Idea
    ↓
Claude Code reads: one/things/features/1-2-yaml-orchestrator.md
    ↓
Stage 1: Ideas
    ↓
  Claude reads: one/things/agents/agent-director.md
  Follows "Validate Idea" instructions
  Checks ontology alignment
  Creates: one/things/ideas/{N}-{idea-name}.md (optional)
    ↓
Stage 2: Plans
    ↓
  Claude reads: one/things/agents/agent-director.md
  Follows "Create Plan" instructions
  Breaks into features, assigns specialists
  Creates: one/things/plans/{N}-{plan-name}.md
    ↓
Stage 3: Features (for each feature)
    ↓
  Claude reads: one/things/agents/agent-{backend|frontend|integration}.md
  Follows "Write Feature Spec" instructions
  Maps to ontology types
  Creates: one/things/features/{N}-{M}-{feature-name}.md
    ↓
Stage 4: Tests (for each feature)
    ↓
  Claude reads: one/things/agents/agent-quality.md
  Follows "Define Tests" instructions
  Defines user flows, acceptance criteria, technical tests
  Creates: one/things/features/{N}-{M}-{feature-name}/tests.md
    ↓
Stage 5: Design (for each feature)
    ↓
  Claude reads: one/things/agents/agent-designer.md
  Follows "Create Design" instructions
  Creates wireframes, component architecture
  Creates: one/things/features/{N}-{M}-{feature-name}/design.md
    ↓
Stage 6: Implementation (for each feature)
    ↓
  Claude reads: one/things/agents/agent-{specialist}.md
  Implements code, runs tests
  If tests fail: reads agent-problem-solver.md, fixes
  When tests pass: reads agent-documenter.md, writes docs
  Creates: Implementation + documentation + lessons learned
    ↓
All features complete
    ↓
Workflow complete (no code executed, just Claude following instructions)
```

**Key insight:** No orchestrator runs. Claude Code reads instructions and uses tools to complete each stage.

---

## Success Criteria

### Immediate (Documentation)

- [x] Workflow guide documented (this document)
- [x] 6 stages clearly defined
- [x] Agent prompt references for each stage
- [x] File naming conventions specified
- [ ] Claude Code successfully follows guide

### Near-term (Usage)

- [ ] Claude Code reads agent prompts naturally
- [ ] Completes all 6 stages for simple features
- [ ] Creates files in correct locations
- [ ] Handles parallel features correctly
- [ ] Recovers from errors by reading problem-solver prompt

### Long-term (Scale)

- [ ] Works for all 66 thing types
- [ ] Faster than manual process (no context switching)
- [ ] Requires minimal maintenance (update docs, not code)
- [ ] New developers understand workflow immediately

---

## Integration Points (Convention-Based)

### With Feature 1-1 (Agent Prompts)

- ✅ Reads agent prompt files using Read tool
- ✅ 12 agent files exist in `one/things/agents/`
- ✅ Each stage references appropriate agent prompt
- ✅ Claude Code follows agent instructions naturally

### With Feature 1-3 (Events) - Future

- Will optionally log workflow events
- Events can track progress across stages
- Audit trail for completed features

### With Feature 1-4 (Knowledge) - Future

- Agents reference patterns from `one/knowledge/patterns/`
- Problem solver searches lessons learned
- Documenter updates knowledge base

### With Feature 1-5 (Quality) - Future

- Stage 4: Quality agent defines tests
- Stage 6: Quality agent validates implementation
- Problem solver triggered on test failures

### With Feature 1-6 (File Structure)

- ✅ Uses numbering conventions from Feature 1-6
- ✅ Each stage specifies file naming pattern
- ✅ Claude Code creates files in correct locations
- ✅ Maintains hierarchy (plan → features → implementation)

**Key:** All integrations work through documentation references, not code dependencies.

---

## Error Handling (AI-Native)

### Missing Agent Prompts

- Claude checks if agent file exists before reading
- If missing: Clear error to user with expected path
- Example: "Agent prompt not found: one/things/agents/agent-backend.md"

### Invalid User Input

- Claude reads director prompt for validation rules
- Explains why idea doesn't map to ontology
- Suggests how to align idea with ontology types

### Test Failures

- Claude reads problem-solver prompt
- Follows "Analyze & Fix" instructions
- Implements fix, retests automatically

### Claude Code Tool Errors

- File write fails → Retry with corrected path
- Read fails → Check file exists, provide helpful message
- Directory doesn't exist → Create automatically

**Key insight:** Claude Code handles errors intelligently by reading appropriate agent prompts and following their instructions.

---

## Performance Characteristics

### Advantages of AI-Native Approach

- **No code to load/execute** - Just reading markdown files
- **No context switching** - Claude Code maintains context across stages
- **Parallel processing** - Can handle multiple features simultaneously
- **Smart error recovery** - Understands context, doesn't blindly retry

### Expected Workflow Times

- **Documentation reading:** Instant (files already in context)
- **Stage execution:** Depends on LLM speed + file I/O
- **Full workflow:** Variable (complexity-dependent)

**Target: Faster than manual process** - No context switching between tools, agents, or documents.

---

## Testing Strategy (AI-Native)

### Manual Verification

- Give Claude Code a simple idea
- Verify it follows all 6 stages correctly
- Check files created in correct locations
- Confirm agent prompts referenced appropriately

### Agent Validation

- Each agent prompt contains examples
- Claude Code follows examples when uncertain
- Problem solver provides self-correction

### No Unit Tests Needed

- No code to test
- Claude Code's natural language understanding is the "test"
- Verification happens through usage

---

## Next Steps

**None.** This feature is complete as documentation.

**Usage:**
- User provides idea to Claude Code
- Claude Code reads this guide
- Claude Code follows 6-stage workflow
- Claude Code reads agent prompts as directed
- Claude Code creates files and implements features

**To test:** Give Claude Code a simple idea and see if it follows the workflow.

---

## References

- **Plan:** `one/things/plans/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md` (Implementation section)
- **Feature 1-1:** Agent prompts (12 files in `one/things/agents/`)
- **Feature 1-6:** Numbering conventions for file creation
- **Feature 1-3:** Event system (future, optional)
- **Feature 1-4:** Knowledge management (future)
- **Feature 1-5:** Quality loops (future)

---

**Status:** ✅ COMPLETE (Documentation-only feature)

**Key insights:**

1. **Claude Code IS the orchestrator** - No need to build what already exists
2. **Reading > Executing** - Claude reads agent prompts and follows instructions naturally
3. **0 lines of code** - 150+ lines of TypeScript replaced with markdown workflow guide
4. **AI-native architecture** - Leverages LLM's natural ability to understand and follow instructions
5. **Simpler = Better** - Documentation beats code for AI-driven workflows

**How it works:**
```
User: "Build a course platform"
Claude: Reads this guide → Reads agent-director.md → Validates idea →
        Creates plan → Reads agent-backend.md → Writes feature specs →
        Reads agent-quality.md → Defines tests → ... → Complete
```

**No orchestrator code runs. Just Claude following documented instructions.** 🎯

# Design for Feature 1-1: Agent Prompts System

**Feature:** 1-1-agent-prompts
**Status:** Design → Implementation
**Design Agent:** agent-designer.md

---

## Design Goal

Enable `/one` CLI command to seamlessly leverage 12 agent prompts for autonomous workflow execution. Design is focused on how Claude Code naturally reads and applies agent prompts without complex UI.

---

## CLI Context

**Command:** `/one [action]`

**Examples:**
```bash
/one idea "Build a course platform"           # Director validates idea
/one plan 1                                    # Director creates plan 1
/one feature 1-1                               # Specialist writes feature spec
/one test 1-1                                  # Quality defines tests
/one design 1-1                                # Designer creates wireframes
/one implement 1-1                             # Specialist implements
/one fix 1-1                                   # Problem solver analyzes
/one docs 1-1                                  # Documenter writes docs
```

---

## Design Decisions (Test-Driven)

### Decision 1: No Visual UI - Prompt-Driven Interaction
**Test requirement:** Claude must load correct agent prompt based on command
**Design solution:**
- Command maps to agent role
- Claude reads agent prompt file
- Claude follows prompt instructions
- Output is natural conversation + file creation

**Reasoning:** CLI is text-based. Best UX is clear, helpful responses that guide user through workflow.

---

### Decision 2: Agent Context Visible to User
**Test requirement:** User understands which agent is "speaking"
**Design solution:**
```
Claude Code (as Engineering Director):
> I've validated your idea against the ontology...
> Creating plan 2-course-platform with 4 features...

Claude Code (as Backend Specialist):
> Writing feature spec for 2-1-course-crud...
> Mapping to ontology types: course (thing), owns (connection)...

Claude Code (as Quality Agent):
> Defining tests for 2-1-course-crud...
> User flow 1: Create a course in < 10 seconds...
```

**Reasoning:** User knows what's happening and can follow workflow progression.

---

### Decision 3: Prompt Loading is Invisible
**Test requirement:** Agent prompt loads < 100ms, user doesn't wait
**Design solution:**
- Claude uses Read tool to load prompt
- Happens instantly (prompts are small markdown files)
- User sees result, not loading

**Example:**
```
User: /one idea "course platform"

Claude: [Reads agent-director.md]
        [Follows "Validate Idea" instructions]
        [Responds naturally]

✅ Idea validated! Mapped to ontology:
   - Things: course, lesson, creator, student
   - Connections: owns, part_of, enrolled_in
   - Events: course_created, lesson_completed
   - Complexity: Medium (2-3 weeks, 4 features)

Would you like me to create a plan? [Y/n]
```

---

### Decision 4: Context Budget Implicit
**Test requirement:** Claude stays within context budgets (director: 200, specialist: 1500, etc.)
**Design solution:**
- Context budgets documented in agent prompts
- Claude loads only what's needed
- User doesn't see token counts (technical detail)

**Reasoning:** Token budgets are implementation detail. User experiences fast, relevant responses.

---

### Decision 5: Multi-Agent Coordination Transparent
**Test requirement:** Multiple agents coordinate without user intervention
**Design solution:**
```
User: /one implement 1-1

Claude Code (as Backend Specialist):
> Implementing feature 1-1-agent-prompts...
> [Writes code, runs tests]
> Tests failed: Event logging missing

Claude Code (switching to Problem Solver):
> Analyzing failure with ultrathink mode...
> Root cause: Forgot to log agent_prompt_created event
> Proposing fix...

Claude Code (back to Backend Specialist):
> Implementing fix...
> Tests passing ✅
> Capturing lesson learned...

Done! Feature 1-1 complete.
```

**Reasoning:** User sees agents working together, understands what's happening, doesn't need to manually coordinate.

---

## Component Architecture

### 1. Command Router (Claude's Understanding)

```typescript
// Conceptual - Claude understands this pattern naturally
/one idea      → Read agent-director.md → Follow "Validate Idea" section
/one plan      → Read agent-director.md → Follow "Create Plan" section
/one feature   → Read agent-{specialist}.md → Follow "Write Feature Spec"
/one test      → Read agent-quality.md → Follow "Define Tests"
/one design    → Read agent-designer.md → Follow "Create Design"
/one implement → Read agent-{specialist}.md → Follow "Implement Feature"
/one fix       → Read agent-problem-solver.md → Follow "Analyze & Fix"
/one docs      → Read agent-documenter.md → Follow "Write Documentation"
```

**No code needed** - Claude maps commands to agent prompts naturally.

---

### 2. Agent Prompt Structure (Already Defined)

```markdown
# [Agent Role] Agent

## Role
[One sentence]

## Responsibilities
- [List]

## Input / Output
- [Specifications]

## Decision Framework
- [How to make decisions]

## Key Behaviors
- [Critical behaviors]

## Communication Patterns
- [Events to watch/emit]

## Examples
- [Concrete examples]
```

**Design Note:** This structure makes prompts scannable for both Claude and humans.

---

### 3. Response Patterns

**Validation Response:**
```
✅ [Success indicator]
[What was validated]
[Ontology mapping]
[Next steps]

[Optional: Ask for confirmation]
```

**Work In Progress:**
```
🔄 [Agent role]
[Current task]
[Progress indicator]
[What's happening]
```

**Completion Response:**
```
✅ [What completed]
[Key results]
[Files created]
[What to do next]
```

**Error Response:**
```
❌ [What failed]
[Why it failed]
[How to fix]
[Retry suggestion]
```

---

## Wireframes (CLI Outputs)

### Wireframe 1: Validate Idea

```
$ /one idea "course platform for creators"

Claude Code (Engineering Director):
Validating idea against ontology...

✅ Idea validated!

Ontology Mapping:
  Things: course, lesson, creator, student
  Connections: owns (creator→course), part_of (lesson→course),
               enrolled_in (student→course)
  Events: course_created, lesson_completed, course_completed

Complexity: Medium (2-3 weeks, 4 features)

Next Steps:
  1. Create plan with feature breakdown
  2. Assign features to specialists
  3. Execute workflow

Create plan now? [Y/n] _
```

---

### Wireframe 2: Create Plan

```
$ /one plan 1-create-workflow

Claude Code (Engineering Director):
Creating plan 1-create-workflow...

Plan Structure:
  📋 Plan 1: Create Workflow System

  Features:
    1-1: Agent Prompts System (Backend Specialist)
    1-2: YAML-Driven Orchestrator (Backend Specialist)
    1-3: Event Coordination (Backend Specialist)
    1-4: Knowledge Management (Integration Specialist)
    1-5: Quality Loops (Quality + Problem Solver)
    1-6: Numbering Structure (Integration Specialist)

Duration: 4-6 weeks
Team: Backend, Integration, Quality, Problem Solver

✅ Plan created: one/things/plans/1-create-workflow.md

Next: Write feature specs
  /one feature 1-1
  /one feature 1-2
  ... etc
```

---

### Wireframe 3: Write Feature Spec

```
$ /one feature 1-1

Claude Code (Backend Specialist):
Writing feature spec for 1-1-agent-prompts...

Loading context:
  ✓ Ontology types (200 tokens)
  ✓ Backend patterns (500 tokens)
  ✓ Recent lessons (300 tokens)

Analyzing requirements:
  - 12 agent prompts needed
  - Each with role, responsibilities, decision framework
  - Communication patterns via events
  - Examples for each agent

✅ Feature spec complete!
   File: one/things/features/1-1-agent-prompts.md

Next: Define tests
  /one test 1-1
```

---

### Wireframe 4: Multi-Agent Coordination

```
$ /one implement 1-1

Claude Code (Backend Specialist):
Implementing feature 1-1-agent-prompts...

Creating agent prompt files:
  ✓ agent-director.md (39KB)
  ✓ agent-backend.md (7.5KB)
  ✓ agent-frontend.md (47KB)
  ✓ agent-integration.md (6.6KB)
  ✓ agent-quality.md (7.4KB)
  ✓ agent-designer.md (54KB)
  ✓ agent-problem-solver.md (10KB)
  ✓ agent-documenter.md (9.5KB)

Running tests...
  ✓ Prompt loading works
  ✓ Context assembly within budget
  ✗ Event emission test failed

Claude Code (Problem Solver - Ultrathink Mode):
Analyzing test failure...

Root cause: Example event in agent-director.md has invalid metadata structure

Proposing fix: Update event metadata example to match event-coordination.md spec

Claude Code (Backend Specialist):
Implementing fix...
  ✓ Updated agent-director.md event examples
  ✓ Re-running tests
  ✓ All tests passing

Capturing lesson learned...
  ✓ Added to one/knowledge/lessons-learned.md

✅ Feature 1-1 complete!
   Files: 12 agent prompts (303KB total)
   Tests: All passing
   Lesson: Event metadata consistency

Next: /one docs 1-1
```

---

## Design Tokens

### Response Prefixes
```
✅ Success
❌ Error
⚠️  Warning
🔄 In Progress
💡 Idea/Suggestion
📋 Plan/Document
🧪 Testing
🔧 Implementing
📚 Documentation
```

### Agent Indicators
```
Claude Code (Engineering Director):
Claude Code (Backend Specialist):
Claude Code (Frontend Specialist):
Claude Code (Integration Specialist):
Claude Code (Quality Agent):
Claude Code (Design Agent):
Claude Code (Problem Solver):
Claude Code (Documenter):
```

### Timing
- Response time: < 2 seconds for simple operations
- Context loading: < 100ms (invisible to user)
- Agent switching: Instant (just reading different prompt)

---

## Accessibility

### Screen Reader Friendly
- Clear role indicators ("Engineering Director", "Backend Specialist")
- Status emojis have text equivalents
- File paths spoken clearly
- Progress indicators explicit

### Keyboard Navigation
- Commands are text-based (fully keyboard accessible)
- No mouse required
- Tab/autocomplete friendly

### Error Recovery
- Clear error messages
- Suggestions for fixes
- Retry instructions
- Help always available (`/one help`)

---

## Success Criteria from Tests

### User Flows
- ✅ Agent loads correct prompt (< 5 seconds)
- ✅ Agents coordinate via clear role indicators
- ✅ Context stays within budget (invisible to user)
- ✅ Decisions follow framework (consistent results)
- ✅ Examples inform behavior (responses match patterns)

### Acceptance Criteria
- ✅ Prompt loading: < 100ms
- ✅ Role switching: Instant
- ✅ Context assembly: < 2 seconds
- ✅ User understands which agent is "speaking"
- ✅ Workflow progression clear
- ✅ Files created in correct locations

---

## Implementation Notes

**No UI to build** - Just ensure agent prompts are:
1. Well-structured (already done ✅)
2. Easy for Claude to scan
3. Include clear examples
4. Specify decision frameworks

**CLI responses** handled by Claude naturally:
- Reads prompt
- Follows instructions
- Responds conversationally
- Creates files as needed

---

## Next Steps

Ready for Level 6 (Implementation):
- Agent prompts already created ✅ (12 files, 303KB)
- Design validates approach
- CLI flow natural and clear
- Implementation is using the prompts

---

**Status:** ✅ Design Complete

**Key Design Insights:**
1. **No UI needed** - CLI is text-based, agents respond conversationally
2. **Role indicators** - User always knows which agent is "speaking"
3. **Invisible complexity** - Context loading, prompt parsing happen instantly
4. **Multi-agent coordination** - Clear role switches, seamless collaboration
5. **Test-driven design** - Every design decision enables test criteria

**The design is the prompts themselves + Claude's natural conversation ability.** 🎯

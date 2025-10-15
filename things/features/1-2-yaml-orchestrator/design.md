# Design for Feature 1-2: Workflow Orchestration

**Feature:** 1-2-yaml-orchestrator
**Status:** Design → Implementation
**Design Agent:** agent-designer.md

---

## Design Goal

Enable `/one` CLI command to orchestrate the 6-stage workflow naturally by having Claude Code read stage instructions and follow them. Design focuses on workflow progression clarity without building orchestrator infrastructure.

---

## CLI Context

**Command:** `/one [stage/action]`

**Examples:**
```bash
/one idea "Build a course platform"           # Stage 1: Validate idea
/one plan 1                                    # Stage 2: Create plan
/one feature 1-1                               # Stage 3: Write feature spec
/one test 1-1                                  # Stage 4: Define tests
/one design 1-1                                # Stage 5: Create design
/one implement 1-1                             # Stage 6: Implement + validate
/one workflow                                  # Show current workflow status
```

---

## Design Decisions (Test-Driven)

### Decision 1: No Orchestrator Code - Claude Reads Instructions
**Test requirement:** Claude must follow 6-stage workflow from documentation
**Design solution:**
- Workflow guide exists as markdown (Feature 1-2 spec)
- Each stage references which agent prompt to read
- Claude Code reads guide → reads agent → follows instructions
- Natural progression through stages

**Reasoning:** Claude Code already understands instructions. No need to build parsing/execution infrastructure.

---

### Decision 2: Stage Progression Visible to User
**Test requirement:** User understands current stage and what's next
**Design solution:**
```
Claude Code (Engineering Director - Stage 1: Ideas):
> Validating idea against ontology...
> ✅ Idea validated!
>
> Next: Stage 2 (Plans) - Create feature breakdown
> Command: /one plan 1-create-workflow

Claude Code (Engineering Director - Stage 2: Plans):
> Creating plan 1-create-workflow...
> Breaking down into 6 features...
> ✅ Plan created!
>
> Next: Stage 3 (Features) - Write specs
> Commands: /one feature 1-1, /one feature 1-2, ...
```

**Reasoning:** Clear stage indicators help user follow workflow progression.

---

### Decision 3: Workflow Status at a Glance
**Test requirement:** User can check workflow progress anytime
**Design solution:**
```
$ /one workflow

Claude Code:
Current Workflow: Plan 1 (Create Workflow System)

Progress:
✅ Stage 1: Ideas - Validated
✅ Stage 2: Plans - Complete (6 features)
✅ Stage 3: Features - All specs written
✅ Stage 4: Tests - All criteria defined
🔄 Stage 5: Design - 1/6 complete (1-1 done)
⏳ Stage 6: Implementation - Not started

Next Actions:
- /one design 1-2 (complete designs)
- /one implement 1-1 (start implementation)
```

**Reasoning:** Status overview prevents confusion about what's done and what's next.

---

### Decision 4: Parallel Execution Guidance
**Test requirement:** User knows which tasks can run in parallel
**Design solution:**
```
Claude Code (Engineering Director):
Stage 3 complete! All 6 feature specs written.

You can now work on Stage 4 (Tests) in parallel:
  /one test 1-1  (Backend: Agent Prompts)
  /one test 1-2  (Backend: Orchestrator)
  /one test 1-3  (Backend: Events)
  /one test 1-4  (Integration: Knowledge)
  /one test 1-5  (Quality: Quality Loops)
  /one test 1-6  (Integration: Numbering)

💡 Tip: These are independent - no dependencies between them
```

**Reasoning:** Explicit parallel guidance helps user optimize workflow speed.

---

### Decision 5: Automatic Stage Detection
**Test requirement:** Claude detects current stage automatically
**Design solution:**
- Claude checks existing files to determine stage
- If `one/things/plans/1-*.md` exists → Stage 2 complete
- If `one/things/features/1-*/tests.md` exists → Stage 4 complete
- If `one/things/features/1-*/design.md` exists → Stage 5 complete
- No need for user to specify stage explicitly

**Example:**
```
User: /one 1-1

Claude: [Checks what exists for feature 1-1]
        [Has: spec ✅, tests ✅, no design ❌]
        [Determines: Should create design]

Claude Code (Design Agent - Stage 5):
Creating design for Feature 1-1 (Agent Prompts)...
```

**Reasoning:** Smart stage detection reduces cognitive load on user.

---

## Component Architecture

### 1. Workflow Stage Map (Claude's Mental Model)

```typescript
// Conceptual - Claude understands this naturally
Stage 1: Ideas       → /one idea [text]       → agent-director.md (Validate)
Stage 2: Plans       → /one plan [N]          → agent-director.md (Create Plan)
Stage 3: Features    → /one feature [N-M]     → agent-{specialist}.md (Write Spec)
Stage 4: Tests       → /one test [N-M]        → agent-quality.md (Define Tests)
Stage 5: Design      → /one design [N-M]      → agent-designer.md (Create Design)
Stage 6: Implement   → /one implement [N-M]   → agent-{specialist}.md (Code)
```

**No code needed** - Claude maps commands to stages naturally.

---

### 2. Stage Progression Logic (AI-Native)

```markdown
# How Claude determines what to do

User: /one feature 1-1

Claude thinks:
1. "User wants to work on feature 1-1"
2. Check: Does one/things/features/1-1-*.md exist?
   - No → Create feature spec (Stage 3)
   - Yes → Move to next incomplete stage
3. Check: Does one/things/features/1-1-*/tests.md exist?
   - No → Create tests (Stage 4)
   - Yes → Check design
4. Check: Does one/things/features/1-1-*/design.md exist?
   - No → Create design (Stage 5)
   - Yes → Check implementation
5. Check: Is implementation complete?
   - No → Implement (Stage 6)
   - Yes → Report complete

Claude acts based on determination
```

**No stage detection code needed** - Claude understands file existence checks naturally.

---

### 3. Response Patterns

**Stage Start:**
```
🔄 [Agent Role - Stage N: Name]
[What I'm doing]
[Progress indicator]
```

**Stage Complete:**
```
✅ [Stage name] complete!
[Summary of what was created]
[Files created with paths]

Next: [Stage name] - [What to do]
Command: [Suggested next command]
```

**Workflow Complete:**
```
🎉 Workflow Complete!

Plan: [Plan name]
Features: [N] features implemented
Duration: [Time]
Files created: [Count]

Summary:
- [Feature 1]: ✅ Complete
- [Feature 2]: ✅ Complete
...

All features tested ✅
All features documented ✅
Ready for use!
```

---

## Wireframes (CLI Outputs)

### Wireframe 1: Start Workflow (Stage 1)

```
$ /one idea "course platform for creators"

Claude Code (Engineering Director - Stage 1: Ideas):
Validating idea against ontology...

✅ Idea validated!

Ontology Mapping:
  Things: course, lesson, creator, student
  Connections: owns (creator→course), part_of (lesson→course),
               enrolled_in (student→course)
  Events: course_created, lesson_completed, course_completed

Complexity: Medium (2-3 weeks, 4 features)

Next: Stage 2 (Plans) - Break down into features
Create plan now? [Y/n] _
```

---

### Wireframe 2: Create Plan (Stage 2)

```
$ /one plan 2-course-platform

Claude Code (Engineering Director - Stage 2: Plans):
Creating plan 2-course-platform...

Breaking down into features:
  2-1: Course CRUD (Backend Specialist)
  2-2: Lesson Management (Backend Specialist)
  2-3: Course UI (Frontend Specialist)
  2-4: Student Enrollment (Integration Specialist)

Duration estimate: 2-3 weeks
Team: Backend, Frontend, Integration

✅ Plan created: one/things/plans/2-course-platform.md

Next: Stage 3 (Features) - Write specifications
Commands (can run in parallel):
  /one feature 2-1
  /one feature 2-2
  /one feature 2-3
  /one feature 2-4
```

---

### Wireframe 3: Parallel Feature Specs (Stage 3)

```
$ /one feature 2-1

Claude Code (Backend Specialist - Stage 3: Features):
Writing feature spec for 2-1-course-crud...

Loading context:
  ✓ Ontology types (200 tokens)
  ✓ Backend patterns (500 tokens)
  ✓ Lessons learned (300 tokens)

Mapping to ontology:
  Things: course (with properties: title, description, price, creatorId)
  Connections: owns (creator→course)
  Events: course_created, course_updated, course_deleted

✅ Feature spec complete!
   File: one/things/features/2-1-course-crud.md

Next: Stage 4 (Tests) - Define quality criteria
Command: /one test 2-1
```

---

### Wireframe 4: Workflow Status Check

```
$ /one workflow

Claude Code:
Current Workflow: Plan 2 (Course Platform)

Progress:
✅ Stage 1: Ideas - Validated
✅ Stage 2: Plans - Complete (4 features)
✅ Stage 3: Features - All specs written
   - 2-1: Course CRUD ✅
   - 2-2: Lesson Management ✅
   - 2-3: Course UI ✅
   - 2-4: Student Enrollment ✅
🔄 Stage 4: Tests - 2/4 complete
   - 2-1: ✅ Tests defined
   - 2-2: ✅ Tests defined
   - 2-3: ⏳ Not started
   - 2-4: ⏳ Not started
⏳ Stage 5: Design - Not started
⏳ Stage 6: Implementation - Not started

Next Actions (continue Stage 4):
  /one test 2-3
  /one test 2-4

Or start Stage 5 for completed features:
  /one design 2-1
  /one design 2-2
```

---

### Wireframe 5: Multi-Stage Progression

```
$ /one 2-1

Claude Code:
Feature 2-1 (Course CRUD) - Stage check...
  ✅ Stage 3: Feature spec exists
  ✅ Stage 4: Tests defined
  ✅ Stage 5: Design complete
  ⏳ Stage 6: Implementation not started

Claude Code (Backend Specialist - Stage 6: Implementation):
Implementing feature 2-1-course-crud...

Creating files:
  ✓ backend/services/CourseService.ts (course CRUD logic)
  ✓ backend/schema.ts (course schema added)
  ✓ backend/mutations/courses.ts (create, update, delete)
  ✓ backend/queries/courses.ts (get, list)

Running tests...
  ✓ CourseService.create() logs event
  ✓ CourseService.list() filters by creator
  ✓ CourseService.delete() checks ownership
  ✓ All tests passing (12/12)

Writing documentation...
  ✓ FEATURES.md updated
  ✓ API docs generated

✅ Feature 2-1 complete!
   Duration: 15 minutes
   Files created: 4
   Tests: 12/12 passing

Feature complete! Moving to next feature automatically.
```

---

## Design Tokens

### Stage Indicators
```
Stage 1: Ideas       → 💡
Stage 2: Plans       → 📋
Stage 3: Features    → 📝
Stage 4: Tests       → 🧪
Stage 5: Design      → 🎨
Stage 6: Implement   → 🔧
```

### Progress Indicators
```
✅ Complete
🔄 In Progress
⏳ Not Started
❌ Failed (with retry suggestion)
💡 Suggestion
⚠️  Warning
```

### Agent Role Indicators
```
Claude Code (Engineering Director - Stage 1: Ideas):
Claude Code (Backend Specialist - Stage 3: Features):
Claude Code (Quality Agent - Stage 4: Tests):
Claude Code (Design Agent - Stage 5: Design):
Claude Code (Backend Specialist - Stage 6: Implementation):
```

---

## Accessibility

### Screen Reader Friendly
- Clear stage names in agent indicators
- Status emojis have text equivalents
- Progress explicitly stated ("2 of 4 complete")
- File paths spoken clearly

### Keyboard Navigation
- All commands text-based (fully keyboard accessible)
- No mouse required
- Tab completion friendly (`/one <tab>` shows options)

### Error Recovery
- Clear error messages with stage context
- Suggestions for fixes
- Resume workflow from any stage
- Help available (`/one help workflow`)

---

## Success Criteria from Tests

### User Flows
- ✅ User completes full workflow (< 1 hour for simple feature)
- ✅ User checks workflow status anytime
- ✅ User resumes interrupted workflow
- ✅ User runs parallel stages correctly
- ✅ User understands next actions

### Acceptance Criteria
- ✅ Stage detection: < 100ms (file existence checks)
- ✅ Stage execution: Follows agent prompts correctly
- ✅ Progress tracking: Accurate file-based status
- ✅ User clarity: Always knows current stage and next action
- ✅ Workflow completion: All 6 stages documented

---

## Implementation Notes

**No orchestrator to build** - Just ensure workflow guide is clear:
1. Stage sequence documented ✅ (in Feature 1-2 spec)
2. Agent prompt references ✅ (each stage lists agent file)
3. File structure conventions ✅ (Feature 1-6)
4. CLI response patterns ✅ (this document)

**Claude Code handles orchestration** by:
- Reading workflow guide
- Checking file existence for stage detection
- Reading appropriate agent prompts
- Following agent instructions
- Creating files as needed

---

## Next Steps

Ready for Level 6 (Implementation):
- Workflow guide complete ✅ (Feature 1-2 spec)
- Stage instructions clear ✅
- Agent prompt references defined ✅
- CLI patterns documented ✅ (this document)
- Implementation is using the guide

---

**Status:** ✅ Design Complete

**Key Design Insights:**
1. **No UI to build** - CLI responses are natural conversation
2. **Stage awareness** - User always knows where they are in workflow
3. **Smart progression** - Claude detects stage from file existence
4. **Parallel guidance** - Clear indication when tasks can run in parallel
5. **Status at glance** - `/one workflow` shows complete progress

**The design is Claude's understanding of workflow stages + file-based status detection.** 🎯

# Design for Feature 1-4: Knowledge Management

**Feature:** 1-4-knowledge-management
**Status:** Design → Implementation
**Design Agent:** agent-designer.md

---

## Design Goal

Enable continuous learning through markdown-based lessons learned and pattern library. Design focuses on how Claude Code naturally reads patterns, searches lessons, and captures new knowledge without building knowledge system infrastructure.

---

## CLI Context

**Knowledge is implicit** - No explicit commands needed. Claude:
- Reads patterns when implementing features
- Searches lessons when solving problems
- Captures lessons after fixes
- User can optionally query knowledge

**Optional commands:**
```bash
/one lessons                       # Show recent lessons learned
/one lessons backend               # Filter by category
/one patterns                      # List available patterns
/one pattern backend/service       # Show specific pattern
/one knowledge "authentication"    # Search all knowledge
```

---

## Design Decisions (Test-Driven)

### Decision 1: Markdown Files ARE the Knowledge Base
**Test requirement:** Claude can search knowledge in < 100ms
**Design solution:**
- Lessons: `one/knowledge/lessons-learned.md` (append-only)
- Patterns: `one/knowledge/patterns/{category}/*.md` (template files)
- Claude uses Grep to search: `grep "authentication" one/knowledge/lessons-learned.md`
- Claude uses Read to load patterns
- No database needed

**Reasoning:** Markdown is fast, searchable, git-tracked, and human-readable.

---

### Decision 2: Lesson Capture Is Automatic After Fixes
**Test requirement:** 100% lesson capture rate
**Design solution:**
```
Test fails → Problem solved → Fix implemented →
Before marking complete: "Capture lesson learned" →
Claude appends to lessons-learned.md →
Lesson available for future searches
```

**Reasoning:** Automatic capture ensures knowledge compounds over time.

---

### Decision 3: Patterns Discovered From Repeated Lessons
**Test requirement:** After 3 similar issues, promote to pattern
**Design solution:**
- Problem solver notices repeated lessons
- Suggests pattern promotion
- Integration specialist creates pattern template
- Future features reference pattern

**Example:**
```
Month 1: 3 features forgot to log events after entity creation
Month 2: Pattern created: backend/event-logging.md
Month 3+: All features use pattern, no more forgotten events
```

**Reasoning:** Patterns emerge naturally from actual problems, not speculation.

---

### Decision 4: Context Loading References Knowledge
**Test requirement:** Specialists load relevant patterns in < 50ms
**Design solution:**
```
Claude Code (Backend Specialist):
Implementing feature 2-1-course-crud...

Loading context:
  ✓ Ontology types (200 tokens)
  ✓ Backend patterns (500 tokens)
    - service-template.md
    - event-logging.md
    - mutation-template.md
  ✓ Recent lessons (300 tokens)
    - Always log events after entity creation
    - Validate ownership before delete
    - Use transactions for multi-step operations

Implementation with patterns applied...
```

**Reasoning:** Patterns and lessons become default context for specialists.

---

### Decision 5: Knowledge Grows With Each Feature
**Test requirement:** Measurable knowledge accumulation
**Design solution:**
```
Week 1:   0 lessons, 8 patterns (templates)
Month 1:  20 lessons, 8 patterns
Month 3:  60 lessons, 15 patterns (7 promoted)
Quarter 1: 150 lessons, 25 patterns
Year 1:   500 lessons, 50 patterns
```

**Reasoning:** Knowledge compounds naturally. System becomes "expert" over time.

---

## Component Architecture

### 1. Lessons Learned File (Append-Only Markdown)

**File:** `one/knowledge/lessons-learned.md`

**Structure:**
```markdown
# Lessons Learned

## Backend Patterns

### Always Log Events After Entity Creation
**Date:** 2025-01-15
**Feature:** 1-1-agent-prompts
**Problem:** Forgot to log agent_prompt_created event
**Solution:** Added event logging after db.insert()
**Pattern:** Every entity creation must log corresponding event
**Context:** All thing_created events are mandatory per ontology
**Example:**
```typescript
// Bad
const id = await ctx.db.insert('entities', data)
return id

// Good
const id = await ctx.db.insert('entities', data)
await ctx.db.insert('events', {
  type: 'entity_created',
  actorId: ctx.userId,
  targetId: id,
  metadata: { ...relevantFields }
})
return id
```
**Related:** See pattern backend/event-logging.md

### Validate Ownership Before Delete Operations
**Date:** 2025-01-16
**Feature:** 2-1-course-crud
...
```

**Claude appends lessons using Edit tool** - No database writes needed.

---

### 2. Pattern Library (Template Files)

**Directory structure:**
```
one/knowledge/patterns/
├── backend/
│   ├── service-template.md
│   ├── mutation-template.md
│   ├── query-template.md
│   └── event-logging.md
├── frontend/
│   ├── page-template.md
│   ├── component-template.md
│   └── form-template.md
├── design/
│   ├── wireframe-template.md
│   └── component-architecture.md
└── test/
    ├── user-flow-template.md
    ├── acceptance-criteria-template.md
    └── unit-test-template.md
```

**Pattern file format:**
```markdown
# Pattern: Event Logging After Entity Creation

**Category:** backend
**Context:** Every time you create an entity in the database
**Problem:** Forgetting to log creation event breaks audit trail
**Solution:** Always log {entity}_created event after db.insert()

## Template

```typescript
async create{Entity}(data: {Entity}Data) {
  // Create entity
  const id = await ctx.db.insert('{entities}', data)

  // ALWAYS log creation event
  await ctx.db.insert('events', {
    type: '{entity}_created',
    actorId: data.creatorId || ctx.userId,
    targetId: id,
    metadata: {
      ...relevantFields
    }
  })

  return id
}
```

## Usage
1. Replace {Entity} with your entity name (capitalized)
2. Replace {entity} with lowercase entity name
3. Replace {entities} with table name
4. Include relevant metadata fields

## Common Mistakes
- Forgetting event log → Use this pattern
- Wrong metadata structure → See event-coordination.md spec
- Missing actorId → Default to ctx.userId

## Related Patterns
- mutation-template.md - General mutation structure
- event-coordination.md - Event metadata standards
```

**Claude reads patterns using Read tool** - No pattern loader needed.

---

### 3. Knowledge Query Patterns (Grep-Based)

```bash
# How Claude searches knowledge naturally

# Search all lessons for keyword
grep -i "authentication" one/knowledge/lessons-learned.md

# Find backend-specific lessons
grep -A 10 "## Backend" one/knowledge/lessons-learned.md

# Search patterns
grep -r "authentication" one/knowledge/patterns/

# Get recent lessons (last 5)
tail -50 one/knowledge/lessons-learned.md

# Find patterns by category
ls one/knowledge/patterns/backend/*.md
```

**No search API to build** - Grep is fast and flexible.

---

## Wireframes (CLI Outputs)

### Wireframe 1: Automatic Lesson Capture (Invisible)

```
$ /one implement 2-1

Claude Code (Backend Specialist):
Implementing feature 2-1-course-crud...

Running tests...
  ✗ CourseService.create() should log course_created event

Claude Code (Problem Solver):
Analyzing failure...
Root cause: Missing event log after db.insert()
Proposing fix...

Claude Code (Backend Specialist):
Implementing fix...
  ✓ Added event logging
  ✓ All tests passing

[Claude automatically captures lesson]

Capturing lesson learned...
  ✓ Appended to one/knowledge/lessons-learned.md

✅ Feature 2-1 complete!

[User doesn't see lesson capture details - it happens automatically]
```

---

### Wireframe 2: Pattern Application (Visible Context)

```
$ /one implement 3-1

Claude Code (Backend Specialist):
Implementing feature 3-1-enrollment-service...

Loading context:
  ✓ Ontology types (200 tokens)
  ✓ Backend patterns (500 tokens)
    - service-template.md
    - event-logging.md          ← Learned from feature 1-1
    - ownership-validation.md   ← Learned from feature 2-1
    - transaction-pattern.md    ← Learned from feature 2-3
  ✓ Recent lessons (300 tokens)
    - Always log events (occurred 3x)
    - Validate ownership (occurred 2x)
    - Use transactions (occurred 2x)

Applying patterns:
  ✓ Using service-template.md structure
  ✓ Will log enrollment_created event (event-logging pattern)
  ✓ Will validate student access (ownership-validation pattern)
  ✓ Will use transaction for enrollment + payment (transaction-pattern)

Implementing with patterns...
```

**User sees:** Patterns being applied proactively
**Result:** Implementation is faster and correct on first try

---

### Wireframe 3: Knowledge Query (Optional Command)

```
$ /one lessons

Claude Code:
Recent lessons learned (last 10):

1. [2025-01-20] Always Use Transactions for Multi-Step Operations
   Feature: 2-3-payment-processing
   Problem: Payment recorded but enrollment failed → inconsistent state
   Solution: Wrap in transaction
   Category: Backend

2. [2025-01-18] Validate Ownership Before Mutations
   Feature: 2-2-lesson-management
   Problem: Users could edit other creators' lessons
   Solution: Check ownership in mutation
   Category: Backend

3. [2025-01-16] Client-Side Validation Reduces API Calls
   Feature: 2-1-course-crud
   Problem: Sequential API calls caused 15s delay (10s budget)
   Solution: Validate locally first, minimize roundtrips
   Category: Frontend

4. [2025-01-15] Always Log Events After Entity Creation
   Feature: 1-1-agent-prompts
   Problem: Forgot to log agent_prompt_created event
   Solution: Added event logging after db.insert()
   Category: Backend

...

Total lessons: 23
Categories: Backend (15), Frontend (5), Integration (3)

View all: one/knowledge/lessons-learned.md
```

---

### Wireframe 4: Pattern Promotion (Proactive Suggestion)

```
$ /one implement 4-1

Claude Code (Problem Solver):
⚠️  Pattern Detected!

I've noticed the same issue 3 times:
  - Feature 1-1: Forgot to log agent_prompt_created event
  - Feature 2-1: Forgot to log course_created event
  - Feature 3-1: Forgot to log enrollment_created event

This should be a pattern!

Would you like me to create a pattern template? [Y/n] y

Claude Code (Integration Specialist):
Creating pattern: backend/event-logging.md...

Pattern created: one/knowledge/patterns/backend/event-logging.md

This pattern will now be included in default context for all backend features.
Future implementations will apply this automatically.

Updated lessons-learned.md to reference pattern.
```

**User sees:** Proactive pattern discovery
**Result:** Repeated problems become institutionalized solutions

---

### Wireframe 5: Knowledge Search (Debugging)

```
$ /one knowledge "authentication"

Claude Code:
Searching knowledge base for "authentication"...

[Claude runs: grep -i "authentication" one/knowledge/lessons-learned.md one/knowledge/patterns/**/*.md]

Found 5 matches:

## Lessons Learned

1. **Use Better Auth for All Authentication** (2025-01-10)
   Feature: 0-1-auth-setup
   Solution: Better Auth provides 6 methods out of the box
   File: one/knowledge/lessons-learned.md:45

2. **Store Session Tokens Securely** (2025-01-12)
   Feature: 0-2-session-management
   Solution: Use httpOnly cookies, never localStorage
   File: one/knowledge/lessons-learned.md:67

## Patterns

3. **Authentication Middleware Pattern**
   Category: backend
   Context: Protect API routes requiring authentication
   File: one/knowledge/patterns/backend/auth-middleware.md

4. **User Context Pattern**
   Category: backend
   Context: Access authenticated user in mutations/queries
   File: one/knowledge/patterns/backend/user-context.md

5. **Protected Route Pattern**
   Category: frontend
   Context: Restrict pages to authenticated users only
   File: one/knowledge/patterns/frontend/protected-route.md

Read full details: /one pattern backend/auth-middleware
```

---

### Wireframe 6: Knowledge Growth Over Time

```
$ /one knowledge stats

Claude Code:
Knowledge Base Statistics

Current Status (Quarter 1):
  Lessons learned: 156
  Patterns: 23

Knowledge Growth:
  Week 1:   0 lessons,   8 patterns (templates)
  Month 1:  22 lessons,  8 patterns
  Month 2:  58 lessons,  15 patterns (7 promoted)
  Month 3:  96 lessons,  18 patterns (3 more promoted)
  Today:    156 lessons, 23 patterns (5 more promoted)

Lesson Breakdown by Category:
  Backend:      89 lessons (57%)
  Frontend:     38 lessons (24%)
  Integration:  21 lessons (13%)
  Testing:      8 lessons (5%)

Pattern Application Rate:
  Month 1: 30% of features apply patterns
  Month 2: 65% of features apply patterns
  Month 3: 92% of features apply patterns

Quality Impact:
  Month 1: 80% first-try pass rate
  Month 2: 87% first-try pass rate
  Month 3: 94% first-try pass rate

Velocity Impact:
  Month 1: Average feature time: 45 minutes
  Month 2: Average feature time: 32 minutes (-29%)
  Month 3: Average feature time: 24 minutes (-47%)

Knowledge is compounding! 📈
```

---

## Design Tokens

### Knowledge Type Icons
```
📚 Lessons learned
🎯 Patterns
💡 Insights
🔍 Search results
📊 Knowledge stats
⚠️  Pattern detected (promotion suggestion)
```

### Category Labels
```
[Backend]     - Services, mutations, queries, schemas
[Frontend]    - Components, pages, state management
[Integration] - Connections, data flows, APIs
[Testing]     - Unit, integration, e2e
[Design]      - UI/UX, accessibility, performance
[Workflow]    - Process improvements, coordination
```

---

## Accessibility

### Screen Reader Friendly
- Lesson titles spoken clearly
- Dates in readable format (not just timestamps)
- Category labels explicit
- Pattern names descriptive

### Keyboard Navigation
- All knowledge commands text-based
- No mouse required for searches
- Tab completion for categories: `/one lessons [tab]`

### Error Recovery
- No lessons found: "No lessons for category X yet"
- Pattern doesn't exist: "Pattern X not found. Available: [list]"
- Search no results: "No matches for 'keyword'. Try broader search?"

---

## Success Criteria from Tests

### User Flows
- ✅ Claude captures lesson after every fix (< 50ms)
- ✅ Claude searches lessons when solving problems (< 100ms)
- ✅ Claude loads patterns when implementing (< 50ms)
- ✅ System promotes patterns after 3 similar lessons
- ✅ Knowledge accumulates measurably over time

### Acceptance Criteria
- ✅ Lesson capture: < 50ms (append to file)
- ✅ Knowledge search: < 100ms (grep)
- ✅ Pattern loading: < 50ms (read file)
- ✅ 100% lesson capture rate
- ✅ Knowledge compounds: 0→20→60→150+ lessons over time

---

## Implementation Notes

**No knowledge system to build** - Just conventions:
1. Lesson file format defined ✅ (in Feature 1-4 spec)
2. Pattern directory structure ✅ (organized by category)
3. Search patterns ✅ (grep examples)
4. Capture workflow ✅ (append after fixes)

**Claude Code handles knowledge** by:
- Appending lessons using Edit tool
- Searching using Grep tool
- Loading patterns using Read tool
- Promoting patterns when detected

---

## Next Steps

Ready for Level 6 (Implementation):
- Lesson format documented ✅ (Feature 1-4 spec)
- Pattern templates ready ✅ (8 initial templates)
- Search patterns documented ✅ (grep examples)
- CLI patterns documented ✅ (this document)
- Implementation is using knowledge naturally

---

**Status:** ✅ Design Complete

**Key Design Insights:**
1. **Markdown is the database** - No knowledge system infrastructure
2. **Automatic capture** - Lessons after every fix
3. **Pattern emergence** - From repeated lessons (3x rule)
4. **Compounding growth** - Knowledge accumulates over time
5. **Velocity multiplier** - Each lesson makes future work faster

**The design is append-only markdown + grep + pattern discovery from repetition.** 🎯

**Knowledge impact:**
```
Month 1: 20 lessons → 80% first-try pass → 45 min/feature
Month 3: 60 lessons → 90% first-try pass → 32 min/feature (-29%)
Year 1:  500 lessons → 97% first-try pass → 15 min/feature (-67%)
```

**Every problem solved becomes institutional intelligence.** 🧠

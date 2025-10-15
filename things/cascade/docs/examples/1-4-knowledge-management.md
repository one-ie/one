# Feature 1-4: Knowledge Management System

**Assigned to:** Integration Specialist Agent (agent-integration.md)
**Status:** ⚠️ SIMPLIFIED - Knowledge is just markdown files
**Plan:** 1-create-workflow
**Priority:** Low (documentation-only)
**Dependencies:** None (Claude reads/writes markdown naturally)

---

## Simplified Approach: Knowledge as Markdown Files

**Key Insight:** We don't need a knowledge management system. Claude Code can read markdown files and search them naturally.

### Why No Code Needed

1. **Lessons learned = markdown file**
   - Problem Solver writes lessons to `one/knowledge/lessons-learned.md`
   - Appends new lessons when problems solved
   - Uses Write/Edit tools naturally

2. **Patterns = markdown files in directories**
   - Organized by category: `one/knowledge/patterns/{category}/*.md`
   - Specialists read relevant patterns when needed
   - Templates are just markdown with placeholders

3. **Claude can search knowledge**
   - Uses Grep to find relevant lessons: `grep "authentication" one/knowledge/lessons-learned.md`
   - Uses Read to load pattern templates
   - Understands context and applies patterns naturally

4. **Knowledge compounds automatically**
   - Every lesson added makes file more useful
   - Git tracks knowledge evolution
   - No indexing or databases needed

**What we actually need:** File organization conventions + lesson/pattern templates.

---

## Feature Specification

### What We're Documenting

A knowledge organization approach where lessons and patterns are stored in markdown files. Claude reads patterns when implementing features, searches lessons when solving problems, and adds new lessons when discovering solutions.

**Philosophy:** Markdown IS the knowledge base. Git IS the version control. Claude Code IS the knowledge management system.

---

## Ontology Types

### Things
- `lesson` - Captured knowledge from problem solving
  - Properties: `category`, `problem`, `solution`, `pattern`, `context`
- `pattern` - Reusable implementation template
  - Properties: `category`, `name`, `description`, `template`, `examples`

### Connections
- `learns_from` - Agent learns from lessons
- `applies` - Agent applies pattern
- `references` - Knowledge references other knowledge

### Events
- `lesson_learned_added` - New lesson captured
  - Metadata: `lessonId`, `category`, `problem`, `solution`
- `pattern_created` - New pattern defined
  - Metadata: `patternId`, `category`, `name`
- `knowledge_queried` - Agent searched knowledge base
  - Metadata: `query`, `resultsFound`, `agentRole`

---

## Core Components

### 1. Lessons Learned System

**Purpose:** Capture problems and solutions for future reference

**Structure:**
```markdown
# Lessons Learned

## [Category] Patterns

### [Lesson Title]
**Date:** YYYY-MM-DD
**Feature:** [Feature ID]
**Problem:** [What went wrong]
**Solution:** [How it was fixed]
**Pattern:** [Principle to follow]
**Context:** [When this applies]
**Example:** [Code snippet or specific case]
**Related:** [Links to other lessons or patterns]
```

**Categories:**
- Backend (services, mutations, queries, schemas)
- Frontend (components, pages, state management)
- Integration (connections, data flows, APIs)
- Testing (unit, integration, e2e)
- Design (UI/UX, accessibility, performance)
- Workflow (process improvements, coordination)

**File:** `one/knowledge/lessons-learned.md`

---

### 2. Pattern Library

**Purpose:** Provide reusable implementation templates

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
│   ├── form-template.md
│   └── list-template.md
├── design/
│   ├── wireframe-template.md
│   ├── component-architecture.md
│   └── design-tokens.md
└── test/
    ├── user-flow-template.md
    ├── acceptance-criteria-template.md
    ├── unit-test-template.md
    └── e2e-test-template.md
```

**Pattern structure:**
```markdown
# Pattern: [Name]

**Category:** [backend/frontend/design/test]
**Context:** [When to use this pattern]
**Problem:** [What problem does this solve]
**Solution:** [How the pattern works]

## Template

[Code or structure template with placeholders]

## Variables
- `{variableName}` - [Description]
- `{anotherVariable}` - [Description]

## Example

[Concrete example with real values]

## Usage

[Step-by-step how to apply this pattern]

## Common Mistakes
- [Mistake 1] → [Correct approach]
- [Mistake 2] → [Correct approach]

## Related Patterns
- [Pattern name] - [When to use instead]
- [Pattern name] - [Combines well with]
```

---

### 3. Knowledge Query System

**Purpose:** Enable agents to search knowledge base

**Query interface:**
```typescript
interface KnowledgeQuery {
  search(query: string, category?: string): Promise<KnowledgeResult[]>
  getLessons(category?: string, limit?: number): Promise<Lesson[]>
  getPattern(category: string, name: string): Promise<Pattern | null>
  getRelated(knowledgeId: string): Promise<KnowledgeResult[]>
}

interface KnowledgeResult {
  type: 'lesson' | 'pattern'
  id: string
  category: string
  title: string
  content: string
  relevance: number  // 0-1 score
}
```

**Query methods:**

#### `search(query, category?)`
- Full-text search across lessons and patterns
- Filter by category if provided
- Return ranked results by relevance
- Use for: "Have we solved this before?"

#### `getLessons(category?, limit?)`
- Get recent lessons learned
- Filter by category if provided
- Ordered by date (most recent first)
- Use for: Context in agent prompts

#### `getPattern(category, name)`
- Get specific pattern by name
- Returns full template
- Use for: Applying known patterns

#### `getRelated(knowledgeId)`
- Find related lessons and patterns
- Based on tags, categories, references
- Use for: Exploring related knowledge

---

### 4. Lesson Capture Workflow

**Process:**

1. **Problem Solver identifies fix** (during Feature 1-5 quality loop)
   - Analyzes failed test
   - Proposes solution
   - Delegates to specialist

2. **Specialist implements fix**
   - Writes code to fix problem
   - Tests pass
   - **Captures lesson learned**

3. **Lesson structure:**
   ```markdown
   ### [Descriptive Title]
   **Date:** 2025-01-15
   **Feature:** 1-2-yaml-orchestrator
   **Problem:** Orchestrator threw error when YAML file missing
   **Solution:** Added file existence check before parsing
   **Pattern:** Always validate file exists before reading
   **Context:** Applies to all file I/O operations
   **Example:**
   ```typescript
   // Bad
   const content = fs.readFileSync(path, 'utf-8')

   // Good
   if (!fs.existsSync(path)) {
     throw new Error(`File not found: ${path}`)
   }
   const content = fs.readFileSync(path, 'utf-8')
   ```
   **Related:** See pattern `backend/file-validation.md`
   ```

4. **Event logged:**
   - Type: `lesson_learned_added`
   - Metadata: lesson details
   - Makes knowledge searchable

---

### 5. Pattern Discovery

**Over time, repeated lessons become patterns:**

**Detection criteria:**
- Same problem appears 3+ times across different features
- Same solution applied consistently
- Clear pattern emerges

**Promotion process:**
1. Notice repeated lesson in lessons-learned.md
2. Extract common structure
3. Create pattern template
4. Document in patterns/ directory
5. Reference pattern from lessons
6. Agents prefer pattern over ad-hoc solutions

**Example:**

After 3 features encountered "forgot to log event after entity creation":

1. **Lesson appears 3x:**
   - Feature 1-1: Forgot to log agent_prompt_created
   - Feature 2-1: Forgot to log course_created
   - Feature 2-2: Forgot to log lesson_created

2. **Pattern created:**
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
   ```

3. **Future features reference this pattern**
   - Specialist agents load pattern as context
   - Apply template automatically
   - No more forgotten event logs

---

## Scope

### In Scope (Documentation + File Templates)

- ✅ Lessons learned structure and markdown template
- ✅ Pattern library directory structure
- ✅ Pattern markdown templates (8+ templates to start)
- ✅ How to search knowledge (grep examples)
- ✅ How to add lessons (append to lessons-learned.md)
- ✅ Categories for organization

### Out of Scope (Don't Build)

- ❌ Knowledge query TypeScript system (Claude uses Grep/Read)
- ❌ Lesson capture automation (Claude writes naturally)
- ❌ Pattern discovery code (Promote manually when pattern emerges)
- ❌ Event logging for knowledge ops (optional)
- ❌ Knowledge visualization UI (future, optional)
- ❌ Automated pattern extraction (future, optional)
- ❌ Knowledge embeddings/vector search (future, optional)

---

## Files to Create

**Initial setup** (pattern templates):
```
one/knowledge/
├── lessons-learned.md           # Empty initially, grows over time
├── patterns/                    # Pattern library
│   ├── backend/
│   │   ├── service-template.md
│   │   ├── mutation-template.md
│   │   └── query-template.md
│   ├── frontend/
│   │   ├── page-template.md
│   │   ├── component-template.md
│   │   └── form-template.md
│   ├── design/
│   │   ├── wireframe-template.md
│   │   └── component-architecture.md
│   └── test/
│       ├── user-flow-template.md
│       ├── acceptance-criteria-template.md
│       └── unit-test-template.md
└── README.md                    # How to use knowledge base
```

**No TypeScript files needed** - Claude reads/writes markdown directly.

**Pattern templates** can be created as needed, starting with most common ones. Add more as patterns emerge from lessons learned.

---

## Integration Points (Convention-Based)

### With Feature 1-1 (Agent Prompts)
- ✅ Agent prompts specify when to check patterns
- ✅ agent-problem-solver.md: "Search lessons-learned.md for similar problems"
- ✅ Specialists: "Read relevant patterns from one/knowledge/patterns/{category}/"
- ✅ No code dependencies - just documentation references

### With Feature 1-3 (Events) - Optional
- Could log `lesson_learned_added` events
- Could log `pattern_created` events
- Not required - lessons/patterns exist as files

### With Feature 1-5 (Quality Loops)
- Problem solver appends lessons after fixes
- Specialists read patterns during implementation
- Quality agent could reference patterns in reviews

### With Feature 1-2 (Workflow Guide)
- Workflow guide references knowledge base
- Stage 6 (Implementation): "Read relevant patterns"
- Stage 6 (Problem Solving): "Search lessons learned"

---

## Knowledge Accumulation Over Time

### Week 1 (Initial)
- 0 lessons learned
- 8 basic patterns (templates)
- Agents work from scratch

### Month 1 (Learning)
- 20+ lessons learned
- 8 patterns (no new ones yet)
- Agents reference lessons occasionally

### Month 3 (Patterns Emerging)
- 60+ lessons learned
- 15 patterns (7 promoted from lessons)
- Agents prefer patterns, fewer mistakes

### Quarter 1 (Institutional Knowledge)
- 150+ lessons learned
- 25+ patterns
- New features 3x faster (less figuring out)
- Quality higher (known patterns applied)

### Year 1 (Expert System)
- 500+ lessons learned
- 50+ patterns
- Rare to encounter new problems
- System essentially "knows how to build features"
- New developers onboard via knowledge base

---

## Success Criteria

### Immediate
- [ ] lessons-learned.md structure defined
- [ ] Pattern library organized
- [ ] 8 basic patterns created (templates)
- [ ] Knowledge query system works
- [ ] Lesson capture workflow documented

### Near-term (Month 1)
- [ ] 20+ lessons captured
- [ ] Agents search knowledge base
- [ ] Problem solver references lessons
- [ ] Specialists apply patterns
- [ ] Knowledge prevents repeated mistakes

### Long-term (Quarter 1)
- [ ] 3 patterns promoted from lessons
- [ ] Features built 3x faster (less problem solving)
- [ ] Quality improves with each feature
- [ ] Knowledge base is primary development resource
- [ ] System has "institutional memory"

---

## Performance Requirements

### Knowledge Queries
- Search query: < 100ms
- Get lessons: < 50ms
- Get pattern: < 20ms (cached)
- Get related: < 100ms

### Lesson Capture
- Add lesson: < 50ms
- Update lessons-learned.md: < 100ms
- Log event: < 10ms

### Pattern Loading
- Load pattern: < 20ms
- Parse template: < 10ms
- Cache patterns in memory

---

## Testing Strategy

### Unit Tests
- Lesson structure validates correctly
- Pattern templates have required fields
- Knowledge queries return correct results
- Lesson capture creates proper format

### Integration Tests
- Problem solver captures lessons after fixes
- Specialists load and apply patterns
- Knowledge queries integrate with agents
- Events logged for knowledge operations

### Long-term Tests
- Track knowledge accumulation over time
- Measure impact on feature velocity
- Measure reduction in repeated problems
- Measure pattern adoption rate

---

## Error Handling

### Lesson Capture Errors
- Missing fields → Validation error with required fields
- Duplicate lesson → Append to existing or create new
- File write fails → Retry 3x, then error

### Pattern Errors
- Pattern not found → Return null, log warning
- Invalid template → Validation error
- Parse error → Clear error with line number

### Query Errors
- Invalid query → Validation error
- No results → Return empty array
- Query timeout → Error after 5 seconds

---

## Next Steps

**Create initial pattern templates** (8-12 markdown files):
1. Backend: service-template.md, mutation-template.md, query-template.md
2. Frontend: page-template.md, component-template.md, form-template.md
3. Design: wireframe-template.md, component-architecture.md
4. Test: user-flow-template.md, acceptance-criteria-template.md

**Create lessons-learned.md** (empty file with template header)

**Create README.md** with:
- How to search for lessons (grep examples)
- How to add lessons (edit instructions)
- When to reference patterns (during implementation)

---

## References

- **Plan:** `one/things/plans/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md` (Knowledge Management section)
- **Feature 1-1:** Agent prompts (specify when to use knowledge)
- **Feature 1-5:** Problem solving (captures lessons)

---

**Status:** ⚠️ REQUIRES SETUP (Create pattern templates + README)

**Key insights:**

1. **Markdown IS the knowledge base** - No infrastructure needed
2. **Grep IS the search engine** - Fast, simple, effective
3. **Git IS the version control** - Tracks knowledge evolution
4. **Knowledge compounds naturally** - Every lesson makes system smarter
5. **Patterns reduce reinvention** - Templates speed up implementation

**How it works:**
```
Claude implements feature → Problem occurs → Problem solver analyzes
Problem solver → Searches lessons-learned.md (grep) → Finds similar issue
No match → Solves problem → Appends new lesson
Next time → Lesson found → Problem avoided
After 3 similar lessons → Promote to pattern template
```

**This is how we achieve continuous improvement and 5x velocity gains - every problem solved becomes institutional knowledge.** 🎯

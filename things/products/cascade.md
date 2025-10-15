# ONE Cascade

**Plain English to Production Code via Agent Orchestration**

---

## Overview

ONE Cascade transforms Plain English descriptions into working applications by orchestrating 8 specialized AI agents through 6 progressive stages. The system uses the 6-dimension ontology to validate every command and load only the context each agent needs—reducing context by 98% while enabling parallel agent execution.

**Core Concept:** Plain English → Ontology Validation → Targeted Context Loading → Parallel Agents → Production Code

---

## How It Works: From English to Reality

### The Plain English Language

Creators describe features using natural language commands that map directly to the ontology:

```
FEATURE: Import my YouTube videos and create courses

GET my YouTube channel videos
FOR EACH video extract title and description
CREATE course with video as lesson
CONNECT me to course as owner
RECORD course created
SHOW my courses dashboard
```

**Each command maps to ontology dimensions:**

- `CREATE` → **Things** (entities: creator, course, lesson, video, student)
- `CONNECT` → **Connections** (owns, enrolled_in, part_of, authored)
- `RECORD` → **Events** (course_created, video_imported, lesson_completed)
- `GET` → **Queries** (retrieve YouTube videos, course data)
- `CALL` → **Services** (YouTube API, OpenAI, Stripe) + event logging
- `CHECK` → **Validation** (against ontology rules)
- `FOR EACH` → **Loops** (process multiple videos, students)

### The 6-Stage Process

```
Plain English
    ↓
1. IDEAS: Validate every command against ontology types
    ↓
2. PLANS: Group related commands into features, assign to specialists
    ↓
3. FEATURES: Specialists write technical specifications (parallel)
    ↓
4. TESTS: Define acceptance criteria from user flows
    ↓
5. DESIGN: Create UI that executes the flows
    ↓
6. IMPLEMENTATION: Generate code + validation loops (parallel)
    ↓
Production-Ready Application
```

---

## Architecture

### The 6-Level Flow

**1. IDEAS**

Creator writes Plain English → Director agent validates each command:

```
GET my YouTube channel videos
  ✓ Validates: service provider "youtube" exists
  ✓ Validates: entity type "video" exists
  ✓ Validates: event type "videos_imported" exists for logging

CREATE course with video as lesson
  ✓ Validates: entity type "course" exists
  ✓ Validates: entity type "lesson" exists
  ✓ Validates: connection type "part_of" exists (lesson part_of course)
```

**Output:** Validated commands with ontology type mappings

**Context Loaded:** Only ontology type names (66 entity types, 25 connection types, 67 event types)

**2. PLANS**

Director creates plan by grouping related commands into features:

```
Plan 2: Creator Course Platform
├── 2-1-youtube-import (Backend Specialist)
│   └── Commands: GET videos, CALL YouTube API, CREATE video entities
├── 2-2-course-builder (Backend Specialist)
│   └── Commands: CREATE course, CONNECT lessons, RECORD course_created
├── 2-3-course-pages (Frontend Specialist)
│   └── Commands: SHOW courses, SHOW lessons, INPUT enrollment
└── 2-4-ai-chat-with-videos (Integration Specialist)
    └── Commands: CALL OpenAI with video transcripts, SHOW chat interface
```

**Output:** Feature assignments with command groupings

**Context Loaded:** Only ontology types used in this plan + similar patterns from history

**3. FEATURES** (parallel)

Specialists convert commands to technical specifications:

```
Plain English:
  CREATE course called "YouTube Masterclass"
    WITH lessons from videos
    WITH price $99

Backend Specialist writes:
  Entity Type: course
  Properties: { title, description, price, lessons[] }
  Service: Effect.ts CourseService.create()
  Mutations: createCourse(title, price, lessons)
  Events: course_created (logged after creation)
```

**Output:** Technical feature specs

**Context Loaded:** Only ontology types for assigned features + implementation patterns for those types

**4. TESTS**

Quality agent converts flows to test specifications:

```
Plain English:
  GET my YouTube channel videos
  FOR EACH video CREATE course
  CHECK course has at least 1 lesson

Quality Agent creates:
  Test: "should import videos from YouTube"
    Given: creator has YouTube channel with 10 videos
    When: creator imports videos
    Then: 10 video entities created

  Test: "should create courses from videos"
    Given: 5 videos imported
    When: creator creates course
    Then: course has 5 lessons from videos
```

**Output:** Test specifications

**Context Loaded:** Feature specification + ontology validation rules + test patterns

**5. DESIGN**

Design agent creates UI that executes the flow:

```
Plain English:
  SHOW my YouTube videos
  SHOW course builder with video selector
  SHOW courses dashboard

Design Agent creates:
  Wireframe: YouTube video grid with import button
  Component: <VideoGrid videos={youtubeVideos} />
  Component: <CourseBuilder selectedVideos={videos} />
  Component: <CourseDashboard courses={myCourses} />
  Flow: Import videos → Select for course → Create course → View dashboard
```

**Output:** UI/UX designs

**Context Loaded:** Feature specification + test criteria (user flows) + design patterns

**6. IMPLEMENTATION** (parallel with quality loops)

Specialists generate production code from specifications:

```
Plain English:
  RECORD course created BY creator WITH lessons

Generated TypeScript:
  await db.insert('events', {
    type: 'course_created',
    actorId: creatorId,
    targetId: courseId,
    metadata: { lessonCount: lessons.length },
    timestamp: Date.now()
  })
```

**Output:** Working application code with tests

**Context Loaded:** Feature spec + test criteria + design + implementation patterns + lessons learned

---

## Context Engineering: How the Ontology Minimizes Context

### The Problem: Context Window Limitations

AI coding tools face a fundamental challenge: they need relevant code to make intelligent suggestions, but can't load everything. Most tools use these approaches:

**File-based loading:** Load current file + imports + similar files
- Problem: Often loads too much (imports tree explodes) or too little (misses patterns)
- Result: Slow, expensive, hit-or-miss relevance

**Semantic search:** Embed codebase, search for relevant chunks
- Problem: Requires pre-indexing, searches are fuzzy, results may not be what you need
- Result: Better than file-based, but still generic and unfocused

**Manual selection:** Developer chooses which files to include
- Problem: Developer must know what's relevant, breaks flow
- Result: Accurate but requires constant attention

### The CASCADE Solution: Ontology as Type System

The 6-dimension ontology is fundamentally different—it's not searching or guessing, it's using the type system itself as the index:

**When you write:** `CREATE course WITH lessons`

**The ontology knows deterministically:**
1. You're creating a `course` (entity type #12)
2. A course has `lessons` (related via `part_of` connection)
3. This requires: course schema, lesson schema, part_of connection definition
4. Nothing else is needed to understand this command

**No search required. No guessing. Just type resolution.**

**Stage 1: Ideas (Minimal Context)**
```
User writes: CREATE course WITH lessons
             CONNECT creator to course as owner

Ontology reveals needed types:
  - course (entity type)
  - lesson (entity type)
  - creator (entity type)
  - owns (connection type)

Context loaded: Only these 4 type definitions
Result: ~200 tokens instead of 150,000
```

**Stage 2: Plans (Targeted Context)**
```
Director sees: This plan uses course, lesson, creator, owns

Ontology provides:
  - Full definitions for these 4 types
  - Similar patterns using these types
  - Validation rules for these types

Context loaded: Only definitions + patterns for plan's types
Result: ~1,500 tokens (99% reduction from loading everything)
```

**Stage 3: Features (Specialist Context)**
```
Backend Specialist assigned: CREATE course WITH lessons

Ontology provides:
  - Course entity schema
  - Lesson entity schema
  - Implementation patterns for CREATE commands
  - Similar features that created courses

Context loaded: Only what's needed for this specific feature
Result: ~1,500 tokens per agent (agents work in parallel)
```

**Stage 4: Tests (Validation Context)**
```
Quality Agent sees: Feature creates course with lessons

Ontology provides:
  - Validation rules for course entities
  - Validation rules for lesson entities
  - Test patterns for entity creation
  - UX patterns for course workflows

Context loaded: Only validation rules + test patterns
Result: ~2,000 tokens focused on quality
```

**Stage 5: Design (UI Context)**
```
Design Agent sees: User needs to CREATE and VIEW courses

Ontology provides:
  - Design patterns for course entities
  - UI components for entity creation
  - Layout patterns for entity lists
  - Accessibility requirements

Context loaded: Only design patterns + components
Result: ~2,000 tokens focused on UI/UX
```

**Stage 6: Implementation (Complete Feature Context)**
```
Specialist implements: Course creation feature

Ontology provides:
  - Feature specification (from Stage 3)
  - Test criteria (from Stage 4)
  - Design specification (from Stage 5)
  - Implementation patterns for course creation
  - Lessons learned about course features

Context loaded: Everything for THIS feature, nothing else
Result: ~2,500 tokens (complete but focused)
```

### Why Ontology-as-Type-System is More Elegant

**Other AI coding tools:**
```
Developer: "I need to implement course creation"

Tool: "Let me search the codebase for 'course'..."
      *finds 47 files mentioning 'course'*
      *embeds them, ranks by similarity*
      *loads top 10 files* (maybe relevant?)

Result: Generic code, might be right, might not
```

**CASCADE with ontology:**
```
Creator: "CREATE course WITH lessons"

Ontology: "course is entity type #12, lesson is entity type #18"
          *loads exactly: course schema, lesson schema, part_of connection*
          *loads exactly: CREATE pattern for entities*
          *loads exactly: 3 previous course features*

Result: Precise code, guaranteed correct structure
```

**The difference:**

| Approach | Method | Accuracy | Speed | Context Size |
|----------|--------|----------|-------|--------------|
| File-based | Import tree traversal | 40-60% relevant | Slow (load many files) | 50-150k tokens |
| Semantic search | Embedding similarity | 60-80% relevant | Medium (search + load) | 20-50k tokens |
| Manual selection | Developer chooses | 90%+ relevant | Fast but manual | 10-30k tokens |
| **CASCADE Ontology** | **Type resolution** | **100% relevant** | **Instant (no search)** | **1-3k tokens** |

**Why ontology wins:**

1. **Deterministic:** Types are resolved, not searched
2. **Complete:** Every type has defined schema, patterns, relationships
3. **Minimal:** Only what's needed for the specific types used
4. **Fast:** No embedding, no search, just lookup
5. **Composable:** Types compose predictably (course + lesson = course with lessons)

### Why This Works

**1. Types are stable** - The ontology types rarely change, so they're perfect indexes

**2. Commands map to types** - Every user command references specific types:
   - `CREATE course` → load course type definition
   - `CONNECT student to course` → load student + course + enrolled_in types
   - `GET lessons WHERE part_of course` → load lesson + course + part_of types

**3. Patterns are reusable** - Implementation patterns are tagged by type:
   - "How to CREATE entity" pattern
   - "How to CONNECT two entities" pattern
   - "How to query relationships" pattern

**4. Context compounds progressively** - Each stage adds only what's new:
   - Stage 1: Type names only
   - Stage 2: Type definitions for plan
   - Stage 3: Patterns for feature types
   - Stage 4: Validation for feature types
   - Stage 5: Design for feature types
   - Stage 6: Everything for feature, nothing for other features

### Real-World Example: How Context Differs

**Scenario:** Implement student enrollment in a course

**Other AI tools approach:**
```
1. Search codebase for "enroll" → 23 files
2. Search codebase for "student" → 41 files
3. Search codebase for "course" → 47 files
4. Embed all 111 files (duplicates removed: 89 unique)
5. Rank by similarity to query
6. Load top 15 files (hoping they're relevant)
7. Context: 35,000 tokens (mostly noise)
8. AI generates code (based on fuzzy matches)
```

**CASCADE ontology approach:**
```
1. Parse command: CONNECT student TO course AS enrolled_in
2. Ontology lookup:
   - student: entity type #8 (here's the schema)
   - course: entity type #12 (here's the schema)
   - enrolled_in: connection type #4 (here's how connections work)
3. Pattern lookup:
   - "CONNECT entity TO entity" pattern (here's the template)
   - Previous enrollment features (here are 2 examples)
4. Context: 1,800 tokens (100% relevant)
5. AI generates code (based on exact types)
```

**Result comparison:**

Other tools: "Here's code that *might* work, based on similar patterns in your codebase"
CASCADE: "Here's code that *will* work, based on the exact types you specified"

### The Elegant Insight

Traditional AI coding tools are doing information retrieval. CASCADE is doing type checking.

**Information retrieval:** Search → Rank → Hope it's relevant
**Type checking:** Lookup → Load exact definitions → Guaranteed correct structure

The ontology doesn't search for what might be relevant—it knows deterministically what IS relevant because types define their own requirements.

---

## Agent System

### 8 Specialized Agents

**Engineering Director**

- Validates commands against ontology types
- Maps user flows to technical features
- Creates parallel task lists from independent commands
- Assigns features to appropriate specialists

**Backend Specialist**

- Converts `CREATE` commands to database schemas
- Converts `RECORD` commands to event logging
- Converts `CALL` commands to service integrations
- Implements Effect.ts services from specifications

**Frontend Specialist**

- Converts `SHOW` commands to UI components
- Converts `GIVE` commands to user feedback
- Creates forms for `INPUT` specifications
- Implements pages that execute user flows

**Integration Specialist**

- Converts `CONNECT` commands to relationship logic
- Converts `CALL` commands to external API integrations
- Implements data flows between operations
- Coordinates multi-system features

**Quality Agent**

- Converts `CHECK` commands to validation tests
- Converts user flows to acceptance criteria
- Validates each step has corresponding test
- Ensures error cases (OTHERWISE clauses) are tested

**Design Agent**

- Converts user flows to wireframes
- Designs UI components for each command
- Creates visual flows matching execution order
- Ensures visual feedback for each operation

**Problem Solver**

- Analyzes specification-to-code mismatches (uses ultrathink)
- Identifies where implementation deviates from specification
- Proposes fixes that maintain intended behavior
- Validates fixes preserve original requirements

**Documenter**

- Converts specifications to user-facing documentation
- Documents each command's purpose
- Creates API docs from service calls
- Generates examples from patterns

---

## Parallel Execution via Command Analysis

### Traditional Approach

```
Load entire codebase → Parse → Find relevant code → Execute
```

Every operation requires full codebase context.

### How CASCADE Analyzes Commands for Parallel Execution

The system analyzes commands to identify independent operations:

```
FEATURE: Import YouTube videos and build course

STEP 1 (Sequential - must happen first):
  CALL YouTube API to get channel videos

STEP 2 (Parallel - no dependencies):
  DO AT SAME TIME:
    - FOR EACH video extract transcript
    - FOR EACH video generate thumbnail
    - FOR EACH video calculate duration

STEP 3 (Sequential - needs data from Step 2):
  FOR EACH video CREATE lesson entity
    WITH transcript
    WITH thumbnail
    WITH duration

STEP 4 (Parallel - independent operations):
  DO AT SAME TIME:
    - CREATE course with all lessons
    - CONNECT creator to course as owner
    - RECORD course created
```

### Agent Launch Pattern

```typescript
// Director analyzes DSL and launches agents in parallel

// Step 2: Three independent FOR EACH operations
Task(agent: backend-specialist, context: "FOR EACH video extract transcript", tokens: 2500)
Task(agent: backend-specialist, context: "FOR EACH video generate thumbnail", tokens: 2500)
Task(agent: backend-specialist, context: "FOR EACH video calculate duration", tokens: 2500)

// All execute simultaneously, results merged when complete
```

**Benefits:**
- Automatic parallelization from DSL structure
- No manual dependency management
- Agents coordinate via DSL semantics

---

## Event-Driven Coordination

### How DSL RECORD Commands Enable Coordination

Every `RECORD` command in DSL becomes an event that other agents can watch:

```
Plain English DSL:

RECORD videos imported
  BY creator
  WITH video count 10
  WITH channel URL

↓ Compiles to ↓

await db.insert('events', {
  type: 'videos_imported',
  actorId: creatorId,
  metadata: {
    videoCount: 10,
    channelUrl: 'youtube.com/c/creator'
  },
  timestamp: Date.now()
})

↓ Backend Specialist watches ↓

const importedVideos = await db
  .query('events')
  .withIndex('by_type', q => q.eq('type', 'videos_imported'))
  .filter(q => q.eq(q.field('actorId'), creatorId))
  .first()
```

### Full Coordination Flow

```
Director writes DSL:
  RECORD plan started WITH plan "2-creator-course-platform"
  RECORD feature assigned WITH target "2-1-youtube-import" WITH agent "backend"

Backend Specialist watches DSL:
  GET events WHERE type = "feature_assigned" WHERE agent = "backend"
  → Start work on "2-1-youtube-import"

Backend Specialist writes DSL:
  RECORD videos imported WITH count 10
  RECORD implementation complete WITH target "2-1-youtube-import"

Quality watches DSL:
  GET events WHERE type = "implementation_complete"
  → Run tests

Quality writes DSL:
  RECORD test passed WITH target "2-1-youtube-import"

Documenter watches DSL:
  GET events WHERE type = "test_passed"
  → Write documentation

Documenter writes DSL:
  RECORD documentation complete WITH target "2-1-youtube-import"

Director watches DSL:
  GET events WHERE type = "documentation_complete"
  → Mark feature complete
```

**Benefits:**
- Agents coordinate using same DSL users write
- Events table IS the message bus
- Complete audit trail in DSL semantics
- Natural failure recovery

---

## Quality Loops: DSL Validation and Fixing

### How DSL Enables Self-Healing

When implementation doesn't match DSL specification, Problem Solver analyzes the gap:

```
Plain English DSL says:
  FOR EACH video CREATE lesson
  RECORD course created
    BY creator
    WITH lesson count

Generated code does:
  const courseId = await db.insert('entities', courseData)
  // Missing: event logging!
  // Missing: lesson count in metadata!

Quality Agent detects:
  ✗ Test fails: "should log course_created event with lesson count"
  ✗ DSL command not executed: RECORD course created

Problem Solver analyzes (ultrathink mode):
  1. DSL specifies: RECORD course created BY creator WITH lesson count
  2. Code creates course but doesn't record event
  3. Missing: event logging after entity creation
  4. Missing: lesson count in event metadata
  5. Solution: Add event logging with lesson count after db.insert

Problem Solver delegates fix:
  Backend Specialist: Add event logging matching DSL spec
    await db.insert('events', {
      type: 'course_created',
      actorId: creatorId,
      targetId: courseId,
      metadata: { lessonCount: lessons.length },
      timestamp: Date.now()
    })

Specialist adds lesson learned:
  "Always implement RECORD commands after CREATE commands with metadata"
```

### Knowledge Accumulation

Lessons learned are written in DSL terms:

```markdown
### Always Implement RECORD After CREATE

**DSL Pattern:**
FOR EACH video CREATE lesson
CREATE course
RECORD course created BY creator WITH lesson count

**Problem:** CREATE was implemented but RECORD was missed
**Solution:** Every CREATE command must have corresponding RECORD with metadata
**Rule:** CREATE + RECORD are a pair, never separate, include all WITH clauses
**Example:**
const courseId = await db.insert('entities', courseData)
await db.insert('events', {
  type: 'course_created',
  actorId: creatorId,
  targetId: courseId,
  metadata: { lessonCount: lessons.length }
})
```

These DSL patterns are loaded in Stage 6 to prevent repeated mistakes.

---

## Ontology Integration: DSL IS the Ontology

### The Direct Mapping

The 6-dimension ontology defines valid DSL commands:

**Organizations (org-scoped data)**

```
DSL: CREATE organization called "Acme Corp"
→ Entity type: organization
→ All subsequent operations scoped to this org
```

**People (roles and authorization)**

```
DSL: CREATE creator WITH role "org_owner"
→ Entity type: creator (thing with role metadata)
→ Authorization: can CREATE, CONNECT, RECORD within org

DSL: CHECK creator can access course
→ Validation: role permissions against ontology rules
```

**Things (66+ entity types)**

```
DSL: CREATE ai_clone
→ Entity type: ai_clone (one of 66+ types)
→ Schema: ontology defines valid properties

DSL: CREATE course
→ Entity type: course
→ Schema: ontology defines valid properties
```

**Connections (25+ relationship types)**

```
DSL: CONNECT creator to ai_clone as owner
→ Connection type: owns (one of 25+ types)
→ Bidirectional: owner/owned_by
→ Temporal: validFrom/validTo

DSL: CONNECT student to course as enrolled
→ Connection type: enrolled_in
→ Metadata: enrollment date, progress
```

**Events (67+ event types)**

```
DSL: RECORD clone created BY creator
→ Event type: clone_created (one of 67+ types)
→ Actor: creator (who did it)
→ Target: clone (what was affected)
→ Complete audit trail

DSL: RECORD tokens purchased BY fan
→ Event type: tokens_purchased
→ Consolidated event family: transacted
→ Metadata: protocol = "token_purchase"
```

**Knowledge (vectors and search)**

```
DSL: GET personality traits WHERE creator = "john"
→ Query: knowledge table
→ Vector search: semantic similarity
→ RAG context for AI responses
```

### Validation at Every DSL Stage

**Stage 1: Validate DSL Commands**

```
User writes: CREATE xyz

Director checks:
  ✗ "xyz" not in ontology entity types
  → Error: "Unknown entity type 'xyz'. Did you mean: ai_clone, course, token?"

User writes: CONNECT creator to clone as invented_relationship

Director checks:
  ✗ "invented_relationship" not in ontology connection types
  → Error: "Unknown connection type. Use: owns, authored, delegated, etc."
```

**Stage 3: Validate DSL Mappings**

```
Specialist writes: Entity type "ai_clone" with property "unknownField"

Quality checks:
  ✗ "unknownField" not in ai_clone schema
  → Error: "Invalid property. Valid properties: voiceId, personalityPrompt, status"
```

**Stage 4: Validate DSL Flow**

```
Quality defines: Test flow deviates from DSL specification

Quality checks:
  ✗ DSL says: CHECK fan owns tokens OTHERWISE say "Buy tokens"
  ✗ Test says: CHECK fan logged in
  → Error: "Test doesn't match DSL specification"
```

**Stage 6: Validate DSL Execution**

```
Code implements: Different behavior than DSL specifies

Quality validates:
  ✗ DSL says: GIVE fan 10 tokens as reward
  ✗ Code gives: 5 tokens
  → Error: "Implementation doesn't match DSL specification"
```

---

## Complete Example: From DSL to Working Code

### Input: Plain English DSL

```
FEATURE: Import YouTube videos and chat with AI about course content

INPUT:
  - creator: who is building the course
  - youtube channel: creator's YouTube channel URL
  - student: who is learning
  - message: question about course

OUTPUT:
  - course: created course with lessons
  - response: AI answer based on video transcripts
  - enrollment: student enrolled in course

FLOW:

CHECK creator exists
  OTHERWISE say "Creator account not found"

GET my YouTube channel videos
  WITH channel URL
  SAVE AS videos

CHECK videos count is at least 3
  OTHERWISE say "Need at least 3 videos to create course"

FOR EACH video IN videos
  CALL YouTube API to get video details
    WITH video ID
    SAVE AS video data

  CALL OpenAI to generate transcript
    WITH video URL
    SAVE AS transcript

  CREATE lesson called video title
    WITH transcript
    WITH video URL
    WITH duration

  RECORD lesson created BY creator

CREATE course called "YouTube Masterclass"
  WITH all lessons
  WITH price $99

CONNECT creator to course as owner

RECORD course created
  BY creator
  WITH lesson count

--- STUDENT ENROLLMENT ---

CHECK student exists
  OTHERWISE say "Please create student account"

CHECK course exists
  OTHERWISE say "Course not found"

CONNECT student to course as enrolled

RECORD enrollment
  BY student
  WITH course ID

--- AI CHAT WITH VIDEO CONTENT ---

GET student's question
  SAVE AS message

GET course lessons WHERE student enrolled
  SAVE AS lessons

CALL OpenAI to search relevant transcripts
  WITH message
  WITH lessons transcripts
  SAVE AS context

CALL OpenAI to generate response
  WITH context from videos
  WITH message
  WITH course structure
  SAVE AS AI response

RECORD chat interaction
  BY student
  WITH course ID
  WITH message
  WITH response

GIVE AI response with video references
```

### Stage 1: Director Validates DSL

```
✓ Entity type "creator" exists in ontology
✓ Entity type "video" exists
✓ Entity type "course" exists
✓ Entity type "lesson" exists
✓ Entity type "student" exists
✓ Connection type "owns" exists (creator owns course)
✓ Connection type "enrolled_in" exists (student enrolled_in course)
✓ Connection type "part_of" exists (lesson part_of course)
✓ Event type "videos_imported" exists
✓ Event type "course_created" exists
✓ Event type "enrollment" exists
✓ Event type "chat_interaction" exists
✓ Service provider "youtube" exists
✓ Service provider "openai" exists
✓ All DSL commands valid

Creates Plan 2: YouTube Course Platform with AI Chat
```

### Stage 2: Director Creates Features

```
Plan 2: YouTube Course Platform with AI Chat
├── 2-1-youtube-import (Backend Specialist)
│   └── DSL: GET videos, CALL YouTube API, FOR EACH video
├── 2-2-transcript-generation (Backend Specialist)
│   └── DSL: FOR EACH video CALL OpenAI, CREATE lesson
├── 2-3-course-builder (Backend Specialist)
│   └── DSL: CREATE course, CONNECT lessons, RECORD course_created
├── 2-4-enrollment-system (Integration Specialist)
│   └── DSL: CONNECT student to course, RECORD enrollment
├── 2-5-ai-chat-engine (Backend Specialist)
│   └── DSL: GET transcripts, CALL OpenAI with context
├── 2-6-course-pages (Frontend Specialist)
│   └── DSL: SHOW courses, SHOW lessons, SHOW chat interface
└── 2-7-student-dashboard (Frontend Specialist)
    └── DSL: SHOW enrollment, SHOW progress, SHOW AI chat
```

### Stage 3: Specialists Write Specs (Parallel)

**Backend Specialist (2-1-youtube-import):**

```
DSL: GET my YouTube channel videos WITH channel URL

Technical Spec:
  Service: YouTubeImportService.getChannelVideos()
  External: YouTube Data API v3
  Input: channelUrl, creatorId
  Output: Array<{ videoId, title, description, duration }>
  Event: videos_imported (logged after retrieval)
```

**Backend Specialist (2-2-transcript-generation):**

```
DSL: FOR EACH video CALL OpenAI to generate transcript

Technical Spec:
  Service: TranscriptService.generateFromVideo()
  External: OpenAI Whisper API
  Input: videoUrl
  Output: transcript text
  Pattern: Parallel processing for all videos
  Event: transcript_generated (logged per video)
```

**Backend Specialist (2-5-ai-chat-engine):**

```
DSL: CALL OpenAI to search relevant transcripts WITH message

Technical Spec:
  Service: AIChatService.generateResponse()
  External: OpenAI Chat Completion API + Vector Search
  Input: studentMessage, courseTranscripts, lessonContext
  Output: AI response with video references
  Event: chat_interaction (logged after response)
```

**Frontend Specialist (2-6-course-pages):**

```
DSL: SHOW courses, SHOW lessons, SHOW chat interface

Technical Spec:
  Pages: /courses, /courses/[id], /courses/[id]/chat
  Components: <CourseGrid>, <LessonPlayer>, <AIChatBox>
  State: course data, video playback, chat history
  Layout: Dashboard with video player + AI chat sidebar
```

### Stage 4: Quality Defines Tests

```
Test Suite: YouTube Course Platform with AI Chat

Test 1: "should import videos from YouTube"
  Given: creator has YouTube channel with 10 videos
  When: creator imports channel
  Then: 10 video entities created with titles and URLs

Test 2: "should generate transcripts for all videos"
  Given: 5 videos imported
  When: transcript generation runs
  Then: 5 lesson entities created with transcripts

Test 3: "should create course with lessons"
  Given: 5 lessons exist
  When: creator creates course
  Then: course created with 5 lessons connected via part_of

Test 4: "should enroll student in course"
  Given: course exists with 5 lessons
  When: student enrolls
  Then: enrolled_in connection created, enrollment event logged

Test 5: "should answer questions using video transcripts"
  Given: student enrolled in course with video transcripts
  When: student asks "What is the main concept?"
  Then: AI responds with answer + references to specific videos

Test 6: "should track chat interactions"
  Given: student chatting with AI about course
  When: student sends 3 messages
  Then: 3 chat_interaction events logged with course context
```

### Stage 5: Design Creates UI

```
Wireframe: Course Dashboard with AI Chat

┌─────────────────────────────────────────────────────────────┐
│ YouTube Masterclass                                         │
├──────────────────────────┬──────────────────────────────────┤
│                          │  💬 Ask AI About This Course     │
│  📹 Lesson 1: Intro      │                                  │
│     [10:32] ▶            │  Student: What's the main topic? │
│                          │                                  │
│  📹 Lesson 2: Setup      │  AI: Based on Lesson 1 (2:30),  │
│     [15:20]              │  the main topic is...            │
│                          │  📹 See Lesson 1                 │
│  📹 Lesson 3: Advanced   │                                  │
│     [22:45]              │  Student: How do I start?        │
│                          │                                  │
│  Progress: 1/3 complete  │  AI: As explained in Lesson 2... │
│                          │  📹 See Lesson 2                 │
├──────────────────────────┼──────────────────────────────────┤
│  [Import More Videos]    │  Type question...         [Ask]  │
└──────────────────────────┴──────────────────────────────────┘

Decision: Split-pane layout (video player + AI chat)
Decision: Video references in chat (satisfies "context from videos" DSL)
Decision: Progress tracking (satisfies "enrollment" tracking)
Decision: Import button (satisfies "GET YouTube videos" DSL)
```

### Stage 6: Implementation (Parallel)

**Generated Backend Service:**

```typescript
// From DSL: Import YouTube videos and generate transcripts
export const importYouTubeChannel = (params: ImportParams) =>
  Effect.gen(function* () {
    // Validate creator (DSL: CHECK creator exists)
    const creator = yield* CreatorService.findById(params.creatorId)
    if (!creator) {
      return yield* Effect.fail({
        tag: 'CreatorNotFound',
        message: 'Creator account not found'
      })
    }

    // Get YouTube videos (DSL: GET my YouTube channel videos)
    const videos = yield* YouTubeService.getChannelVideos(params.channelUrl)

    if (videos.length < 3) {
      return yield* Effect.fail({
        tag: 'InsufficientVideos',
        message: 'Need at least 3 videos to create course'
      })
    }

    // Process videos in parallel (DSL: FOR EACH video)
    const lessons = yield* Effect.all(
      videos.map(video =>
        Effect.gen(function* () {
          // Generate transcript (DSL: CALL OpenAI)
          const transcript = yield* OpenAIService.transcribe(video.url)

          // Create lesson (DSL: CREATE lesson)
          const lessonId = yield* db.insert('entities', {
            type: 'lesson',
            properties: {
              title: video.title,
              videoUrl: video.url,
              transcript,
              duration: video.duration
            }
          })

          // Record lesson created (DSL: RECORD lesson created)
          yield* EventService.record({
            type: 'lesson_created',
            actorId: params.creatorId,
            targetId: lessonId,
            metadata: { videoId: video.id }
          })

          return lessonId
        })
      ),
      { concurrency: 5 } // Parallel processing
    )

    // Create course (DSL: CREATE course)
    const courseId = yield* db.insert('entities', {
      type: 'course',
      properties: {
        title: 'YouTube Masterclass',
        price: 99,
        lessonCount: lessons.length
      }
    })

    // Connect lessons to course (DSL: CONNECT lessons part_of course)
    yield* Effect.all(
      lessons.map(lessonId =>
        db.insert('connections', {
          type: 'part_of',
          fromId: lessonId,
          toId: courseId
        })
      )
    )

    // Connect creator to course (DSL: CONNECT creator to course as owner)
    yield* db.insert('connections', {
      type: 'owns',
      fromId: params.creatorId,
      toId: courseId
    })

    // Record course created (DSL: RECORD course created)
    yield* EventService.record({
      type: 'course_created',
      actorId: params.creatorId,
      targetId: courseId,
      metadata: { lessonCount: lessons.length }
    })

    return { courseId, lessonCount: lessons.length }
  })

// From DSL: AI chat with video transcripts
export const chatWithCourse = (params: ChatParams) =>
  Effect.gen(function* () {
    // Get course lessons (DSL: GET course lessons WHERE student enrolled)
    const enrollment = yield* db
      .query('connections')
      .withIndex('by_type', q => q.eq('type', 'enrolled_in'))
      .filter(q =>
        q.and(
          q.eq(q.field('fromId'), params.studentId),
          q.eq(q.field('toId'), params.courseId)
        )
      )
      .first()

    if (!enrollment) {
      return yield* Effect.fail({
        tag: 'NotEnrolled',
        message: 'Student not enrolled in course'
      })
    }

    const lessons = yield* db
      .query('connections')
      .withIndex('by_type', q => q.eq('type', 'part_of'))
      .filter(q => q.eq(q.field('toId'), params.courseId))
      .collect()

    // Get transcripts from lessons
    const transcripts = yield* Effect.all(
      lessons.map(lesson =>
        db.get(lesson.fromId).then(l => l.properties.transcript)
      )
    )

    // Search relevant transcripts (DSL: CALL OpenAI to search)
    const context = yield* OpenAIService.searchTranscripts({
      query: params.message,
      transcripts
    })

    // Generate response (DSL: CALL OpenAI to generate response)
    const response = yield* OpenAIService.generateResponse({
      context,
      message: params.message,
      lessons
    })

    // Record interaction (DSL: RECORD chat interaction)
    yield* EventService.record({
      type: 'chat_interaction',
      actorId: params.studentId,
      targetId: params.courseId,
      metadata: { message: params.message, response }
    })

    return { response, videoReferences: context.sources }
  })
```

**Generated Frontend Components:**

```typescript
// From DSL: SHOW courses, SHOW lessons, SHOW chat interface
export function CourseDashboard({ courseId }: { courseId: string }) {
  const course = useQuery(api.courses.get, { courseId })
  const lessons = useQuery(api.lessons.listByCourse, { courseId })
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const sendMessage = async () => {
    const result = await chatWithCourse({ courseId, message: chatMessage })
    setChatHistory([
      ...chatHistory,
      { role: 'student', content: chatMessage },
      { role: 'ai', content: result.response, sources: result.videoReferences }
    ])
    setChatMessage('')
  }

  return (
    <div className="course-dashboard">
      <h1>{course?.properties.title}</h1>

      <div className="layout-split">
        {/* Lessons sidebar */}
        <div className="lessons-sidebar">
          {lessons?.map(lesson => (
            <LessonCard
              key={lesson._id}
              title={lesson.properties.title}
              duration={lesson.properties.duration}
              videoUrl={lesson.properties.videoUrl}
            />
          ))}
          <button onClick={importMoreVideos}>Import More Videos</button>
        </div>

        {/* AI Chat interface */}
        <div className="ai-chat">
          <h2>💬 Ask AI About This Course</h2>
          <div className="chat-messages">
            {chatHistory.map((msg, i) => (
              <ChatBubble
                key={i}
                role={msg.role}
                content={msg.content}
                sources={msg.sources}
              />
            ))}
          </div>
          <ChatInput
            value={chatMessage}
            onChange={setChatMessage}
            onSend={sendMessage}
            placeholder="Type question..."
          />
        </div>
      </div>
    </div>
  )
}
```

**Generated Tests:**

```typescript
describe('YouTube Course Platform', () => {
  it('should import videos and create lessons', async () => {
    const creator = await createCreator()
    const result = await importYouTubeChannel({
      creatorId: creator.id,
      channelUrl: 'youtube.com/c/creator'
    })

    expect(result.lessonCount).toBeGreaterThanOrEqual(3)

    const lessons = await getLessons(result.courseId)
    expect(lessons).toHaveLength(result.lessonCount)
    expect(lessons[0].properties.transcript).toBeDefined()
  })

  it('should answer questions using video transcripts', async () => {
    const student = await createStudent()
    const course = await createCourseWithLessons(5)
    await enrollStudent(student.id, course.id)

    const result = await chatWithCourse({
      studentId: student.id,
      courseId: course.id,
      message: 'What is the main concept?'
    })

    expect(result.response).toContain('Based on')
    expect(result.videoReferences).toHaveLength.greaterThan(0)
  })

  it('should track enrollment and chat interactions', async () => {
    const student = await createStudent()
    const course = await createCourse()

    await enrollStudent(student.id, course.id)
    await chatWithCourse({ studentId: student.id, courseId: course.id, message: 'Hi' })

    const events = await getEvents({ studentId: student.id })
    expect(events).toContainEqual(expect.objectContaining({ type: 'enrollment' }))
    expect(events).toContainEqual(expect.objectContaining({ type: 'chat_interaction' }))
  })
})
```

### Output: Production-Ready Application

- ✅ YouTube import working with video metadata extraction
- ✅ Transcript generation for all videos via OpenAI Whisper
- ✅ Course builder with lessons automatically connected
- ✅ Student enrollment system with tracking
- ✅ AI chat with video transcript context
- ✅ Video references in AI responses
- ✅ Complete event logging (imports, enrollments, chats)
- ✅ Tests covering all user flows
- ✅ Dashboard UI with split-pane layout

**Generated Files:**
- `backend/services/YouTubeImportService.ts`
- `backend/services/TranscriptService.ts`
- `backend/services/CourseService.ts`
- `backend/services/AIChatService.ts`
- `frontend/src/pages/courses.astro`
- `frontend/src/pages/courses/[id].astro`
- `frontend/src/components/CourseDashboard.tsx`
- `frontend/src/components/LessonCard.tsx`
- `frontend/src/components/ChatBubble.tsx`
- `frontend/test/courses/import.test.ts`
- `frontend/test/courses/enrollment.test.ts`
- `frontend/test/courses/ai-chat.test.ts`

**Timeline:** 2-3 weeks from DSL to production

---

## File Structure

```
one/
├── knowledge/
│   ├── language.md                  # Plain English DSL reference
│   ├── ontology-minimal.yaml        # 6-dimension ontology (DSL validation)
│   ├── lessons-learned.md           # DSL patterns that work
│   └── patterns/                    # DSL→Code translation patterns
├── things/
│   ├── cascade/
│   │   ├── cascade.yaml             # Workflow orchestration config
│   │   ├── docs/
│   │   │   ├── getting-started.md   # Quick start
│   │   │   ├── workflow.md          # Complete specification
│   │   │   └── examples/            # DSL examples with generated code
│   │   └── templates/
│   │       └── feature-template.md  # DSL feature template
│   ├── agents/                      # 8 agent prompts (DSL processors)
│   │   ├── agent-director.md        # Validates DSL
│   │   ├── agent-backend.md         # Implements CREATE, RECORD, CALL
│   │   ├── agent-frontend.md        # Implements SHOW, GIVE
│   │   ├── agent-integration.md     # Implements CONNECT, UPDATE
│   │   ├── agent-quality.md         # Validates DSL flow
│   │   ├── agent-designer.md        # Designs DSL execution UI
│   │   ├── agent-problem-solver.md  # Fixes DSL mismatches
│   │   └── agent-documenter.md      # Documents DSL features
│   ├── plans/                       # Generated plans (from DSL)
│   └── features/                    # Generated features (from DSL)
└── events/
    └── workflow/                    # Event logs (DSL RECORD commands)
```

---

## Command Interface

```bash
/one
```

Launches CASCADE with DSL interface:

```
ONE CASCADE - Plain English to Production Code

Write Features:
1. New Feature (Plain English DSL)
2. View Active Plans
3. Check Feature Status

Templates:
4. AI Clone Template
5. Token Economy Template
6. Course Platform Template
7. Custom Template

Help:
H. DSL Quick Reference
?. Example Library
```

---

## Performance Metrics

| Metric | Traditional | CASCADE with DSL |
|--------|-------------|------------------|
| Input format | Technical specifications | Plain English |
| Validation | Manual code review | Automatic against ontology |
| Context per stage | 150,000 tokens | 200-2,500 tokens |
| Average context | 150,000 tokens | 3,000 tokens (98% reduction) |
| Parallelization | Manual coordination | Automatic from DSL structure |
| Error detection | Runtime failures | Compile-time validation |
| Code quality | Variable | Consistent (validated against DSL) |
| Knowledge retention | None | DSL patterns accumulate |
| Time to production | 3-6 months | 2-3 weeks |

---

## Technical Requirements

**Backend:**
- Effect.ts (functional programming, error handling)
- Database with events table (message bus)
- Service providers (OpenAI, ElevenLabs, Stripe, etc.)

**Frontend:**
- Astro 5 (static generation + SSR)
- React 19 (islands architecture)
- Tailwind v4 (styling)

**AI:**
- Claude Code (agent orchestration)
- Task tool (parallel agent execution)
- 8 specialized agent prompts (DSL processors)

**Deployment:**
- Edge platform (Cloudflare Pages, Vercel, etc.)
- Database platform (supporting events table)

---

## Philosophy

**Core Principles:**

1. **Plain English IS the specification** - DSL commands are executable
2. **Ontology IS the validation** - Every DSL command maps to ontology types
3. **Agents collaborate via DSL semantics** - RECORD commands create events agents watch
4. **Context loaded per DSL stage** - Only load what's needed for current DSL commands
5. **Parallel by default** - Independent DSL commands execute concurrently
6. **Quality loops validate DSL** - Implementation must match DSL specification
7. **Knowledge accumulates in DSL terms** - Lessons learned as DSL patterns

**Key Insight:** When the input language maps directly to the ontology, and agents coordinate using the same language, you get 98% context reduction, automatic parallelization, and self-validating implementations.

---

## Documentation

**DSL Reference:** `one/knowledge/language.md`
**Quick Start:** `one/things/cascade/docs/getting-started.md`
**Complete Workflow:** `one/things/cascade/docs/workflow.md`
**Configuration:** `one/things/cascade/cascade.yaml`
**Agent Prompts:** `one/things/agents/`
**Ontology:** `one/knowledge/ontology-minimal.yaml`
**Examples:** `one/things/cascade/docs/examples/`

---

**ONE Cascade v1.0.0**

Plain English DSL → 6-Dimension Ontology → Parallel Agent Orchestration → Production Code

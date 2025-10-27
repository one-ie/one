# Lessons Learned

This file captures problems encountered and solutions found during feature development. Every problem solved makes the system smarter.

**How to use:**
- Search for similar problems: `grep -i "keyword" lessons-learned.md`
- Add new lessons after solving problems (append to relevant category)
- Reference lessons when implementing similar features

**Categories:**
- Backend (services, mutations, queries, schemas)
- Frontend (components, pages, state management)
- Integration (connections, data flows, APIs)
- Testing (unit, integration, e2e)
- Design (UI/UX, accessibility, performance)
- Workflow (process improvements, coordination)

---

## Backend Lessons

### Hierarchical Groups Enable Infinite Flexibility
**Date:** 2025-01-25
**Feature:** Groups (Dimension 1)
**Problem:** Initial design had flat groups - organizations couldn't model internal structure
**Solution:** Added `parentGroupId` field for hierarchical nesting
**Pattern:** Groups can nest infinitely (Org → Dept → Team → Project)
**Context:** Use when modeling organizations, social circles, DAOs with internal structure
**Example:**
```typescript
const org = await createGroup({ type: "organization", slug: "acme" });
const dept = await createGroup({ type: "community", slug: "engineering", parentGroupId: org._id });
const team = await createGroup({ type: "community", slug: "backend", parentGroupId: dept._id });
```
**Related:** Multi-tenant isolation, Permission inheritance

---

### GroupId Provides Perfect Multi-Tenant Isolation
**Date:** 2025-01-25
**Feature:** Multi-tenancy
**Problem:** Risk of cross-tenant data leakage
**Solution:** Every dimension (entities, connections, events, knowledge) MUST have groupId
**Pattern:** ALWAYS filter queries by groupId
**Context:** All queries in multi-tenant systems
**Example:**
```typescript
// ✅ CORRECT
const entities = await ctx.db
  .query("entities")
  .withIndex("by_group", q => q.eq("groupId", groupId))
  .collect();

// ❌ WRONG - Missing groupId
const entities = await ctx.db.query("entities").collect();
```
**Related:** Security, GDPR compliance, Permission model

---

### Ontology Composition Eliminates Schema Changes
**Date:** 2025-01-25
**Feature:** Ontology system
**Problem:** Adding features required schema migrations
**Solution:** Generate types from YAML ontologies based on enabled features
**Pattern:** Features enabled via `PUBLIC_FEATURES` env variable
**Context:** Adding new entity/connection/event types
**Example:**
```bash
export PUBLIC_FEATURES="blog,portfolio,courses"
bun run scripts/generate-ontology-types.ts
# Auto-generates THING_TYPES, CONNECTION_TYPES, EVENT_TYPES
```
**Related:** Schema design, Type generation, Feature flags

---

### Composite Indexes Provide 50x Performance Improvement
**Date:** 2025-01-25
**Feature:** Query performance
**Problem:** Queries slow on large datasets
**Solution:** Added composite indexes for common query patterns
**Pattern:** Index frequently-filtered fields together (groupId + type)
**Context:** All frequently-used query paths
**Example:**
```typescript
// Schema
entities: defineTable({ groupId, type, ... })
  .index("group_type", ["groupId", "type"])

// Query using index
await ctx.db
  .query("entities")
  .withIndex("group_type", q => q.eq("groupId", id).eq("type", "course"))
  .collect();
```
**Related:** Performance optimization, Database design

---

### Event Logging Provides Complete Audit Trail
**Date:** 2025-01-25
**Feature:** Event dimension (Dimension 5)
**Problem:** No audit trail made debugging difficult
**Solution:** ALL mutations log events (who, what, when, why)
**Pattern:** Log event after every mutation
**Context:** All create/update/delete operations
**Example:**
```typescript
await ctx.db.insert("events", {
  groupId,
  type: "thing_created",
  actorId: userId,
  targetId: entityId,
  timestamp: Date.now(),
  metadata: { entityType: "course", name: "TS 101" }
});
```
**Related:** Compliance, Debugging, Activity feeds

---

### Soft Deletes Preserve Audit Trail
**Date:** 2025-01-25
**Feature:** Entity lifecycle
**Problem:** Hard deletes broke audit trail and relationships
**Solution:** Archive entities (status="archived", deletedAt timestamp)
**Pattern:** Soft delete by default, hard delete only when legally required
**Context:** All delete operations
**Example:**
```typescript
// Soft delete
await ctx.db.patch(entityId, {
  status: "archived",
  deletedAt: Date.now()
});

// Restore
await ctx.db.patch(entityId, {
  status: "active",
  deletedAt: undefined
});
```
**Related:** GDPR compliance, Data retention

---

## Frontend Lessons

### React Islands Beat Full React for SEO
**Date:** 2025-01-25
**Feature:** Astro + React architecture
**Problem:** Full React app had poor SEO and slow initial load
**Solution:** Astro SSR with React islands (selective hydration)
**Pattern:** Server-render static content, use React only for interactivity
**Context:** All page-level components
**Example:**
```astro
---
// Server-side render
const courses = await convex.query(api.queries.entities.list, { groupId, type: "course" });
---

<Layout>
  <h1>Courses</h1>
  {courses.map(c => <li>{c.name}</li>)}

  <!-- Interactive React island -->
  <CourseEnroll client:load courseId={courseId} />
</Layout>
```
**Related:** Performance, SEO optimization

---

### Loading States Prevent UI Flicker
**Date:** 2025-01-25
**Feature:** Real-time data
**Problem:** Queries return undefined initially causing UI flicker
**Solution:** Handle 3 states: loading, error, success
**Pattern:** Always check for undefined, null, and data states
**Context:** All Convex query hooks
**Example:**
```typescript
const data = useQuery(api.queries.entities.list, { groupId, type });

if (data === undefined) return <Skeleton />;
if (data === null) return <Alert>Not found</Alert>;
return <List data={data} />;
```
**Related:** User experience, Error handling

---

### shadcn/ui Accelerates Development 10x
**Date:** 2025-01-25
**Feature:** UI components
**Problem:** Building components from scratch is slow
**Solution:** Use shadcn/ui (50+ pre-built accessible components)
**Pattern:** Use shadcn for all UI components
**Context:** All UI development
**Example:**
```bash
bunx shadcn@latest add button
# Use immediately
import { Button } from "@/components/ui/button";
<Button variant="default">Click me</Button>
```
**Related:** Accessibility, Development velocity

---

## Integration Lessons

<!-- Lessons about connections, data flows, APIs -->

---

## Testing Lessons

### Test Real User Flows, Not Implementation
**Date:** 2025-01-25
**Feature:** Testing strategy
**Problem:** Unit tests passed but real flows broke
**Solution:** Write integration tests that simulate actual user journeys
**Pattern:** Test from user perspective, not code perspective
**Context:** All feature testing
**Example:**
```typescript
// ✅ GOOD - Tests real user flow
it("should allow student to enroll in course", async () => {
  const studentId = await createEntity({ type: "user", name: "Alice" });
  const courseId = await createEntity({ type: "course", name: "TS 101" });
  const connectionId = await createConnection({
    fromEntityId: studentId,
    toEntityId: courseId,
    relationshipType: "enrolled_in"
  });
  const enrollments = await listConnections({
    fromEntityId: studentId,
    relationshipType: "enrolled_in"
  });
  expect(enrollments).toHaveLength(1);
});

// ❌ BAD - Tests implementation detail
it("should insert into connections table", async () => {
  await ctx.db.insert("connections", { /* ... */ });
});
```
**Related:** Quality assurance, User experience

---

### Parallel Tests with Isolated Groups
**Date:** 2025-01-25
**Feature:** Test isolation
**Problem:** Tests interfered with each other (shared state)
**Solution:** Each test creates its own group → perfect isolation
**Pattern:** Create fresh group per test
**Context:** All integration/E2E tests
**Example:**
```typescript
describe("Course enrollment", () => {
  let testGroup;

  beforeEach(async () => {
    testGroup = await createGroup({
      slug: `test-${Date.now()}`,
      name: "Test Group",
      type: "organization"
    });
  });

  it("should enroll student", async () => {
    // All operations scoped to testGroup
    const studentId = await createEntity({ groupId: testGroup._id, ... });
    // Tests can run in parallel
  });
});
```
**Related:** Test reliability, Parallel execution

---

## Design Lessons

### Parallel Queries Provide 5x Speed Improvement
**Date:** 2025-01-25
**Feature:** Query performance
**Problem:** Loading dashboard with 5 sequential queries took 2500ms
**Solution:** Run queries in parallel with Promise.all()
**Pattern:** Parallelize all independent queries
**Context:** Dashboard loading, multi-dataset pages
**Example:**
```typescript
// ❌ SLOW - Sequential (500ms × 5 = 2500ms)
const courses = await convex.query(api.queries.entities.list, { type: "course" });
const projects = await convex.query(api.queries.entities.list, { type: "project" });

// ✅ FAST - Parallel (max 500ms total)
const [courses, projects] = await Promise.all([
  convex.query(api.queries.entities.list, { type: "course" }),
  convex.query(api.queries.entities.list, { type: "project" })
]);
```
**Related:** Performance optimization, User experience

---

### Pagination Beats Loading Everything
**Date:** 2025-01-25
**Feature:** Large dataset handling
**Problem:** Loading 10,000 entities crashed browser
**Solution:** Use limit + cursor-based pagination
**Pattern:** Always paginate, never load all data
**Context:** List views, infinite scroll
**Example:**
```typescript
async function* paginateEntities(groupId, type) {
  let cursor = null;
  while (true) {
    const response = await convex.query(api.queries.entities.list, {
      groupId, type, limit: 100, cursor
    });
    yield response.items;
    if (!response.hasMore) break;
    cursor = response.nextCursor;
  }
}

for await (const batch of paginateEntities(groupId, "course")) {
  renderBatch(batch);
}
```
**Related:** Memory optimization, Infinite scroll

---

## Workflow Lessons

<!-- Lessons about process improvements, coordination -->

---

## Lesson Template

**Use this template when adding new lessons:**

```markdown
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

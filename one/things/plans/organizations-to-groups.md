# Organizations → Groups: Parallel Migration Plan

**Status:** Planning
**Version:** 2.0.0
**Complexity:** High (Breaking change to Dimension 1)
**Execution:** Parallel tracks after schema update

---

## Core Concept: Organizations ARE Groups

**Key Insight:** "Organizations" don't disappear—they become a **type** of group.

```typescript
// Organizations as Groups
{
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "organization",  // ← Organizations are just a group type!
  settings: {
    plan: "enterprise",
    limits: { users: 100, storage: 1000, apiCalls: 1000000 }
  }
}
```

**The Evolution:**

| Dimension | Old Name | New Name | Change |
|-----------|----------|----------|--------|
| 1 | Organizations | Groups | Generalized + hierarchical |
| 2 | People | People | No change |
| 3 | Things | Things | No change |
| 4 | Connections | Connections | No change |
| 5 | Events | Events | No change |
| 6 | Knowledge | Knowledge | No change |

**Multi-tenancy preserved:** Every group (including "organization" type) maintains perfect data isolation.

---

## The 6 Group Types

```typescript
type GroupType =
  | "friend_circle"   // Emma's Friends
  | "business"        // Acme Corp
  | "community"       // Crypto Community
  | "dao"             // CoolDAO
  | "government"      // City Council
  | "organization";   // Legacy - maps to old "organizations"
```

**All types share:**
- Multi-tenant isolation (groupId scopes all data)
- Hierarchical nesting (parentGroupId enables subgroups)
- URL-based creation (one.ie/group/slug)
- Role-based access (org_owner, org_user, customer)

**Type-specific differences:**
- Default visibility (friend_circle → private, dao → public)
- Default join policy (business → invite_only, dao → open)
- UI terminology (business → "company", dao → "DAO")
- Discovery settings (public types appear in /explore)

---

## Parallel Execution Strategy

### Sequential Foundation (Must Complete First)

**Track 0: Schema Update** (1 inference)
```typescript
// backend/convex/schema.ts
// BEFORE: organizations table
// AFTER: groups table with slug, type, parentGroupId, settings
```

**Dependencies:** None
**Blocks:** Everything else
**Duration:** 1 inference

---

### Parallel Track 1: Backend Mutations (Run in Parallel)

**All mutations can be updated simultaneously** after schema is ready.

```typescript
// Each file is independent - update in parallel!

// File 1: mutations/entities.ts
export const create = mutation({
  handler: async (ctx, args) => {
    - organizationId: args.organizationId,
    + groupId: args.groupId,
  }
});

// File 2: mutations/connections.ts
export const create = mutation({
  handler: async (ctx, args) => {
    - organizationId: args.organizationId,
    + groupId: args.groupId,
  }
});

// File 3: mutations/events.ts
// ... same pattern

// File 4: mutations/knowledge.ts
// ... same pattern
```

**Files to update (parallel):**
- `mutations/entities.ts` (Infer 11)
- `mutations/connections.ts` (Infer 12)
- `mutations/events.ts` (Infer 13)
- `mutations/knowledge.ts` (Infer 14)
- `mutations/groups.ts` (new file) (Infer 15)

**Pattern:** Simple find/replace: `organizationId` → `groupId`

**Dependencies:** Schema update (Track 0)
**Duration:** 5 inferences (parallel) = 1 inference elapsed

---

### Parallel Track 2: Backend Queries (Run in Parallel)

**All queries can be updated simultaneously** after schema is ready.

```typescript
// Each query file is independent - update in parallel!

// File 1: queries/entities.ts
export const list = query({
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entities")
      - .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      + .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
  }
});

// File 2: queries/connections.ts
// ... same pattern (parallel!)

// File 3: queries/events.ts
// ... same pattern (parallel!)
```

**Files to update (parallel):**
- `queries/entities.ts` (Infer 16)
- `queries/connections.ts` (Infer 17)
- `queries/events.ts` (Infer 18)
- `queries/knowledge.ts` (Infer 19)
- `queries/groups.ts` (new file with hierarchy queries) (Infer 20)

**New hierarchical queries:**
```typescript
// queries/groups.ts (NEW)
export const getSubgroups = query({
  args: { parentGroupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_parent", (q) => q.eq("parentGroupId", args.parentGroupId))
      .collect();
  }
});

export const getGroupHierarchy = query({
  args: { rootGroupId: v.id("groups") },
  handler: async (ctx, args) => {
    // Recursive query to get all subgroups
    const allSubgroups = [];
    const queue = [args.rootGroupId];

    while (queue.length > 0) {
      const current = queue.shift();
      const subgroups = await ctx.db
        .query("groups")
        .withIndex("by_parent", (q) => q.eq("parentGroupId", current))
        .collect();

      allSubgroups.push(...subgroups);
      queue.push(...subgroups.map(g => g._id));
    }

    return allSubgroups;
  }
});
```

**Dependencies:** Schema update (Track 0)
**Duration:** 5 inferences (parallel) = 1 inference elapsed

---

### Parallel Track 3: Frontend Components (Run in Parallel)

**All components can be updated simultaneously** after backend is ready.

```typescript
// Each component is independent - update in parallel!

// Component 1: EntityList.tsx
export function EntityList() {
  - const entities = useQuery(api.queries.entities.list, { organizationId });
  + const entities = useQuery(api.queries.entities.list, { groupId });
}

// Component 2: ConnectionGraph.tsx (parallel!)
export function ConnectionGraph() {
  - const connections = useQuery(api.queries.connections.list, { organizationId });
  + const connections = useQuery(api.queries.connections.list, { groupId });
}

// Component 3: EventTimeline.tsx (parallel!)
// ... same pattern
```

**Files to update (parallel):**
- `src/components/features/EntityList.tsx` (Infer 21)
- `src/components/features/ConnectionGraph.tsx` (Infer 22)
- `src/components/features/EventTimeline.tsx` (Infer 23)
- `src/components/features/KnowledgeSearch.tsx` (Infer 24)
- All other components using `organizationId` (Infer 25-30)

**Dependencies:** Backend queries (Track 2)
**Duration:** 10 inferences (parallel) = 1 inference elapsed

---

### Parallel Track 4: Frontend Routes & UI (Sequential within track)

**New group-specific UI** (sequential within track, parallel with Track 5 & 6).

```typescript
// 1. Add /group/:slug routing (Infer 31)
// src/pages/group/[slug].astro
---
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const { slug } = Astro.params;
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

const group = await convex.query(api.queries.groups.getBySlug, { slug });

if (!group) {
  return Astro.redirect(`/group/${slug}/create`);
}
---

<Layout>
  <GroupPage group={group} />
</Layout>

// 2. Create group creation flow (Infer 32)
// src/pages/group/[slug]/create.astro

// 3. Create group hierarchy navigation (Infer 33)
// src/components/features/GroupHierarchy.tsx

// 4. Create group type selector (Infer 34)
// src/components/features/GroupTypeSelector.tsx
```

**Dependencies:** Backend queries (Track 2)
**Duration:** 4 inferences (sequential)

---

### Parallel Track 5: Documentation (Run in Parallel)

**All documentation updates are independent** - can run fully in parallel!

```bash
# Each doc file is independent - update in parallel!

# File 1: CLAUDE.md (Infer 41)
- 1. **Organizations** – Who owns what (multi-tenant isolation)
+ 1. **Groups** – Who owns what (multi-tenant isolation, hierarchical)

# File 2: README.md (Infer 42)
- const myStand = await createOrganization({ name: "Emma's Lemonade Stand" });
+ const myStand = await createGroup({ slug: "emmas-lemonade", name: "Emma's Lemonade Stand", type: "business" });

# File 3: one/knowledge/ontology.md (Infer 43)
# Version 2.0.0
- ## Dimension 1: Organizations
+ ## Dimension 1: Groups (with 6 types)

# Files 4-41: All other docs in one/ (Infer 44-81)
# Simple find/replace: "organizations" → "groups"
# Can be done completely in parallel!
```

**Files to update (all parallel):**
- `CLAUDE.md` (Infer 41)
- `README.md` (Infer 42)
- `one/knowledge/ontology.md` (Infer 43)
- All 41 files in `one/` directory (Infer 44-84)

**Pattern:** Global find/replace: `organizations` → `groups`, `organizationId` → `groupId`

**Dependencies:** None (can start immediately!)
**Duration:** 44 inferences (parallel) = 1 inference elapsed

---

### Parallel Track 6: Data Migration (Parallel with Track 5)

**Migration script** (can develop in parallel with docs).

```typescript
// migrations/orgsToGroups.ts (Infer 85)

import { mutation } from "./_generated/server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const migrateOrgsToGroups = mutation({
  handler: async (ctx) => {
    console.log("Starting migration: organizations → groups");

    // 1. Get all organizations
    const orgs = await ctx.db.query("organizations").collect();
    console.log(`Found ${orgs.length} organizations to migrate`);

    const mapping = new Map(); // orgId → groupId

    // 2. Create groups from organizations
    for (const org of orgs) {
      const groupId = await ctx.db.insert("groups", {
        slug: slugify(org.name),
        name: org.name,
        type: "organization", // Legacy type
        description: undefined,
        parentGroupId: undefined, // Top-level
        metadata: {},
        settings: {
          visibility: "private",
          joinPolicy: "invite_only",
          plan: org.plan,
          limits: org.limits
        },
        status: org.status === "active" ? "active" : "archived",
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      });

      mapping.set(org._id, groupId);
      console.log(`Migrated: ${org.name} → ${groupId}`);
    }

    // 3. Update entities
    const entities = await ctx.db.query("entities").collect();
    for (const entity of entities) {
      const groupId = mapping.get(entity.organizationId);
      if (groupId) {
        await ctx.db.patch(entity._id, {
          groupId,
          organizationId: undefined // Remove old field
        });
      }
    }
    console.log(`Updated ${entities.length} entities`);

    // 4. Update connections
    const connections = await ctx.db.query("connections").collect();
    for (const conn of connections) {
      const groupId = mapping.get(conn.organizationId);
      if (groupId) {
        await ctx.db.patch(conn._id, {
          groupId,
          organizationId: undefined
        });
      }
    }
    console.log(`Updated ${connections.length} connections`);

    // 5. Update events
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      const groupId = mapping.get(event.organizationId);
      if (groupId) {
        await ctx.db.patch(event._id, {
          groupId,
          organizationId: undefined
        });
      }
    }
    console.log(`Updated ${events.length} events`);

    // 6. Update knowledge
    const knowledge = await ctx.db.query("knowledge").collect();
    for (const k of knowledge) {
      const groupId = mapping.get(k.organizationId);
      if (groupId) {
        await ctx.db.patch(k._id, {
          groupId,
          organizationId: undefined
        });
      }
    }
    console.log(`Updated ${knowledge.length} knowledge entries`);

    console.log("Migration complete!");
    return {
      organizations: orgs.length,
      entities: entities.length,
      connections: connections.length,
      events: events.length,
      knowledge: knowledge.length
    };
  }
});
```

**Dependencies:** Schema update (Track 0)
**Duration:** 1 inference

---

## Execution Timeline (Inference-Based)

### Phase 1: Foundation (Sequential)

**Infer 0:** Update schema (Track 0) ← BLOCKS EVERYTHING

**Duration:** 1 inference

---

### Phase 2: Backend Updates (Parallel)

Run **Tracks 1 & 2** in parallel after schema is ready:

**Track 1:** Update mutations (Infer 11-15) - 5 parallel
**Track 2:** Update queries (Infer 16-20) - 5 parallel

**Duration:** 1 inference elapsed (10 inferences running in parallel)

---

### Phase 3: Frontend + Docs + Migration (Parallel)

Run **Tracks 3, 4, 5, 6** in parallel after backend is ready:

**Track 3:** Update components (Infer 21-30) - 10 parallel
**Track 4:** New group UI (Infer 31-34) - 4 sequential
**Track 5:** Update docs (Infer 41-84) - 44 parallel
**Track 6:** Migration script (Infer 85) - 1 parallel

**Duration:** 4 inferences elapsed (longest track is Track 4 with 4 sequential inferences)

---

### Phase 4: Testing (Parallel)

**Infer 86:** Test nested group queries
**Infer 87:** Test URL-based creation
**Infer 88:** Test data migration on dev
**Infer 89:** Integration tests
**Infer 90:** E2E tests

**Duration:** 1 inference elapsed (5 tests running in parallel)

---

### Phase 5: Deployment (Sequential)

**Infer 91:** Run migration on staging
**Infer 92:** Verify staging data
**Infer 93:** Deploy backend to production
**Infer 94:** Run migration on production
**Infer 95:** Deploy frontend to production
**Infer 96:** Verify production
**Infer 97:** Monitor for 24 hours
**Infer 98:** Archive old organizations table
**Infer 99:** Update external docs
**Infer 100:** Announce migration complete

**Duration:** 10 inferences (sequential for safety)

---

## Total Duration: ~17 Inferences (Instead of 100!)

**Traditional sequential approach:** 100 inferences (if each step was sequential)

**Parallel approach:**
- Phase 1: 1 inference (schema)
- Phase 2: 1 inference (backend parallel)
- Phase 3: 4 inferences (frontend + docs + migration parallel)
- Phase 4: 1 inference (testing parallel)
- Phase 5: 10 inferences (deployment sequential)
- **Total: 17 inferences**

**Speed increase: 5.9x faster** (100 → 17 inferences)

---

## Parallelization Strategy

### Rule 1: Dependencies First

Schema must complete before anything else. This is the foundation.

### Rule 2: Independent Files = Parallel

- All mutation files can update in parallel (no dependencies between them)
- All query files can update in parallel
- All component files can update in parallel
- All doc files can update in parallel

### Rule 3: Use Multiple Agents

```typescript
// Launch 5 backend mutation agents in parallel
await Promise.all([
  agent1.update("mutations/entities.ts"),
  agent2.update("mutations/connections.ts"),
  agent3.update("mutations/events.ts"),
  agent4.update("mutations/knowledge.ts"),
  agent5.create("mutations/groups.ts")
]);

// Launch 5 backend query agents in parallel
await Promise.all([
  agent1.update("queries/entities.ts"),
  agent2.update("queries/connections.ts"),
  agent3.update("queries/events.ts"),
  agent4.update("queries/knowledge.ts"),
  agent5.create("queries/groups.ts")
]);

// Launch 44 documentation agents in parallel (!)
const docAgents = docFiles.map(file =>
  agent.update(file, { replace: "organizations → groups" })
);
await Promise.all(docAgents);
```

### Rule 4: Monitor Progress

```typescript
// Track parallel execution
const progress = {
  phase: "Backend Updates",
  tracks: {
    mutations: "5/5 complete",
    queries: "5/5 complete"
  },
  elapsed: "1 inference",
  remaining: "16 inferences"
};
```

---

## Risk Mitigation

### Risk 1: Breaking Changes

**Mitigation:** Create backward-compatible wrapper for 1 version:

```typescript
// Temporary: Support both organizationId and groupId
export const create = mutation({
  args: {
    organizationId: v.optional(v.id("organizations")), // Deprecated
    groupId: v.optional(v.id("groups")),
    // ... other args
  },
  handler: async (ctx, args) => {
    const actualGroupId = args.groupId || args.organizationId; // Fallback
    // ... rest of implementation
  }
});
```

### Risk 2: Data Loss During Migration

**Mitigation:**
1. Backup database before migration
2. Test migration on staging first
3. Verify data counts match (orgs → groups)
4. Keep organizations table for 1 week after migration

### Risk 3: Frontend Breaks Before Backend Ready

**Mitigation:**
1. Deploy backend changes first
2. Keep old organizationId field for 1 version
3. Deploy frontend after backend is stable
4. Use feature flags for new group features

### Risk 4: Parallel Agents Conflict

**Mitigation:**
1. Each agent works on separate files (no conflicts)
2. Use git branches per track
3. Merge tracks sequentially: backend → frontend → docs
4. Run tests after each track merge

---

## Example: Parallel Execution in Practice

### Scenario: Update All Backend Mutations

**Sequential (old way):**
```bash
Infer 11: Update mutations/entities.ts      (10 min)
Infer 12: Update mutations/connections.ts   (10 min)
Infer 13: Update mutations/events.ts        (10 min)
Infer 14: Update mutations/knowledge.ts     (10 min)
Infer 15: Create mutations/groups.ts        (15 min)
Total: 55 minutes
```

**Parallel (new way):**
```bash
# Launch 5 agents simultaneously
Infer 11-15: [All 5 agents working in parallel]
  - Agent 1: mutations/entities.ts      (10 min)
  - Agent 2: mutations/connections.ts   (10 min)
  - Agent 3: mutations/events.ts        (10 min)
  - Agent 4: mutations/knowledge.ts     (10 min)
  - Agent 5: mutations/groups.ts        (15 min) ← longest
Total: 15 minutes (limited by slowest agent)
```

**Speed increase:** 55 min → 15 min = **3.7x faster**

---

## Validation Checklist

After each parallel track completes:

**Track 1 (Mutations):**
- [ ] All mutations compile without errors
- [ ] organizationId references removed
- [ ] groupId added to all mutations
- [ ] Events logged with groupId

**Track 2 (Queries):**
- [ ] All queries compile without errors
- [ ] organizationId references removed
- [ ] groupId used in all indexes
- [ ] Hierarchical queries work

**Track 3 (Components):**
- [ ] All components compile without errors
- [ ] useQuery calls use groupId
- [ ] UI displays group terminology
- [ ] No organizationId in props

**Track 4 (Routes):**
- [ ] /group/:slug route works
- [ ] Group creation flow works
- [ ] Group hierarchy navigation works
- [ ] URL-based join works

**Track 5 (Docs):**
- [ ] All 41 files updated
- [ ] No "organizations" references
- [ ] Examples use "groups"
- [ ] Version updated to 2.0.0

**Track 6 (Migration):**
- [ ] Migration script tested on dev
- [ ] All data migrated correctly
- [ ] Counts match (orgs = groups)
- [ ] Old data archived

---

## Summary

**The Big Idea:** Organizations don't disappear—they become a **type** of group.

**The Architecture:** 6 group types (friend_circle, business, community, dao, government, organization) with hierarchical nesting.

**The Strategy:** Maximize parallelization after schema update. Instead of 100 sequential inferences, we execute ~17 inferences with massive parallelization.

**The Result:**
- 5.9x faster execution (100 → 17 inferences)
- Same multi-tenancy guarantees
- Hierarchical groups enabled
- URL-based creation unlocked
- Universal applicability achieved

**Organizations → Groups = Clarity + Scale + Speed**

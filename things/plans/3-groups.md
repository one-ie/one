# 3. Groups - Organizations ARE Groups

**Key Insight:** Organizations don't disappear. They become a **type** of group.

---

## The Concept

```typescript
// Organizations are just one type of group
type GroupType =
  | "friend_circle"   // Emma's Friends
  | "business"        // Startup Inc
  | "community"       // Crypto Enthusiasts
  | "dao"             // CoolDAO
  | "government"      // City Council
  | "organization";   // ← Legacy "organizations" = group type
```

**Everything that was an "organization" becomes a group with `type: "organization"`.**

Multi-tenancy preserved. Data isolation identical. Just more flexible.

---

## Schema Evolution

### Before (4 tables scoped to organizations)

```typescript
organizations: defineTable({ name, plan, limits, status })
entities: defineTable({ organizationId, type, name, properties })
connections: defineTable({ organizationId, fromId, toId, type })
events: defineTable({ organizationId, type, actorId, targetId })
knowledge: defineTable({ organizationId, type, text, embedding })
```

### After (5 tables scoped to groups)

```typescript
groups: defineTable({
  slug,                    // NEW: URL identifier
  name,
  type,                    // NEW: 6 types (including "organization")
  parentGroupId,           // NEW: Hierarchical nesting!
  description,
  metadata,
  settings: {
    visibility,            // NEW: public/private
    joinPolicy,            // NEW: open/invite/approval
    plan,                  // Same as before
    limits                 // Same as before
  },
  status
})

entities: defineTable({ groupId, type, name, properties })      // organizationId → groupId
connections: defineTable({ groupId, fromId, toId, type })       // organizationId → groupId
events: defineTable({ groupId, type, actorId, targetId })       // organizationId → groupId
knowledge: defineTable({ groupId, type, text, embedding })      // organizationId → groupId
```

**Key changes:**
1. `organizations` → `groups` (new table with 6 types)
2. `organizationId` → `groupId` (everywhere)
3. Add `parentGroupId` (enables nesting)
4. Add `slug` (enables URL-based creation)
5. Add type-specific settings

---

## Parallel Execution Strategy

### Phase 0: Schema (Sequential - Must Complete First)

**1 inference** - Schema update blocks everything else.

```bash
✅ Update backend/convex/schema.ts
  - Add groups table
  - Add groupId to entities, connections, events, knowledge
  - Add indexes: by_group, group_type, by_slug, by_parent
```

**Duration:** 1 inference
**Blocks:** All other work

---

### Phase 1: Backend (Parallel After Schema)

Run all backend updates **simultaneously** - no dependencies between files.

#### Track A: Mutations (5 agents in parallel)

```bash
Agent 1: mutations/entities.ts      (organizationId → groupId)
Agent 2: mutations/connections.ts   (organizationId → groupId)
Agent 3: mutations/events.ts        (organizationId → groupId)
Agent 4: mutations/knowledge.ts     (organizationId → groupId)
Agent 5: mutations/groups.ts        (NEW: create, update, archive)
```

**Duration:** 1 inference elapsed (5 running in parallel)

#### Track B: Queries (5 agents in parallel)

```bash
Agent 1: queries/entities.ts      (organizationId → groupId)
Agent 2: queries/connections.ts   (organizationId → groupId)
Agent 3: queries/events.ts        (organizationId → groupId)
Agent 4: queries/knowledge.ts     (organizationId → groupId)
Agent 5: queries/groups.ts        (NEW: getBySlug, getSubgroups, getHierarchy)
```

**Duration:** 1 inference elapsed (5 running in parallel)

**Total Phase 1:** 1 inference (both tracks run simultaneously)

---

### Phase 2: Frontend (Parallel After Backend)

Run all frontend updates **simultaneously** - components are independent.

#### Track C: Components (10+ agents in parallel)

```bash
Agent 1:  src/components/features/EntityList.tsx
Agent 2:  src/components/features/ConnectionGraph.tsx
Agent 3:  src/components/features/EventTimeline.tsx
Agent 4:  src/components/features/KnowledgeSearch.tsx
Agent 5:  src/components/ui/OrgSelector.tsx → GroupSelector.tsx
Agent 6-10: All other components using organizationId
```

**Pattern:** Simple find/replace in each file:
```typescript
- const data = useQuery(api.queries.entities.list, { organizationId });
+ const data = useQuery(api.queries.entities.list, { groupId });
```

**Duration:** 1 inference elapsed (all components in parallel)

#### Track D: Routes (4 inferences sequential, runs parallel with Track C)

```bash
Infer 1: src/pages/group/[slug].astro         (URL-based routing)
Infer 2: src/pages/group/[slug]/create.astro  (Creation flow)
Infer 3: src/components/GroupHierarchy.tsx    (Nested navigation)
Infer 4: src/components/GroupTypeSelector.tsx (Type picker UI)
```

**Duration:** 4 inferences (sequential within track)

**Total Phase 2:** 4 inferences (Track C + Track D run in parallel)

---

### Phase 3: Documentation (Parallel - Can Start Immediately!)

Documentation has **no dependencies** - can update any time.

#### Track E: Core Docs (3 agents in parallel)

```bash
Agent 1: CLAUDE.md           (organizations → groups, Version 2.0.0)
Agent 2: README.md           (update examples with groups)
Agent 3: one/knowledge/ontology.md (Dimension 1: Groups)
```

#### Track F: All Other Docs (41 agents in parallel!)

```bash
# Global find/replace in all one/ files:
# "organizations" → "groups"
# "organizationId" → "groupId"

Agent 4-44: Update all 41 files in one/ directory
```

**Pattern:** Automated find/replace, then human review.

**Duration:** 1 inference elapsed (all docs in parallel)

---

### Phase 4: Data Migration (Parallel with Phase 3)

Migration script can be developed while docs update.

```typescript
// migrations/orgsToGroups.ts
export const migrate = mutation({
  handler: async (ctx) => {
    // 1. Get all organizations
    const orgs = await ctx.db.query("organizations").collect();

    // 2. Create groups (type: "organization")
    for (const org of orgs) {
      const groupId = await ctx.db.insert("groups", {
        slug: slugify(org.name),
        name: org.name,
        type: "organization",  // Legacy type
        parentGroupId: undefined,
        description: undefined,
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

      // 3. Update all entities, connections, events, knowledge
      // Replace organizationId with groupId
    }

    return { migrated: orgs.length };
  }
});
```

**Duration:** 1 inference

---

## Timeline Summary

| Phase | What | Duration | Parallel? |
|-------|------|----------|-----------|
| 0 | Schema update | 1 inference | No (blocks all) |
| 1 | Backend (mutations + queries) | 1 inference | Yes (10 agents) |
| 2 | Frontend (components + routes) | 4 inferences | Partial (components parallel) |
| 3 | Documentation | 1 inference | Yes (44 agents) |
| 4 | Migration script | 1 inference | Yes (with Phase 3) |

**Total: ~7 inferences** (vs 100+ if sequential)

**Speed increase: 14x faster**

---

## Hierarchical Groups (New Capability)

Once groups are live, you can nest them:

### Example 1: Company with Teams

```typescript
// Parent: Acme Corporation
const acme = await createGroup({
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "business"
});

// Child: Engineering team
const engineering = await createGroup({
  slug: "acme-corp-engineering",
  name: "Engineering",
  type: "business",
  parentGroupId: acme._id  // ← Nested!
});

// Grandchild: Backend team
const backend = await createGroup({
  slug: "acme-corp-engineering-backend",
  name: "Backend Team",
  type: "business",
  parentGroupId: engineering._id  // ← Deeply nested!
});
```

### Example 2: DAO with Committees

```typescript
// Parent: Main DAO
const dao = await createGroup({
  slug: "cooldao",
  name: "Cool DAO",
  type: "dao"
});

// Children: Specialized committees
const treasury = await createGroup({
  slug: "cooldao-treasury",
  name: "Treasury Multisig",
  type: "dao",
  parentGroupId: dao._id
});

const governance = await createGroup({
  slug: "cooldao-governance",
  name: "Governance Committee",
  type: "dao",
  parentGroupId: dao._id
});
```

**Query hierarchy:**
```typescript
// Get all subgroups recursively
const allSubgroups = await getGroupHierarchy({ rootGroupId: dao._id });

// Get all entities across hierarchy
const allEntities = await getEntitiesInHierarchy({ rootGroupId: dao._id });
```

---

## URL-Based Creation (New Capability)

Users can create groups just by visiting a URL:

### Flow

1. **User visits:** `one.ie/group/my-cool-dao`
2. **Check if exists:** Query by slug
3. **If not exists:** Show creation flow with slug pre-filled
4. **User confirms:** Select type, add description, choose settings
5. **Group created:** User becomes `org_owner`, redirected to group page
6. **Share URL:** "Join my DAO at one.ie/group/my-cool-dao"

### Implementation

```typescript
// src/pages/group/[slug].astro
const { slug } = Astro.params;
const group = await convex.query(api.queries.groups.getBySlug, { slug });

if (!group) {
  // Doesn't exist - redirect to creation
  return Astro.redirect(`/group/${slug}/create`);
}

// Exists - show group page
return <GroupPage group={group} />;
```

---

## Migration Path: Zero Downtime

### Strategy

1. **Deploy schema changes** (adds groups table, keeps organizations temporarily)
2. **Deploy backend updates** (new code uses groupId, old code still works)
3. **Run migration script** (creates groups from organizations)
4. **Deploy frontend updates** (UI switches to groups terminology)
5. **Monitor for 7 days** (keep organizations table as backup)
6. **Archive organizations table** (after verification)

### Backward Compatibility (1 version)

```typescript
// Support both organizationId and groupId temporarily
export const create = mutation({
  args: {
    organizationId: v.optional(v.id("organizations")), // Deprecated
    groupId: v.optional(v.id("groups")),
    // ... other args
  },
  handler: async (ctx, args) => {
    // Use groupId if provided, fallback to organizationId
    const actualGroupId = args.groupId || args.organizationId;
    // ... rest of implementation
  }
});
```

Remove backward compatibility in next major version.

---

## Key Differences: Organizations vs Groups

| Aspect | Organizations | Groups |
|--------|---------------|--------|
| **Scope** | Business-oriented | Universal (friends, DAOs, communities, etc.) |
| **Nesting** | Flat (no hierarchy) | Hierarchical (groups within groups) |
| **Creation** | Manual only | URL-based + manual |
| **Types** | One type | 6 types (friend_circle, business, community, dao, government, organization) |
| **Visibility** | Always private | Public or private |
| **Join Policy** | Always invite-only | Open, invite-only, or approval-required |
| **URL** | `/org/:id` | `/group/:slug` |
| **Multi-tenancy** | Perfect isolation | Perfect isolation (same guarantee) |

---

## Examples: Before & After

### Before (Organizations)

```typescript
// Emma's Lemonade Stand
const myStand = await createOrganization({
  name: "Emma's Lemonade Stand",
  plan: "starter"
});

const lemonade = await createThing({
  type: "product",
  name: "Fresh Lemonade",
  organizationId: myStand._id
});
```

### After (Groups)

```typescript
// Emma's Lemonade Stand (same functionality, more flexible)
const myStand = await createGroup({
  slug: "emmas-lemonade",
  name: "Emma's Lemonade Stand",
  type: "business",
  settings: {
    visibility: "public",  // NEW: Can be discovered
    joinPolicy: "open"     // NEW: Anyone can join
  }
});

const lemonade = await createThing({
  type: "product",
  name: "Fresh Lemonade",
  groupId: myStand._id  // organizationId → groupId
});

// NEW: Emma can now create subgroups
const summerPromo = await createGroup({
  slug: "emmas-lemonade-summer-2025",
  name: "Summer 2025 Promotion",
  type: "business",
  parentGroupId: myStand._id  // Nested under main business!
});
```

---

## Validation: Multi-Tenancy Preserved

**Critical:** Groups maintain identical multi-tenant isolation as organizations.

### Before (Organizations)

```typescript
// All data scoped to organizationId
const myEntities = await ctx.db
  .query("entities")
  .withIndex("by_org", (q) => q.eq("organizationId", myOrg))
  .collect();

// Perfect isolation - can't see other orgs' data
```

### After (Groups)

```typescript
// All data scoped to groupId (same isolation!)
const myEntities = await ctx.db
  .query("entities")
  .withIndex("by_group", (q) => q.eq("groupId", myGroup))
  .collect();

// Perfect isolation - can't see other groups' data
```

**Plus hierarchical queries (new!):**

```typescript
// Get entities across group hierarchy
const allEntities = await getEntitiesInHierarchy({
  rootGroupId: myGroup
});
// Returns: myGroup entities + all subgroup entities
```

---

## Summary

**The Big Idea:** Organizations → Groups = Same multi-tenancy + Hierarchical nesting + URL-based creation + Universal applicability

**The Change:**
- Table: `organizations` → `groups` (with 6 types)
- Field: `organizationId` → `groupId` (everywhere)
- New fields: `slug`, `type`, `parentGroupId`, `settings`

**The Strategy:** Maximize parallelization (7 inferences vs 100+)

**The Result:**
- ✅ Multi-tenancy preserved (same isolation guarantees)
- ✅ Hierarchical groups enabled (teams, committees, subgroups)
- ✅ URL-based creation unlocked (viral growth)
- ✅ Universal applicability (friends, businesses, DAOs, communities, governments)
- ✅ Backward compatible (organizations become group type)

**Organizations don't disappear. They evolve into groups.**

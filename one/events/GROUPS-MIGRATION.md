# Organizations → Groups Migration Plan

**Version:** 2.0.0
**Status:** Architecture Planning
**Impact:** Breaking change to Dimension 1 of the 6-dimension ontology

---

## Executive Summary

We are evolving **Dimension 1** from `organizations` to `groups` to enable:

1. **Universal scope** – Friends, businesses, communities, DAOs, governments (not just "organizations")
2. **Hierarchical nesting** – Groups can contain groups (teams within companies, sub-DAOs, committees)
3. **URL-based creation** – `one.ie/group/slug` creates or joins a group
4. **Same multi-tenancy guarantees** – Perfect data isolation preserved

---

## The New 6-Dimension Ontology

**Before:**
1. Organizations → People → Things → Connections → Events → Knowledge

**After:**
1. **Groups** → People → Things → Connections → Events → Knowledge

**Key Insight:** "Organizations" was too limiting. Groups are the universal container:
- Your friend circle is a group
- Your company is a group
- Your DAO is a group
- Your community is a group
- Your government is a group

---

## Architecture Changes

### Schema Evolution

```typescript
// BEFORE: organizations table
organizations: defineTable({
  name: v.string(),
  plan: v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
  limits: v.object({
    users: v.number(),
    storage: v.number(),
    apiCalls: v.number()
  }),
  status: v.union(v.literal("active"), v.literal("trial"), v.literal("suspended")),
  createdAt: v.number(),
  updatedAt: v.number()
})
  .index("by_status", ["status"])

// AFTER: groups table
groups: defineTable({
  slug: v.string(),                    // NEW: URL-friendly identifier
  name: v.string(),
  type: v.union(                       // NEW: Group types
    v.literal("friend_circle"),
    v.literal("business"),
    v.literal("community"),
    v.literal("dao"),
    v.literal("government"),
    v.literal("organization")          // Legacy support
  ),
  parentGroupId: v.optional(v.id("groups")), // NEW: Enables nesting!
  description: v.optional(v.string()), // NEW: Rich description
  metadata: v.any(),                   // NEW: Flexible properties
  settings: v.object({                 // NEW: Group settings
    visibility: v.union(v.literal("public"), v.literal("private")),
    joinPolicy: v.union(
      v.literal("open"),
      v.literal("invite_only"),
      v.literal("approval_required")
    ),
    plan: v.optional(v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise"))),
    limits: v.optional(v.object({
      users: v.number(),
      storage: v.number(),
      apiCalls: v.number()
    }))
  }),
  status: v.union(v.literal("active"), v.literal("archived")),
  createdAt: v.number(),
  updatedAt: v.number()
})
  .index("by_slug", ["slug"])          // NEW: URL routing
  .index("by_type", ["type"])          // NEW: Group type queries
  .index("by_parent", ["parentGroupId"]) // NEW: Hierarchy queries
  .index("by_status", ["status"])
```

### Multi-Tenancy Preserved

**Critical:** Groups maintain the same multi-tenant isolation guarantees as organizations.

**Before:**
```typescript
// All data scoped to organizationId
const myData = await ctx.db
  .query("entities")
  .withIndex("by_org", (q) => q.eq("organizationId", orgId))
  .collect();
```

**After:**
```typescript
// All data scoped to groupId (same isolation!)
const myData = await ctx.db
  .query("entities")
  .withIndex("by_group", (q) => q.eq("groupId", groupId))
  .collect();
```

**Hierarchical Queries (NEW):**
```typescript
// Get all subgroups of a parent group
const subgroups = await ctx.db
  .query("groups")
  .withIndex("by_parent", (q) => q.eq("parentGroupId", parentGroupId))
  .collect();

// Get all entities across group hierarchy (recursive)
async function getEntitiesInHierarchy(ctx, rootGroupId) {
  const groups = await getAllSubgroups(ctx, rootGroupId); // Recursive
  const groupIds = [rootGroupId, ...groups.map(g => g._id)];

  return await ctx.db
    .query("entities")
    .filter((q) => groupIds.some(id => q.eq(q.field("groupId"), id)))
    .collect();
}
```

---

## URL-Based Group Creation

### URL Patterns

| URL | Creates | Type |
|-----|---------|------|
| `one.ie/group/friends` | Friends group | friend_circle |
| `one.ie/group/acme-corp` | Acme Corp | business |
| `one.ie/group/mycommunity` | My Community | community |
| `one.ie/group/cooldao` | Cool DAO | dao |
| `one.ie/group/dublin-city` | Dublin City | government |
| `one.ie/@username` | Personal group | organization |

### URL Flow

```typescript
// 1. User visits one.ie/group/my-cool-dao
// 2. Frontend checks if group exists
const group = await ctx.db
  .query("groups")
  .withIndex("by_slug", (q) => q.eq("slug", "my-cool-dao"))
  .first();

// 3a. If exists → Show group page
if (group) {
  return <GroupPage group={group} />;
}

// 3b. If not exists → Show creation flow
return <CreateGroupFlow slug="my-cool-dao" />;
```

### Creation Flow

```typescript
// When user creates from URL
const newGroup = await ctx.db.insert("groups", {
  slug: "my-cool-dao",
  name: "My Cool DAO", // User provides
  type: "dao",         // User selects
  description: "A DAO for cool people doing cool things",
  metadata: {},
  settings: {
    visibility: "public",
    joinPolicy: "approval_required",
    plan: "starter"
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Creator automatically becomes org_owner
const creator = await ctx.db.insert("entities", {
  type: "creator",
  name: user.name,
  groupId: newGroup,
  properties: {
    role: "org_owner",
    userId: user._id
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Log creation event
await ctx.db.insert("events", {
  type: "group_created",
  actorId: creator,
  targetId: newGroup,
  groupId: newGroup,
  timestamp: Date.now(),
  metadata: {
    source: "url",
    slug: "my-cool-dao"
  }
});
```

---

## Hierarchical Groups (Nested)

### Example: Company with Teams

```typescript
// 1. Create parent company
const acmeCorp = await createGroup({
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "business",
  settings: {
    visibility: "public",
    joinPolicy: "invite_only",
    plan: "enterprise"
  }
});

// 2. Create subgroup: Engineering team
const engineering = await createGroup({
  slug: "acme-corp-engineering",
  name: "Engineering",
  type: "business",
  parentGroupId: acmeCorp._id, // Nested!
  settings: {
    visibility: "private",
    joinPolicy: "invite_only"
  }
});

// 3. Create subgroup: Backend team (nested within Engineering)
const backend = await createGroup({
  slug: "acme-corp-engineering-backend",
  name: "Backend Team",
  type: "business",
  parentGroupId: engineering._id, // Deeply nested!
  settings: {
    visibility: "private",
    joinPolicy: "invite_only"
  }
});
```

### Example: DAO with Committees

```typescript
// 1. Main DAO
const dao = await createGroup({
  slug: "cooldao",
  name: "Cool DAO",
  type: "dao",
  settings: { visibility: "public", joinPolicy: "open" }
});

// 2. Treasury multisig (subgroup)
const treasury = await createGroup({
  slug: "cooldao-treasury",
  name: "Treasury Multisig",
  type: "dao",
  parentGroupId: dao._id,
  settings: { visibility: "private", joinPolicy: "invite_only" }
});

// 3. Governance committee (subgroup)
const governance = await createGroup({
  slug: "cooldao-governance",
  name: "Governance Committee",
  type: "dao",
  parentGroupId: dao._id,
  settings: { visibility: "public", joinPolicy: "approval_required" }
});
```

---

## Migration Path

### Phase 1: Schema Changes (Backend)

**Files to update:**
- `backend/convex/schema.ts` – Rename table, add fields
- All mutations in `backend/convex/mutations/` – Change `organizationId` → `groupId`
- All queries in `backend/convex/queries/` – Change `organizationId` → `groupId`
- `backend/convex/auth.ts` – Update org references

**Field mapping:**
```typescript
// Direct renames
organizationId → groupId
orgId → groupId

// New fields (with defaults for existing data)
slug: slugify(name)                  // Generate from name
type: "organization"                 // Legacy type
parentGroupId: undefined             // Top-level groups
description: undefined               // Optional
metadata: {}                         // Empty object
settings: {                          // Migrate from existing fields
  visibility: "private",
  joinPolicy: "invite_only",
  plan: plan,                        // Existing plan field
  limits: limits                     // Existing limits field
}
```

### Phase 2: Documentation Updates

**41 files in `one/` directory:**
- Global search/replace: "organizations" → "groups"
- Update `one/knowledge/ontology.md` to Version 2.0.0
- Update `CLAUDE.md` with new architecture
- Update `README.md` with groups examples

### Phase 3: Frontend Updates

**Files to update:**
- All components using `organizationId`
- URL routing: Add `/group/:slug` routes
- Group creation flow
- Group discovery/join UI

### Phase 4: Data Migration Script

```typescript
// migration.ts
import { mutation } from "./_generated/server";

export const migrateOrgsToGroups = mutation({
  handler: async (ctx) => {
    // 1. Get all organizations
    const orgs = await ctx.db.query("organizations").collect();

    // 2. For each org, create a group
    for (const org of orgs) {
      const groupId = await ctx.db.insert("groups", {
        slug: slugify(org.name),
        name: org.name,
        type: "organization", // Legacy type
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

      // 3. Update all entities pointing to this org
      const entities = await ctx.db
        .query("entities")
        .withIndex("by_org", (q) => q.eq("organizationId", org._id))
        .collect();

      for (const entity of entities) {
        await ctx.db.patch(entity._id, { groupId });
      }

      // 4. Update connections, events, knowledge similarly
      // ... (repeat for other tables)
    }

    // 5. Delete old organizations table (after verification)
    // await ctx.db.system.deleteTable("organizations");

    return { migrated: orgs.length };
  }
});
```

---

## Examples with New Groups Architecture

### Example 1: Friend Circle

```typescript
// Emma creates a friend circle from URL
// Visits: one.ie/group/emmas-friends

const friendCircle = await createGroup({
  slug: "emmas-friends",
  name: "Emma's Friends",
  type: "friend_circle",
  description: "My close friends from school",
  settings: {
    visibility: "private",
    joinPolicy: "invite_only"
  }
});

// Emma plans a birthday party (subgroup)
const birthdayParty = await createGroup({
  slug: "emmas-friends-birthday-2025",
  name: "Emma's Birthday Party 2025",
  type: "friend_circle",
  parentGroupId: friendCircle._id,
  settings: {
    visibility: "private",
    joinPolicy: "invite_only"
  }
});

// Create party details (thing)
const party = await createThing({
  type: "event",
  name: "Emma's 25th Birthday",
  groupId: birthdayParty._id, // Scoped to subgroup
  properties: {
    date: "2025-06-15",
    location: "The Cool Venue",
    attendees: 30
  }
});
```

### Example 2: Lemonade Stand (Unchanged!)

```typescript
// Emma's Lemonade Stand still works!
const myStand = await createGroup({
  slug: "emmas-lemonade",
  name: "Emma's Lemonade Stand",
  type: "business",
  settings: {
    visibility: "public",
    joinPolicy: "open"
  }
});

// Everything else stays the same
const me = await createPerson({ role: "org_owner", groupId: myStand._id });
const lemonade = await createThing({ type: "product", groupId: myStand._id });
// ... etc
```

### Example 3: Enterprise (Enhanced with Hierarchy!)

```typescript
// Acme Corporation with departments
const acmeCorp = await createGroup({
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "business",
  settings: {
    visibility: "public",
    joinPolicy: "invite_only",
    plan: "enterprise",
    limits: { users: 100, storage: 1000, apiCalls: 1000000 }
  }
});

// Engineering department (subgroup)
const engineering = await createGroup({
  slug: "acme-corp-engineering",
  name: "Engineering",
  type: "business",
  parentGroupId: acmeCorp._id,
  settings: { visibility: "private", joinPolicy: "invite_only" }
});

// Backend team within Engineering (deeply nested!)
const backend = await createGroup({
  slug: "acme-corp-engineering-backend",
  name: "Backend Team",
  type: "business",
  parentGroupId: engineering._id,
  settings: { visibility: "private", joinPolicy: "invite_only" }
});

// All data is scoped correctly
const backendProject = await createThing({
  type: "project",
  name: "API Rewrite",
  groupId: backend._id, // Scoped to Backend team
  properties: { status: "in_progress", deadline: "2025-12-31" }
});

// Can query across hierarchy
const allAcmeProjects = await getEntitiesInHierarchy(acmeCorp._id);
// Returns projects from all subgroups
```

---

## Impact Analysis

### Breaking Changes

1. **Database schema**: `organizations` table → `groups` table
2. **Field names**: `organizationId` → `groupId` everywhere
3. **API endpoints**: `/api/organizations/*` → `/api/groups/*`
4. **Documentation**: 41 files need terminology updates

### Non-Breaking Changes

1. **Multi-tenancy guarantees**: Identical isolation (no behavior change)
2. **Existing patterns**: Same CRUD operations, just renamed
3. **API structure**: Same mutation/query patterns

### New Capabilities

1. **Hierarchical groups**: Groups within groups (recursively)
2. **URL-based creation**: `one.ie/group/slug` instantly creates or joins
3. **Universal types**: Friend circles, DAOs, communities (not just "organizations")
4. **Flexible settings**: Per-group visibility and join policies

---

## Timeline (Inference-Based)

**Infer 1-10: Foundation & Planning**
- ✅ Infer 1: Map ontology changes (organizations → groups)
- ✅ Infer 2: Design nested groups schema
- ✅ Infer 3: Design URL → group creation flow
- Current: Complete architecture document

**Infer 11-30: Backend Migration**
- Infer 11: Update `backend/convex/schema.ts`
- Infer 12: Add hierarchical group queries
- Infer 13-20: Update all mutations (orgId → groupId)
- Infer 21-28: Update all queries (orgId → groupId)
- Infer 29: Create data migration script
- Infer 30: Test migration on dev data

**Infer 31-50: Frontend Updates**
- Infer 31-35: Update components (organizationId → groupId)
- Infer 36-40: Implement `/group/:slug` routing
- Infer 41-45: Build group creation flow UI
- Infer 46-50: Build group hierarchy navigation

**Infer 51-70: Documentation**
- Infer 51-65: Update 41 files in `one/` directory
- Infer 66: Update `CLAUDE.md`
- Infer 67: Update `README.md`
- Infer 68: Update `AGENTS.md`
- Infer 69-70: Create migration guide

**Infer 71-90: Testing & Quality**
- Infer 71-80: Write tests for nested groups
- Infer 81-85: Test URL-based creation
- Infer 86-90: Integration tests

**Infer 91-100: Deployment**
- Infer 91-95: Run migration on staging
- Infer 96-98: Deploy backend
- Infer 99: Deploy frontend
- Infer 100: Verify production migration

---

## Vision → Reality Mapping

**Vision:** "Groups can be started from a URL"

**Reality:**
1. User visits `one.ie/group/my-cool-dao`
2. Backend checks if `slug === "my-cool-dao"` exists
3. If not, show creation flow with slug pre-filled
4. User fills name, type, description, settings
5. Click "Create" → Group created, user becomes `org_owner`
6. Redirect to `one.ie/group/my-cool-dao` (now live!)
7. User can invite others via URL: "Just visit one.ie/group/my-cool-dao"

**Vision:** "Groups can have groups"

**Reality:**
1. Parent group exists: `acme-corp`
2. Create subgroup with `parentGroupId: acme-corp._id`
3. Subgroup inherits permissions (can override)
4. Data scoped to subgroup: `groupId: engineering._id`
5. Hierarchical queries: "Get all things in Acme Corp and subgroups"
6. Visual hierarchy in UI: Acme Corp > Engineering > Backend Team

**Vision:** "Friends, businesses, communities, DAOs, governments"

**Reality:**
1. `type` field: `"friend_circle" | "business" | "community" | "dao" | "government"`
2. Each type has default settings (friend_circle → private, dao → public)
3. UI shows appropriate icons and terminology per type
4. Discoverability: Filter groups by type (`/explore/daos`, `/explore/communities`)
5. Different join flows per type (DAOs might use token-gating)

---

## Next Steps

1. **Complete this architecture document** ✅
2. **Update `backend/convex/schema.ts`** (Infer 4)
3. **Create hierarchical query patterns** (Infer 5)
4. **Update first mutation as example** (Infer 6)
5. **Create migration script** (Infer 7)

---

**This migration unlocks:**
- Universal applicability (beyond just "organizations")
- Hierarchical structures (teams, committees, subgroups)
- URL-based viral growth (share a link, create a group)
- Clearer mental model (groups > organizations)

**Multi-tenancy preserved. Clarity enhanced. Scale infinite.**

# Plan Synchronization Checklist

**Version:** 1.0.0
**Created:** 2025-10-24
**Purpose:** Ensure all planning documents stay in sync with the 6-dimension ontology and unified architecture

---

## Core Principles (Source of Truth)

All planning documents MUST align with these principles from `one/knowledge/ontology.md`:

### 1. The 6-Dimension Ontology

**ALWAYS use these terms:**

```
1. GROUPS     (not "organizations", not "orgs")
2. PEOPLE     (authorization & governance)
3. THINGS     (66 entity types)
4. CONNECTIONS (25 relationship types)
5. EVENTS     (67 event types)
6. KNOWLEDGE  (labels, chunks, vectors)
```

**Why "Groups" not "Organizations":**
- Groups support hierarchical nesting (parent → child → grandchild...)
- Groups scale from friend circles (2 people) to governments (billions)
- "Organization" implies business context; "Groups" is universal

### 2. Terminology Standards

**✅ CORRECT:**
```typescript
- group, groups, groupId
- group_owner, group_user
- member_of (connection type)
- group_created (event type)
- Multi-tenant isolation via groups
- Hierarchical nesting of groups
```

**❌ INCORRECT:**
```typescript
- organization, org, orgId
- org_owner, org_user
- organization_created
- Multi-tenant isolation via organizations
```

### 3. Architecture Standards

**Backend-Agnostic Pattern (MANDATORY):**

```
Frontend (Astro + React)
    ↓
Effect.ts Services (Backend-Agnostic)
    ↓
DataProvider Interface (Universal Contract)
    ↓
Backend Providers (Convex, WordPress, Supabase, etc.)
```

**Key Points:**
- Services use `DataProvider` (NOT direct backend calls)
- Change backend = edit ONE line in `astro.config.ts`
- Frontend can run WITHOUT backend (demo mode)

### 4. Deployment Strategy Standards

**Three Deployment Targets:**

```
/web (development - full features)
  ↓
git push → one-ie/web (website source)
  ↓
├─→ one.ie (backend ON)
├─→ demo.one.ie (backend OFF)
└─→ npx oneie (backend OFF by default)
```

**Environment Configuration:**
- Development: `ONE_BACKEND=on`, `ENABLE_ADMIN_FEATURES=true`
- Production (one.ie): `ONE_BACKEND=on`, `ENABLE_ADMIN_FEATURES=false`
- Demo (demo.one.ie): `ONE_BACKEND=off`, `ENABLE_ADMIN_FEATURES=false`
- User install (npx oneie): `ONE_BACKEND=off` (default)

---

## Critical Documents (Must Stay in Sync)

### Tier 1: Foundation Documents (Review First)

1. **`one/knowledge/ontology.md`** - SOURCE OF TRUTH
   - 6-dimension data model
   - All entity, connection, event types
   - Database schema structure
   - ✅ Status: Complete and current

2. **`one/knowledge/todo.md`** - Execution Template
   - 100-inference sequence
   - Planning paradigm (inferences, not days)
   - ✅ Status: Complete and current

3. **`CLAUDE.md`** - Development Workflow
   - 6-phase workflow
   - Inference-based planning
   - File structure policy
   - ✅ Status: Complete and current

### Tier 2: Strategic Plans (Keep Aligned)

4. **`one/things/plans/effect.md`** - Effect.ts Integration
   - ✅ Status: Updated 2025-10-24
   - Backend-agnostic architecture
   - DataProvider pattern
   - Complete examples

5. **`one/things/plans/separate.md`** - Backend Separation
   - Status: Review needed
   - Check: Uses "Groups" terminology
   - Check: Backend-agnostic approach
   - Check: Deployment strategy alignment

6. **`one/things/plans/unified-implementation-plan.md`** - 11-Week Plan
   - Status: Review needed
   - Check: Phase 1-2 complete status
   - Check: Phases 3-7 roadmap
   - Check: Groups terminology

7. **`one/things/plans/improve-codebase.md`** - Alternative Plan
   - Status: Review needed
   - Check: Ontology alignment
   - Check: Groups terminology

8. **`one/things/plans/architecture-summary.md`** - Deployment
   - ✅ Status: Complete and current
   - Deployment architecture
   - Release strategy

9. **`one/things/plans/ontology-6-dimensions.md`** - Migration Plan
   - ✅ Status: Updated 2025-10-24
   - Uses "Groups" terminology
   - Status marked as Complete

10. **`one/things/plans/backend-agnostic-frontend.md`** - Backend Agnostic
    - ✅ Status: Updated 2025-10-24
    - Uses "Groups" terminology
    - All 6 dimensions validated

11. **`one/things/plans/one.md`** - Product Document
    - ✅ Status: Updated 2025-10-24
    - Now lists 6 dimensions (was 5 primitives)
    - Includes Groups

### Tier 3: Feature Plans (Validate When Implementing)

12. **`one/things/plans/desktop.md`** - ONE Desktop
    - Status: Review needed
    - Check: Ontology mapping
    - Check: Groups terminology

13. **`one/things/plans/ontology-driven-strategy.md`** - Strategy
    - Status: Review needed
    - Check: 6-dimension alignment

14. **`one/things/plans/open-agent.md`** - Open Agent
    - Status: Review needed
    - Check: Ontology mapping

---

## Synchronization Checklist

### Before Creating/Updating ANY Plan

- [ ] Read `one/knowledge/ontology.md` (6-dimension model)
- [ ] Use "Groups" not "Organizations"
- [ ] Use "group_owner" not "org_owner"
- [ ] Map all features to 6 dimensions (Groups, People, Things, Connections, Events, Knowledge)
- [ ] Assume backend-agnostic architecture (use DataProvider)
- [ ] Reference unified deployment strategy (one.ie, demo.one.ie, npx oneie)

### When Updating Core Documents

If you update any Tier 1 document:
1. Review all Tier 2 documents for alignment
2. Update version numbers and timestamps
3. Add changelog entry
4. Test against 6-dimension ontology

### Monthly Review Cycle

**First Monday of Each Month:**
1. Review all Tier 1 documents (source of truth)
2. Audit Tier 2 documents for drift
3. Update this checklist with new documents
4. Archive obsolete plans (move to `/one/things/plans/archive/`)

---

## Common Synchronization Issues

### Issue 1: Terminology Drift

**Problem:** Plans using "organizations", "org", "orgId"
**Fix:** Global search/replace with "groups", "group", "groupId"
**Affected Files:** Check all `*.md` files in `one/things/plans/`

### Issue 2: Missing Groups Dimension

**Problem:** Plans listing 4 or 5 dimensions instead of 6
**Fix:** Always list all 6 dimensions in order:
1. Groups
2. People
3. Things
4. Connections
5. Events
6. Knowledge

### Issue 3: Backend-Coupling Assumptions

**Problem:** Plans assuming Convex-specific features
**Fix:** Use DataProvider pattern, show backend-agnostic approach

### Issue 4: Deployment Strategy Inconsistency

**Problem:** Plans describing different deployment targets
**Fix:** Always reference the three targets:
- one.ie (backend ON)
- demo.one.ie (backend OFF)
- npx oneie (backend OFF)

---

## Validation Commands

### Check for Terminology Issues

```bash
# Find "organization" usage (should be "groups")
grep -r "organization" one/things/plans/ --include="*.md" | grep -v "sync-checklist"

# Find "org_owner" usage (should be "group_owner")
grep -r "org_owner" one/things/plans/ --include="*.md"

# Find "orgId" usage (should be "groupId")
grep -r "orgId" one/things/plans/ --include="*.md"
```

### Check for Ontology Completeness

```bash
# Ensure plans mention all 6 dimensions
grep -L "Groups\|People\|Things\|Connections\|Events\|Knowledge" one/things/plans/*.md
```

### Check for Backend-Agnostic Pattern

```bash
# Plans should mention DataProvider
grep -L "DataProvider" one/things/plans/effect.md one/things/plans/backend-agnostic-frontend.md
```

---

## Document Status Legend

- ✅ **Complete** - Fully synchronized, reviewed, current
- 🚧 **Review Needed** - May have drift, needs audit
- ❌ **Obsolete** - Should be archived or deleted
- 📝 **Draft** - Work in progress, not yet authoritative

---

## Quick Reference: What Changed

### 2025-10-24 Sync Update

**Changed:**
1. ❌ "Organizations" → ✅ "Groups" (everywhere)
2. ❌ "org_owner" → ✅ "group_owner" (everywhere)
3. ❌ "5 primitives" → ✅ "6 dimensions" (one.md)
4. ✅ Backend-agnostic architecture emphasized (effect.md)
5. ✅ Deployment strategy unified (three targets)

**Files Updated:**
- `effect.md` - Complete rewrite for backend-agnostic architecture
- `ontology-6-dimensions.md` - Groups terminology, status marked Complete
- `backend-agnostic-frontend.md` - Groups terminology throughout
- `one.md` - Added Groups dimension (was missing!)

**Why Groups Not Organizations:**
- Supports hierarchical nesting (parent → child → grandchild...)
- Scales from friend circles to governments
- Universal term (not business-specific)
- Enables flexible multi-tenancy models

---

## Ownership & Maintenance

**Primary Maintainer:** Engineering Director
**Review Frequency:** Monthly (first Monday)
**Last Full Audit:** 2025-10-24
**Next Scheduled Review:** 2025-11-01

---

## Related Documentation

- **`one/knowledge/ontology.md`** - 6-dimension data model (SOURCE OF TRUTH)
- **`one/knowledge/todo.md`** - 100-inference execution template
- **`CLAUDE.md`** - Development workflow and patterns
- **`web/AGENTS.md`** - Quick reference for Convex patterns

---

**Keep plans synchronized. Keep architecture consistent. Keep building.**

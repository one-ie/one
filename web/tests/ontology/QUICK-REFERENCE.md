# ONE BIG ONTOLOGY - Quick Reference Card

## The Golden Rules

### ✅ DO THIS

```
Global Ontology (ONE source of truth):
  /one/knowledge/ontology.md
    → 61 thing types
    → 25+ connection types
    → 67+ event types
    → ALL type definitions

Installation Customization (branding ONLY):
  /<installation>/knowledge/brand-guide.md
  /<installation>/knowledge/features.md
  /<installation>/knowledge/rules.md
  /<installation>/groups/<group-slug>/

Database Schema (data isolation):
  groups       → Multi-tenant boundary
  entities     → groupId (things)
  connections  → groupId (relationships)
  events       → groupId (actions)
  knowledge    → groupId (semantics)
```

### ❌ NEVER DO THIS

```
❌ /acme/knowledge/ontology.md        (duplicate ontology)
❌ /acme/things/custom-types.md       (type definitions)
❌ /acme/connections/custom.md        (connection types)
❌ /acme/events/custom.md             (event types)
```

## Quick Test

```bash
# Validate "one big ontology" approach
cd /Users/toc/Server/ONE/web
bun test tests/ontology/

# Expected: 34 pass, 0 fail, ~35ms
```

## The Pattern

```
ONE Ontology     →  ALL Organizations
    ↓
    ├─ Organization A (groupId: acme_123)
    │    ├─ Data: isolated by groupId
    │    └─ Brand: /acme/knowledge/brand-guide.md
    │
    ├─ Organization B (groupId: example_456)
    │    ├─ Data: isolated by groupId
    │    └─ Brand: /example/knowledge/brand-guide.md
    │
    └─ Organization C (groupId: startup_789)
         ├─ Data: isolated by groupId
         └─ Brand: /startup/knowledge/brand-guide.md

Same Types, Different Data, Custom Branding!
```

## 4 Tests in 4 Lines

```typescript
✅ Test 1: Global ontology at /one/knowledge/ontology.md exists
✅ Test 2: Installation folders do NOT have ontology.md
✅ Test 3: All dimension tables have groupId field
✅ Test 4: File resolution loads ontology from /one/
```

## Key Numbers

```
Ontology:  1 file   (/one/knowledge/ontology.md)
Types:     61 thing + 25 connection + 67 event
Tables:    5 (groups, entities, connections, events, knowledge)
Isolation: 1 field (groupId)
Tests:     34 (all passing)
Time:      35ms
```

## File Locations

```
Tests:
  /web/tests/ontology/one-big-ontology.test.ts
  /web/tests/ontology/TEST-RESULTS.md
  /web/tests/ontology/README.md

Ontology:
  /one/knowledge/ontology.md (global)

Schema:
  /backend/convex/schema.ts (groupId isolation)

Installation:
  /<name>/knowledge/brand-guide.md (optional)
  /<name>/knowledge/features.md (optional)
  /<name>/knowledge/rules.md (optional)
```

## Run Commands

```bash
# Run tests
bun test tests/ontology/

# View results
cat tests/ontology/TEST-RESULTS.md

# View docs
cat tests/ontology/README.md
```

## What's Validated

1. **Universal Ontology** - One source defines all types
2. **No Duplication** - Installation folders customize branding only
3. **Data Isolation** - groupId field on all dimension tables
4. **File Priority** - Installation → global fallback

## Status

```
✅ 34 tests passing
✅ 0 tests failing
✅ 120 assertions validated
✅ Production ready
```

---

**Remember:** ONE ontology, MANY organizations, ZERO duplication!

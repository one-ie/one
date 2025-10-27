# Backend Cleanup Quickstart Guide

**Status**: Ready to execute
**Time**: 4-6 hours total work
**Complexity**: Low-medium (mostly file organization)
**Risk**: Low (no code changes, only reorganization)

---

## What's Wrong Right Now?

```
❌ /backend/ has 20+ markdown files (messy root)
❌ 7 files are duplicates (3 copies of query docs, 3 of structure docs, 2 of test reports)
❌ Documentation scattered between /backend/ and /one/ (confusing)
❌ README.md says "4-table" (outdated - should be "6-dimension")
❌ Examples in /backend/examples/ (should be in /one/knowledge/)
❌ _tests_disabled/ folder (obsolete tests taking up space)
❌ No clear mapping of files to 6-dimension ontology
```

**Impact**: Hard to find documentation, confusing for new developers, duplicate information

---

## Target State

```
✅ /backend/ has only source code (convex/, lib/, test/, scripts/)
✅ All documentation in /one/ (organized by dimension)
✅ Zero duplicates (consolidated into single authoritative files)
✅ README.md says "6-dimension" (current)
✅ Examples in /one/knowledge/examples/
✅ _tests_disabled/ deleted (clean)
✅ Every file mapped to 6-dimension ontology
```

**Impact**: Beautiful structure, easy to navigate, single source of truth

---

## Three Essential Documents Created

### 1. `/backend/BACKEND-AUDIT-MANIFEST.md`
**What**: File-by-file assessment of all 33 backend root files
**Content**:
- Classification of each file (keep, move, delete, consolidate)
- Duplicate detection
- Ontology mapping
- Risk assessment
**Use this to**: Understand what each file does and why

### 2. `/one/things/plans/backend-ontology-conformance.md`
**What**: Complete 100-inference execution plan
**Content**:
- 5 phases (Audit, Consolidation, Reorganization, Cleanup, Verification)
- 60 detailed inference steps (Infer 1-100)
- Execution timeline
- Success criteria
**Use this to**: Follow the step-by-step execution plan

### 3. `/one/things/plans/backend-target-structure.md`
**What**: Vision of what backend looks like after cleanup
**Content**:
- Before/after directory structures
- File mapping to 6 dimensions
- Quality metrics
- Success checklist
**Use this to**: Visualize the end goal

---

## Quick Summary Table

| Action | Files | Destination | Effort |
|--------|-------|-------------|--------|
| **KEEP** (no changes) | convex/, lib/, test/, scripts/ | /backend/ | 0% |
| **DELETE** | ONTOLOGY-FILE-STRUCTURE.md, PERFECT-ONTOLOGY-STRUCTURE.md, ONTOLOGY-INTEGRATION-TEST-SUMMARY.md, _tests_disabled/ | - | 5% |
| **CONSOLIDATE** | 3 query files → 1, 3 structure files → 1, 2 test report files → 1 | /one/connections/api/, /one/things/plans/, /one/events/ | 20% |
| **MOVE** | 12 other markdown files | /one/events/, /one/knowledge/, /one/things/, /one/people/, /one/connections/ | 30% |
| **UPDATE** | README.md (change 4-table to 6-dimension) | /backend/ | 5% |
| **VERIFY** | TypeScript, links, schema | - | 40% |

---

## How to Get Started

### Option A: Follow the Full Plan (Recommended)
```bash
# Read these in order:
1. /backend/BACKEND-AUDIT-MANIFEST.md (understand current state)
2. /one/things/plans/backend-target-structure.md (see target vision)
3. /one/things/plans/backend-ontology-conformance.md (follow step-by-step)
```

### Option B: Quick Cleanup (Just Fix It)
```bash
# Phase 1: Consolidate duplicates
cp /backend/QUERIES_ONTOLOGY_COMPLETE.md /tmp/queries-backup.md
# Merge examples from ONTOLOGY_QUERIES_EXAMPLE.md into QUERIES_ONTOLOGY_COMPLETE.md
mv /backend/QUERIES_ONTOLOGY_COMPLETE.md /one/connections/api/queries-reference.md
rm /backend/QUERY_ONTOLOGY.md /backend/ONTOLOGY_QUERIES_EXAMPLE.md

# Phase 2: Move documentation
mv /backend/BACKEND-STRUCTURE.md /one/things/plans/
mv /backend/TEST-DASHBOARD.md /one/events/
# ... (continue for other files)

# Phase 3: Clean up
rm -rf /backend/_tests_disabled/
rm /backend/ONTOLOGY-FILE-STRUCTURE.md /backend/PERFECT-ONTOLOGY-STRUCTURE.md

# Phase 4: Verify
cd /backend && npx tsc --noEmit
```

---

## Files to Keep vs. Move at a Glance

### In `/backend/` (KEEP - source code)
```
✅ convex/          (all - database schema, queries, mutations, auth)
✅ lib/             (all - validators, utilities)
✅ test/            (all - active tests)
✅ scripts/         (all - build tools)
✅ README.md        (update to say "6-dimension")
✅ LICENSE.md
✅ package.json
✅ .env.local
```

### In `/one/` (MOVE - documentation)
```
📋 /one/things/plans/backend-structure.md (merged from 3)
📋 /one/things/implementation/backend-guide.md
📋 /one/connections/api/queries-reference.md (merged from 3)
📋 /one/events/backend-integration-tests.md (merged from 2)
📋 /one/events/[other test/analysis files]
📋 /one/knowledge/ontology-visual-guide.md
📋 /one/knowledge/examples/backend-examples/
```

### DELETE (no longer needed)
```
❌ _tests_disabled/                          (obsolete)
❌ ONTOLOGY-FILE-STRUCTURE.md                (duplicate)
❌ PERFECT-ONTOLOGY-STRUCTURE.md             (duplicate)
❌ ONTOLOGY-INTEGRATION-TEST-SUMMARY.md      (consolidate into report)
```

---

## The 6-Dimension Mapping

### Where does each dimension show up in backend?

```
GROUPS
  └─ backend/convex/schema.ts (groups table)
     backend/convex/queries/groups.ts
     backend/convex/mutations/groups.ts

PEOPLE
  └─ backend/convex/auth.ts (authentication)
     backend/convex/mutations/people.ts
     one/people/backend-auth-roles.md

THINGS
  └─ backend/convex/schema.ts (things table, 66+ types)
     backend/convex/ontologies/*.json (feature types)
     backend/convex/mutations/things.ts
     backend/convex/queries/things.ts

CONNECTIONS
  └─ backend/convex/schema.ts (connections table, 25+ types)
     backend/convex/mutations/connections.ts
     backend/convex/queries/connections.ts
     one/connections/api/queries-reference.md

EVENTS
  └─ backend/convex/schema.ts (events table, 67+ types)
     backend/convex/internalActions/events.ts (event logging)
     one/events/[test files]

KNOWLEDGE
  └─ backend/convex/schema.ts (knowledge table)
     backend/convex/mutations/knowledge.ts
     backend/convex/queries/knowledge.ts
     one/knowledge/ontology-visual-guide.md
```

---

## Commands to Execute (In Order)

```bash
# 1. CREATE CONSOLIDATION: Merge query docs
cd /backend
# (manually merge ONTOLOGY_QUERIES_EXAMPLE.md into QUERIES_ONTOLOGY_COMPLETE.md)
# (copy merged content to /one/connections/api/queries-reference.md)

# 2. DELETE duplicates
rm QUERY_ONTOLOGY.md
rm ONTOLOGY_QUERIES_EXAMPLE.md
rm ONTOLOGY-FILE-STRUCTURE.md
rm PERFECT-ONTOLOGY-STRUCTURE.md
rm -rf _tests_disabled/

# 3. MOVE documentation (create directories first)
mkdir -p /one/things/implementation/
mkdir -p /one/connections/api/
mkdir -p /one/events/

# Then move files:
mv BACKEND-STRUCTURE.md /one/things/plans/
mv IMPLEMENTATION-GUIDE.md /one/things/implementation/backend-guide.md
mv CONVEX-STRUCTURE-ANALYSIS.md /one/events/
# ... (etc)

# 4. VERIFY TypeScript still compiles
npx tsc --noEmit

# 5. UPDATE README
# Change "4-Table Ontology" to "6-Dimension Ontology"
# Update links to point to /one/ instead of /backend/

# 6. VERIFY all links work
grep -r "backend/" /one --include="*.md" | grep -v node_modules

# 7. FINAL CHECK
ls -la /backend/*.md  # Should only see: README.md, LICENSE.md
echo "Backend cleanup complete! 🎉"
```

---

## What Won't Change (Safe)

✅ **Source code completely safe**
- All Convex code stays in `/backend/convex/`
- All imports remain the same
- Schema.ts untouched (6 dimensions still there)
- Auth still works
- Database structure unchanged

✅ **Tests still pass**
- `/backend/test/` stays exactly as-is
- `_tests_disabled/` deleted (already disabled)
- Active tests unaffected

✅ **Configuration unchanged**
- `.env.local`, `package.json`, `vitest.config.ts` unchanged
- Build process unaffected
- Deployment unaffected

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Broken imports | Very low | High | Only moving docs, not code |
| Lost documentation | Low | Medium | Copy before deleting, verify copy exists |
| TypeScript errors | Very low | High | Run `tsc --noEmit` after changes |
| Schema validation fails | Almost zero | Critical | Not touching schema.ts |
| Broken markdown links | Medium | Low | Use grep to find before moving |

---

## Verification Checklist

```bash
# After cleanup, verify:

[ ] TypeScript compiles: cd /backend && npx tsc --noEmit
[ ] No source code deleted: ls convex/ has everything
[ ] Docs moved to /one/: ls /one/things/plans/ shows backend-*
[ ] Duplicates gone: ls /backend/*.md | wc -l (should be ~2-3)
[ ] Examples moved: ls /one/knowledge/examples/backend-examples/
[ ] Tests still work: cd /backend && bun test
[ ] _tests_disabled/ gone: [ ! -d _tests_disabled ] && echo "✅"
[ ] README updated: grep "6-dimension" /backend/README.md
[ ] Links valid: Manual spot-check of documentation links
```

---

## Success = Beautiful Backend

**Before**: Confusing mess
- 20+ markdown files in root
- 7 duplicate files
- Examples buried in /backend/examples/
- Documentation scattered
- README outdated
- Unclear mapping to ontology

**After**: Crystal clear
- Only 2-3 markdown files in /backend/ (README, LICENSE)
- Zero duplicates (consolidated)
- Examples in `/one/knowledge/examples/`
- Documentation organized by dimension in `/one/`
- README current
- 100% mapped to 6-dimension ontology

---

## Timeline

- **Phase 1 (Audit)**: Already done ✅
- **Phase 2 (Consolidation)**: ~1 hour
- **Phase 3 (Migration)**: ~2 hours
- **Phase 4 (Cleanup)**: ~1 hour
- **Phase 5 (Verification)**: ~1.5 hours
- **Total**: 4-6 hours

---

## Next Step

**Pick one of these**:

1. **Read full plan**: `/one/things/plans/backend-ontology-conformance.md` (100-inference sequence)
2. **See the vision**: `/one/things/plans/backend-target-structure.md` (before/after)
3. **Just execute it**: Follow "Quick Cleanup (Just Fix It)" section above

**Recommendation**: Read this quickstart, then read backend-target-structure.md, then follow backend-ontology-conformance.md step by step.

---

## Questions?

- **How long does this take?** 4-6 hours
- **Is this risky?** No - only reorganizing documentation, not touching code
- **Will I break anything?** No - schema, imports, and source code unchanged
- **Can I undo it?** Yes - git has all files, easily reversible
- **Do I need to deploy?** No - purely filesystem organization

---

**Status**: Ready to begin
**Recommendation**: Start with Phase 2 (Consolidation) - it's the quickest win
**Owner**: Agent-clean, Agent-backend, or whoever wants beautiful code

🚀 Let's make the backend beautiful!

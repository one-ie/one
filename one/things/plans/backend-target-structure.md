# Backend Target Structure (After Conformance)

**Status**: Target Design
**Purpose**: Vision of beautifully organized backend that 100% maps to 6-dimension ontology

---

## Current State (BEFORE)

```
backend/
├── 20+ markdown files (scattered, some duplicate)
├── _tests_disabled/ (obsolete)
├── convex/ (good structure)
├── lib/ (utilities with scattered docs)
├── test/ (good structure)
├── examples/ (should be in /one/)
├── scripts/ (good structure)
├── README.md (outdated - says "4-table")
└── BACKEND-AUDIT-MANIFEST.md (new - assessment guide)
```

**Problems**:
- Documentation scattered across root
- Duplicate files (3 copies of query docs, 3 copies of structure docs)
- Outdated references ("4-table" instead of "6-dimension")
- No clear mapping to 6-dimension ontology
- Examples not discoverable (not in /one/)
- Disabled tests take up space

**Impact**:
- 33+ files to assess and organize
- Context switching between `/backend/` and `/one/`
- Unclear which files are current vs. archived
- Difficult for new developers to find relevant docs

---

## Target State (AFTER)

### `/backend/` - Clean & Minimal

```
backend/
├── convex/
│   ├── schema.ts (6-dimension ontology ✅)
│   │   ├── groups table
│   │   ├── people table
│   │   ├── things table
│   │   ├── connections table
│   │   ├── events table
│   │   └── knowledge table
│   ├── auth.ts (People dimension)
│   ├── auth.config.ts
│   ├── queries/
│   │   ├── groups.ts
│   │   ├── people.ts
│   │   ├── things.ts
│   │   ├── connections.ts
│   │   ├── events.ts
│   │   ├── knowledge.ts
│   │   ├── ontology.ts (meta queries)
│   │   └── README.md
│   ├── mutations/
│   │   ├── groups.ts
│   │   ├── people.ts
│   │   ├── things.ts
│   │   ├── connections.ts
│   │   ├── knowledge.ts
│   │   ├── init.ts
│   │   ├── onboarding.ts
│   │   └── README.md
│   ├── actions/ (server-side actions)
│   ├── internalActions/
│   │   ├── events.ts (event logging)
│   │   ├── search.ts (RAG/embedding)
│   │   └── validation.ts
│   ├── services/
│   │   ├── entityService.ts (Things dimension)
│   │   ├── ontologyMapper.ts (Mapping logic)
│   │   ├── brandGuideGenerator.ts
│   │   ├── featureRecommender.ts
│   │   ├── websiteAnalyzer.ts
│   │   └── layers.ts
│   ├── ontologies/ (feature-specific definitions)
│   │   ├── base.json
│   │   ├── blog.json
│   │   ├── courses.json
│   │   ├── ecommerce.json
│   │   └── portfolio.json
│   ├── types/
│   │   ├── ontology.ts (auto-generated)
│   │   └── README.md
│   ├── http.ts (HTTP endpoints)
│   ├── convex.config.ts
│   └── INDEX.md (navigation)
│
├── lib/
│   ├── ontology-loader.ts (load definitions)
│   ├── ontology-validator.ts (validate structure)
│   ├── ontology-errors.ts (error handling)
│   ├── type-generator.ts (type gen)
│   ├── jwt.ts (auth utils)
│   ├── validation.ts (validators)
│   └── __tests__/ (lib tests)
│
├── test/
│   ├── groups.test.ts
│   ├── things.test.ts
│   ├── connections.test.ts (future)
│   ├── events.test.ts (future)
│   ├── knowledge.test.ts (future)
│   ├── auth.test.ts (future)
│   ├── README.md (testing guide)
│   └── RUN_TESTS.md (how to run)
│
├── scripts/
│   ├── generate-ontology-types.ts
│   ├── generate-template-from-ontology.ts
│   └── README.md
│
├── README.md (clean overview)
├── LICENSE.md
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── bun.lock
└── .env.local (secrets - .gitignored)

# NO subdirectories for:
# - _tests_disabled/ ❌ DELETED
# - 33 markdown files (moved to /one/)
# - examples/ (moved to /one/knowledge/)
```

**Total files in /backend/**: ~60 (down from 200+)
**All source code present**: ✅
**Documentation clean**: ✅ (moved to /one/)
**Ontology-compliant**: ✅

---

### `/one/things/plans/` - Backend Architecture Docs

```
one/things/plans/
├── backend-ontology-conformance.md (THIS FILE - the plan)
├── backend-target-structure.md (target vision)
└── backend-structure.md (merged from 3 originals)
```

### `/one/things/implementation/` - Backend Development Guides

```
one/things/implementation/
├── backend-guide.md (how to implement features)
├── convex-patterns.md
├── auth-patterns.md
└── ontology-mapping.md (how to map to 6 dimensions)
```

### `/one/connections/api/` - Query & Mutation Reference

```
one/connections/api/
├── queries-reference.md (consolidated from 3 files)
├── mutations-reference.md
├── http-endpoints.md
├── ontology-queries.md (examples)
└── convex-quick-reference.md (quick ref)
```

### `/one/events/` - Analysis, Testing, & Insights

```
one/events/
├── backend-integration-tests.md (consolidated from 2 files)
├── backend-structure-analysis.md
├── backend-structure-diagram.txt
├── backend-structure-summary.txt
├── convex-analysis-index.md
├── test-dashboard.md
├── test-index.md
├── test-report-ontology.md
├── testing-summary.md
├── ontology-test-examples.md
└── disabled-tests-archive.md (archive note from _tests_disabled/)
```

### `/one/knowledge/` - Learning Resources

```
one/knowledge/
├── ontology-visual-guide.md
└── examples/
    ├── backend-examples/
    │   ├── complete-newsletter-example/
    │   ├── ontology-types-usage.ts
    │   └── README.md
    ├── frontend-examples/
    └── full-stack-examples/
```

### `/one/people/` - Authorization & Roles

```
one/people/
├── backend-auth-roles.md
├── better-auth-guide.md
└── permissions-model.md
```

---

## Organization by 6-Dimension

### 1. GROUPS Dimension
**Files that document multi-tenant isolation**:
- `one/things/plans/backend-structure.md` (groups table section)
- `backend/convex/schema.ts` (groups table definition)
- `backend/convex/queries/groups.ts` (read operations)
- `backend/convex/mutations/groups.ts` (write operations)

### 2. PEOPLE Dimension
**Files that document authorization & governance**:
- `one/people/backend-auth-roles.md`
- `one/people/better-auth-guide.md`
- `backend/convex/auth.ts` (auth config)
- `backend/convex/mutations/people.ts` (person operations)
- `backend/convex/queries/people.ts` (read people)

### 3. THINGS Dimension
**Files that document entity definitions**:
- `one/things/plans/backend-structure.md` (things table section)
- `one/things/implementation/backend-guide.md`
- `backend/convex/schema.ts` (things table + 66+ types)
- `backend/convex/ontologies/*.json` (feature types)
- `backend/convex/mutations/things.ts` (create/update entities)
- `backend/convex/queries/things.ts` (read entities)
- `backend/convex/services/entityService.ts` (entity operations)
- `one/knowledge/examples/backend-examples/` (usage examples)

### 4. CONNECTIONS Dimension
**Files that document relationships**:
- `one/connections/api/queries-reference.md`
- `one/connections/api/mutations-reference.md`
- `backend/convex/schema.ts` (connections table + 25+ types)
- `backend/convex/mutations/connections.ts` (create/update relations)
- `backend/convex/queries/connections.ts` (read relations)
- `one/connections/api/ontology-queries.md` (query examples)

### 5. EVENTS Dimension
**Files that document actions & audit trail**:
- `one/events/backend-integration-tests.md`
- `one/events/testing-summary.md`
- `one/events/ontology-test-examples.md`
- `backend/convex/schema.ts` (events table + 67+ types)
- `backend/convex/internalActions/events.ts` (event logging)
- `backend/convex/queries/events.ts` (read events)

### 6. KNOWLEDGE Dimension
**Files that document embeddings & RAG**:
- `one/knowledge/ontology-visual-guide.md`
- `one/knowledge/examples/backend-examples/`
- `backend/convex/schema.ts` (knowledge table)
- `backend/convex/mutations/knowledge.ts` (create/update knowledge)
- `backend/convex/queries/knowledge.ts` (search/retrieve)
- `backend/convex/internalActions/search.ts` (embedding + RAG)

---

## File Movement Summary

### DELETE (4 files) ❌
```
ONTOLOGY-FILE-STRUCTURE.md (duplicate)
ONTOLOGY-INTEGRATION-TEST-SUMMARY.md (consolidate with report)
PERFECT-ONTOLOGY-STRUCTURE.md (duplicate)
_tests_disabled/ (entire directory - obsolete)
```

### MOVE (12 files) 📋
```
BACKEND-STRUCTURE.md → /one/things/plans/ (consolidate)
CONVEX-ANALYSIS-INDEX.md → /one/events/
CONVEX-STRUCTURE-ANALYSIS.md → /one/events/
CONVEX-STRUCTURE-DIAGRAM.txt → /one/events/
IMPLEMENTATION-GUIDE.md → /one/things/implementation/
ONTOLOGY-TEST-EXAMPLES.md → /one/events/
ONTOLOGY_VISUAL_GUIDE.md → /one/knowledge/
ONTOLOGY_QUERIES_EXAMPLE.md → /one/connections/api/ (consolidate)
QUERIES_ONTOLOGY_COMPLETE.md → /one/connections/api/ (consolidate)
QUERY_ONTOLOGY.md → /one/connections/api/ (consolidate)
TEST-DASHBOARD.md → /one/events/
TEST-INDEX.md → /one/events/
TEST-REPORT-ONTOLOGY.md → /one/events/
TESTING-SUMMARY.md → /one/events/
```

### CONSOLIDATE (3 groups) ⚠️
```
Query docs: ONTOLOGY_QUERIES_EXAMPLE.md + QUERIES_ONTOLOGY_COMPLETE.md + QUERY_ONTOLOGY.md
  → one/connections/api/queries-reference.md

Structure docs: BACKEND-STRUCTURE.md + ONTOLOGY-FILE-STRUCTURE.md + PERFECT-ONTOLOGY-STRUCTURE.md
  → one/things/plans/backend-structure.md

Test reports: ONTOLOGY-INTEGRATION-TEST-REPORT.md + ONTOLOGY-INTEGRATION-TEST-SUMMARY.md
  → one/events/backend-integration-tests.md
```

### KEEP in `/backend/` (10 items) ✅
```
convex/           (all - source code)
lib/              (all - utilities)
test/             (all - active tests)
scripts/          (all - build tools)
README.md         (update "4-table" → "6-dimension")
LICENSE.md
package.json
.env.local
vitest.config.ts
bun.lock
```

---

## Quality Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Markdown files in `/backend/` | 20 | 2 | <5 |
| Duplicate documentation | 7 files (3+ copies) | 0 | 0 |
| Files mapped to 6 dimensions | ~50% | 100% | 100% |
| Discoverability (in /one/) | ~30% | ~95% | 100% |
| TypeScript errors | 0 | 0 | 0 |
| Broken links | Unknown | 0 | 0 |
| Schema compliance | 6-dim ✅ | 6-dim ✅ | 6-dim ✅ |

---

## Success Checklist

- [ ] All source code remains in `/backend/convex/`
- [ ] All documentation moved to `/one/` (except README.md)
- [ ] All duplicates consolidated (7 files → 3 consolidated files)
- [ ] All deleted files archived (only _tests_disabled/ truly deleted)
- [ ] Schema.ts verified - 6 dimensions intact
- [ ] TypeScript compilation successful
- [ ] All markdown links updated and valid
- [ ] README.md updated (4-table → 6-dimension)
- [ ] Examples moved to `/one/knowledge/examples/`
- [ ] Every file mapped to at least 1 ontology dimension

---

## Why This Matters

### Before: Hard to Navigate
- Q: "Where's the query documentation?"
- A: "It's in QUERY_ONTOLOGY.md... or maybe QUERIES_ONTOLOGY_COMPLETE.md... or ONTOLOGY_QUERIES_EXAMPLE.md"
- Problem: 3 files, different content, unclear which to use

### After: Crystal Clear
- Q: "Where's the query documentation?"
- A: "Read `/one/connections/api/queries-reference.md`"
- Problem solved: 1 file, consolidated, discoverable

### Before: Scattered Context
- To understand backend: read `/backend/README.md`, then 20+ files, piecing it together
- Hard to see 6-dimension mapping

### After: Organized by Dimension
- To understand backend: navigate `/one/` by dimension
- Groups → check `/one/things/plans/backend-structure.md` section 1
- People → check `/one/people/backend-auth-roles.md`
- Things → check `/one/things/implementation/` + `/one/knowledge/examples/`
- Connections → check `/one/connections/api/`
- Events → check `/one/events/`
- Knowledge → check `/one/knowledge/`

---

## Implementation Phases

### Phase 1: Audit (✅ DONE)
- [x] Create BACKEND-AUDIT-MANIFEST.md (file-by-file assessment)
- [x] Create this document (target vision)
- [x] Create backend-ontology-conformance.md (100-inference plan)

### Phase 2: Consolidation (Next)
- [ ] Merge 3 query docs into 1
- [ ] Merge 3 structure docs into 1
- [ ] Merge 2 test reports into 1
- [ ] Move consolidated files to `/one/`

### Phase 3: Migration (Then)
- [ ] Move remaining documentation to `/one/`
- [ ] Move examples to `/one/knowledge/examples/`
- [ ] Delete _tests_disabled/
- [ ] Delete duplicate files

### Phase 4: Cleanup (Finally)
- [ ] Update /backend/README.md
- [ ] Verify TypeScript compilation
- [ ] Test all markdown links
- [ ] Validate 6-dimension schema

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking imports | Convex source code stays in `/backend/` - no import changes needed |
| Losing documentation | Keep backups during migration, verify everything copied |
| Broken links | Use grep to find all references before moving |
| Schema validation fails | Don't touch schema.ts - only organize documentation |

---

## Next Steps

1. Review this target structure
2. Approve the plan
3. Execute Phase 2 (Consolidation)
4. Execute Phase 3 (Migration)
5. Execute Phase 4 (Cleanup)
6. Celebrate! 🎉

**Estimated effort**: 4-6 hours total
**Payoff**: Infinitely better developer experience forever

---

**Status**: Ready for execution
**Owner**: Agent-clean, Agent-backend
**Timeline**: 60-100 inferences in 100-inference sequence

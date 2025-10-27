# Backend Ontology Conformance Plan

**Status**: Draft
**Created**: 2025-10-25
**Purpose**: Audit every `/backend/*` file and organize according to 6-dimension ontology
**Goal**: Beautiful, neat backend structure that maps 100% to groups, people, things, connections, events, knowledge

---

## Overview

The backend has accumulated 200+ files with 50+ markdown documentation files scattered in the root. These need to be:
1. **Assessed** - Confirm what each file does
2. **Classified** - Map to 6-dimension ontology
3. **Reorganized** - Move to appropriate `/one/*` directory
4. **Consolidated** - Merge duplicates
5. **Cleaned** - Delete obsolete files

### Current State

**Files to organize:**
```
/backend/ (root files scattered everywhere)
├── BACKEND-STRUCTURE.md
├── CONVEX-ANALYSIS-INDEX.md
├── CONVEX-QUICK-REFERENCE.md
├── CONVEX-STRUCTURE-ANALYSIS.md
├── CONVEX-STRUCTURE-DIAGRAM.txt
├── IMPLEMENTATION-GUIDE.md
├── ONTOLOGY-FILE-STRUCTURE.md
├── ONTOLOGY-INTEGRATION-TEST-REPORT.md
├── ONTOLOGY-INTEGRATION-TEST-SUMMARY.md
├── ONTOLOGY-TEST-EXAMPLES.md
├── ONTOLOGY_QUERIES_EXAMPLE.md
├── ONTOLOGY_VISUAL_GUIDE.md
├── PERFECT-ONTOLOGY-STRUCTURE.md
├── QUERIES_ONTOLOGY_COMPLETE.md
├── QUERY_ONTOLOGY.md
├── STRUCTURE-SUMMARY.txt
├── TEST-DASHBOARD.md
├── TEST-INDEX.md
├── TEST-REPORT-ONTOLOGY.md
├── TESTING-SUMMARY.md
├── (+ 30+ more markdown files)
├── lib/ (utilities, validation, ontology tools)
├── test/ (test suites)
├── _tests_disabled/ (disabled tests - cleanup candidate)
└── convex/ (main source)
    ├── ontologies/ (feature ontology definitions)
    ├── services/ (business logic services)
    ├── types/ (type definitions)
    └── (queries, mutations, actions, auth)
```

---

## File Classification Matrix

### 1. DOCUMENTATION FILES → `/one/things/`

These belong in the `/one` platform documentation:

| File | Type | Destination | Action |
|------|------|-------------|--------|
| `README.md` | Overview | Keep (root) | REVIEW - update to 6-dimension |
| `BACKEND-STRUCTURE.md` | Architecture | `/one/things/plans/backend-structure.md` | MOVE |
| `CONVEX-QUICK-REFERENCE.md` | Reference | `/one/things/convex-quick-reference.md` | MOVE |
| `IMPLEMENTATION-GUIDE.md` | Guide | `/one/things/implementation/backend-guide.md` | MOVE |
| `ONTOLOGY-FILE-STRUCTURE.md` | Structure | DUPLICATE (consolidate) | DELETE |
| `PERFECT-ONTOLOGY-STRUCTURE.md` | Reference | DUPLICATE (consolidate) | DELETE |
| `CONVEX-STRUCTURE-ANALYSIS.md` | Analysis | `/one/events/backend-structure-analysis.md` | MOVE |
| `CONVEX-STRUCTURE-DIAGRAM.txt` | Diagram | `/one/events/backend-structure-diagram.txt` | MOVE |
| `ONTOLOGY_VISUAL_GUIDE.md` | Guide | `/one/knowledge/ontology-visual-guide.md` | MOVE |

### 2. TEST DOCUMENTATION → `/one/events/`

| File | Type | Destination | Action |
|------|------|-------------|--------|
| `TEST-DASHBOARD.md` | Test tracking | `/one/events/test-dashboard.md` | MOVE |
| `TEST-INDEX.md` | Test index | `/one/events/test-index.md` | MOVE |
| `TEST-REPORT-ONTOLOGY.md` | Test report | `/one/events/test-report-ontology.md` | MOVE |
| `TESTING-SUMMARY.md` | Summary | `/one/events/testing-summary.md` | MOVE |
| `ONTOLOGY-INTEGRATION-TEST-REPORT.md` | Test report | DUPLICATE | CONSOLIDATE |
| `ONTOLOGY-INTEGRATION-TEST-SUMMARY.md` | Test summary | DUPLICATE | CONSOLIDATE |
| `ONTOLOGY-TEST-EXAMPLES.md` | Examples | `/one/events/ontology-test-examples.md` | MOVE |
| `RUN_TESTS.md` (in test/) | Test guide | KEEP (in `/backend/test/`) | REVIEW |

### 3. QUERY/API DOCUMENTATION → `/one/connections/`

| File | Type | Destination | Action |
|------|------|-------------|--------|
| `ONTOLOGY_QUERIES_EXAMPLE.md` | API examples | `/one/connections/api/ontology-queries.md` | MOVE |
| `QUERIES_ONTOLOGY_COMPLETE.md` | Query spec | `/one/connections/api/queries-complete.md` | MOVE |
| `QUERY_ONTOLOGY.md` | Query reference | DUPLICATE | CONSOLIDATE |
| `convex/queries/README.md` | Query guide | Keep in `/backend/convex/` | REVIEW |

### 4. IMPLEMENTATION SPECIFICS → Keep in `/backend/`

These stay in backend (source code adjacent):

| File/Folder | Type | Action |
|-------------|------|--------|
| `convex/` | Source | **KEEP** - Main backend |
| `convex/schema.ts` | Core | **KEEP** - 6-dimension schema |
| `convex/auth.ts` | Core | **KEEP** - Authentication |
| `convex/http.ts` | Core | **KEEP** - HTTP endpoints |
| `convex/services/` | Code | **KEEP** - Business logic |
| `convex/ontologies/` | Config | **KEEP** - Feature definitions |
| `lib/` | Utilities | **KEEP** - Validation, loaders |
| `test/` | Tests | **KEEP** - Test suites |
| `_tests_disabled/` | Archived | **DELETE** - Obsolete |
| `examples/` | Examples | MOVE to `/one/knowledge/examples/` |
| `scripts/` | Scripts | KEEP in `/backend/` |
| `.env.local` | Config | KEEP (secret) |

### 5. ANALYSIS FILES → `/one/events/` (Analysis & Insights)

| File | Type | Destination | Action |
|------|------|-------------|--------|
| `CONVEX-ANALYSIS-INDEX.md` | Analysis | `/one/events/convex-analysis-index.md` | MOVE |
| `STRUCTURE-SUMMARY.txt` | Summary | `/one/events/backend-structure-summary.txt` | MOVE |

---

## Ontology Mapping

### Groups Dimension
- **Belongs**: Multi-tenant isolation configuration
- **Files affected**: `convex/schema.ts` (groups table)
- **Action**: REVIEW schema - ensure hierarchical nesting pattern documented

### People Dimension
- **Belongs**: Authorization, roles, access control
- **Files affected**: `convex/auth.ts`, `convex/auth.config.ts`, `convex/mutations/people.ts`
- **Action**: KEEP all - core to platform

### Things Dimension
- **Belongs**: Entity definitions, thing types, properties
- **Files affected**: `convex/schema.ts` (things table), `convex/ontologies/*.json`, `convex/types/ontology.ts`
- **Action**: KEEP all - core ontology definition

### Connections Dimension
- **Belongs**: Relationship types, connection logic
- **Files affected**: `convex/schema.ts` (connections table), `convex/mutations/connections.ts`, `convex/queries/connections.ts`
- **Action**: KEEP all - core ontology definition

### Events Dimension
- **Belongs**: Event logging, audit trail, action tracking
- **Files affected**: `convex/schema.ts` (events table), `convex/mutations/init.ts`, `convex/internalActions/events.ts`
- **Action**: KEEP all - core ontology definition

### Knowledge Dimension
- **Belongs**: Embeddings, vectors, RAG, labels
- **Files affected**: `convex/schema.ts` (knowledge table), `convex/mutations/knowledge.ts`, `convex/queries/knowledge.ts`
- **Action**: KEEP all - core ontology definition

---

## Execution Plan (100-Inference Sequence)

### Phase 1: AUDIT (Infer 1-10)

**Infer 1**: Review all 200+ root files
- Categorize by type (documentation, test, config, source)
- List in classification matrix above

**Infer 2**: Identify duplicates
- `ONTOLOGY-FILE-STRUCTURE.md` ≈ `PERFECT-ONTOLOGY-STRUCTURE.md`
- `ONTOLOGY-INTEGRATION-TEST-REPORT.md` ≈ `ONTOLOGY-INTEGRATION-TEST-SUMMARY.md`
- `QUERY_ONTOLOGY.md` ≈ `QUERIES_ONTOLOGY_COMPLETE.md` ≈ `ONTOLOGY_QUERIES_EXAMPLE.md`

**Infer 3**: Validate schema compliance
- Check `convex/schema.ts` maps to 6 dimensions
- Verify all tables present: groups, people (if separate), things, connections, events, knowledge
- Check indexes, relationships, constraints

**Infer 4**: Review test coverage
- Assess test files: `/backend/test/`, `_tests_disabled/`
- Determine if disabled tests should be deleted or re-enabled

**Infer 5**: Audit documentation quality
- Check for outdated information (e.g., "4-table" vs actual 6-dimension)
- Identify contradictions between files
- List accuracy issues

**Infer 6-10**: Plan-specific audits
- Services audit
- Types audit
- Examples audit
- Ontology definitions audit
- Library utilities audit

### Phase 2: CONSOLIDATION (Infer 11-20)

**Infer 11**: Merge duplicate test reports
- Consolidate `ONTOLOGY-INTEGRATION-TEST-*.md` into single `/one/events/backend-integration-tests.md`

**Infer 12**: Merge query documentation
- Consolidate `QUERY_ONTOLOGY.md`, `QUERIES_ONTOLOGY_COMPLETE.md`, `ONTOLOGY_QUERIES_EXAMPLE.md`
- Create single `/one/connections/api/queries-guide.md`

**Infer 13**: Consolidate structure documentation
- Merge `ONTOLOGY-FILE-STRUCTURE.md`, `PERFECT-ONTOLOGY-STRUCTURE.md`, `BACKEND-STRUCTURE.md`
- Create single `/one/things/plans/backend-structure.md`

**Infer 14**: Audit ontology definitions
- Review all files in `convex/ontologies/*.json`
- Verify they're correctly referenced
- Move or keep based on usage

**Infer 15**: Review service layer
- Audit each file in `convex/services/`
- Ensure 100% ontology-aligned
- Document patterns

**Infer 16**: Audit types
- Review `convex/types/ontology.ts`
- Verify auto-generation works
- Document type generation process

**Infer 17**: Assess examples
- Review `backend/examples/`
- Move to `/one/knowledge/examples/`

**Infer 18**: Evaluate disabled tests
- Decide: re-enable, delete, or archive
- Update `_tests_disabled/README.md` with decisions

**Infer 19**: Review lib utilities
- Document each utility
- Determine if needed or obsolete

**Infer 20**: Plan deletion candidates
- List all files to delete
- Verify no dependencies

### Phase 3: REORGANIZATION (Infer 21-40)

**Infer 21-25**: Move documentation to `/one/`
- Create target directories in `/one/things/`, `/one/events/`, `/one/connections/`
- Move files per classification matrix

**Infer 26-30**: Move examples to `/one/knowledge/`
- Transfer `backend/examples/` content
- Create index

**Infer 31-35**: Clean up backend root
- Delete moved files from `/backend/`
- Verify no broken references

**Infer 36-40**: Update all references
- Update links in remaining files
- Verify docs build correctly
- Test all cross-references

### Phase 4: CLEANUP (Infer 41-50)

**Infer 41**: Delete disabled tests
- Remove `backend/_tests_disabled/` directory
- Verify no other references

**Infer 42**: Remove duplicate files
- Delete consolidated files
- Create deprecation notices in `/one/events/`

**Infer 43**: Update backend README
- Reflect new documentation structure
- Point to `/one/` for detailed guides

**Infer 44**: Create index in `/one/things/`
- List all backend-related documentation
- Organize by dimension

**Infer 45**: Validate 6-dimension compliance
- Run ontology validator
- Confirm all tables present and properly indexed
- Verify schema matches specification

### Phase 5: VERIFICATION (Infer 51-60)

**Infer 51**: Test all imports
- Verify no broken imports in backend code
- Check TypeScript compilation

**Infer 52**: Validate documentation links
- Test all markdown links work
- Verify `/one/` references valid

**Infer 53**: Review convex/schema.ts
- Ensure all 6 dimensions present
- Check indexes match specification
- Verify type unions correct

**Infer 54**: Test convex operations
- Run sample queries
- Run sample mutations
- Verify auth flows

**Infer 55**: Audit file permissions
- Ensure secrets properly excluded (`.env.local` in `.gitignore`)
- Check all source files readable

**Infer 56-60**: Final QA
- Full build test
- Type checking
- Documentation completeness check
- Manual review of organized structure

---

## Expected Outcome

### Before
```
/backend/
├── 50+ markdown files (scattered, duplicated)
├── README.md (outdated - says "4-table" instead of 6-dimension)
├── convex/
├── lib/
├── test/
├── _tests_disabled/
└── examples/
```

### After
```
/backend/
├── README.md (updated - points to /one/)
├── convex/ (clean, well-organized)
├── lib/ (focused utilities only)
├── test/ (active tests only)
├── scripts/
└── package.json

/one/
├── things/plans/
│   ├── backend-ontology-conformance.md (this file)
│   ├── backend-structure.md (merged docs)
│   └── implementation/
│       └── backend-guide.md
├── connections/api/
│   ├── queries-guide.md (consolidated)
│   └── mutations-guide.md
├── events/
│   ├── backend-integration-tests.md
│   ├── backend-structure-analysis.md
│   ├── testing-summary.md
│   └── backend-structure-summary.txt
├── knowledge/
│   └── examples/
│       ├── complete-newsletter-example/
│       └── ontology-types-usage.ts
└── people/
    └── backend-roles.md (auth/people dimension)
```

---

## Success Criteria

✅ **Every backend file mapped** to 6-dimension ontology
✅ **Zero duplicates** - consolidated or deleted
✅ **No scattered documentation** - all in `/one/`
✅ **TypeScript compilation** - zero errors
✅ **All tests passing** - or archived
✅ **Schema validation** - 6 dimensions present + indexed
✅ **Documentation links** - all working
✅ **Backend README** - updated to reflect new structure

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Broken imports | Run TypeScript check after each move |
| Lost documentation | Keep originals until verified in new location |
| Schema changes | Don't touch schema.ts - only organize docs |
| Test failures | Archive disabled tests before deleting |
| Link breaks | Use grep to find all references before moving |

---

## Commands to Execute

```bash
# Phase 1: Audit
grep -r "THINGS\|CONNECTIONS\|EVENTS\|GROUPS\|PEOPLE\|KNOWLEDGE" /backend --include="*.md"

# Phase 3: Move documentation
mkdir -p /one/things/plans/
mkdir -p /one/connections/api/
mkdir -p /one/events/
mv /backend/BACKEND-STRUCTURE.md /one/things/plans/

# Phase 4: Delete duplicates
rm /backend/PERFECT-ONTOLOGY-STRUCTURE.md
rm /backend/ONTOLOGY-FILE-STRUCTURE.md

# Phase 5: Verify
cd /backend && npx tsc --noEmit
```

---

## Next Steps

1. Review this plan
2. Approve high-level approach
3. Execute Phase 1 (Audit) - Infer 1-10
4. Generate detailed file manifest
5. Begin consolidation (Infer 11-20)

**Status**: Ready for execution
**Owner**: Agent-clean / Agent-backend
**Timeline**: 100 inferences (estimated 5-10 hours of focused work)

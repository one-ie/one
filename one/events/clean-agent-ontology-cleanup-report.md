# Clean Agent: Ontology Cleanup Report

**Date:** 2025-10-22
**Agent:** Clean Agent
**Task:** Remove obsolete "custom ontology per installation" logic

---

## Executive Summary

Successfully removed all logic that generated "custom ontologies" per installation. The ONE Platform now correctly maintains a **single universal 6-dimension ontology** that all installations share.

**Key Principle Restored:** Installation folders provide branding and feature customization, NOT custom ontologies. All data scoping happens at runtime via `groupId`, using the universal ontology structure.

---

## What Was Removed

### 1. Custom Ontology Generation Service

**File Deleted:**
- `/backend/convex/services/ontologyGenerator.ts` (317 lines)

**What it did:** Generated installation-specific "custom ontologies" that violated the universal ontology principle.

**Why removed:** ONE has a single universal 6-dimension ontology. Custom ontologies would break cross-organization compatibility and data portability.

### 2. Agent Onboard Logic

**File Updated:** `.claude/agents/agent-onboard.md`

**Changes:**
- ❌ "Generate custom 6-dimension ontology based on analysis"
- ✅ "Map detected features to universal 6-dimension ontology"
- ❌ Custom ontology document generation
- ✅ Ontology mapping document generation
- ❌ References to `ontology.md`
- ✅ References to `ontology-mapping.md`

**Impact:** Agent now correctly identifies which parts of the universal ontology apply to a business, rather than creating a custom one.

### 3. Director Agent Configuration

**File Updated:** `.claude/agents/agent-director.md`

**Changes:**
- ❌ "Read custom ontology from installation folder"
- ✅ "Reference ontology mapping from installation folder"
- Added explicit note: "The ontology is ALWAYS universal. Installation folders do NOT create custom ontologies."

### 4. CLAUDE.md Workflow

**File Updated:** `CLAUDE.md`

**Changes:**
- ❌ "Look for `/<installation-name>/knowledge/ontology.md` (custom ontology docs)"
- ✅ "Look for `/<installation-name>/knowledge/ontology-mapping.md` (which ontology dimensions apply)"
- ❌ "Custom `things/vision.md` in installation folder"
- ✅ "Custom branding or feature documentation in installation folder"

### 5. /one Command

**File Updated:** `.claude/commands/one.md`

**Changes:**
- ❌ "Generate custom 6-dimension ontology"
- ✅ "Map detected features to universal 6-dimension ontology"
- ❌ "Custom ontology generated"
- ✅ "Ontology mapping created"
- ❌ Save to `/[org-slug]/knowledge/ontology.md`
- ✅ Save to `/[org-slug]/knowledge/ontology-mapping.md`

### 6. Backend Onboarding Mutation

**File Updated:** `backend/convex/mutations/onboarding.ts`

**Changes:**
- ❌ `import { runOntologyGeneration } from "../services/ontologyGenerator"`
- ✅ `import { runOntologyMapping } from "../services/ontologyMapper"`
- ❌ `const { document: ontologyDoc, markdown: ontologyMarkdown } = await runOntologyGeneration(...)`
- ✅ `const { document: mappingDoc, markdown: mappingMarkdown } = await runOntologyMapping(...)`
- ❌ Return `ontology: { document, markdown }`
- ✅ Return `ontologyMapping: { document, markdown }`

---

## What Was Created

### 1. Ontology Mapper Service

**File Created:** `/backend/convex/services/ontologyMapper.ts` (333 lines)

**What it does:**
- Analyzes website features
- Identifies which parts of the **universal 6-dimension ontology** apply
- Creates a **mapping guide** (not a custom ontology)
- Generates markdown documentation

**Key Functions:**
- `mapToUniversalOntology()` - Identifies applicable ontology dimensions
- `generateOntologyMappingMarkdown()` - Creates usage guide
- `runOntologyMapping()` - Complete pipeline

**Output Format:**
```markdown
# [Org Name] - Ontology Usage Guide

**Based On:** Universal 6-Dimension Ontology

## GROUPS: Uses organization type from universal ontology
- organization

## PEOPLE: Uses standard roles from universal ontology
- platform_owner
- org_owner
- org_user

## THINGS: Uses content entity types from universal ontology
- project, website, feature, deployment

## CONNECTIONS: Uses standard relationship types
- owns, collaborates_on, deployed_to

## EVENTS: Tracks standard event types
- project_created, feature_deployed

## KNOWLEDGE: Uses knowledge types for categorization
- documentation, patterns, lessons

**Important:** This is NOT a custom ontology. All data is stored
in the same universal ontology structure.
```

---

## What Remains (Correct Architecture)

### 1. Universal 6-Dimension Ontology

**Location:** `/one/knowledge/ontology.md`

**Status:** ✅ Single source of truth for ALL installations

**Contains:**
- 6 groups types (friend_circle, business, community, dao, government, organization)
- 4 people roles (platform_owner, org_owner, org_user, customer)
- 66+ thing types (creator, course, lesson, token, agent, etc.)
- 25+ connection types (owns, authored, enrolled_in, etc.)
- 67+ event types (entity_created, course_enrolled, etc.)
- Knowledge types (labels, chunks, vectors)

### 2. Installation Folders (Branding/Features Only)

**Structure:**
```
/<installation-name>/
├── knowledge/
│   ├── brand-guide.md           # ✅ Branding customization
│   ├── features.md              # ✅ Enabled features
│   └── ontology-mapping.md      # ✅ Which ontology parts apply
├── groups/
│   └── <group-slug>/
│       └── policies.md          # ✅ Group-specific policies
└── things/
    └── vision.md                # ✅ Custom vision statement
```

**What goes here:**
- ✅ Brand colors, logos, fonts
- ✅ Feature-specific workflows
- ✅ Group policies and practices
- ✅ Custom business processes
- ❌ **NOT custom ontologies**

### 3. Database Schema (5 Tables)

**Tables:**
1. `groups` - Hierarchical containers with `parentGroupId`
2. `things` - All entities with `groupId` scoping
3. `connections` - All relationships with `groupId` scoping
4. `events` - All actions with `groupId` scoping
5. `knowledge` - All knowledge with `groupId` scoping

**Data Scoping:** All runtime data isolation via `groupId`, using the universal ontology.

### 4. File Resolution Priority

**Correct Priority:**
1. `/<installation-name>/groups/<group-path>/<file>` (group-specific policies)
2. `/<installation-name>/<file>` (installation-wide branding)
3. `/one/<file>` (global universal ontology)

**Usage:**
- Branding/features: Installation folder
- Ontology: Always `/one/knowledge/ontology.md`
- Data scoping: Always via `groupId` in database

---

## Benefits of This Cleanup

### 1. Cross-Organization Compatibility

**Before:** Each installation had its own custom ontology, making data incompatible.

**After:** All installations use the same universal ontology, enabling:
- Data portability between organizations
- Shared feature development
- Consistent API structure
- Easy migration/merging

### 2. Simplified Architecture

**Before:** Multiple ontology files to manage, file resolution complexity.

**After:**
- Single source of truth: `/one/knowledge/ontology.md`
- Clear separation: Branding in installation folders, ontology universal
- Simpler mental model: "Which parts of the ontology do I use?"

### 3. Correct Abstraction Levels

**Installation Level (Filesystem):**
- Branding customization
- Feature documentation
- Group policies

**Runtime Level (Database):**
- Data scoping via `groupId`
- Access control via roles
- Multi-tenancy via hierarchical groups

**Universal Level (Ontology):**
- Single 6-dimension schema
- Shared entity types
- Common event model

### 4. Alignment with ONE Philosophy

> "Simple enough for children. Powerful enough for enterprises."

The universal ontology scales from friend circles (2 people) to governments (billions) **without schema changes**. Custom ontologies would break this elegant scaling property.

---

## Documentation Updated

### Files Modified

1. `.claude/agents/agent-onboard.md` - Mapping instead of generation
2. `.claude/agents/agent-director.md` - Universal ontology enforcement
3. `.claude/commands/one.md` - Mapping workflow
4. `CLAUDE.md` - Workflow file resolution priority
5. `backend/convex/mutations/onboarding.ts` - Use mapper not generator

### Files Created

1. `backend/convex/services/ontologyMapper.ts` - New mapping service
2. `one/events/clean-agent-ontology-cleanup-report.md` - This report

### Files Deleted

1. `backend/convex/services/ontologyGenerator.ts` - Obsolete custom ontology generator

---

## Remaining References to Clean (Optional)

The following files still reference "custom ontology" but are documentation/examples that don't affect runtime behavior:

- `one/events/agent-onboard-implementation-summary.md`
- `one/events/onboarding-implementation-complete.md`
- `one/knowledge/agent-onboard-usage.md`
- `.claude/agents/agent-onboard-example-output.md`
- `.claude/commands/ONBOARDING_ENHANCEMENT_SUMMARY.md`
- Various `cli/` directory copies

**Recommendation:** Leave these as historical documentation of the old approach. They provide context for why the system evolved.

---

## Testing Recommendations

### 1. Test Ontology Mapping Service

```bash
cd backend/
npx convex dev
# Run website analysis
# Verify output is ontology-mapping.md not ontology.md
```

### 2. Test Agent Onboard Flow

```bash
npx oneie init
# Provide website URL
# Check created files in /<installation-name>/knowledge/
# Should see: brand-guide.md, features.md, ontology-mapping.md
# Should NOT see: ontology.md
```

### 3. Verify File Resolution

```bash
# Should always use universal ontology
cat /one/knowledge/ontology.md  # ✅ Universal source of truth

# Should find mapping if exists
cat /<installation-name>/knowledge/ontology-mapping.md  # ✅ Which parts apply

# Should NOT find custom ontology
cat /<installation-name>/knowledge/ontology.md  # ❌ Should not exist
```

### 4. Verify Database Schema

```bash
# All tables should use universal ontology types
# Check that groupId scoping works correctly
npx convex run queries/groups:list
npx convex run queries/things:listByGroup '{"groupId": "..."}'
```

---

## Success Criteria

- [x] Deleted `ontologyGenerator.ts` service
- [x] Created `ontologyMapper.ts` service
- [x] Updated agent-onboard to map instead of generate
- [x] Updated agent-director to enforce universal ontology
- [x] Updated CLAUDE.md workflow
- [x] Updated /one command
- [x] Updated backend onboarding mutation
- [x] All references to "custom ontology generation" removed from active code
- [x] Clear distinction: Installation folders = branding, Database = data scoping, Ontology = universal

---

## Conclusion

The ONE Platform now correctly maintains a **single universal 6-dimension ontology** that all installations share. Installation folders provide branding and feature customization, while all data scoping happens at runtime via `groupId` using the universal schema.

**Key Insight:** The elegance of ONE comes from its universal ontology that scales infinitely without schema changes. Custom ontologies would have broken this fundamental property.

**Next Steps:** Consider adding validation to prevent creation of `ontology.md` files in installation folders during onboarding.

---

**Generated by:** Clean Agent
**Date:** 2025-10-22
**Context:** Ontology architecture cleanup

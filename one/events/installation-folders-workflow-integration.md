# Installation Folders Workflow Integration

**Status:** ✅ Complete
**Version:** 1.0.0
**Date:** 2025-10-16
**Type:** Workflow Enhancement

## Summary

Successfully integrated installation folder architecture into the complete ONE Platform workflow system. All agents now support hierarchical file resolution with installation-specific and group-specific documentation.

## Changes Made

### 1. CLAUDE.md - Development Workflow Updated

**Changed:** Development Workflow from 6-Phase to **7-Phase Process**

**Phase 0 Added: CHECK INSTALLATION FOLDER**

```bash
# New first step before all development work
if [ -d "/${INSTALLATION_NAME}" ]; then
  echo "✅ Installation folder detected"
  # Use hierarchical file resolution
fi
```

**File Resolution Priority Documented:**
1. `/<installation-name>/groups/<group-path>/<file>` (group-specific)
2. `/<installation-name>/<file>` (installation-wide)
3. `/one/<file>` (global template)

**Updated Phases:**
- **Phase 0:** Check installation folder (NEW)
- **Phase 1:** Understand (with installation folder awareness)
- **Phase 2:** Map to ontology (with group-specific docs check)
- **Phase 3:** Design services
- **Phase 4:** Implement backend
- **Phase 5:** Build frontend
- **Phase 6:** Test & document (with installation-specific documentation)

**Key Additions:**
- Check for custom `things/vision.md` in installation folder
- Look for group-specific `groups/<group-name>/` docs
- Decide if feature needs installation-specific documentation
- Test file resolution with installation folder

### 2. .claude/agents/agent-director.md - Ontology Guardian Updated

**Added: Installation Folders Section**

**Critical check before ALL validation:**
```bash
if [ -n "$INSTALLATION_NAME" ] && [ -d "/${INSTALLATION_NAME}" ]; then
  # Installation folder detected - use hierarchical file resolution
fi
```

**Key Questions When Validating:**
- Does this feature need installation-specific documentation?
- Are there group-specific requirements in `/<installation-name>/groups/`?
- Should the plan be documented in global `/one/` or installation folder?

**Usage Guidelines:**
- **Global features** → Document in `/one/things/plans/`
- **Installation-specific features** → Document in `/<installation-name>/things/plans/`
- **Group-specific features** → Document in `/<installation-name>/groups/<group-slug>/`

### 3. .claude/agents/agent-documenter.md - Documentation Writer Updated

**Added: Installation Folders Section**

**Decision Logic for Documentation Placement:**

```
Is feature used by ALL installations?
  → YES: Write to /one/things/features/ (global)
  → NO: Installation-specific?
    → YES: Write to /<installation-name>/things/features/
    → NO: Group-specific?
      → YES: Write to /<installation-name>/groups/<group-slug>/
```

**Scope Indicators:**
- **Global:** Feature modifies core schema, adds new thing types, used by all
- **Installation:** Feature uses custom properties, org-specific workflow
- **Group:** Feature only applies to one team/department

**Updated Workflow:**
1. Determine scope (global/installation/group)
2. Write to appropriate location
3. Add scope metadata to documentation
4. Note installation folder in knowledge entries

**Updated Template:**
```markdown
# Feature N-M: [Name]

**Scope:** [Global | Installation: <name> | Group: <installation>/<group-slug>]
```

## Integration Points

### 1. File Resolution Throughout Workflow

**All agents now follow hierarchical resolution:**

```typescript
async function resolveFile(relativePath: string, groupId?: Id<"groups">) {
  const installationName = process.env.INSTALLATION_NAME;

  if (groupId && installationName) {
    // 1. Check group-specific
    const groupPath = await getGroupPath(groupId);
    const groupFile = `/${installationName}/groups/${groupPath}/${relativePath}`;
    if (fileExists(groupFile)) return groupFile;

    // 2. Walk up parent groups
    // ... parent resolution logic
  }

  if (installationName) {
    // 3. Check installation root
    const installFile = `/${installationName}/${relativePath}`;
    if (fileExists(installFile)) return installFile;
  }

  // 4. Global fallback
  return `/one/${relativePath}`;
}
```

### 2. Documentation Routing

**Agents now route documentation based on feature scope:**

| Feature Type | Documentation Location | Example |
|--------------|----------------------|---------|
| Core platform feature | `/one/things/features/` | Entity CRUD operations |
| Installation-specific | `/<installation>/things/features/` | Custom approval workflow |
| Group-specific | `/<installation>/groups/<slug>/` | Engineering team practices |

### 3. Ontology Validation

**Director validates against installation context:**

```typescript
// Before validation
const installationName = process.env.INSTALLATION_NAME;
const ontologyDocs = installationName
  ? await resolveFile('knowledge/ontology.md', groupId)
  : '/one/knowledge/ontology.md';

// Load installation-specific ontology extensions
const customRules = installationName
  ? await resolveFile('knowledge/rules.md', groupId)
  : null;
```

### 4. Knowledge Dimension Updates

**Documenter creates installation-aware knowledge entries:**

```typescript
await ctx.db.insert("knowledge", {
  knowledgeType: "document",
  text: documentationMarkdown,
  labels: [
    "feature:name",
    installationName ? `installation:${installationName}` : "scope:global",
    groupId ? `group:${groupSlug}` : null,
  ].filter(Boolean),
  metadata: {
    scope: installationName ? "installation" : "global",
    installationName: installationName || null,
    groupId: groupId || null,
  }
});
```

## Workflow Examples

### Example 1: Global Feature (Course Platform)

```
1. Agent-Director validates idea
   - Reads /one/knowledge/ontology.md (no installation override)
   - Creates plan in /one/things/plans/2-course-platform.md

2. Specialist implements feature
   - Reads /one/connections/patterns.md
   - Implements using global patterns

3. Agent-Documenter writes docs
   - Determines scope: Global (used by all installations)
   - Writes to /one/things/features/2-1-course-crud.md
   - Labels: ["scope:global", "feature:course_crud"]
```

### Example 2: Installation-Specific Feature (Acme Custom Approval)

```
1. Agent-Director validates idea
   - Reads /acme/knowledge/rules.md (custom approval rules)
   - Creates plan in /acme/things/plans/custom-approval-flow.md

2. Specialist implements feature
   - Reads /acme/connections/patterns.md (custom patterns)
   - Implements using Acme-specific workflow

3. Agent-Documenter writes docs
   - Determines scope: Installation-specific (Acme only)
   - Writes to /acme/things/features/custom-approval.md
   - Labels: ["installation:acme", "feature:approval_flow"]
```

### Example 3: Group-Specific Feature (Engineering Team Sprint Guide)

```
1. Agent-Director validates idea
   - Reads /acme/groups/engineering/practices.md
   - Creates plan in /acme/groups/engineering/sprint-process.md

2. Specialist implements feature
   - Reads /acme/groups/engineering/workflows/
   - Implements engineering-specific process

3. Agent-Documenter writes docs
   - Determines scope: Group-specific (engineering team only)
   - Writes to /acme/groups/engineering/sprint-guide.md
   - Labels: ["installation:acme", "group:engineering", "topic:agile"]
```

## Agent Coordination

### Event-Driven Coordination with Installation Context

All events now include installation context:

```typescript
// Director emits idea_validated
{
  type: "idea_validated",
  actorId: directorId,
  targetId: ideaId,
  metadata: {
    installationName: "acme" || null,
    groupId: engineeringGroupId || null,
    scope: "installation" | "group" | "global",
    planLocation: "/acme/things/plans/custom-feature.md"
  }
}

// Documenter emits documentation_complete
{
  type: "documentation_complete",
  actorId: documenterId,
  targetId: featureId,
  metadata: {
    installationName: "acme" || null,
    groupId: engineeringGroupId || null,
    documentPath: "/acme/things/features/custom-feature.md",
    scope: "installation"
  }
}
```

## Migration Guide

### For Existing Agents

**Before (Old Workflow):**
```typescript
// Agent reads global docs only
const ontologyDocs = '/one/knowledge/ontology.md';
const rulesDoc = '/one/knowledge/rules.md';
```

**After (New Workflow):**
```typescript
// Agent uses hierarchical resolution
const ontologyDocs = await resolveFile('knowledge/ontology.md', groupId);
const rulesDoc = await resolveFile('knowledge/rules.md', groupId);
```

### For New Features

**Always ask these questions:**

1. **Is this feature global or installation-specific?**
   - Global: Used by all installations → Document in `/one/`
   - Installation: Specific to one org → Document in `/<installation>/`
   - Group: Specific to one team → Document in `/<installation>/groups/<slug>/`

2. **Are there existing installation overrides?**
   - Check `/<installation>/knowledge/` for custom rules
   - Check `/<installation>/groups/<slug>/` for team practices

3. **Should this create new installation docs?**
   - If feature adds new workflow, create guide in installation folder
   - If feature uses custom properties, document in installation folder

## Testing

### Test Installation Folder Integration

```bash
# 1. Create test installation
npx oneie init
# Enter: Test Organization, test-org

# 2. Create custom vision
echo "# Test Org Vision" > /test-org/things/vision.md

# 3. Test file resolution
# Should show Test Org Vision, not global
cat $(resolveFile "things/vision.md")

# 4. Create group-specific doc
mkdir -p /test-org/groups/engineering
echo "# Engineering Practices" > /test-org/groups/engineering/practices.md

# 5. Test group resolution
# Should show Engineering Practices
cat $(resolveFile "practices.md" --group="engineering")
```

## Success Criteria

- ✅ **7-phase workflow documented** in CLAUDE.md
- ✅ **Agent-Director aware** of installation folders
- ✅ **Agent-Documenter routes** docs based on scope
- ✅ **File resolution hierarchical** across all agents
- ✅ **Events include** installation context
- ✅ **Knowledge entries** tagged with scope
- ✅ **Backward compatible** with non-installation setups
- ✅ **Documentation complete** for all workflow changes

## Benefits

### 1. Context-Aware Documentation

Agents now understand the difference between:
- Platform-wide features (everyone uses)
- Organization-specific features (one company uses)
- Team-specific features (one department uses)

### 2. Proper Documentation Routing

Documentation lands in the right place automatically:
- No more cluttering `/one/` with org-specific docs
- Group teams can manage their own documentation
- Global templates remain clean and universal

### 3. Hierarchical Knowledge

Knowledge dimension now captures installation hierarchy:
- Global knowledge (searchable by all)
- Installation knowledge (searchable by org members)
- Group knowledge (searchable by team members)

### 4. Flexible Customization

Organizations can:
- Override global vision with their own
- Add custom rules in their installation folder
- Document team-specific practices in group folders
- All while maintaining global platform coherence

## Future Enhancements

### Phase 2: Multi-Installation Agent Coordination

Enable agents to work across multiple installations:

```typescript
// Query features across installations
const allFeatures = await queryKnowledge({
  labels: ["feature:*"],
  installations: ["acme", "tesla", "google"],
  scope: "global" // Only show global features
});
```

### Phase 3: Installation-Specific Agent Customization

Allow installations to customize agent behavior:

```yaml
# /acme/.claude/agents/agent-director.md
# Custom director rules for Acme
- Require legal approval for all features
- Enforce HIPAA compliance checks
- Route medical features to healthcare specialist
```

### Phase 4: Cross-Installation Learning

Enable agents to learn patterns across installations:

```typescript
// Find similar patterns across installations
const similarPatterns = await vectorSearch({
  query: "approval workflow",
  installations: ["acme", "tesla"],
  shareAcrossInstallations: true
});
```

## Files Modified

1. `/Users/toc/Server/ONE/CLAUDE.md`
   - Added Phase 0: CHECK INSTALLATION FOLDER
   - Updated all workflow phases with installation awareness
   - Added installation folder priority to "Critical Reading"

2. `/Users/toc/Server/ONE/.claude/agents/agent-director.md`
   - Added Installation Folders section
   - Updated Core Responsibility with "Groups" terminology
   - Added file resolution priority guidelines

3. `/Users/toc/Server/ONE/.claude/agents/agent-documenter.md`
   - Added Installation Folders section with decision logic
   - Updated Decision 1 with scope determination
   - Updated documentation locations for installation-aware paths
   - Updated feature documentation template with Scope field

## Related Documentation

- **Implementation Plan:** `/one/things/plans/group-folder-multi-tenancy.md`
- **Installation Guide:** `/one/knowledge/installation-folders.md`
- **CLI Usage:** `cli/src/commands/init.ts`
- **File Resolver:** `cli/src/utils/file-resolver.ts`
- **Frontend Integration:** `web/src/lib/utils/file-resolver.ts`

---

**Status: ✅ Workflow Integration Complete**

All agents now support installation folders with hierarchical file resolution. The 7-phase workflow ensures installation-specific customization while maintaining global platform coherence.

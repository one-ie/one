---
title: "CLI Updated: /web Directory & Command Clarity"
date: 2025-10-18
description: "ONE CLI now correctly creates /web directories and clearly separates full setup from installation folder initialization"
author: "ONE Platform Team"
type: "feature_update"
tags: ["cli", "architecture", "multi-tenancy", "dx"]
category: "infrastructure"
repo: "cli"
draft: false
---

## What Changed

The ONE CLI has been updated to align with the documented architecture and provide a clearer distinction between full project setup and installation folder initialization.

### Directory Structure Fix: `/frontend` → `/web`

**Before (Incorrect):**
```bash
npx oneie
# Created: /frontend directory
# Cloned from: github.com/one-ie/frontend
```

**After (Correct):**
```bash
npx oneie
# Creates: /web directory
# Clones from: github.com/one-ie/web
```

**Why This Matters:**

The documented architecture always specified `/web/` as the correct directory name:

```
/
├── one/                    # Global ontology
├── web/                    # Astro + React application ✅
├── backend/                # Convex backend
├── <installation-name>/    # Installation folder
```

This change ensures the CLI behavior matches the documentation, preventing confusion and maintaining consistency across all documentation, code examples, and deployment scripts.

---

## Command Separation: Full Setup vs. Installation Folder

### Before: Ambiguous Command

Previously, `npx oneie init` was documented as doing everything (syncing ontology + creating installation folder + cloning web app), which didn't match the actual implementation.

### After: Clear Separation

Two distinct commands with clear purposes:

#### 1. `npx oneie` - Full Project Bootstrap

**Purpose:** First-time setup for new projects

**What it does:**
1. ✅ Prompts for user profile (name, email)
2. ✅ Prompts for organization (name, website)
3. ✅ Syncs global ontology (`/one/` - 100+ files)
4. ✅ Syncs AI agent definitions (`.claude/`)
5. ✅ Optionally clones web repository (`/web/`)
6. ✅ Optionally clones third-party docs (`/docs/`)

**Creates:**
- `/one/` - Global ontology templates
- `/web/` - Astro 5 + React 19 application
- `/docs/` - Third-party documentation (optional)
- `.claude/` - AI configuration
- User profile in `one/people/`
- Organization profile in `one/people/`

**Use when:** Starting a brand new ONE project

---

#### 2. `npx oneie init` - Installation Folder Only

**Purpose:** Add multi-tenancy to existing projects

**What it does:**
1. ✅ Prompts for organization name
2. ✅ Prompts for installation identifier (e.g., "acme")
3. ✅ Creates installation folder structure
4. ✅ Updates `.env.local` with `INSTALLATION_NAME`
5. ✅ Optionally updates `.gitignore`

**Creates:**
- `/<installation-name>/` - Installation folder
  - `groups/` - Hierarchical group docs
  - `people/` - People profiles
  - `things/` - Custom entities
  - `connections/` - Custom relationships
  - `events/` - Custom events
  - `knowledge/` - Custom knowledge
- `.env.local` - Updated with installation name

**Use when:** Adding multi-tenancy to an existing ONE project

---

## Installation Folder Architecture

### What is an Installation Folder?

An installation folder is a **top-level directory** that provides organization-specific customization and overrides global templates.

```
/one/                 # Global templates (source of truth)
/acme/                # Your private customizations
  ├── groups/         # Hierarchical group docs
  │   ├── engineering/
  │   │   ├── frontend/
  │   │   │   └── practices.md  # Most specific
  │   │   └── backend/
  │   └── marketing/
  ├── people/
  ├── things/
  ├── connections/
  ├── events/
  └── knowledge/
/web/                 # Web application
/backend/             # Convex backend
```

### File Resolution Hierarchy

When loading documentation or configuration, the system checks in this order:

1. **Most specific group** - `/acme/groups/engineering/frontend/practices.md` ✅
2. **Parent group** - `/acme/groups/engineering/practices.md`
3. **Installation root** - `/acme/practices.md`
4. **Global fallback** - `/one/practices.md`

This hierarchical resolution enables powerful customization while maintaining global consistency.

### Multi-Tenancy Built-In

**Key Distinction:**

- **Installation folder** = Filesystem customization per organization
- **Database groups** = Runtime data isolation per group (via `groupId`)

One installation can serve **many database groups**:

```
Installation: /acme/
├── Database Groups:
│   ├── acme-engineering (groupId: g1, parentGroupId: null)
│   ├── acme-frontend (groupId: g2, parentGroupId: g1)
│   ├── acme-backend (groupId: g3, parentGroupId: g1)
│   └── acme-marketing (groupId: g4, parentGroupId: null)
│
└── Filesystem Docs:
    ├── /acme/groups/engineering/practices.md (applies to g1, g2, g3)
    ├── /acme/groups/engineering/frontend/sprint-guide.md (applies to g2 only)
    └── /acme/groups/marketing/campaign-playbook.md (applies to g4 only)
```

**Benefits:**

- **Private Documentation** - Keep internal docs separate from open-source templates
- **Hierarchical Inheritance** - Subgroups inherit parent group documentation
- **Git Flexibility** - Exclude installation folders or use separate repos
- **AI-Ready** - Complete context for offline AI operation

---

## Technical Implementation

### Files Changed

**CLI Source:**

1. `cli/src/clone-frontend.ts` → `cli/src/clone-web.ts`
   - Function renamed: `cloneFrontend` → `cloneWeb`
   - Target directory: `"frontend"` → `"web"`
   - Repository URL: `one-ie/frontend` → `one-ie/web`

2. `cli/src/index.ts`
   - Updated import and function calls
   - Updated console messages: `"cd frontend &&"` → `"cd web &&"`
   - Updated project structure display

3. `cli/README.md`
   - Updated all command examples
   - Clarified `npx oneie` vs `npx oneie init`
   - Updated test coverage descriptions

4. `cli/CLAUDE.md`
   - Updated "Frontend Development" → "Web Development"
   - Updated integration flow descriptions

5. `one/things/cli/cli.md`
   - Complete rewrite of usage section
   - Clear distinction between commands
   - Accurate interactive prompt examples

**Build Artifacts:**

- Rebuilt TypeScript (`cli/dist/`)
- Removed old `clone-frontend.*` files
- Verified CLI execution

### Version

This update will be released in **CLI v3.3.7** (next patch release)

---

## Migration Guide

### For Existing Users

**If you already have `/frontend` directory:**

No action required! Your existing setup will continue to work. The change only affects new projects created with `npx oneie`.

If you want to align with the new structure:

```bash
# Optional: Rename directory
mv frontend web

# Update any references in your scripts/docs
sed -i 's/frontend/web/g' package.json
```

### For New Users

Just follow the updated commands:

```bash
# Full setup (includes web app)
npx oneie

# Or add installation folder to existing project
npx oneie init
```

---

## Benefits

### 1. Architectural Consistency

- CLI behavior matches documentation
- All examples use `/web/` directory
- Deployment scripts reference correct paths

### 2. Clear Command Semantics

- `npx oneie` = "bootstrap everything"
- `npx oneie init` = "add installation folder"
- No more confusion about what each command does

### 3. Multi-Tenancy Ready

- Installation folders enable enterprise-grade multi-tenancy
- Hierarchical groups with inherited documentation
- Private customizations without forking

### 4. Developer Experience

- Predictable directory structure
- Consistent across all documentation
- AI agents can navigate codebase reliably

---

## Related Documentation

**Updated Files:**
- [CLI Documentation](https://github.com/one-ie/one/blob/main/one/things/cli/cli.md)
- [Installation Folder Architecture](https://github.com/one-ie/one/blob/main/one/things/plans/group-folder-multi-tenancy.md)
- [CLI README](https://github.com/one-ie/cli/blob/main/README.md)

**Learn More:**
- [6-Dimension Ontology](https://github.com/one-ie/one/blob/main/one/knowledge/ontology.md)
- [Development Workflow](https://github.com/one-ie/one/blob/main/one/connections/workflow.md)

---

## Summary

This update ensures the ONE CLI provides a consistent, predictable experience that aligns with the documented architecture:

**Directory Structure:**
- ✅ Creates `/web/` (not `/frontend/`)
- ✅ Clones from `one-ie/web` repository
- ✅ Matches all documentation examples

**Command Clarity:**
- ✅ `npx oneie` - Full project bootstrap
- ✅ `npx oneie init` - Installation folder only
- ✅ Clear separation of concerns

**Multi-Tenancy:**
- ✅ Installation folder architecture
- ✅ Hierarchical file resolution
- ✅ Database + filesystem sync

**Developer Experience:**
- ✅ Predictable structure
- ✅ AI-friendly navigation
- ✅ Enterprise-ready from day one

The ONE CLI continues to make it **easier for AI agents to build features** than humans. When that's true, we've succeeded.

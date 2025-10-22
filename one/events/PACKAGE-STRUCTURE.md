# ONE Platform Package Structure

**Version:** 3.6.0
**Date:** 2025-01-22

## Three Distribution Methods

### 1. CLI Package (npm: `oneie`)

**Purpose:** Initialization tool for creating installation folders

**What's Included:**
```
oneie@3.6.0 (2.8 MB, 653 files)
├── dist/                    # Compiled TypeScript
├── one/                     # Ontology documentation (41 files)
│   ├── connections/
│   ├── events/
│   ├── groups/
│   ├── knowledge/
│   ├── people/
│   └── things/
├── .claude/
│   ├── agents/             # AI agent definitions
│   └── commands/           # Slash commands
├── README.md               # Platform overview ✓
├── LICENSE.md              # Free license ✓
├── SECURITY.md             # Security policy ✓
├── TESTING-ONBOARDING.md   # Test guide ✓
├── .mcp.json               # MCP servers ✓
├── CLAUDE.md               # Claude instructions
├── AGENTS.md               # Agent coordination
└── folders.yaml            # Folder configuration
```

**Install:**
```bash
npx oneie
```

**What's NOT Included:**
- `/web` source code (too large, 50+ MB)
- `/backend` source code (separate repo)
- `/apps` examples (separate repos)

---

### 2. Web Repository (github.com/one-ie/web)

**Purpose:** Full Astro + React 19 website source code

**What's Included:**
```
web/
├── src/
│   ├── components/         # React components + shadcn/ui
│   ├── pages/              # Astro pages
│   ├── layouts/            # Page layouts
│   ├── content/            # Blog posts
│   └── styles/             # Tailwind CSS
├── dist/                   # Built site (after bun run build)
├── astro.config.mjs        # Astro configuration
├── wrangler.toml           # Cloudflare Pages config
├── wrangler.toml.example   # Customer template ✓
├── package.json
└── AGENTS.md
```

**Clone:**
```bash
git clone https://github.com/one-ie/web.git
```

**Or sync via release script:**
```bash
./scripts/release.sh patch
# Syncs web/ → apps/one/web/
```

---

### 3. Assembly Repository (github.com/one-ie/one)

**Purpose:** Complete platform with all components

**What's Included:**
```
one/
├── one/                    # Ontology docs (from root)
├── web/                    # Full web app (synced)
├── .claude/                # AI configuration (synced)
├── README.md               # Combined docs
├── CLAUDE.md
├── AGENTS.md
├── LICENSE.md
├── SECURITY.md
└── TESTING-ONBOARDING.md
```

**Clone:**
```bash
git clone https://github.com/one-ie/one.git
```

---

## What Goes Where (Release Process)

### From Root → CLI

**Files synced:**
```bash
/one/           → cli/one/
/.claude/       → cli/.claude/
/README.md      → cli/README.md
/LICENSE.md     → cli/LICENSE.md
/SECURITY.md    → cli/SECURITY.md
/CLAUDE.md      → cli/CLAUDE.md
/.mcp.json      → cli/.mcp.json
/TESTING-ONBOARDING.md → cli/TESTING-ONBOARDING.md
/web/AGENTS.md  → cli/AGENTS.md
```

**Published to npm:** All of the above (package.json `files` array)

### From Root → apps/one (Assembly)

**Files synced:**
```bash
/one/           → apps/one/one/
/web/           → apps/one/web/ (full rsync)
/.claude/       → apps/one/one/.claude/
/README.md      → apps/one/README.md
/LICENSE.md     → apps/one/one/LICENSE.md
/SECURITY.md    → apps/one/one/SECURITY.md
/CLAUDE.md      → apps/one/one/CLAUDE.md
/.mcp.json      → apps/one/one/.mcp.json
/TESTING-ONBOARDING.md → apps/one/one/TESTING-ONBOARDING.md
/web/AGENTS.md  → apps/one/one/AGENTS.md
```

**Pushed to GitHub:** All of the above

---

## Package Sizes

| Package | Size (Compressed) | Size (Unpacked) | Files |
|---------|-------------------|-----------------|-------|
| **CLI (npm)** | 2.8 MB | 11.4 MB | 653 |
| **Web (git)** | ~15 MB | ~50 MB | 1000+ |
| **Assembly (git)** | ~20 MB | ~65 MB | 1700+ |

---

## User Journeys

### Journey 1: Quick Start (CLI Only)

```bash
# Install CLI
npx oneie

# Creates installation folder
# User gets: one/, .claude/, docs
# Total: 11.4 MB
```

**Perfect for:** Users who just want to create installation folders

### Journey 2: Full Platform (Clone Assembly)

```bash
# Clone complete platform
git clone https://github.com/one-ie/one.git

# User gets: one/, web/, .claude/, docs
# Total: ~65 MB
```

**Perfect for:** Users who want everything ready to go

### Journey 3: Web Development (Clone Web)

```bash
# Clone just web app
git clone https://github.com/one-ie/web.git

# User gets: Full Astro + React site
# Total: ~50 MB
```

**Perfect for:** Users building websites only

---

## Why /web is NOT in CLI Package

**Reasons:**
1. **Size:** Web is 50+ MB, would make CLI package too large
2. **Use case:** CLI is for initialization, not development
3. **Updates:** Web changes frequently, CLI changes rarely
4. **Flexibility:** Users can use different frontend frameworks

**How users get /web:**
- Clone from github.com/one-ie/web
- Clone assembly repo (github.com/one-ie/one)
- Sync via release script

---

## Verification

### Check what's in CLI package:

```bash
cd cli
npm pack --dry-run | grep -E "README|LICENSE|SECURITY|TESTING|\.mcp"
```

**Expected output:**
```
.mcp.json             ✓
LICENSE.md            ✓
README.md             ✓
SECURITY.md           ✓
TESTING-ONBOARDING.md ✓
```

### Check what's in Assembly repo:

```bash
ls -la apps/one/
```

**Expected:**
```
one/                  ✓ (ontology docs)
web/                  ✓ (full web app)
README.md             ✓
```

---

## Release Process

### Step 1: Sync Files

```bash
./scripts/release.sh minor
```

**Syncs:**
- Root → cli/ (for npm)
- Root → apps/one/ (for github)
- web/ → apps/one/web/ (full rsync)

### Step 2: Publish CLI

```bash
cd cli
npm publish --access public
```

**Result:** `oneie@3.6.0` on npm with all docs

### Step 3: Push Assembly

```bash
cd apps/one
git push origin main
```

**Result:** Complete platform on github

---

## Customer Experience

### What customers get from `npx oneie`:

1. **CLI tool** (2.8 MB)
   - ✓ Ontology docs (one/)
   - ✓ AI agents (.claude/)
   - ✓ Core documentation
   - ✓ MCP configuration
   - ✗ Web source (they clone separately)

2. **Installation folder created:**
   - /<org-name>/knowledge/
   - /<org-name>/groups/
   - .env.local with ORG_NAME, ORG_WEBSITE, etc.

3. **Next steps:**
   - Clone web: `git clone https://github.com/one-ie/web.git`
   - Or use assembly: `git clone https://github.com/one-ie/one.git`

---

## Summary

✅ **CLI package** = Initialization tool (2.8 MB, all docs included)
✅ **Web repo** = Full website source (separate clone)
✅ **Assembly repo** = Everything together (one/, web/, .claude/)

**All core documentation** (README, LICENSE, SECURITY, TESTING-ONBOARDING, .mcp.json) **is now included in CLI package v3.6.0!**

---

**Status:** ✅ Package structure perfected for v3.6.0

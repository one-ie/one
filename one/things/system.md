# ONE CLI System Architecture

**Version:** 2.0.3
**Package:** `oneie` on npm
**Repository:** `one-ie/one` on GitHub

---

## Overview

The ONE CLI (`npx oneie`) packages the ONE Platform's 6-dimension ontology, documentation, and AI configuration into a distributable npm package that bootstraps production-ready projects in 30 seconds.

**Core Principle:** Everything AI needs to understand and build with ONE is included in the package—no web fetches, no external dependencies for documentation.

---

## Package Structure

### Deployed Package (`oneie` on npm)

```
oneie/
├── dist/                    # Compiled CLI code (TypeScript → JavaScript)
│   └── index.js            # Entry point (executable)
│
├── .claude/                 # Claude Code integration (copied from source)
│   ├── agents/             # AI agent configurations
│   ├── commands/           # Custom slash commands
│   └── hooks/              # Pre/post tool-use hooks
│
├── one/                     # 6-Dimension ontology docs (copied from source)
│   ├── connections/        # Ontology, protocols, patterns
│   ├── things/             # Architecture, specifications
│   ├── events/             # Event specifications
│   ├── knowledge/          # RAG, AI, implementation
│   └── people/             # Roles, groups, governance
│
├── web/                     # Astro 5 + React 19 starter (copied from source)
│   ├── src/
│   │   ├── pages/          # File-based routing
│   │   ├── components/     # React components + shadcn/ui
│   │   ├── layouts/        # Page layouts
│   │   ├── content/        # Content collections (blog, etc.)
│   │   └── styles/         # Tailwind v4 + global CSS
│   ├── public/             # Static assets
│   └── astro.config.mjs    # Astro configuration
│
├── data/                    # Sample data and migrations (optional)
│   └── ...                 # JSON/YAML data files
│
├── CLAUDE.md               # AI agent instructions (root level)
├── AGENTS.md               # Convex patterns quick reference
├── README.md               # Package documentation
├── LICENSE.md              # License information
├── folders.yaml            # Copy configuration
└── package.json            # NPM package metadata
```

---

## Copy Configuration (`folders.yaml`)

The CLI uses `folders.yaml` to define what gets copied from the source repository to the user's project:

```yaml
# ONE CLI - Folder Copy Configuration
# Defines what gets packaged and deployed to npm

# Claude Code Integration (AI agent configs)
claude_folders:
  - .claude/agents
  - .claude/commands
  - .claude/hooks

# ONE Ontology (complete documentation)
one_folders:
  - one/**/*

# Web starter (Astro 5 + React 19)
web_folders:
  - web/

# Sample data (optional)
data_folders:
  - data/

# Root documentation files
root_files:
  - CLAUDE.md
  - AGENTS.md
  - README.md
  - LICENSE.md

# File extensions to copy
allowed_extensions:
  - .md
  - .yaml
  - .yml
  - .sh
  - .astro
  - .ts
  - .tsx
  - .js
  - .jsx
  - .json
  - .css

# Exclude patterns (never copy)
exclude_patterns:
  - "*/node_modules/*"
  - "*/.git/*"
  - "*/dist/*"
  - "*/build/*"
  - "*/.DS_Store"
  - "*/package-lock.json"
  - "*/bun.lockb"
  - "*/.env*"
```

---

## Deployment Pipeline

### 1. Development (Source Repository)

```
ONE/                         # Source monorepo
├── .claude/                 # → Copied to package
├── one/                     # → Copied to package
├── web/                     # → Copied to package
├── data/                    # → Copied to package
├── cli/                     # → Built and packaged
│   ├── src/                # TypeScript source
│   ├── dist/               # Compiled output
│   ├── package.json        # NPM metadata
│   └── folders.yaml        # Copy config
├── CLAUDE.md               # → Copied to package root
├── AGENTS.md               # → Copied to package root
├── README.md               # → Copied to package root
└── LICENSE.md              # → Copied to package root
```

### 2. Build Process

```bash
cd cli/

# 1. Build TypeScript to JavaScript
npm run build
# → Compiles src/*.ts → dist/*.js

# 2. Copy files according to folders.yaml
# → Copies .claude/, one/, web/, data/ into cli/ directory
# → Copies CLAUDE.md, AGENTS.md, README.md, LICENSE.md to cli/ directory

# 3. Package for npm
npm pack
# → Creates oneie-2.0.3.tgz with:
#    - dist/ (compiled CLI)
#    - .claude/ (AI config)
#    - one/ (docs)
#    - web/ (starter)
#    - data/ (sample data)
#    - *.md files (root docs)
```

### 3. NPM Publish

```bash
# Publish to npm registry
npm publish
# → Deploys package as "oneie" on npm
# → Users run: npx oneie
```

### 4. GitHub Release

```bash
# Tag and push
git tag v2.0.3
git push origin v2.0.3

# GitHub Actions automatically:
# 1. Builds package
# 2. Runs tests
# 3. Publishes to npm
# 4. Creates GitHub release
```

---

## Package Manifest (`package.json`)

```json
{
  "name": "oneie",
  "version": "2.0.3",
  "type": "module",
  "description": "Transform ideas into production-ready websites using the ONE 6-dimension ontology and 8 AI agents. From idea to website in 3 commands: npx oneie, claude, /one",
  "bin": {
    "oneie": "./dist/index.js"
  },
  "files": [
    "dist",
    ".claude",
    "one",
    "web",
    "data",
    "README.md",
    "CLAUDE.md",
    "AGENTS.md",
    "LICENSE.md",
    "folders.yaml"
  ],
  "keywords": [
    "one",
    "ontology",
    "cli",
    "bootstrap",
    "6-dimension",
    "ai-agents",
    "cascade",
    "astro",
    "react",
    "convex",
    "website-builder",
    "no-code",
    "low-code",
    "claude",
    "ai"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/one-ie/one.git",
    "directory": "cli"
  },
  "homepage": "https://one.ie",
  "license": "SEE LICENSE IN https://one.ie/free-license"
}
```

**Key Fields:**

- **`bin`**: Makes `oneie` executable via `npx oneie`
- **`files`**: Defines what gets included in the npm package (everything AI needs)
- **`type: "module"`**: Uses ES modules (import/export)
- **`repository.directory`**: Points to `/cli` subdirectory in monorepo

---

## User Experience Flow

### Bootstrap New Project

```bash
# User runs
npx oneie

# CLI does:
# 1. Copies .claude/ → user-project/.claude/
# 2. Copies one/ → user-project/one/
# 3. Copies web/ → user-project/web/
# 4. Copies data/ → user-project/data/
# 5. Copies CLAUDE.md, AGENTS.md, README.md to user-project/
# 6. Runs bun install in web/
# 7. Creates .env with defaults
# 8. Prints success message with next steps
```

### Generated Project Structure

```
my-project/                  # User's new project
├── .claude/                 # ✅ Claude Code config (from package)
│   ├── agents/
│   ├── commands/
│   └── hooks/
│
├── one/                     # ✅ Complete ontology docs (from package)
│   ├── connections/
│   ├── things/
│   ├── events/
│   ├── knowledge/
│   └── people/
│
├── web/                     # ✅ Astro + React starter (from package)
│   ├── src/
│   ├── public/
│   ├── astro.config.mjs
│   └── package.json
│
├── data/                    # ✅ Sample data (from package)
│
├── .env                     # ✅ Generated by CLI
├── CLAUDE.md               # ✅ AI instructions (from package)
├── AGENTS.md               # ✅ Quick reference (from package)
└── README.md               # ✅ Project docs (from package)
```

**Result:** User has complete, self-contained project with all documentation and AI configuration ready.

---

## AI Integration Features

### 1. Claude Code Integration (`.claude/`)

**What It Provides:**

- **Agents:** Pre-configured AI specialists (backend, frontend, integration, quality, design, etc.)
- **Commands:** Custom slash commands (`/now`, `/next`, `/todo`, `/done`, `/build`, `/design`, `/deploy`)
- **Hooks:** Pre/post tool-use validation hooks

**Why It Matters:**

- AI agents understand the 6-dimension ontology
- Developers get intelligent assistance for every phase
- Code generation follows proven patterns automatically

### 2. Complete Documentation (`one/`)

**What It Provides:**

- 41 documentation files across 8 layers
- Complete ontology specification (groups, people, things, connections, events, knowledge)
- Protocol specs (A2A, ACP, AP2, X402, AG-UI)
- Implementation patterns and examples

**Why It Matters:**

- AI agents read documentation locally (no web fetches)
- Semantic search over ontology
- MCP servers can query ontology structure

### 3. Starter App (`web/`)

**What It Provides:**

- Astro 5.14+ with React 19
- shadcn/ui components (50+)
- Tailwind v4 configuration
- Better Auth setup
- Content collections (blog, etc.)

**Why It Matters:**

- User gets production-ready frontend immediately
- All best practices pre-configured
- Ontology-aligned component structure

---

## Version Management

### Semantic Versioning

```
2.0.3
│ │ │
│ │ └─ PATCH: Bug fixes, doc updates
│ └─── MINOR: New features, backwards-compatible
└───── MAJOR: Breaking changes
```

### Release Process

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Build package
npm run build

# 3. Test locally
npm pack
npm install -g oneie-2.0.3.tgz
oneie --version

# 4. Publish to npm
npm publish

# 5. Tag and push
git tag v2.0.3
git push origin v2.0.3
```

---

## Maintenance Commands

### Update Documentation

```bash
# Sync latest ontology docs from source
cd ONE/one/
# Edit files...

# Rebuild CLI package
cd ONE/cli/
npm run build
npm publish
```

### Update Starter App

```bash
# Update web/ directory in source
cd ONE/web/
# Add new components, update dependencies...

# Rebuild CLI package
cd ONE/cli/
npm run build
npm publish
```

### Update AI Configuration

```bash
# Update .claude/ directory in source
cd ONE/.claude/
# Add new agents, commands, hooks...

# Rebuild CLI package
cd ONE/cli/
npm run build
npm publish
```

---

## Distribution Channels

### 1. NPM Registry

**URL:** `https://www.npmjs.com/package/oneie`

**Install:**

```bash
npm install -g oneie
# or
npx oneie
```

### 2. GitHub Repository

**URL:** `https://github.com/one-ie/one`

**Clone:**

```bash
git clone https://github.com/one-ie/one.git
cd one/cli
npm install
npm run build
npm link
```

### 3. Direct Download

**URL:** `https://one.ie/download`

**Usage:**

```bash
curl -o oneie.tgz https://one.ie/download/oneie-latest.tgz
npm install -g oneie.tgz
```

---

## Security Considerations

### Package Integrity

- **Signed releases:** All npm packages signed with GPG
- **Checksums:** SHA256 checksums published with releases
- **Audit:** Regular `npm audit` checks for vulnerabilities

### User Privacy

- **No telemetry:** CLI does not collect usage data
- **Local-first:** All documentation and AI config stored locally
- **Offline-capable:** Works without internet after initial install

### License Compliance

- **MIT License:** Permissive open-source license
- **Attribution:** Credit required in derivative works
- **Commercial use:** Allowed without restrictions

---

## Troubleshooting

### Issue: CLI not found after install

```bash
# Fix: Ensure npm global bin directory is in PATH
npm config get prefix
export PATH="$(npm config get prefix)/bin:$PATH"
```

### Issue: Permission errors on Linux/Mac

```bash
# Fix: Use npm's built-in permissions
npx oneie  # Uses local install, no global permissions needed
```

### Issue: Old version cached

```bash
# Fix: Clear npm cache and reinstall
npm cache clean --force
npx clear-npx-cache
npx oneie@latest
```

---

## Development Workflow

### Local Testing

```bash
# 1. Make changes to CLI source
cd ONE/cli/src/
# Edit files...

# 2. Rebuild
npm run build

# 3. Link locally
npm link

# 4. Test in new directory
cd /tmp/test-project/
oneie
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/publish-cli.yml
name: Publish CLI
on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: https://registry.npmjs.org/

      - name: Install dependencies
        run: cd cli && npm install

      - name: Build
        run: cd cli && npm run build

      - name: Publish to npm
        run: cd cli && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Related Documentation

- **[CLI Documentation](./cli.md)** - Complete CLI command reference
- **[Ontology](../knowledge/ontology.md)** - 6-dimension data model
- **[Architecture](../knowledge/architecture.md)** - Platform architecture
- **[Workflow](../connections/workflow.md)** - Development process

---

## Summary

The ONE CLI packaging system:

1. **Bundles** everything AI needs (docs, config, starter code)
2. **Deploys** to npm as `oneie` package
3. **Distributes** via `npx oneie` (no install required)
4. **Bootstraps** complete projects in 30 seconds
5. **Updates** seamlessly via version bumps

**Core Innovation:** Self-contained, AI-ready packages that work offline and include complete ontology knowledge.

---

**Built for simplicity, portability, and AI-first development.**

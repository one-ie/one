# ONE Platform Release Process

**Version**: 2.0.0
**Last Updated**: 2025-10-14

## Overview

This document defines the **exact process** to release ONE Platform across npm, GitHub, and the web. The process is automated via `scripts/release.sh` and ensures all repositories, documentation, and packages stay in sync.

## Repository Architecture

ONE Platform uses a **monorepo development** structure with **distributed deployment**:

```
ONE/ (Development Monorepo)
├── one/           → one-ie/ontology (6-dimension ontology docs)
├── web/           → one-ie/web (Astro 5 + React 19 frontend)
├── backend/       → one-ie/backend (Convex backend)
├── cli/           → one-ie/cli (npm: oneie)
└── apps/one/      → one-ie/one (Master assembly repo)
    ├── one/       (synced from /one)
    ├── web/       (git submodule: one-ie/web)
    ├── docs/      (git submodule: one-ie/docs)
    └── .claude/   (synced from /.claude)
```

## Release Checklist

Before running the release script, verify:

- [ ] All tests pass (`bun test`)
- [ ] Build succeeds (`bun run build` in web/)
- [ ] TypeScript types are valid (`bunx astro check`)
- [ ] Version number updated in `cli/folders.yaml`
- [ ] Changelog updated with release notes
- [ ] No uncommitted changes (or explicitly allow dirty working directory)

## The 13-Step Release Process

### Step 1-3: Push Core Repositories

Push the three core repositories to their dedicated GitHub repos:

```bash
# Step 1: Push ontology documentation
cd one/
git add .
git commit -m "chore: update ontology documentation"
git push origin main  # → one-ie/ontology

# Step 2: Push web frontend
cd ../web/
git add .
git commit -m "feat: update web frontend"
git push origin main  # → one-ie/web

# Step 3: Push backend
cd ../backend/
git add .
git commit -m "feat: update backend services"
git push origin main  # → one-ie/backend
```

**Note**: Each of these directories should have their own `.git` directory linked to their respective GitHub repos.

### Step 4: Sync Documentation via folders.yaml

Use `cli/folders.yaml` configuration to sync:
- `/one` → `cli/one/`
- `/.claude` → `cli/.claude/`
- `/AGENTS.md` → `cli/AGENTS.md`
- `/CLAUDE.md` → `cli/CLAUDE.md`
- `/README.md` → `cli/README.md`
- `/LICENSE.md` → `cli/LICENSE.md`

**Automated by**: `scripts/release.sh` (Steps 2-5)

### Step 5: Update CLI README

The script automatically updates `cli/README.md` to reflect:
- Current version from `cli/package.json`
- Installation instructions
- Quick start guide
- Links to documentation

**Automated by**: `scripts/release.sh` (Step 5)

### Step 6: Commit and Push CLI

Push the updated CLI package to GitHub:

```bash
cd cli/
git add .
git commit -m "chore: release v2.0.0"
git push origin main  # → one-ie/cli
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

**Automated by**: `scripts/release.sh` (Step 9)

### Step 7: Publish to npm

Publish the `oneie` package to npm registry:

```bash
cd cli/
npm publish --access public
```

**Manual step** - requires npm authentication

### Step 8-9: Create apps/one Assembly

The CLI creates the master assembly repository:

```bash
cd apps/one/
mkdir -p .claude one
# Sync files from root (automated by script)
```

**Automated by**: `scripts/release.sh` (Steps 2-5)

### Step 10-11: Clone Web and Docs as Submodules

Add web and docs as git submodules in `apps/one/`:

```bash
cd apps/one/
git submodule add https://github.com/one-ie/web.git web
git submodule add https://github.com/one-ie/docs.git docs
git submodule update --remote --merge
```

**Automated by**: `scripts/release.sh` (Step 6)

### Step 12: Update apps/one README

Generate the master README for the assembly repository:

```bash
cd apps/one/
# Update README.md with:
# - Project overview
# - Quick start with npx oneie
# - Architecture diagram
# - Links to all repos
```

**TODO**: Add to `scripts/release.sh`

### Step 13: Push Master Assembly

Push the complete assembly to GitHub:

```bash
cd apps/one/
git add .
git commit -m "chore: release v2.0.0"
git push origin main --recurse-submodules=on-demand  # → one-ie/one
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

**Automated by**: `scripts/release.sh` (Step 9)

## Using the Release Script

### Basic Release (Sync Only)

Sync documentation and configuration without version bump:

```bash
./scripts/release.sh
```

This will:
- Sync `/one` to `cli/one` and `apps/one/one`
- Sync `/.claude` to `cli/.claude` and `apps/one/.claude`
- Copy core docs (AGENTS.md, CLAUDE.md, README.md, LICENSE.md)
- Update submodules in `apps/one/`

### Release with Version Bump

```bash
# Patch release (2.0.0 → 2.0.1)
./scripts/release.sh patch

# Minor release (2.0.1 → 2.1.0)
./scripts/release.sh minor

# Major release (2.1.0 → 3.0.0)
./scripts/release.sh major
```

This will:
- Perform all sync operations
- Bump version in `cli/package.json` and `apps/one/package.json`
- Update `cli/folders.yaml` with new version
- Create git tags (if you confirm push)

### Full Release Workflow

```bash
# 1. Prepare release
bun test                    # Run tests
cd web && bun run build     # Test build

# 2. Bump version and sync
cd ..
./scripts/release.sh minor

# 3. Review changes
cd cli && git status
cd ../apps/one && git status

# 4. Publish to npm (manual)
cd ../cli
npm publish

# 5. Verify installation
npx oneie@latest --version

# 6. Deploy web to Cloudflare Pages
cd ../web
wrangler pages deploy dist --project-name=one-platform
```

## Version Management

Version numbers follow **Semantic Versioning** (semver):

- **Major** (X.0.0): Breaking changes, new ontology dimensions, protocol changes
- **Minor** (x.X.0): New features, new entity types, new protocols
- **Patch** (x.x.X): Bug fixes, documentation updates, performance improvements

**Version is stored in:**
- `cli/package.json` (source of truth)
- `cli/folders.yaml` (for documentation)
- `apps/one/package.json` (synced from cli)

## Post-Release Tasks

After running the release script and publishing to npm:

### 1. Create GitHub Releases

For each tagged repository, create a GitHub release:

```bash
# Navigate to each repo on GitHub
# Click "Releases" → "Create a new release"
# Select the version tag (e.g., v2.0.0)
# Add release notes from changelog
```

### 2. Update Documentation Site

Deploy the latest docs:

```bash
cd docs/
npm run build
wrangler pages deploy dist --project-name=one-docs
```

### 3. Test the CLI

Verify the npm package works:

```bash
# Test global installation
npm install -g oneie
oneie --version
oneie init my-project

# Test npx usage
npx oneie@latest --version
npx oneie@latest init my-project

# Verify submodules and structure
cd my-project
ls -la  # Should see: one/, web/, docs/, .claude/
```

### 4. Update Cloudflare Pages

Deploy the web frontend:

```bash
cd web/
bun run build
wrangler pages deploy dist --project-name=one-platform
```

### 5. Announce Release

- Post to Discord/Slack
- Tweet from @ONE_ie
- Update website homepage with "What's New"
- Send email to newsletter subscribers

## Repository URLs

**GitHub Repositories:**
- **Main**: https://github.com/one-ie/one (master assembly)
- **Ontology**: https://github.com/one-ie/ontology (6-dimension docs)
- **Web**: https://github.com/one-ie/web (Astro frontend)
- **Backend**: https://github.com/one-ie/backend (Convex backend)
- **CLI**: https://github.com/one-ie/cli (npm package)
- **Docs**: https://github.com/one-ie/docs (documentation site)

**npm Package:**
- **Package**: https://www.npmjs.com/package/oneie
- **Install**: `npm install -g oneie` or `npx oneie@latest`

**Live Deployments:**
- **Web**: https://one.ie
- **Docs**: https://docs.one.ie
- **API**: https://api.one.ie

## Rollback Procedure

If a release fails or introduces critical bugs:

### 1. Unpublish from npm (within 24 hours)

```bash
npm unpublish oneie@2.0.1  # Only works within 24 hours
```

### 2. Revert Git Tags

```bash
cd cli/
git tag -d v2.0.1
git push origin :refs/tags/v2.0.1

cd ../apps/one/
git tag -d v2.0.1
git push origin :refs/tags/v2.0.1
```

### 3. Revert Commits

```bash
cd cli/
git revert HEAD
git push origin main

cd ../apps/one/
git revert HEAD
git push origin main
```

### 4. Publish Previous Version

```bash
cd cli/
git checkout v2.0.0
npm publish
```

## Troubleshooting

### "Working directory has uncommitted changes"

The script will prompt if there are uncommitted changes. You can:
- Commit or stash changes first (recommended)
- Continue anyway by typing `y` when prompted

### "cli/ is not a git repository"

The `cli/` directory needs its own git repository:

```bash
cd cli/
git init
git remote add origin https://github.com/one-ie/cli.git
git add .
git commit -m "chore: initialize cli repository"
git push -u origin main
```

### "Submodules not found in apps/one/"

Add submodules manually:

```bash
cd apps/one/
git submodule add https://github.com/one-ie/web.git web
git submodule add https://github.com/one-ie/docs.git docs
git submodule update --init --recursive
```

### "npm publish fails with 403"

Ensure you're logged in to npm:

```bash
npm login
npm whoami  # Should show your npm username
```

Verify you have permissions to publish to the `oneie` package.

## Architecture Validation

To verify the architecture is correct after release:

```bash
# Test the full flow
npx oneie@latest init test-project
cd test-project

# Verify structure
tree -L 2
# Should show:
# test-project/
# ├── one/           (ontology docs)
# ├── web/           (git submodule)
# ├── docs/          (git submodule)
# ├── .claude/       (AI agent config)
# ├── CLAUDE.md      (AI instructions)
# ├── AGENTS.md      (Convex patterns)
# ├── README.md      (Getting started)
# └── LICENSE.md     (License)

# Test web frontend
cd web/
bun install
bun run dev  # Should start on localhost:4321

# Verify ontology docs
cd ../one/
ls -la  # Should see all 6 dimension folders
```

## Release Cadence

**Production Releases:**
- **Major**: Quarterly (when ontology or protocols change)
- **Minor**: Monthly (new features, entity types)
- **Patch**: Weekly or as needed (bug fixes, docs)

**Pre-Release Versions:**
- **Alpha**: `2.1.0-alpha.1` - Internal testing
- **Beta**: `2.1.0-beta.1` - Early access for community
- **RC**: `2.1.0-rc.1` - Release candidate

**Use npm tags:**
```bash
npm publish --tag alpha
npm publish --tag beta
npm publish --tag next  # For RC
npm publish --tag latest  # For stable releases
```

## Emergency Hotfix Process

For critical production bugs:

1. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/2.0.1 v2.0.0
   ```

2. **Fix the bug** and commit

3. **Run release script**:
   ```bash
   ./scripts/release.sh patch
   ```

4. **Publish immediately**:
   ```bash
   cd cli && npm publish
   ```

5. **Merge back to main**:
   ```bash
   git checkout main
   git merge hotfix/2.0.1
   git push origin main
   ```

## Success Criteria

A release is considered successful when:

- [ ] All repositories pushed to GitHub
- [ ] npm package published and installable via `npx oneie@latest`
- [ ] `npx oneie init` creates correct directory structure
- [ ] Web frontend deployed to Cloudflare Pages
- [ ] Documentation site updated
- [ ] All submodules pointing to correct commits
- [ ] GitHub releases created for all tagged repos
- [ ] No critical bugs reported within 24 hours

## License

Copyright © 2025 ONE 
Licensed under the ONE FREE License
See LICENSE.md for details

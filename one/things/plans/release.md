# Release Strategy for ONE Platform

**Version:** 1.0.0
**Status:** Draft
**Owner:** Platform Team
**Last Updated:** 2025-10-14

## Overview

This document outlines the release and distribution strategy for the ONE platform across multiple repositories and packages. The goal is to maintain a single source of truth while distributing components to specialized repositories for different use cases.

## Repository Structure

### Primary Repositories

1. **one-ie/one** (Main CLI/SDK Package)
   - Core platform logic
   - CLI tool (`npx oneie`)
   - Ontology documentation
   - Configuration templates
   - License and core documentation

2. **one-ie/web** (Web Application)
   - Astro + React frontend
   - Standalone web application
   - Can be used independently or with CLI

3. **one-ie/docs** (Documentation Site)
   - Public-facing documentation
   - API reference
   - Tutorials and guides
   - Examples and case studies

### Workspace Structure

```
ONE/                          # Main development workspace (private/local)
├── one/                      # Ontology docs → one-ie/one
├── .claude/                  # AI config → one-ie/one
├── AGENTS.md                 # → one-ie/one, apps/one
├── CLAUDE.md                 # → one-ie/one, apps/one
├── README.md                 # → one-ie/one, apps/one
├── LICENSE.md                # → one-ie/one, apps/one
├── web/                      # → one-ie/web
├── apps/
│   └── one/                  # Build target for one-ie/one
│       ├── one/              # (synced from /one)
│       ├── .claude/          # (synced from /.claude)
│       ├── web/              # (linked to one-ie/web)
│       └── docs/             # (linked to one-ie/docs)
├── cli/                      # Build target for CLI package
└── scripts/
    └── release.sh            # Release automation
```

## Sync Strategy

### 1. Core Documentation Sync

**Source → Targets:**
- `/one/*` → `cli/one/*` and `apps/one/one/*`
- `/.claude/*` → `cli/.claude/*` and `apps/one/.claude/*`
- `/AGENTS.md`, `/CLAUDE.md`, `/README.md`, `/LICENSE.md` → `cli/` and `apps/one/`

**Rationale:**
- Keep ontology and configuration in sync across distributions
- CLI package contains everything needed for `npx oneie`
- Apps directory is staging area for multi-repo coordination

### 2. Web Application Strategy

**Options for web sync:**

#### Option A: Git Submodule (Recommended)
```bash
cd apps/one
git submodule add https://github.com/one-ie/web.git web
```

**Pros:**
- Clean separation of concerns
- Independent versioning
- Explicit version pinning
- Easy to update: `git submodule update --remote`
- One-ie/web can be used standalone

**Cons:**
- Requires submodule knowledge
- Extra step during clone: `git clone --recursive`
- Can be confusing for contributors

#### Option B: Directory Sync
```bash
rsync -av --delete web/ apps/one/web/
```

**Pros:**
- Simple, no git complexity
- Everything in one repo
- Easy for contributors

**Cons:**
- Duplicate code maintenance
- No independent versioning
- Harder to keep in sync
- Bloats repository size

#### Option C: Symbolic Link (Development Only)
```bash
ln -s ../../web apps/one/web
```

**Pros:**
- Perfect for local development
- No duplication
- Instant sync

**Cons:**
- Doesn't work in git
- Local development only

**Recommendation:** Use **Option A (Git Submodule)** for `apps/one/web` linking to `one-ie/web`. This provides clean separation while maintaining the ability to use the web app independently.

### 3. Documentation Strategy

**Same as web - use Git Submodule:**
```bash
cd apps/one
git submodule add https://github.com/one-ie/docs.git docs
```

## Release Workflow

### Phase 1: Preparation
1. Ensure all changes committed in development workspace
2. Run tests and validation
3. Update version numbers
4. Update CHANGELOG.md

### Phase 2: Sync to Staging
1. Sync `/one` → `cli/one` and `apps/one/one`
2. Sync `/.claude` → `cli/.claude` and `apps/one/.claude`
3. Sync core docs → `cli/` and `apps/one/`
4. Update submodules in `apps/one/`:
   - `git submodule update --remote web`
   - `git submodule update --remote docs`

### Phase 3: Publish CLI Package
1. `cd cli`
2. `npm version [major|minor|patch]`
3. `npm publish`
4. Create git tag
5. Push to one-ie/one

### Phase 4: Publish Web Application
1. `cd web` (or `apps/one/web` if using submodule)
2. Update version
3. Build and test
4. Push to one-ie/web
5. Deploy to Cloudflare Pages

### Phase 5: Publish Documentation
1. `cd docs` (or `apps/one/docs` if using submodule)
2. Update version
3. Build and test
4. Push to one-ie/docs
5. Deploy to docs site

### Phase 6: Update Main Package
1. `cd apps/one`
2. Commit all changes
3. Create release tag
4. Push to one-ie/one
5. Create GitHub release with notes

## Release Script

The `scripts/release.sh` script automates phases 1-2:

```bash
./scripts/release.sh [major|minor|patch]
```

**What it does:**
1. Validates git status (clean working directory)
2. Runs tests
3. Syncs all files to staging areas
4. Updates submodules
5. Creates commit with version bump
6. Pushes to remotes
7. Creates release tags

**What it does NOT do:**
- Publish to npm (manual step for safety)
- Deploy to production (CI/CD handles this)
- Create GitHub releases (manual step for release notes)

## Version Strategy

### Semantic Versioning
- **Major (1.0.0):** Breaking changes to ontology or APIs
- **Minor (0.1.0):** New features, backward compatible
- **Patch (0.0.1):** Bug fixes, no API changes

### Synchronized Releases
- CLI, Web, and Docs share the same version number
- Ontology version (in `one/knowledge/ontology.md`) is independent
- Example: ONE Platform v1.2.3 can use Ontology v2.0.0

### Release Channels
- **stable:** Production releases (main branch)
- **beta:** Testing releases (beta branch)
- **canary:** Nightly builds (dev branch)

## Git Submodule Commands

### Initial Setup
```bash
# In apps/one directory
git submodule add https://github.com/one-ie/web.git web
git submodule add https://github.com/one-ie/docs.git docs
git commit -m "Add web and docs as submodules"
```

### Cloning with Submodules
```bash
git clone --recursive https://github.com/one-ie/one.git
# Or after regular clone:
git submodule init
git submodule update
```

### Updating Submodules
```bash
# Update to latest from remote
git submodule update --remote web
git submodule update --remote docs

# Commit the submodule pointer updates
git add web docs
git commit -m "Update web and docs submodules"
```

### Working in Submodules
```bash
# Make changes in submodule
cd web
git checkout main
git pull
# make changes...
git add .
git commit -m "Update web"
git push

# Update parent repo to point to new commit
cd ../..
git add web
git commit -m "Update web submodule pointer"
git push
```

## CI/CD Integration

### GitHub Actions Workflow

**.github/workflows/release.yml:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

## Security Considerations

### Sensitive Files
**Never sync these:**
- `.env*` files
- `node_modules/`
- Build artifacts (`dist/`, `.astro/`)
- User data or secrets
- Private keys

### Access Control
- CLI repo: Public (open source)
- Web repo: Public (open source)
- Docs repo: Public (open source)
- Main workspace: Private (development only)

## Rollback Strategy

### If Release Fails

1. **Revert npm publish:**
   ```bash
   npm unpublish one@1.2.3
   npm publish --tag latest one@1.2.2
   ```

2. **Revert git tag:**
   ```bash
   git tag -d v1.2.3
   git push origin :refs/tags/v1.2.3
   ```

3. **Redeploy previous version:**
   ```bash
   git revert HEAD
   git push
   ```

## Testing Before Release

### Checklist
- [ ] All tests pass (`bun test`)
- [ ] Build succeeds (`bun run build`)
- [ ] Type checking passes (`bunx astro check`)
- [ ] Lint passes (`bun run lint`)
- [ ] Documentation is up to date
- [ ] CHANGELOG.md updated
- [ ] Version numbers bumped
- [ ] Breaking changes documented
- [ ] Migration guide written (if needed)

### Local Testing
```bash
# Test CLI locally before publishing
cd cli
npm link
oneie --version
oneie --help

# Test in fresh directory
cd /tmp
oneie init test-project
cd test-project
oneie dev
```

## Future Enhancements

### Planned Improvements
1. **Automated testing in release script**
2. **Automated CHANGELOG generation**
3. **Release candidate (RC) builds**
4. **Automated deployment to Cloudflare**
5. **Slack/Discord notifications on release**
6. **Release metrics and monitoring**
7. **A/B testing for new features**

### Monorepo Consideration
**Future option:** Migrate to a monorepo using Turborepo or Nx
- Single repository for all packages
- Shared dependencies
- Atomic commits across packages
- Simplified version management

**Not recommended now because:**
- Current structure is simple and working
- Want to validate separation of concerns first
- Monorepo adds complexity during early development

## Questions to Resolve

1. **Submodule vs Directory Sync for Web?**
   - Recommendation: Submodule for clean separation

2. **Should CLI include web?**
   - Recommendation: No, keep separate. CLI can scaffold projects that use web.

3. **Versioning strategy for submodules?**
   - Recommendation: Pin to specific commits, update deliberately

4. **How to handle breaking changes?**
   - Recommendation: Semantic versioning + deprecation warnings

5. **Release frequency?**
   - Recommendation: Weekly minor releases, daily patches if needed

## Conclusion

This release strategy provides:
- **Clear separation** between CLI, Web, and Docs
- **Single source of truth** in main workspace
- **Automated syncing** via release script
- **Independent versioning** where needed
- **Clean git history** across repositories

The use of git submodules for `web` and `docs` is recommended to maintain independence while keeping everything coordinated in `apps/one`.

## Next Steps

1. Review this plan
2. Create `scripts/release.sh`
3. Set up git submodules in `apps/one`
4. Create CI/CD workflows
5. Perform first release (v1.0.0)
6. Document lessons learned

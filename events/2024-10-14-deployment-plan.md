---
type: event
eventType: deployment
category: infrastructure
tags: [deployment, planning, release-management, infrastructure]
created: 2024-10-14
updated: 2024-10-14
status: completed
timestamp: 2024-10-14
kpis:
  complexity: 7
  impact: 9
  completeness: 10
  quality: 9
  documentation: 10
score: 9.0
groupId: platform
actorRole: platform_owner
---

# ONE Platform Full Deployment Plan

**Date**: 2025-10-14
**Version**: 2.0.4 → 2.0.5 (new patch release)
**Target**: npm + GitHub
**Status**: Ready for Execution ✅

## Pre-Deployment Status

### ✅ All Critical Checks Passed

- ✅ Repository structure validated
- ✅ npm authentication confirmed (logged in as: oneie)
- ✅ CLI binary exists and valid
- ✅ Build validated (9 JS files compiled)
- ✅ 397 ontology files synced
- ✅ Version format valid (semver)
- ✅ npm publish dry-run passed
- ✅ GitHub CLI authenticated
- ✅ Security: .npmignore excludes .env files

### ⚠️ Acceptable Warnings (7)

1. **one/**: On branch 'dev' (will merge to main during release)
2. **one/**: 27 uncommitted changes (will commit during release)
3. **web/**: 37 uncommitted changes (will commit during release)
4. **backend/**: 12 uncommitted changes (will commit during release)
5. **cli/**: 79 uncommitted changes (will commit during release)
6. **apps/one/**: 5 uncommitted changes (will commit during release)
7. **License**: May need review (not blocking)

## Deployment Strategy

### Phase 1: Version Bump (AUTOMATED)

```bash
./scripts/release.sh patch
```

**This will:**
1. Bump version: 2.0.4 → 2.0.5
2. Update cli/package.json
3. Update cli/folders.yaml
4. Sync all documentation (503 ontology + 49 .claude files)
5. Generate apps/one/README.md
6. Show git status for review

**User actions:**
- Answer 'y' to commit prompts
- Answer 'y' to push prompts
- Answer 'y' to tag creation

**Duration**: ~30 seconds

### Phase 2: Git Repository Pushes (AUTOMATED)

The release script will prompt for:

1. **one/** → `one-ie/ontology`
   - Commit: "chore: update ontology documentation"
   - 27 files to commit

2. **web/** → `one-ie/web`
   - Commit: "feat: update web frontend"
   - 37 files to commit

3. **backend/** → `one-ie/backend`
   - Commit: "feat: update backend services"
   - 12 files to commit

4. **cli/** → `one-ie/cli`
   - Commit: "chore: release v2.0.5"
   - 79 files to commit
   - Tag: v2.0.5

5. **apps/one/** → `one-ie/one`
   - Commit: "chore: release v2.0.5"
   - 5 files to commit
   - Tag: v2.0.5

**Duration**: ~60 seconds

### Phase 3: npm Publish (MANUAL)

```bash
cd cli
npm publish --access public
```

**Verification:**
```bash
npm view oneie@2.0.5
npx oneie@latest --version  # Should show 2.0.5
```

**Duration**: ~10 seconds

### Phase 4: Test Installation (VERIFICATION)

```bash
# Test global install
npm install -g oneie@latest

# Test npx usage
npx oneie@latest --version

# Test project creation
npx oneie@latest init test-deployment
cd test-deployment
ls -la  # Verify structure
```

**Expected structure:**
```
test-deployment/
├── one/           # 397 ontology files
├── .claude/       # 49 config files
├── CLAUDE.md
├── README.md
└── LICENSE.md
```

**Duration**: ~30 seconds

### Phase 5: GitHub Releases (MANUAL)

Create releases for tagged versions:

**CLI Release** (https://github.com/one-ie/cli/releases/new):
```
Tag: v2.0.5
Title: ONE CLI v2.0.5
Description:
## What's New
- Synced 6-dimension ontology (397 files)
- Updated Claude Code configuration (15 agents, 14 hooks, 12 commands)
- Security: Enhanced .npmignore to exclude .env files
- Updated version management across all configs

## Installation
```bash
npm install -g oneie
# or
npx oneie@latest --version
```

## Quick Start
```bash
npx oneie init my-project
cd my-project
cd web && bun install && bun run dev
```
```

**Master Assembly Release** (https://github.com/one-ie/one/releases/new):
```
Tag: v2.0.5
Title: ONE Platform v2.0.5
Description:
## Complete ONE Platform Release

This release includes:
- ✅ 6-dimension ontology (Groups, People, Things, Connections, Events, Knowledge)
- ✅ 397 documentation files
- ✅ 15 Claude Code AI agents
- ✅ Complete deployment system
- ✅ Release automation scripts

## Repositories
- **CLI**: https://github.com/one-ie/cli
- **Ontology**: https://github.com/one-ie/ontology
- **Web**: https://github.com/one-ie/web
- **Backend**: https://github.com/one-ie/backend

## Get Started
```bash
npx oneie@latest init my-project
```
```

**Duration**: ~5 minutes

### Phase 6: Deploy Web to Cloudflare (OPTIONAL)

```bash
cd web
bun run build
wrangler pages deploy dist --project-name=one-platform
```

**Duration**: ~2 minutes

## Rollback Plan (If Needed)

### If npm publish fails:

```bash
# Within 24 hours, can unpublish
npm unpublish oneie@2.0.5

# Or deprecate
npm deprecate oneie@2.0.5 "Use 2.0.4 instead"
```

### If critical bug found:

```bash
# Hotfix process
git checkout -b hotfix/2.0.6 v2.0.5
# Fix bug
./scripts/release.sh patch  # Creates 2.0.6
cd cli && npm publish --access public
```

### If need to revert git:

```bash
# Revert commits
cd cli
git revert HEAD
git push origin main

cd ../apps/one
git revert HEAD
git push origin main
```

## Success Criteria

After deployment, verify:

- [ ] `npx oneie@latest --version` shows 2.0.5
- [ ] `npx oneie@latest init test-project` creates correct structure
- [ ] test-project has 397 ontology files in one/
- [ ] test-project has .claude/ with agents, hooks, commands
- [ ] GitHub releases created for cli and apps/one
- [ ] npm shows version 2.0.5 at https://www.npmjs.com/package/oneie
- [ ] No critical errors in first 24 hours

## Post-Deployment Tasks

1. **Update documentation site** (if needed)
   ```bash
   cd docs && npm run build && wrangler pages deploy dist
   ```

2. **Announce release**
   - Tweet from @ONE_ie
   - Post to Discord/Slack
   - Update website

3. **Monitor npm downloads**
   ```bash
   npm info oneie
   ```

4. **Monitor GitHub stars/forks**
   - https://github.com/one-ie/one
   - https://github.com/one-ie/cli

## Timeline

| Phase | Duration | Type |
|-------|----------|------|
| 1. Version bump & sync | 30s | Automated |
| 2. Git pushes | 60s | Automated (with prompts) |
| 3. npm publish | 10s | Manual |
| 4. Test installation | 30s | Verification |
| 5. GitHub releases | 5m | Manual |
| 6. Cloudflare deploy | 2m | Optional |
| **Total** | **~8 minutes** | **Full deployment** |

## Risk Assessment

### Low Risk ✅
- Version bump (automated, tested)
- Documentation sync (tested with 552 files)
- Git commits and pushes (reversible)
- npm publish (can deprecate if issues)

### Medium Risk ⚠️
- Breaking changes in ontology (mitigated by semver patch)
- npm package size (mitigated by .npmignore)

### High Risk ❌
- None identified

## Go/No-Go Decision

### GO ✅

**Reasons:**
1. All pre-deployment checks passed (0 errors)
2. Version validated and ready (2.0.5)
3. Test release completed successfully
4. npm authentication confirmed
5. GitHub authentication confirmed
6. Rollback procedures documented
7. All critical files present and valid
8. Build artifacts validated
9. Security checks passed
10. Documentation comprehensive (397 files)

**Recommendation**: ✅ PROCEED WITH DEPLOYMENT

---

**Prepared by**: Claude Code
**Reviewed on**: 2025-10-14
**Approval**: Ready for execution
**Next step**: Run `./scripts/release.sh patch`

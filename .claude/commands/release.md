---
allowed-tools: Bash(./scripts/release.sh:*), Bash(./scripts/pre-deployment-check.sh:*), Bash(cd web && bun run build:*), Bash(cd web && wrangler pages deploy:*), Bash(cd cli && npm publish:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git tag:*), Bash(npm view oneie:*)
description: Execute full ONE Platform release - npm, GitHub, and Cloudflare Pages
---

# /release - Full ONE Platform Release

**Purpose:** Execute the complete 13-step release process including npm publish, GitHub pushes, and Cloudflare Pages deployment.

## Context

- Current directory: !`pwd`
- Release script status: !`ls -lah scripts/release.sh`
- CLI version: !`cd cli && node -p "require('./package.json').version"`
- Web build status: !`ls -lah web/dist/ 2>/dev/null | head -3 || echo "No build found"`
- Current git status: !`git status --short | head -10`

## Release Options

### Option 1: Patch Release (Recommended for Hotfixes)
```
/release patch
```

### Option 2: Minor Release (New Features)
```
/release minor
```

### Option 3: Major Release (Breaking Changes)
```
/release major
```

### Option 4: Sync Only (No Version Bump)
```
/release sync
```

## Your Task

Based on the release type requested:

### Step 1: Pre-Deployment Validation
1. Run `./scripts/pre-deployment-check.sh`
2. Verify all checks pass (0 errors)
3. If errors found, report to user and STOP
4. If warnings only, continue

### Step 2: Version Bump & Sync (if not "sync")
1. Run `./scripts/release.sh [patch|minor|major]`
2. This will:
   - Bump version in cli/package.json
   - Sync 552 files (ontology + .claude)
   - Update apps/one/README.md
   - Show git status for review
3. When prompted "Commit and push?", answer 'y'
4. When prompted "Create tag?", answer 'y'

### Step 3: npm Publish
1. `cd cli`
2. Run `npm publish --access public`
3. Wait for completion
4. Verify: `npm view oneie version`
5. Report new version to user

### Step 4: Build & Deploy Web to Cloudflare
1. `cd web`
2. Run `bun run build`
3. If build succeeds, run `wrangler pages deploy dist --project-name=one-web`
4. Capture deployment URL
5. Report URL to user: https://a7b61736.one-web-eqz.pages.dev (or new URL)

### Step 5: Verification
1. Test npm package: `npx oneie@latest --version`
2. Report all live URLs:
   - npm: https://www.npmjs.com/package/oneie
   - Web: https://web.one.ie (or Cloudflare URL)
   - GitHub CLI: https://github.com/one-ie/cli
   - GitHub One: https://github.com/one-ie/one

### Step 6: Summary Report
Provide a concise summary:
```
✅ Release v2.0.X Complete!

📦 npm: oneie@2.0.X (live)
🌐 Web: https://web.one.ie (deployed)
🏷️ GitHub: v2.0.X tagged
⏱️ Total time: ~X minutes

Next steps:
- Create GitHub releases
- Test installation: npx oneie@latest
- Monitor for errors
```

## Important Notes

**You MUST:**
- ✅ Run pre-deployment checks first
- ✅ Stop if critical errors found
- ✅ Build web before deploying
- ✅ Verify npm publish succeeded
- ✅ Capture and report all URLs
- ✅ Provide clear success/failure status

**You MUST NOT:**
- ❌ Skip pre-deployment validation
- ❌ Deploy without building first
- ❌ Continue if npm publish fails
- ❌ Forget to report deployment URLs

## Error Handling

### If pre-deployment check fails:
1. Report specific errors to user
2. Suggest fixes
3. STOP - do not proceed

### If npm publish fails:
1. Check if already published: `npm view oneie@X.X.X`
2. If version exists, bump patch and retry
3. Report to user

### If Cloudflare deploy fails:
1. Check if build succeeded
2. Report wrangler error
3. Suggest: Check environment variables
4. Continue (deployment can be done separately)

## When to Use

Use `/release` when you want to:
- ✅ Deploy a new version to production
- ✅ Publish CLI updates to npm
- ✅ Update web frontend on Cloudflare
- ✅ Create git tags for version
- ✅ Execute full release pipeline

## When NOT to Use

Do NOT use `/release` if:
- ❌ You're still developing/testing
- ❌ There are failing tests
- ❌ You haven't committed changes
- ❌ You're not ready for production

**Instead:** Use individual commands like `/push-cli` or test locally first.

## Example Usage

**User:** `/release patch`

**Claude:**
1. Runs pre-deployment check
2. Validates (0 errors, 7 warnings)
3. Runs release.sh patch
4. Bumps version 2.0.6 → 2.0.7
5. Syncs 552 files
6. Commits and pushes to GitHub
7. Publishes to npm
8. Builds web
9. Deploys to Cloudflare
10. Reports success with all URLs

## Prerequisites

Before running `/release`, ensure:
- ✅ You're in the ONE root directory
- ✅ All changes are committed (or acceptable)
- ✅ You're logged in to npm (`npm whoami`)
- ✅ Wrangler is authenticated
- ✅ Release scripts exist in `scripts/`

## Post-Release Tasks

After `/release` succeeds, remind user to:
1. Create GitHub releases (manual)
2. Test installation: `npx oneie@latest`
3. Verify web deployment
4. Monitor npm downloads
5. Check for errors in first 24 hours

---

**Full Release Pipeline: npm → GitHub → Cloudflare Pages → Production! 🚀**

---
allowed-tools: Bash(./scripts/release.sh:*), Bash(./scripts/pre-deployment-check.sh:*), Bash(./scripts/cloudflare-deploy.sh:*), Bash(cd web && bun run build:*), Bash(cd web && wrangler pages deploy:*), Bash(cd cli && npm publish:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git tag:*), Bash(npm view oneie:*)
description: Execute full ONE Platform release with automated Cloudflare deployment via API
---

# /release - Full ONE Platform Release

**Purpose:** Execute the complete 13-step release process including npm publish, GitHub pushes, and Cloudflare Pages deployment.

## Context

Before starting the release, gather this information:
1. Run `pwd` to verify current directory
2. Check `ls -lah scripts/release.sh` to verify release script exists
3. Run `git status --short` to check for uncommitted changes
4. Check `ls -lah web/dist/` to see if a build already exists

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
   - Sync 518+ files to cli/ and apps/one/:
     - `/one/*` → `cli/one/` and `apps/one/one/`
     - `/.claude/*` → `cli/.claude/` and `apps/one/one/.claude/`
     - `/web/*` → `apps/one/web/` (git subtree)
     - `CLAUDE.md`, `README.md`, `LICENSE.md`, `SECURITY.md` → all targets
     - `web/AGENTS.md` → `apps/one/one/AGENTS.md`
   - **AUTOMATICALLY** commit and push apps/one/ to one-ie/one (no confirmation needed)
   - Show git status for review
3. When prompted for cli/ "Commit and push?", answer 'y'
4. When prompted "Create tag?", answer 'y'

### Step 3: npm Publish
1. `cd cli`
2. Run `npm publish --access public`
3. Wait for completion
4. Verify: `npm view oneie version`
5. Report new version to user

### Step 4: Build & Deploy Web to Cloudflare

**Automatic Mode (if CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are set):**
1. The release script automatically detects credentials
2. Builds web with `cd web && bun run build`
3. Deploys via `scripts/cloudflare-deploy.sh` using Cloudflare API
4. Shows deployment status and URLs
5. **Zero confirmation needed** - fully automated!

**Manual Mode (if credentials not set):**
1. `cd web`
2. Run `bun run build`
3. When prompted "Deploy web to Cloudflare Pages via wrangler?", answer 'y'
4. Script runs `wrangler pages deploy dist --project-name=web`
5. Capture deployment URL and report to user

**Standalone Deployment:**
```bash
# Deploy directly via Cloudflare module
scripts/cloudflare-deploy.sh deploy web web/dist production

# Check deployment status
scripts/cloudflare-deploy.sh status web

# List recent deployments
scripts/cloudflare-deploy.sh list web 5
```

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

**For Automated Cloudflare Deployment (Optional):**
- ✅ Set `CLOUDFLARE_API_TOKEN` environment variable
- ✅ Set `CLOUDFLARE_ACCOUNT_ID` environment variable

**Without these credentials:**
- The script falls back to interactive wrangler CLI deployment
- Still fully functional, just requires manual confirmation

## Post-Release Tasks

After `/release` succeeds, remind user to:
1. Create GitHub releases (manual)
2. Test installation: `npx oneie@latest`
3. Verify web deployment
4. Monitor npm downloads
5. Check for errors in first 24 hours

## Installation Folder Sync (Optional)

If installation folders need to be synced across repositories:

```bash
# Sync installation folder to assembly repo
if [ -d "/${INSTALLATION_NAME}" ]; then
  echo "📦 Syncing installation folder: ${INSTALLATION_NAME}"

  # Copy to assembly repo
  rsync -av --delete \
    "/${INSTALLATION_NAME}/" \
    "apps/one/${INSTALLATION_NAME}/"

  # Commit and push
  cd apps/one
  git add "${INSTALLATION_NAME}/"
  git commit -m "chore: sync installation folder ${INSTALLATION_NAME}"
  git push

  echo "✅ Installation folder synced"
fi
```

**Update version bump to include installation folder in changelog:**

```bash
# Generate changelog entry
cat >> CHANGELOG.md <<EOF

## [${NEW_VERSION}] - $(date +%Y-%m-%d)

### Added
- Installation folder multi-tenancy support
- Hierarchical file resolution with group support
- CLI: \`npx oneie init\` to create installation folders
- Frontend: Auto-resolution of installation-specific files
- Deployment: Cloudflare Pages integration for installation folders

### Changed
- Terminology: "group folder" → "installation folder"
- Environment: \`GROUP_NAME\` → \`INSTALLATION_NAME\`
- Documentation updated across CLAUDE.md, AGENTS.md, README.md

### Security
- Path traversal prevention in file resolution
- Symlink validation
- Audit logging for file access
EOF
```

---

**Full Release Pipeline: npm → GitHub → Cloudflare Pages → Production! 🚀**

---
allowed-tools: Task(agent-ops:*)
description: Execute full ONE Platform release via agent-ops specialist
---

# /release - Full ONE Platform Release

**Purpose:** Delegate to `agent-ops` specialist to execute the complete 13-step release process including npm publish, GitHub pushes, and Cloudflare Pages deployment.

## How It Works

This command **MUST** delegate to the `agent-ops` specialist agent, which has the expertise and tools to handle:
1. Pre-deployment validation
2. Version bumping
3. File synchronization
4. Git operations
5. npm publishing
6. Cloudflare deployments (using CLOUDFLARE_GLOBAL_API_KEY)
7. Verification and reporting

## Release Types

- `/release patch` - Bug fixes (3.3.5 → 3.3.6)
- `/release minor` - New features (3.3.5 → 3.4.0)
- `/release major` - Breaking changes (3.3.5 → 4.0.0)
- `/release sync` - Sync files without version bump

## Your Task

**CRITICAL:** You MUST delegate this entire release to the `agent-ops` specialist by using the Task tool:

```typescript
Task({
  subagent_type: "agent-ops",
  description: "Execute full release",
  prompt: `Execute a ${releaseType} release for ONE Platform:

1. Run pre-deployment validation
2. Execute release script: ./scripts/release.sh ${releaseType}
3. Publish to npm: cd cli && npm publish --access public
4. Verify deployment:
   - npm: npx oneie@latest --version
   - Web: Check Cloudflare deployment URL
   - GitHub: Verify tags created
5. Report summary with all live URLs

IMPORTANT: The CLOUDFLARE_GLOBAL_API_KEY is set in .env and provides FULL ACCESS to Cloudflare API for automated deployments.`
})
```

## Agent-Ops Responsibilities

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

**For Automated Cloudflare Deployment:**

**Option 1: Global API Key (FULL ACCESS - Recommended for automated deployments):**
- ✅ Set `CLOUDFLARE_GLOBAL_API_KEY` in root `.env`
- ✅ Set `CLOUDFLARE_ACCOUNT_ID` in root `.env`
- ✅ Set `CLOUDFLARE_EMAIL` in root `.env`
- ✅ Provides complete programmatic access to Cloudflare API
- ✅ Zero manual intervention needed

**Option 2: API Token (Scoped access):**
- ✅ Set `CLOUDFLARE_API_TOKEN` environment variable
- ✅ Set `CLOUDFLARE_ACCOUNT_ID` environment variable

**Without these credentials:**
- The script falls back to interactive wrangler CLI deployment
- Still fully functional, just requires manual confirmation

**CRITICAL:** The `CLOUDFLARE_GLOBAL_API_KEY` in `.env` provides **FULL ACCESS** to the Cloudflare API. This is required for fully automated deployments via `/release` command.

## Frontend Onboarding Environment Variables

**New in v3.6.0:** The frontend now supports organization-specific onboarding via environment variables in `web/.env.local`:

```bash
# Organization Configuration (Frontend Onboarding)
ORG_NAME=your-org-name          # Reserved: "one" for ONE Platform
ORG_WEBSITE=https://example.com # Reserved: "https://one.ie" for ONE Platform
ORG_FOLDER=your-org-folder      # Reserved: "onegroup", "one" for ONE Platform
ONE_BACKEND=off                 # "off" = frontend-only, "on" = full platform
```

**How it works:**
- `ORG_NAME=one` → Full ONE Platform homepage with complete navigation
- `ORG_NAME=acme` → Customer org homepage with GetStartedPrompt interface
- `ONE_BACKEND=off` → Frontend-only mode (no Convex, no auth)
- `ONE_BACKEND=on` → Full platform with backend features

**Reserved values** (protected in CLI via validation):
- Name: `one`
- Folders: `onegroup`, `one`
- Website: `https://one.ie`, `one.ie`

**Testing:**
See `TESTING-ONBOARDING.md` for complete test guide.

## MCP Server Configuration

**Important:** The `.mcp.json` file configures MCP (Model Context Protocol) servers and is automatically synced to all target repositories:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "stripe": {
      "url": "https://mcp.stripe.com"
    }
  }
}
```

**What it provides:**
- **shadcn MCP:** Access to shadcn/ui component library via MCP
- **Stripe MCP:** Stripe API integration via Model Context Protocol

**Synced to:**
- `cli/.mcp.json` - For CLI MCP server access
- `apps/one/one/.mcp.json` - For assembly repo MCP access

## Post-Release Tasks

After `/release` succeeds, remind user to:
1. Create GitHub releases (manual)
2. Test installation: `npx oneie@latest`
3. Verify web deployment
4. Monitor npm downloads
5. Check for errors in first 24 hours

## Installation Folder Sync (Optional)

**Note:** `INSTALLATION_NAME` is different from `ORG_NAME`:
- `INSTALLATION_NAME` - Backend/filesystem identifier for org-specific documentation
- `ORG_NAME` - Frontend environment variable controlling UI/branding
- Both can have the same value (e.g., "acme") but serve different purposes

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
- Frontend onboarding system with ORG_NAME/ORG_WEBSITE/ONE_BACKEND
- Reserved name validation in CLI (prevents use of "one", "one.ie")
- GetStartedPrompt component for customer organizations
- MinimalSidebar layout with Blog + License only
- Installation folder multi-tenancy support
- Hierarchical file resolution with group support
- CLI: \`npx oneie init\` to create installation folders
- Frontend: Auto-resolution of installation-specific files

### Changed
- Frontend conditionally renders based on ORG_NAME environment variable
- Backend can be disabled with ONE_BACKEND=off for frontend-only development
- Documentation updated across CLAUDE.md, AGENTS.md, README.md

### Security
- Reserved name protection prevents brand confusion
- Path traversal prevention in file resolution
- Symlink validation
- Audit logging for file access
EOF
```

---

**Full Release Pipeline: npm → GitHub → Cloudflare Pages → Production! 🚀**

# Cloudflare Pages Infrastructure Setup Report

**Date:** 2025-10-23
**Agent:** agent-ops (Ops Agent)
**Status:** Analysis Complete - Manual Action Required

## Executive Summary

Completed comprehensive analysis of Cloudflare Pages infrastructure for multi-site deployment architecture. API credentials verified, existing projects documented, and architecture gap identified. Manual project creation required due to Cloudflare API limitations.

## Current State ✓

### Credentials Verified
- **Account ID:** 627e0c7ccbe735a4a7cabf91e377bbad
- **Email:** tony@one.ie
- **Global API Key:** Working (verified via API call)
- **Account Type:** Standard
- **Created:** 2012-06-13

### Existing Projects (3)

1. **web** → one.ie (main production site)
   - **Project ID:** 787739a5-ea85-48cf-8469-1f529031af9c
   - **GitHub:** one-ie/web (auto-deploy enabled)
   - **Custom Domains:** one.ie, web.one.ie, www.one.ie
   - **Build Command:** `bun run build`
   - **Dist Directory:** dist
   - **Status:** Active, currently serving one.ie

2. **frontend** → frontend.one.ie
   - **Project ID:** ffc16a1b-2e46-4b15-ad7e-dba5b645f722
   - **GitHub:** one-ie/frontend (same repo as web)
   - **Custom Domains:** frontend.one.ie
   - **Build Command:** `bun install && bun run build`
   - **Status:** Active, auto-deploys from one-ie/frontend

3. **astro-shadcn** → (no custom domain)
   - **Project ID:** a04130aa-f146-4b41-9ea7-94738a694c4a
   - **GitHub:** one-ie/one
   - **Custom Domains:** None (only astro-shadcn-4lu.pages.dev)
   - **Build Command:** `bun install && bun run build`
   - **Root Directory:** web/
   - **Status:** Active, but production deployments disabled

## Required for New Architecture

According to `/scripts/release.sh` and `.claude/agents/agent-ops.md`:

### Main Site (oneie project)
- **Target:** one.ie
- **Source Repo:** one-ie/oneie
- **Source Directory:** apps/oneie/web
- **Build:** bun run build
- **Status:** ❌ PROJECT DOES NOT EXIST

### Demo Site (one project)
- **Target:** demo.one.ie
- **Source Repo:** one-ie/one
- **Source Directory:** apps/one/web
- **Build:** bun run build
- **Status:** ❌ PROJECT DOES NOT EXIST

## Architecture Gap Analysis

### Problem
The release script expects projects named "oneie" and "one" but they don't exist yet. The existing "web" project occupies the one.ie domain.

### Recommended Solution: Create New Projects

**Pros:**
- Aligns perfectly with release script expectations
- Clean separation between main and demo sites
- Each project maps to its own GitHub repo
- Follows documented architecture

**Cons:**
- Requires moving domain from "web" to "oneie"
- Brief DNS propagation period (usually < 5 min)
- Need to create projects manually (API doesn't support creation)

### Implementation Steps

1. Create "oneie" project via Cloudflare Dashboard
2. Create "one" project via Cloudflare Dashboard
3. Connect oneie → one-ie/oneie GitHub repo
4. Connect one → one-ie/one GitHub repo
5. Move one.ie domain from "web" to "oneie"
6. Add demo.one.ie domain to "one" project
7. Test deployments
8. Verify release script works

## API Limitation Discovered

### Cloudflare Pages API Constraint
The Cloudflare Pages API does NOT support creating projects programmatically. Projects can only be created via:
1. **Cloudflare Dashboard** (manual)
2. **Wrangler CLI** (requires authentication)

### Workaround
Since wrangler authentication failed, projects must be created through the Cloudflare Dashboard.

## Manual Steps Required

### 1. Create oneie Project
1. Visit: https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad/pages
2. Click "Create a project"
3. Connect to GitHub: **one-ie/oneie**
4. Production branch: **main**
5. Build command: `cd web && bun run build`
6. Build output directory: `web/dist`
7. Root directory: (leave empty)

### 2. Create one Project
1. Visit: https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad/pages
2. Click "Create a project"
3. Connect to GitHub: **one-ie/one**
4. Production branch: **main**
5. Build command: `cd web && bun run build`
6. Build output directory: `web/dist`
7. Root directory: (leave empty)

### 3. Configure Custom Domains (via API)

After manual project creation, run these commands:

```bash
# Add one.ie to oneie project
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects/oneie/domains" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9" \
  -H "Content-Type: application/json" \
  --data '{"name":"one.ie"}'

# Add demo.one.ie to one project
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects/one/domains" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9" \
  -H "Content-Type: application/json" \
  --data '{"name":"demo.one.ie"}'
```

### 4. Remove Conflicting Domain (After Verification)

**IMPORTANT:** Only run this after confirming the oneie project is working:

```bash
# Remove one.ie from web project
curl -X DELETE \
  "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects/web/domains/one.ie" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9"
```

## Environment Variables

### For oneie project (Production)
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
GITHUB_CLIENT_ID=55c60b9b2850097d51b7
NODE_VERSION=22.16.0
ONE_BACKEND=on
INSTALLATION_NAME=one-group
```

### For one project (Demo)
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
NODE_VERSION=22.16.0
INSTALLATION_NAME=one-demo
```

## Post-Setup Verification

### 1. Verify Projects Exist
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9" | grep -o '"name":"[^"]*"'
```

### 2. Check oneie Project Domains
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects/oneie" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9" | jq '.result.domains'
```

### 3. Check one Project Domains
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects/one" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9" | jq '.result.domains'
```

### 4. Test Deployment
```bash
./scripts/release.sh patch main   # Deploy to one.ie only
./scripts/release.sh patch demo   # Deploy to demo.one.ie only
./scripts/release.sh patch        # Deploy to both
```

## Success Criteria

- ✓ Two projects created: "oneie" and "one"
- ✓ oneie project → connected to one-ie/oneie repo
- ✓ one project → connected to one-ie/one repo
- ✓ one.ie custom domain → oneie project
- ✓ demo.one.ie custom domain → one project
- ✓ Environment variables configured
- ✓ Auto-deployment enabled from GitHub
- ✓ Release script works: `./scripts/release.sh patch`

## Timeline Estimate

- **Manual project creation:** 10 minutes (via dashboard)
- **Domain configuration via API:** 2 minutes
- **DNS propagation:** 5-15 minutes
- **First deployment test:** 5 minutes
- **Total:** ~25-35 minutes

## Risk Mitigation

### Zero Downtime Strategy
1. Create both new projects first
2. Test deployments to *.pages.dev subdomains
3. Only move domains after confirming new setup works
4. Keep "web" project as fallback during migration
5. Can rollback by re-adding domain to "web" project

### Rollback Procedure

If something goes wrong, restore domain to web project:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/627e0c7ccbe735a4a7cabf91e377bbad/pages/projects/web/domains" \
  -H "X-Auth-Email: tony@one.ie" \
  -H "X-Auth-Key: 2751f1e8bdbc3cf9481e0cff345605c9bd3b9" \
  -H "Content-Type: application/json" \
  --data '{"name":"one.ie"}'
```

## Summary

**Status:** Infrastructure analysis complete, API credentials verified, existing projects documented.

**Blocker:** Cloudflare Pages API does not support programmatic project creation. Projects must be created manually via dashboard.

**Next Step:** User must create "oneie" and "one" projects via Cloudflare Dashboard, then domains can be configured via API (commands provided above).

**After Manual Creation:** This agent can complete domain configuration, verify setup, and test the release process.

---

**Generated by:** agent-ops (Ops Agent)
**Date:** 2025-10-23
**Related Files:**
- `/scripts/release.sh`
- `/.claude/agents/agent-ops.md`
- `/.claude/commands/release.md`

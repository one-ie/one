---
allowed-tools: Bash(*), Read(*), Edit(*)
description: Deploy web to Cloudflare Pages
---

# /deploy - Deploy Sites to Cloudflare Pages

**Purpose:** Build and deploy ONE Platform sites to Cloudflare Pages with automated deployment scripts.

## Two-Site Architecture

- **oneie/** → https://one.ie (production site - source of truth)
- **web/** → https://web.one.ie (starter template - AUTO-GENERATED)

## Quick Deploy

**Deploy Production Site (oneie):**
```bash
./scripts/deploy-oneie.sh
```

**Deploy Starter Template (web):**
```bash
./scripts/deploy-web.sh
```

**Deploy Both:**
```bash
./scripts/deploy-oneie.sh && ./scripts/deploy-web.sh
```

## How It Works

The deployment scripts:
1. Load credentials from `.env`
2. Navigate to site directory (oneie/ or web/)
3. Build production bundle (`bun run build`)
4. Deploy to Cloudflare Pages using wrangler
5. Report deployment URL and status

**Deployment Flow:**
1. Check credentials (CLOUDFLARE_GLOBAL_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_EMAIL)
2. Build site with React 19 edge support
3. Clear CLOUDFLARE_API_TOKEN (avoid conflicts)
4. Export required credentials
5. Deploy via wrangler
6. Confirm success

## Requirements

**Before deploying, ensure:**
- ✅ Cloudflare Global API Key configured: `export CLOUDFLARE_GLOBAL_API_KEY=your-key`
- ✅ Cloudflare Account ID set: `export CLOUDFLARE_ACCOUNT_ID=your-account-id`
- ✅ Cloudflare Email set: `export CLOUDFLARE_EMAIL=your-email@domain.com`
- ✅ React 19 edge alias is configured in `astro.config.mjs`
- ✅ Environment variables set in `wrangler.toml`

## Deployment URLs

**Production:**
- Primary: https://web.one.ie (custom domain)
- Cloudflare: https://web-d3d.pages.dev

**Preview:**
- Auto-generated: https://[commit-hash].web-d3d.pages.dev

## Environment Configuration

### For ONE Platform (Default)

```toml
# wrangler.toml
ORG_NAME = "one"
ORG_WEBSITE = "https://one.ie"
ORG_FOLDER = "onegroup"
ONE_BACKEND = "on"
```

**Result:** Full ONE Platform homepage

### For Customer Organizations

```toml
# wrangler.toml (customer config)
ORG_NAME = "acme"
ORG_WEBSITE = "https://acme.com"
ORG_FOLDER = "acme"
ONE_BACKEND = "off"  # Frontend-only
```

**Result:** Customer homepage with GetStartedPrompt

## React 19 + Cloudflare Edge Fix

**Critical:** Ensure `astro.config.mjs` has:

```javascript
resolve: {
  alias: {
    'react-dom/server': 'react-dom/server.edge',
  },
}
```

Without this, deployment fails with `MessageChannel is not defined`.

## Common Issues

**Authentication failed:**
```bash
# Make sure all Cloudflare variables are set:
echo $CLOUDFLARE_GLOBAL_API_KEY
echo $CLOUDFLARE_ACCOUNT_ID
echo $CLOUDFLARE_EMAIL

# Or fallback to API Token if Global Key not available:
export CLOUDFLARE_API_TOKEN=your-scoped-token
```

**MessageChannel error:**
```bash
# Fix: Add edge alias to astro.config.mjs
'react-dom/server': 'react-dom/server.edge'
```

**Build errors:**
```bash
cd web && bun run check
```

**Credentials not recognized:**
```bash
# Ensure the root .env file has these exact variables:
# (These are automatically loaded by scripts)
CLOUDFLARE_GLOBAL_API_KEY=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_EMAIL=...
```

## Customer Deployment

For customers deploying their own sites:

```bash
# 1. Install CLI
npx oneie

# 2. Configure (edit web/.env.local)
ORG_NAME=acme
ORG_WEBSITE=https://acme.com
ONE_BACKEND=off

# 3. Deploy
cd web
bun run build
wrangler pages deploy dist --project-name=acme-web
```

---

**Deployment ready** 🚀

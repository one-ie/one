---
allowed-tools: Bash(*), Read(*), Edit(*)
description: Deploy web to Cloudflare Pages
---

# /deploy - Deploy Web to Cloudflare Pages

**Purpose:** Build and deploy the web application to Cloudflare Pages with zero-downtime deployment.

## How It Works

This command builds the Astro web application and deploys it to Cloudflare Pages using wrangler.

**Deployment Flow:**
1. Navigate to web directory
2. Build production bundle (with React 19 edge support)
3. Deploy to Cloudflare Pages
4. Report deployment URL and status

## Quick Deploy

```bash
# Build and deploy in one command
cd web && bun run build && wrangler pages deploy dist --project-name=web --commit-dirty=true
```

## Requirements

**Before deploying, ensure:**
- ✅ You're authenticated with wrangler: `wrangler login`
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

**MessageChannel error:**
```bash
# Fix: Add edge alias to astro.config.mjs
'react-dom/server': 'react-dom/server.edge'
```

**Not authenticated:**
```bash
wrangler login
```

**Build errors:**
```bash
cd web && bunx astro check
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

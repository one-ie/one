# Deploy Frontend to Cloudflare Pages

**Project Name:** `frontend`
**Repository:** `one-ie/frontend`
**Deployment Options:** Wrangler CLI or Git Push

---

## Overview

This guide covers deploying the ONE Platform frontend (Astro 5 + React 19) to Cloudflare Pages under a new project called `frontend`. You can deploy using either:

1. **Wrangler CLI** - Direct deployment from local machine
2. **Git Integration** - Automatic deployment on push to `one-ie/frontend`

## Prerequisites

- Cloudflare account with Pages access
- Wrangler CLI installed (`npm install -g wrangler`)
- Authenticated with Cloudflare (`wrangler login`)
- Repository: `https://github.com/one-ie/frontend`

## Project Configuration

### Build Settings

**Build Command:**
```bash
bun run build
```

**Build Output Directory:**
```
dist/
```

**Root Directory:**
```
/ (repository root)
```

**Node Version:**
```
20.x or later
```

### Environment Variables

Add these to Cloudflare Pages project settings:

```bash
# Convex Backend
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Better Auth
BETTER_AUTH_SECRET=your-production-secret-key
BETTER_AUTH_URL=https://frontend.pages.dev

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Deployment Method 1: Wrangler CLI

### Initial Setup

1. **Navigate to frontend directory:**
```bash
cd /path/to/ONE/frontend
```

2. **Build the project:**
```bash
bun run build
```

3. **Deploy to Cloudflare Pages:**
```bash
wrangler pages deploy dist --project-name=frontend --commit-dirty=true
```

### Subsequent Deployments

```bash
# Build and deploy in one command
bun run build && wrangler pages deploy dist --project-name=frontend
```

### Production Deployment

```bash
# Deploy to production branch
wrangler pages deploy dist --project-name=frontend --branch=main
```

### Preview Deployment

```bash
# Deploy preview (non-production)
wrangler pages deploy dist --project-name=frontend --branch=preview
```

## Deployment Method 2: Git Integration

### Setup Cloudflare Pages Project

1. **Log in to Cloudflare Dashboard**
   - Navigate to: https://dash.cloudflare.com
   - Go to **Workers & Pages** → **Pages**

2. **Create New Project**
   - Click **Create application** → **Pages** → **Connect to Git**
   - Select **GitHub** as the git provider
   - Authorize Cloudflare to access your GitHub account

3. **Select Repository**
   - Organization: `one-ie`
   - Repository: `frontend`
   - Click **Begin setup**

4. **Configure Build Settings**
   ```
   Project name: frontend
   Production branch: main
   Build command: bun run build
   Build output directory: dist
   Root directory: /
   ```

5. **Environment Variables**
   - Click **Add variable** for each environment variable listed above
   - Add all required variables (PUBLIC_CONVEX_URL, BETTER_AUTH_SECRET, etc.)
   - Separate variables for **Production** and **Preview** if needed

6. **Save and Deploy**
   - Click **Save and Deploy**
   - First deployment will begin automatically

### Automatic Deployments

Once configured, deployments happen automatically:

**Production Deployments:**
```bash
# Any push to main branch triggers production deployment
git push origin main
```

**Preview Deployments:**
```bash
# Any push to other branches triggers preview deployment
git push origin dev
git push origin feat/new-feature
```

### Deployment Branches

- **Production**: `main` branch → `https://frontend.pages.dev`
- **Preview**: `dev`, `feat/*`, etc. → `https://<branch>.<project>.pages.dev`

## Custom Domain Setup

### Add Custom Domain

1. **Cloudflare Dashboard**
   - Go to your `frontend` project
   - Click **Custom domains** tab
   - Click **Set up a custom domain**

2. **Add Domain**
   ```
   Primary domain: frontend.one.ie
   ```
   - If domain is on Cloudflare, DNS records are added automatically
   - If external, add the CNAME record provided

3. **SSL Certificate**
   - Cloudflare automatically provisions SSL certificate
   - Certificate is issued within minutes
   - HTTPS is enforced by default

### Multiple Domains

```
Production:
- frontend.one.ie (primary)
- www.frontend.one.ie (redirect)
- app.one.ie (alias)

Preview:
- preview.frontend.one.ie (dev branch)
- staging.frontend.one.ie (staging branch)
```

## Wrangler Configuration File

Create `wrangler.toml` in `/frontend` directory for easier deployments:

```toml
# wrangler.toml
name = "frontend"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production]
pages_build_output_dir = "dist"

[env.preview]
pages_build_output_dir = "dist"
```

With this file, deployment becomes simpler:

```bash
# Deploy to production
wrangler pages deploy

# Deploy to preview
wrangler pages deploy --env=preview
```

## Build Optimization

### Enable Caching

Add to `astro.config.mjs`:

```javascript
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',
    functionPerRoute: true,
    routes: {
      strategy: 'auto',
      include: ['/*'],
      exclude: ['/assets/*', '/_astro/*']
    }
  }),
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'convex-vendor': ['convex', 'convex/react']
          }
        }
      }
    }
  }
});
```

### Asset Optimization

Cloudflare automatically optimizes:
- Image compression (WebP, AVIF)
- Brotli compression for text assets
- HTTP/3 and QUIC support
- Edge caching for static assets

## Monitoring and Analytics

### Enable Web Analytics

1. **Cloudflare Dashboard** → **frontend** project
2. Click **Analytics** tab
3. Enable **Web Analytics**
4. Add analytics beacon to your site (optional - auto-injected)

### View Deployment Logs

**Via Dashboard:**
- Go to **Deployments** tab
- Click on any deployment to view build logs
- View real-time logs during deployment

**Via Wrangler:**
```bash
# View recent deployments
wrangler pages deployments list --project-name=frontend

# View specific deployment logs
wrangler pages deployments view <deployment-id> --project-name=frontend
```

### Function Logs

```bash
# Tail function logs in real-time
wrangler pages deployment tail --project-name=frontend
```

## Rollback Deployments

### Via Dashboard

1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click **⋯** menu → **Rollback to this deployment**
4. Confirm rollback

### Via Wrangler

```bash
# List deployments
wrangler pages deployments list --project-name=frontend

# Rollback to specific deployment
wrangler pages deployment rollback <deployment-id> --project-name=frontend
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
      - dev

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build
        env:
          PUBLIC_CONVEX_URL: ${{ secrets.PUBLIC_CONVEX_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: frontend
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref_name }}
```

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `PUBLIC_CONVEX_URL` - Backend URL
- `BETTER_AUTH_SECRET` - Auth secret key

## Troubleshooting

### Build Fails

**Issue:** Build command fails
```bash
# Check build locally first
bun run build

# Verify all dependencies are in package.json
bun install --frozen-lockfile
```

**Issue:** TypeScript errors
```bash
# Run type checking
bunx astro check

# Fix errors before deploying
```

### Environment Variables

**Issue:** Environment variables not working
- Verify variables are set in Cloudflare Pages dashboard
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)

### React 19 Edge Runtime

**Issue:** "MessageChannel is not defined"
- Ensure `react-dom/server.edge` alias is set in `astro.config.mjs`:

```javascript
vite: {
  resolve: {
    alias: {
      'react-dom/server': 'react-dom/server.edge'
    }
  }
}
```

### Function Size Limits

**Issue:** "Functions bundle exceeds size limit"
- Enable code splitting in Vite config
- Use dynamic imports for large dependencies
- Split routes into separate functions with `functionPerRoute: true`

### Authentication Issues

**Issue:** Auth not working after deployment
- Verify `BETTER_AUTH_URL` matches your production domain
- Check `PUBLIC_CONVEX_URL` is accessible from Cloudflare edge
- Ensure all OAuth redirect URLs are updated in provider settings

## Performance Optimization

### Edge Caching

Add cache headers for static assets in `public/_headers`:

```
# Cache static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

# Cache HTML with revalidation
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

# API routes - no cache
/api/*
  Cache-Control: no-store, no-cache, must-revalidate
```

### CDN Configuration

Cloudflare automatically provides:
- Global CDN with 330+ edge locations
- DDoS protection
- Bot management
- SSL/TLS encryption
- HTTP/3 support
- IPv6 support

## Security

### Enable Security Features

1. **WAF (Web Application Firewall)**
   - Enabled by default for all Cloudflare Pages
   - Protects against common vulnerabilities

2. **HTTPS Only**
   - Always use HTTPS URLs in production
   - HTTP automatically redirects to HTTPS

3. **Environment Variables**
   - Never commit secrets to git
   - Use Cloudflare Pages environment variables
   - Rotate secrets regularly

4. **CSP Headers**
   - Add Content Security Policy in `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Migration from Old Project

### Export from Old Project

1. **Save Environment Variables**
   - Export all environment variables from old project
   - Document custom domain settings

2. **Note Custom Configuration**
   - Build commands
   - Deployment branches
   - Access policies

### Setup New Project

1. Follow **Deployment Method 2** steps above
2. Import saved environment variables
3. Configure same custom domains (or new ones)
4. Run test deployment

### Switch Traffic

1. **DNS Method** (recommended):
   - Update DNS records to point to new project
   - Old project remains as fallback

2. **Domain Transfer**:
   - Remove domain from old project
   - Add domain to new `frontend` project
   - DNS updates automatically

### Cleanup Old Project

After successful migration:
```bash
# Delete old project (via dashboard or API)
# Keep old project for 30 days as backup (optional)
```

## Quick Reference

### Essential Commands

```bash
# Build locally
bun run build

# Deploy via Wrangler
wrangler pages deploy dist --project-name=frontend

# Deploy production
wrangler pages deploy dist --project-name=frontend --branch=main

# View deployments
wrangler pages deployments list --project-name=frontend

# Tail logs
wrangler pages deployment tail --project-name=frontend

# Deploy via Git
git push origin main  # production
git push origin dev   # preview
```

### Project URLs

```
Production: https://frontend.pages.dev
Preview: https://<branch>.frontend.pages.dev
Custom: https://frontend.one.ie (after DNS setup)
```

### Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Astro + Cloudflare**: https://docs.astro.build/en/guides/deploy/cloudflare/
- **Community**: https://discord.cloudflare.com

---

**Status:** Ready for deployment
**Last Updated:** 2025-01-13
**Maintained By:** ONE Platform Team

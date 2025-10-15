# 🚀 Deployment Guide - ONE Web Platform

**Status:** ✅ Production Ready

This guide covers deploying the ONE web platform to Cloudflare Pages with React 19 SSR.

---

## 📊 Build Stats

- **Build Output:** 20MB
- **TypeScript Errors:** 0
- **Runtime:** Cloudflare Workers (Edge)
- **Framework:** Astro 5 + React 19
- **Backend:** Decoupled via `PUBLIC_CONVEX_URL`

---

## 🎯 Pre-Deployment Checklist

### ✅ Required

- [ ] Backend deployed to Convex (URL ready)
- [ ] Environment variables configured
- [ ] Build completes without errors (`bun run build`)
- [ ] Cloudflare account with Pages access
- [ ] Domain configured (optional)

### ✅ Recommended

- [ ] Test locally with `bun run preview`
- [ ] Review `wrangler.toml` configuration
- [ ] KV namespace created for sessions
- [ ] Analytics configured

---

## 🔧 Environment Variables

### Production Environment

Create `.env.production` or configure in Cloudflare Pages dashboard:

```bash
# Backend Connection
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Authentication
BETTER_AUTH_SECRET=your-production-secret-key-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (via backend)
# Configured in backend deployment

# Analytics (optional)
# Add your analytics IDs here
```

### Important Notes

- `BETTER_AUTH_SECRET`: Must be at least 32 characters
- `BETTER_AUTH_URL`: Must match your production domain
- OAuth redirects must be configured for production URLs
- All `PUBLIC_` prefixed vars are exposed to browser

---

## 📦 Deployment Methods

### Method 1: Cloudflare Pages Dashboard (Recommended)

**Step 1: Connect Repository**

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Connect your Git repository
4. Select the `web` directory as root

**Step 2: Configure Build**

```yaml
Build command: bun run build
Build output directory: dist
Root directory: web
Node version: 20
```

**Step 3: Environment Variables**

Add all production environment variables in the dashboard under:
Settings → Environment Variables → Production

**Step 4: Deploy**

- Click "Save and Deploy"
- First build takes 2-3 minutes
- Subsequent builds: ~1 minute

---

### Method 2: Wrangler CLI

**Install Wrangler:**

```bash
npm install -g wrangler
# or
bun add -g wrangler
```

**Login:**

```bash
wrangler login
```

**Deploy:**

```bash
cd web
bun run build
wrangler pages deploy dist --project-name=web
```

**Set Environment Variables:**

```bash
wrangler pages secret put BETTER_AUTH_SECRET --project-name=web
wrangler pages secret put PUBLIC_CONVEX_URL --project-name=web
# ... repeat for all secrets
```

---

### Method 3: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
    paths:
      - 'web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        working-directory: ./web
        run: bun install

      - name: Build
        working-directory: ./web
        run: bun run build
        env:
          PUBLIC_CONVEX_URL: ${{ secrets.PUBLIC_CONVEX_URL }}
          # Add other env vars

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: one-platform
          directory: web/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🗄️ Cloudflare KV Setup (Sessions)

**Create KV Namespace:**

```bash
wrangler kv:namespace create SESSION
```

**Add to `wrangler.toml`:**

```toml
[[kv_namespaces]]
binding = "SESSION"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

**Or configure in dashboard:**

Settings → Functions → KV Namespace Bindings

---

## 🌐 Custom Domain

**Method 1: Cloudflare Pages Dashboard**

1. Go to your project in Pages dashboard
2. Click "Custom domains"
3. Add your domain
4. Update DNS records as instructed

**Method 2: Wrangler CLI**

```bash
wrangler pages domain add web.one.ie --project-name=web
```

**SSL/TLS:**

- Automatically provisioned by Cloudflare
- Free SSL certificates
- HTTP/3 enabled by default

---

## 🔍 Post-Deployment Verification

### Health Checks

```bash
# Check homepage
curl -I https://web.one.ie

# Check API health
curl https://web.one.ie/api/health

# Check auth endpoints
curl https://web.one.ie/api/auth/get-session
```

### Monitoring

**Cloudflare Analytics:**

- Dashboard → Analytics
- Real-time visitors
- Performance metrics
- Error rates

**Custom Monitoring:**

- Set up alerts for 4xx/5xx errors
- Monitor worker invocations
- Track KV read/write operations

---

## 🐛 Troubleshooting

### Build Fails

**Error: TypeScript errors**

```bash
# Run locally
bun run build

# Check specific errors
bunx astro check
```

**Error: Missing dependencies**

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Runtime Errors

**Error: Cannot connect to backend**

- Verify `PUBLIC_CONVEX_URL` is correct
- Check backend is deployed and accessible
- Test backend URL directly

**Error: Authentication not working**

- Verify `BETTER_AUTH_SECRET` matches backend
- Check `BETTER_AUTH_URL` matches production domain
- Verify OAuth redirect URLs are configured

**Error: KV Session binding**

- Create KV namespace in Cloudflare
- Add binding to `wrangler.toml`
- Redeploy

---

## 📈 Performance Optimization

### Edge Rendering

- ✅ React 19 SSR on Cloudflare Edge
- ✅ `react-dom/server.edge` configured
- ✅ Streaming HTML responses
- ✅ 330+ global locations

### Caching Strategy

```javascript
// pages/_middleware.ts
export const onRequest = async (context) => {
  const response = await context.next();

  // Cache static assets
  if (context.url.pathname.startsWith('/_astro/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  return response;
};
```

### Asset Optimization

- Images optimized at build time
- CSS minified and purged
- JavaScript bundled and tree-shaken
- Fonts preloaded

---

## 🔄 Rollback Strategy

**Cloudflare Pages keeps deployment history:**

1. Go to project → Deployments
2. Find previous working deployment
3. Click "Promote to production"
4. Instant rollback (< 30 seconds)

**Or via CLI:**

```bash
wrangler pages deployment list --project-name=web
wrangler pages deployment promote <deployment-id> --project-name=web
```

---

## 📊 Deployment Metrics

### Target Performance

- **TTFB:** < 100ms (Edge locations)
- **FCP:** < 1.0s
- **LCP:** < 2.5s
- **TTI:** < 3.0s
- **CLS:** < 0.1

### Monitoring

- Cloudflare Web Analytics (free)
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Error tracking with Sentry (optional)

---

## 🔐 Security Checklist

### Pre-Deployment

- [ ] Environment secrets secured
- [ ] OAuth redirects whitelisted
- [ ] CORS configured properly
- [ ] Rate limiting enabled (via backend)
- [ ] Content Security Policy set

### Post-Deployment

- [ ] Force HTTPS enabled
- [ ] Security headers configured
- [ ] DDoS protection active (Cloudflare)
- [ ] Bot protection enabled
- [ ] Regular security audits

---

## 🎉 Success Criteria

**Deployment is successful when:**

✅ Build completes with 0 errors
✅ Site loads at production URL
✅ Auth flows work (signin, signup, magic link)
✅ Backend connectivity confirmed
✅ All pages render without errors
✅ Performance metrics meet targets
✅ Analytics reporting data

---

## 📞 Support & Resources

**Documentation:**

- Cloudflare Pages: https://developers.cloudflare.com/pages
- Astro SSR: https://docs.astro.build/en/guides/server-side-rendering/
- Better Auth: https://better-auth.com/docs

**Getting Help:**

- GitHub Issues: Report bugs and feature requests
- Cloudflare Community: https://community.cloudflare.com
- Astro Discord: https://astro.build/chat

---

## 🚀 Quick Deploy (Production)

```bash
# 1. Build
cd web
bun run build

# 2. Deploy
wrangler pages deploy dist --project-name=one-platform

# 3. Verify
curl -I https://web.one.ie

# 4. Done! 🎉
```

---

**Last Updated:** October 14, 2025
**Build Version:** Production Ready
**Status:** ✅ Deployment Ready

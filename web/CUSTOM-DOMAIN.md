# Setting up web.one.ie Custom Domain

**Domain**: web.one.ie
**Project**: one-web
**Current URL**: https://a7b61736.one-web-eqz.pages.dev

---

## 📋 Prerequisites

- Access to Cloudflare account (627e0c7ccbe735a4a7cabf91e377bbad)
- Domain one.ie registered in Cloudflare
- one-web Pages project deployed

---

## 🌐 Step-by-Step Setup

### Step 1: Add Custom Domain in Cloudflare Pages

1. **Navigate to Pages Dashboard**:
   ```
   https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad/pages/view/one-web
   ```

2. **Go to Custom Domains**:
   - Click "Custom domains" tab
   - Click "Set up a custom domain"

3. **Enter Domain**:
   ```
   web.one.ie
   ```

4. **Click "Continue"**

---

### Step 2: Configure DNS

Cloudflare will automatically configure DNS. If manual setup is needed:

1. **Go to DNS Settings**:
   ```
   https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad/one.ie/dns
   ```

2. **Add CNAME Record**:
   ```
   Type: CNAME
   Name: web
   Target: a7b61736.one-web-eqz.pages.dev
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

3. **Save**

---

### Step 3: Wait for DNS Propagation

- **Typical Time**: 1-5 minutes with Cloudflare
- **Maximum Time**: 24 hours (unlikely)

**Check status**:
```bash
# Check DNS propagation
dig web.one.ie

# Or visit
https://dnschecker.org/#CNAME/web.one.ie
```

---

### Step 4: SSL Certificate

Cloudflare automatically provisions SSL certificates:

1. **Certificate Type**: Universal SSL (Free)
2. **Auto-renewal**: Enabled
3. **Activation Time**: 1-5 minutes

**Verify SSL**:
```bash
curl -I https://web.one.ie
# Should return: HTTP/2 200
```

---

### Step 5: Verify Deployment

Once DNS propagates:

**Test URLs**:
```
https://web.one.ie
https://web.one.ie/account/signin
https://web.one.ie/groups
https://web.one.ie/design
```

**All should work!** ✅

---

## 🔧 Configuration

### Cloudflare Pages Settings

**Project**: one-web

**Build Configuration**:
```yaml
Build command: bun run build
Build output directory: dist
Root directory: (leave empty)
```

**Environment Variables** (set in Pages dashboard):
```env
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_SECRET=<secret>
GITHUB_CLIENT_ID=55c60b9b2850097d51b7
GITHUB_CLIENT_SECRET=<secret>
GOOGLE_CLIENT_ID=<google-id>
GOOGLE_CLIENT_SECRET=<secret>
RESEND_API_KEY=<secret>
```

**Branch Deployments**:
- `main` branch → https://web.one.ie (production)
- Other branches → https://[branch].[project].pages.dev (preview)

---

## 🚀 Deploy Commands

### Deploy to Production (web.one.ie)

```bash
cd /Users/toc/Server/ONE/web

# Build
bun run build

# Deploy to one-web project
wrangler pages deploy dist --project-name=one-web

# Automatically deploys to:
# - https://web.one.ie (custom domain)
# - https://a7b61736.one-web-eqz.pages.dev (preview)
```

### Deploy via GitHub (Recommended)

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Connect `one-ie/web` repository
   - Select `main` branch

2. **Automatic Deployments**:
   - Push to `main` → Deploys to web.one.ie
   - Push to other branches → Preview deployments

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] **DNS resolves**: `dig web.one.ie` shows CNAME
- [ ] **SSL active**: `curl -I https://web.one.ie` returns 200
- [ ] **Homepage loads**: https://web.one.ie shows ONE platform
- [ ] **Authentication works**: Sign in/sign up functional
- [ ] **Groups work**: https://web.one.ie/groups loads
- [ ] **Design system**: https://web.one.ie/design renders
- [ ] **API routes**: OAuth callbacks functional

---

## 🐛 Troubleshooting

### Issue: DNS not resolving

**Check**:
```bash
dig web.one.ie
# Should show CNAME to one-web project
```

**Fix**:
1. Verify CNAME record in Cloudflare DNS
2. Ensure orange cloud (Proxied) is enabled
3. Wait up to 5 minutes for propagation

### Issue: SSL certificate not active

**Check**:
```bash
curl -I https://web.one.ie
# Should not show certificate errors
```

**Fix**:
1. Go to Cloudflare Pages → Custom domains
2. Check certificate status
3. Wait up to 15 minutes for provisioning
4. If stuck, remove and re-add custom domain

### Issue: 404 or blank page

**Check**:
1. Verify deployment succeeded
2. Check `dist/` directory has files
3. Verify `wrangler.toml` is configured

**Fix**:
```bash
# Redeploy
cd web
bun run build
wrangler pages deploy dist --project-name=one-web
```

### Issue: Environment variables not working

**Fix**:
1. Go to Pages dashboard → Settings → Environment variables
2. Add all required variables for Production
3. Redeploy (push to main or manual deploy)

---

## 📊 DNS Configuration Summary

```
Domain: one.ie
Subdomain: web.one.ie

DNS Records:
┌──────┬──────┬───────────────────────────────────────┬──────────┐
│ Type │ Name │ Target                                │ Status   │
├──────┼──────┼───────────────────────────────────────┼──────────┤
│ CNAME│ web  │ a7b61736.one-web-eqz.pages.dev        │ Proxied  │
└──────┴──────┴───────────────────────────────────────┴──────────┘

SSL:
- Type: Universal SSL (Free)
- Status: Active
- Auto-renewal: Enabled

Cloudflare Protection:
- DDoS protection: Enabled
- WAF: Enabled
- Bot protection: Enabled
- Edge caching: Enabled
```

---

## 🔄 Maintenance

### Update DNS (if needed)

If deployment URL changes:

```bash
# Get current deployment URL
wrangler pages deployment list --project-name=one-web

# Update CNAME record in Cloudflare DNS to new URL
```

### Monitor Performance

**Cloudflare Analytics**:
```
https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad/pages/view/one-web/analytics
```

**Metrics Available**:
- Page views
- Unique visitors
- Requests
- Bandwidth
- Geographic distribution

---

## 🎯 Production URLs

After setup complete:

**Primary Domain**:
```
https://web.one.ie
```

**Cloudflare Preview**:
```
https://a7b61736.one-web-eqz.pages.dev
```

**GitHub Repository**:
```
https://github.com/one-ie/web
```

**npm Package**:
```
https://www.npmjs.com/package/oneie
```

---

## ✅ Success Criteria

Custom domain is successfully configured when:

- ✅ https://web.one.ie loads without errors
- ✅ SSL certificate is active (green padlock)
- ✅ DNS resolves to Cloudflare Pages
- ✅ All routes work (/, /account/signin, /groups, etc.)
- ✅ Authentication functions correctly
- ✅ No console errors
- ✅ Performance is optimal (<100ms TTFB)

---

## 📚 Resources

**Cloudflare Docs**:
- Pages Custom Domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- DNS Configuration: https://developers.cloudflare.com/dns/
- SSL Certificates: https://developers.cloudflare.com/ssl/

**Wrangler CLI**:
- Pages Deploy: https://developers.cloudflare.com/workers/wrangler/commands/#pages
- Pages List: `wrangler pages deployment list --project-name=one-web`

**Project Links**:
- Dashboard: https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad/pages
- GitHub: https://github.com/one-ie/web
- Documentation: /Users/toc/Server/ONE/web/DEPLOYMENT.md

---

**web.one.ie is ready to go live! 🚀**

**Setup Time**: 5-10 minutes
**DNS Propagation**: 1-5 minutes
**SSL Activation**: 1-5 minutes
**Total**: ~15 minutes from start to live!

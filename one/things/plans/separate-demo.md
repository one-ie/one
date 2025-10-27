# Separate Development from Customer Releases

**Problem:** We develop the full ONE Platform in `/web` but need to release different versions:
1. Main platform website (one.ie)
2. Demo/starter template (web.one.ie) - same as what users download via `npx oneie`

**Current Flow:**
```
/web (development)
  → rsync →
apps/one/web (assembly)
  → build → deploy →
Cloudflare Pages (one.ie)
```

**New Flow:**
```
/web (development - full features)
  ├→ rsync → apps/oneie/web → Deploy → one.ie (main site)
  └→ rsync → apps/one/web → Deploy → demo.one.ie (demo)
                                  ↓
                          Also: git push → one-ie/one
                                  ↓
                          Available via: npx oneie
```

**Requirement:**
- one.ie = Full platform/marketing site (oneie project)
- demo.one.ie = Demo/starter template (one project, matches `npx oneie` download)
- Users get same code whether they visit demo.one.ie or run `npx oneie`

---

## Recommended Strategy: Multi-Site Deployment

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  DEVELOPMENT REPOSITORY: /web                               │
│  - Full ONE Platform features                               │
│  - All navigation and admin tools                           │
│  - Internal development environment variables               │
│  - Test with: bun run dev (localhost:4321)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─────────────────┐
                   ↓                 ↓
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  MAIN SITE: apps/oneie/web   │  │  DEMO SITE: apps/one/web     │
│  - Full platform features    │  │  - Starter template          │
│  - Marketing content         │  │  - Minimal features          │
│  - Deploy → one.ie           │  │  - Deploy → demo.one.ie      │
│  - Repo: one-ie/oneie        │  │  - Repo: one-ie/one          │
└──────────────────────────────┘  └────────────┬─────────────────┘
                                               │
                                               ↓
                                    ┌──────────────────────────────┐
                                    │  CLI DISTRIBUTION            │
                                    │  - npx oneie                 │
                                    │  - git clone one-ie/one      │
                                    │  - Same code as demo.one.ie  │
                                    └──────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Environment-Based Feature Flags

**Create environment-specific configuration:**

```bash
# /web/.env.local (DEVELOPMENT - full features)
# This is what you use during development
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=true
ENABLE_EXPERIMENTAL_FEATURES=true
SHOW_FULL_NAVIGATION=true
SITE_TYPE=development
```

```bash
# /web/.env.main (MAIN SITE - one.ie)
# This gets copied to apps/one/web during release
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=false
ENABLE_EXPERIMENTAL_FEATURES=false
SHOW_FULL_NAVIGATION=true
SITE_TYPE=main
```

```bash
# /web/.env.demo (DEMO/STARTER - demo.one.ie)
# This gets copied to apps/one/web during release
# Also: what users get via npx oneie
ORG_NAME=one
ORG_WEBSITE=https://demo.one.ie
ONE_BACKEND=off
ENABLE_ADMIN_FEATURES=false
ENABLE_EXPERIMENTAL_FEATURES=false
SHOW_FULL_NAVIGATION=false
SITE_TYPE=demo
```

**Usage in code:**

```typescript
// src/config/features.ts
export const features = {
  adminPanel: import.meta.env.ENABLE_ADMIN_FEATURES === 'true',
  experimental: import.meta.env.ENABLE_EXPERIMENTAL_FEATURES === 'true',
  fullNavigation: import.meta.env.SHOW_FULL_NAVIGATION === 'true',
  orgName: import.meta.env.ORG_NAME || 'one',
  backendEnabled: import.meta.env.ONE_BACKEND === 'on',
};

// src/components/Sidebar.tsx
import { features } from '@/config/features';

export function Sidebar() {
  const navItems = features.fullNavigation
    ? [/* all nav items */]
    : [/* customer nav items only */];

  return <nav>{/* ... */}</nav>;
}
```

---

### Phase 2: Enhanced Release Script

**Update `scripts/release.sh` to support multiple deployment targets:**

Add this after line 356 (after web sync):

```bash
# ============================================================
# STEP 4B: PREPARE DEPLOYMENT TARGET
# ============================================================

section "Step 4b: Prepare Deployment Target"

step "4b"

# Determine deployment target from argument
DEPLOYMENT_TARGET="${2:-production}"  # Default: production

case "$DEPLOYMENT_TARGET" in
  main)
    info "Target: Main Site (apps/oneie/web → one.ie)"
    TARGET_DIR="apps/oneie/web"
    ENV_FILE="web/.env.main"
    PROJECT_NAME="oneie"
    DOMAIN="one.ie"
    REPO="one-ie/oneie"
    ;;

  demo)
    info "Target: Demo Site (apps/one/web → demo.one.ie)"
    TARGET_DIR="apps/one/web"
    ENV_FILE="web/.env.demo"
    PROJECT_NAME="one"
    DOMAIN="demo.one.ie"
    REPO="one-ie/one"
    ;;

  *)
    error "Unknown deployment target: $DEPLOYMENT_TARGET"
    echo "Valid targets: main, demo"
    echo ""
    echo "Examples:"
    echo "  ./scripts/release.sh patch main   # Deploy to one.ie"
    echo "  ./scripts/release.sh patch demo   # Deploy to demo.one.ie"
    exit 1
    ;;
esac

# Create target directory if needed
mkdir -p "$(dirname "$TARGET_DIR")"

# Sync web to target (already done for apps/one/web)
if [ "$TARGET_DIR" != "apps/one/web" ]; then
  info "Syncing web/ → $TARGET_DIR"
  rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.astro' \
    --exclude='.wrangler' \
    web/ "$TARGET_DIR/"
  success "Synced to $TARGET_DIR"
fi

# Copy appropriate .env file
if [ -f "$ENV_FILE" ]; then
  info "Copying environment: $ENV_FILE → $TARGET_DIR/.env.local"
  cp "$ENV_FILE" "$TARGET_DIR/.env.local"
  success "Environment configured for $DEPLOYMENT_TARGET"
else
  warning "Environment file not found: $ENV_FILE"
  warning "Using default .env.local from source"
fi

# Optional: Remove development-only files
if [ "$DEPLOYMENT_TARGET" != "development" ]; then
  info "Cleaning development artifacts from $TARGET_DIR"

  # Remove files that shouldn't be in production
  rm -f "$TARGET_DIR/.env.local.example"
  rm -f "$TARGET_DIR/README-DEV.md"

  success "Cleaned development artifacts"
fi

echo ""
success "Deployment target prepared: $TARGET_DIR"

# Store for later use in deployment step
DEPLOY_FROM_DIR="$TARGET_DIR"
```

**Update the deployment step (line 736+) to use `$DEPLOY_FROM_DIR`:**

```bash
# Replace WEB_DIR="apps/one/web" with:
WEB_DIR="${DEPLOY_FROM_DIR:-apps/one/web}"
PROJECT_NAME="${PROJECT_NAME:-web}"
```

**Usage:**

```bash
# Deploy to main site (one.ie)
./scripts/release.sh patch main

# Deploy to demo site (web.one.ie + npx oneie)
./scripts/release.sh patch demo

# Deploy both
./scripts/release.sh patch main && ./scripts/release.sh patch demo

# Sync files only, no deployment
./scripts/release.sh sync
```

---

### Phase 3: Component-Level Feature Gating

**Pattern for conditionally rendering features:**

```typescript
// src/components/features/admin/AdminPanel.tsx
import { features } from '@/config/features';

export function AdminPanel() {
  // Don't even render in production builds
  if (!features.adminPanel) {
    return null;
  }

  return (
    <div className="admin-panel">
      {/* Admin-only features */}
    </div>
  );
}
```

```astro
---
// src/pages/admin/index.astro
import { features } from '@/config/features';
import AdminPanel from '@/components/features/admin/AdminPanel';

// Redirect if admin features disabled
if (!features.adminPanel) {
  return Astro.redirect('/');
}
---

<Layout>
  <AdminPanel client:load />
</Layout>
```

**Benefits:**
- Development: See all features
- Production: Features completely removed from bundle
- No runtime overhead checking flags

---

### Phase 4: Deployment Targets in Cloudflare

**Create separate Cloudflare Pages projects:**

```bash
# Main site (full platform)
wrangler pages project create one
# Custom domain: one.ie

# Demo site (starter template)
wrangler pages project create oneie
# Custom domain: web.one.ie

# Development (internal, optional)
wrangler pages project create dev
# Custom domain: dev.one.ie
```

**Set environment variables per project:**

Via Cloudflare Dashboard or wrangler:

```bash
# Main site project (one.ie)
wrangler pages secret put ENABLE_ADMIN_FEATURES --project-name=one
# Enter: false
wrangler pages secret put SITE_TYPE --project-name=one
# Enter: main

# Demo site project (web.one.ie)
wrangler pages secret put ONE_BACKEND --project-name=oneie
# Enter: off
wrangler pages secret put SITE_TYPE --project-name=oneie
# Enter: demo

# Dev project (optional)
wrangler pages secret put ENABLE_ADMIN_FEATURES --project-name=dev
# Enter: true
wrangler pages secret put SITE_TYPE --project-name=dev
# Enter: development
```

---

### Phase 5: Create New Repo and CLI Distribution

**Step 1: Create one-ie/oneie repository**

```bash
# On GitHub, create new repository: one-ie/oneie
# Description: ONE Platform Starter Template - Download via npx oneie

# Clone locally
cd ~/workspace
git clone https://github.com/one-ie/oneie.git
cd oneie

# Initialize with same structure as apps/oneie after sync
git init
git remote add origin https://github.com/one-ie/oneie.git
```

**Step 2: Update release script to push to one-ie/oneie**

After syncing to `apps/oneie/`, also push to the separate repo:

```bash
# In scripts/release.sh, add after apps/oneie sync:

if [ "$DEPLOYMENT_TARGET" == "demo" ]; then
  section "Push to one-ie/oneie repository"

  # Ensure oneie repo exists locally
  if [ ! -d "oneie/.git" ]; then
    info "Cloning one-ie/oneie repository..."
    git clone https://github.com/one-ie/oneie.git oneie
  fi

  # Note: For demo target, also sync to separate one-ie/one repo
  section "Push to one-ie/one repository"

  # Ensure one repo exists locally
  if [ ! -d "one/.git" ]; then
    info "Cloning one-ie/one repository..."
    git clone https://github.com/one-ie/one.git one
  fi

  # Note: apps/one already gets pushed to one-ie/one automatically
# by the standard release script (step 11)
# This happens in the main release flow, no extra sync needed

# What happens:
# 1. Sync /web → apps/one/web
# 2. Sync /one → apps/one/one
# 3. Sync /.claude → apps/one/.claude
# 4. Commit and push apps/one/ to one-ie/one
# 5. Deploy apps/one/web to Cloudflare "one" project → demo.one.ie

success "Demo site synced and ready for deployment"
fi
```

**Step 3: Update CLI to download from one-ie/oneie**

Update `cli/index.js` (or wherever npx oneie is implemented):

```javascript
// Instead of downloading from one-ie/one, download from one-ie/oneie
const REPO_URL = 'https://github.com/one-ie/oneie.git';

// Or use npm package distribution:
// npx oneie downloads pre-built tarball
```

**Directory Structure After Sync:**

```
ONE/                        # Local workspace
├── web/                   # Development website (all features)
├── one/                   # Documentation
├── .claude/               # Claude configuration
│
└── apps/
    ├── oneie/            # Main site assembly (complete structure)
    │   ├── web/         # → Deployed to one.ie
    │   ├── one/         # Documentation
    │   └── .claude/     # Claude config
    │   → Pushed to one-ie/oneie
    │
    └── one/              # Demo site assembly (complete structure)
        ├── web/         # → Deployed to demo.one.ie
        ├── one/         # Documentation
        └── .claude/     # Claude config
        → Pushed to one-ie/one

GitHub Repositories (full structure):

one-ie/oneie/             # Main site
├── web/                 # Website for one.ie
├── one/                 # Documentation
└── .claude/             # Claude config

one-ie/one/              # Demo/starter (what npx oneie clones)
├── web/                 # Website for demo.one.ie
├── one/                 # Documentation
└── .claude/             # Claude config
```

**Result:**

- `apps/oneie/` → Pushed to one-ie/oneie → web/ deployed to one.ie
- `apps/one/` → Pushed to one-ie/one → web/ deployed to demo.one.ie
- `npx oneie` → Clones entire one-ie/one repo (web/, one/, .claude/)
- Users get complete structure: website + docs + Claude config

---

## Alternative Strategies (Considered)

### Option A: Separate Branches

**Pros:**
- Clear separation
- Git-based history

**Cons:**
- Merge conflicts
- Duplicate code
- Hard to keep in sync

**Verdict:** ❌ Not recommended - creates maintenance burden

### Option B: Monorepo with Workspaces

**Pros:**
- Shared code via packages
- Independent deployments

**Cons:**
- Complex setup
- Overhead for small differences

**Verdict:** ⚠️ Overkill for feature flags

### Option C: Build-Time Code Stripping

**Pros:**
- No runtime overhead
- Clean production builds

**Cons:**
- Complex build process
- Hard to debug

**Verdict:** ⚠️ Good for optimization, not primary strategy

---

## Migration Path

### Week 1: Setup Feature Flags

```bash
# 1. Create environment files
cp web/.env.local web/.env.local.backup
cat > web/.env.production <<EOF
# Production environment (customer-facing)
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=false
ENABLE_EXPERIMENTAL_FEATURES=false
SHOW_FULL_NAVIGATION=false
EOF

# 2. Create feature config
cat > web/src/config/features.ts <<EOF
export const features = {
  adminPanel: import.meta.env.ENABLE_ADMIN_FEATURES === 'true',
  experimental: import.meta.env.ENABLE_EXPERIMENTAL_FEATURES === 'true',
  fullNavigation: import.meta.env.SHOW_FULL_NAVIGATION === 'true',
  orgName: import.meta.env.ORG_NAME || 'one',
  backendEnabled: import.meta.env.ONE_BACKEND === 'on',
};
EOF

# 3. Test locally with production env
cd web
cp .env.production .env.local
bun run build
# Verify: admin features should be disabled
```

### Week 2: Update Components

```bash
# Update navigation
# Update admin pages
# Add feature checks to experimental features
# Test thoroughly
```

### Week 3: Update Release Script

```bash
# Add multi-target support to scripts/release.sh
# Test with: ./scripts/release.sh sync production
# Verify: apps/one/web has production .env
```

### Week 4: Deploy and Verify

```bash
# Deploy production
./scripts/release.sh patch production

# Deploy demo (optional)
./scripts/release.sh patch demo

# Verify both deployments
# Check feature flags working correctly
```

---

## Development Workflow

### Day-to-Day Development

```bash
# 1. Develop with full features
cd web
bun run dev
# localhost:4321 - full ONE Platform

# 2. Test production build locally
cp .env.production .env.local
bun run build
bun run preview
# Verify customer experience

# 3. Restore development environment
cp .env.local.backup .env.local

# 4. Commit changes
git add .
git commit -m "feat: add new feature"
git push

# 5. Release to production
cd ..
./scripts/release.sh patch production
```

### Testing Customer Experience

```bash
# Quick test of production build
cd web
cp .env.production .env.local
bun run build && bun run preview

# Full test with deployment
cd ..
./scripts/release.sh sync production
cd apps/one/web
bun run build && bun run preview
```

---

## Benefits of This Approach

✅ **Single Codebase:** No duplicate code to maintain

✅ **Environment-Based:** Simple `.env` files control features

✅ **Clean Builds:** Production builds only include enabled features

✅ **Multiple Targets:** Can deploy to production, demo, dev simultaneously

✅ **Existing Infrastructure:** Uses current rsync + Cloudflare setup

✅ **Type Safety:** TypeScript checks feature flags at compile time

✅ **Easy Testing:** Can test customer experience locally

✅ **Flexible:** Add new deployment targets easily (enterprise, whitelabel, etc.)

✅ **No Vendor Lock-in:** Not tied to specific build tools or frameworks

---

## Security Considerations

**Never expose sensitive features in production:**

```typescript
// ✅ CORRECT: Feature completely removed
if (!features.adminPanel) {
  return null;
}

// ❌ WRONG: Just hidden, still in bundle
<div className={features.adminPanel ? 'block' : 'hidden'}>
  {/* Admin features still shipped */}
</div>
```

**Environment variable security:**

- Keep `.env.local` in `.gitignore`
- Use `.env.production` for defaults (safe to commit)
- Set secrets via Cloudflare dashboard
- Never commit actual API keys

**API endpoint security:**

```typescript
// Backend must also check permissions
// Don't rely on frontend feature flags alone
export const deleteUser = mutation({
  handler: async (ctx, args) => {
    // Check user role in database
    const user = await getCurrentUser(ctx);
    if (user.role !== 'platform_owner') {
      throw new Error('Unauthorized');
    }
    // ... delete logic
  },
});
```

---

## Future Enhancements

### White-Label Support

```bash
# /web/.env.customer-acme
ORG_NAME=acme
ORG_WEBSITE=https://acme.com
ORG_FOLDER=acme
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=false
CUSTOM_BRANDING=true
```

Deploy with:
```bash
./scripts/release.sh patch customer-acme
```

### Multi-Tenant Deployments

Each customer gets:
- Separate Cloudflare Pages project
- Own environment variables
- Custom domain
- Branded experience
- Independent deployment

### Progressive Rollout

```bash
# Deploy to staging first
./scripts/release.sh patch staging

# Test thoroughly
# Then deploy to production
./scripts/release.sh patch production
```

---

## Troubleshooting

### Issue: Production build includes development features

**Cause:** Wrong `.env` file used during build

**Solution:**
```bash
# Verify environment during release
cd apps/one/web
cat .env.local | grep ENABLE_ADMIN
# Should show: false
```

### Issue: Features disabled in development

**Cause:** `.env.production` copied over `.env.local`

**Solution:**
```bash
cd web
rm .env.local
cp .env.local.backup .env.local
# Or just set ENABLE_ADMIN_FEATURES=true
```

### Issue: Environment variables not updating in deployed site

**Cause:** Cloudflare Pages caches environment variables

**Solution:**
```bash
# Force rebuild
wrangler pages deployment create --project-name=web web/dist

# Or update via dashboard:
# Cloudflare → Pages → web → Settings → Environment variables
```

---

## Summary

**What You Get:**

1. **Development:** Full ONE Platform with all features (`/web`)
2. **Main Site:** Full platform + marketing (`apps/oneie/web → one.ie`)
3. **Demo Site:** Starter template (`apps/one/web → demo.one.ie`)
4. **Downloadable:** Same as demo via `npx oneie` (from `one-ie/one` repo)

**How It Works:**

- Single codebase (`/web`) with feature flags
- Different `.env` files per deployment target
- Release script syncs to multiple targets
- Deploy to separate Cloudflare projects (oneie → one.ie, one → demo.one.ie)
- Demo code also pushed to separate GitHub repo (one-ie/one) for CLI distribution

**Commands:**

```bash
# Develop locally (full features)
cd web && bun run dev

# Release to main site (one.ie)
./scripts/release.sh patch main

# Release to demo site (demo.one.ie + npx oneie)
./scripts/release.sh patch demo

# Release both
./scripts/release.sh patch main && ./scripts/release.sh patch demo

# Sync files only (no deployment)
./scripts/release.sh sync
```

**Repositories:**

- `one-ie/oneie` → Main site assembly (apps/oneie/ → one.ie)
- `one-ie/one` → Demo/starter template (apps/one/ + one/ → demo.one.ie + npx oneie)
- `one-ie/cli` → CLI package (npx oneie downloads from one-ie/one)

**Next Steps:**

1. ✅ Read this document
2. ⬜ Create environment files:
   - `web/.env.main` (main site: one.ie)
   - `web/.env.demo` (demo site: demo.one.ie)
3. ⬜ Create `web/src/config/features.ts` with feature flags
4. ⬜ Test both builds locally:
   - `cp .env.main .env.local && bun run build`
   - `cp .env.demo .env.local && bun run build`
5. ⬜ Create GitHub repository: `one-ie/oneie`
6. ⬜ Create Cloudflare Pages projects:
   - `oneie` (for one.ie)
   - `one` (for demo.one.ie)
7. ⬜ Update `scripts/release.sh` with multi-target support
8. ⬜ Deploy main site: `./scripts/release.sh patch main`
9. ⬜ Deploy demo site: `./scripts/release.sh patch demo`
10. ⬜ Test both deployments:
    - https://one.ie (full platform)
    - https://demo.one.ie (starter template)
11. ⬜ Update CLI to download from `one-ie/one`
12. ⬜ Test: `npx oneie` downloads correct starter template

---

**Result:**

- **one.ie** → Full platform/marketing site (oneie project)
- **demo.one.ie** → Live demo (same as npx oneie download)
- **npx oneie** → Downloads starter template from one-ie/one
- Single codebase, clean separation, no duplication

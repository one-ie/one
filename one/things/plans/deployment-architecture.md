# ONE Platform Deployment Architecture

## Current vs. New Architecture

### Current Architecture (Single Deployment)

```
┌─────────────────────────────────────────────────────────────┐
│  /web (development)                                         │
│  - Full features                                            │
│  - localhost:4321                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ rsync
┌─────────────────────────────────────────────────────────────┐
│  apps/one/web                                               │
│  - Assembly for deployment                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ wrangler deploy
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Pages: web.one.ie                               │
│  - Single deployment                                        │
│  - Everything goes here                                     │
└─────────────────────────────────────────────────────────────┘
```

**Problem:** Development code deployed directly to production

---

### New Architecture (Multi-Target Deployment)

```
┌──────────────────────────────────────────────────────────────┐
│  /web (DEVELOPMENT)                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - Single source of truth                                    │
│  - Full ONE Platform features                                │
│  - All admin tools and experimental features                 │
│  - Development environment (.env.local)                      │
│  - Test: bun run dev (localhost:4321)                        │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────────┐  ┌──────────────────────┐
│  TARGET 1: MAIN     │  │  TARGET 2: DEMO      │
│  ━━━━━━━━━━━━━━━━━  │  │  ━━━━━━━━━━━━━━━━━━  │
│  apps/oneie/web     │  │  apps/one/web        │
│  (.env.main)        │  │  (.env.demo)         │
│                     │  │                      │
│  Features:          │  │  Features:           │
│  ✅ Full platform   │  │  ⬜ Starter template │
│  ✅ Marketing       │  │  ⬜ Minimal UI       │
│  ✅ Backend ON      │  │  ⬜ Backend OFF      │
│  ⬜ Admin tools OFF │  │  ⬜ No admin         │
└─────────┬───────────┘  └──────────┬───────────┘
          │                         │
          ↓                         ↓
┌───────────────────┐      ┌────────────────────────────────┐
│  Cloudflare: oneie│      │  Cloudflare: one               │
│  ━━━━━━━━━━━━━━━  │      │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  one.ie           │      │  demo.one.ie                   │
│  (main website)   │      │  (live demo)                   │
└───────────────────┘      └─────────────┬──────────────────┘
                                         │
                                         ↓ git push
                           ┌──────────────────────────────────┐
                           │  GitHub: one-ie/one              │
                           │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
                           │  Starter template repo           │
                           └─────────────┬────────────────────┘
                                         │
                                         ↓
                           ┌──────────────────────────────────┐
                           │  npm: oneie package              │
                           │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
                           │  npx oneie                       │
                           │  Downloads from one-ie/one       │
                           └──────────────────────────────────┘
```

---

## The Three Outputs

### 1. Main Website (one.ie)

**Purpose:** Full platform + marketing

**Source:** `/web`, `/one`, `/.claude` → `apps/oneie/` → `one-ie/oneie` → Cloudflare `oneie`

**Environment:** `.env.main`
```bash
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=false
SHOW_FULL_NAVIGATION=true
SITE_TYPE=main
```

**Features:**
- ✅ Complete navigation
- ✅ All marketing pages
- ✅ Backend integration (Convex)
- ✅ Authentication
- ⬜ Admin panel (not exposed to public)
- ⬜ Experimental features

**Audience:** Public visitors, potential customers

---

### 2. Demo Website (demo.one.ie)

**Purpose:** Live starter template

**Source:** `/web`, `/one`, `/.claude` → `apps/one/` → `one-ie/one` → Cloudflare `one`

**Environment:** `.env.demo`
```bash
ORG_NAME=one
ORG_WEBSITE=https://demo.one.ie
ONE_BACKEND=off
ENABLE_ADMIN_FEATURES=false
SHOW_FULL_NAVIGATION=false
SITE_TYPE=demo
```

**Features:**
- ✅ Minimal navigation (Blog + License only)
- ✅ GetStartedPrompt component
- ⬜ Backend disabled (frontend-only)
- ⬜ No authentication required
- ⬜ Clean starter experience

**Audience:**
- Developers visiting to see the demo
- Users who want to try before downloading
- Matches exactly what they'll get from `npx oneie`

---

### 3. Downloadable (npx oneie)

**Purpose:** Local development starter

**Source:** `one-ie/one` repository

**Distribution:**
1. **Via npm:** `npx oneie` clones entire `one-ie/one` repo
2. **Via git:** `git clone one-ie/one`

**What users get:**
- `web/` - Complete website code (same as demo.one.ie)
- `one/` - Full documentation
- `.claude/` - Claude configuration
- Complete starter kit with all resources

**Same as:** demo.one.ie (plus docs and Claude config)

**Audience:** Developers starting new projects

---

## Release Workflow

### Development Workflow

```bash
# 1. Develop with full features
cd /web
bun run dev
# → localhost:4321 with full ONE Platform

# 2. Make changes
# Edit components, add features, etc.

# 3. Test locally with different configs
cp .env.main .env.local
bun run build && bun run preview
# → Test main site experience

cp .env.demo .env.local
bun run build && bun run preview
# → Test demo/starter experience

# 4. Commit changes
git add .
git commit -m "feat: new feature"
git push
```

### Release Workflow

```bash
# From workspace root

# Option A: Release main site only
./scripts/release.sh patch main
# → Syncs /web, /one, /.claude to apps/oneie/
# → Pushes apps/oneie/ to one-ie/oneie
# → Builds apps/oneie/web with .env.main
# → Deploys to one.ie

# Option B: Release demo site only
./scripts/release.sh patch demo
# → Syncs /web, /one, /.claude to apps/one/
# → Pushes apps/one/ to one-ie/one
# → Builds apps/one/web with .env.demo
# → Deploys to demo.one.ie
# → Users can clone via npx oneie

# Option C: Release both (recommended)
./scripts/release.sh patch main && ./scripts/release.sh patch demo
# → Updates both deployments
# → Main: one-ie/oneie → one.ie
# → Demo: one-ie/one → demo.one.ie + npx oneie
```

---

## Directory Structure

```
ONE/                          # Local workspace
│
├── web/                      # Development website (single source of truth)
│   ├── .env.local           # Development config (full features)
│   ├── .env.main            # Main site config (for one.ie)
│   ├── .env.demo            # Demo config (for demo.one.ie)
│   ├── src/
│   │   ├── config/
│   │   │   └── features.ts  # Feature flags
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
│
├── one/                      # Documentation (single source of truth)
│   ├── things/
│   ├── connections/
│   ├── events/
│   ├── knowledge/
│   └── ...
│
├── .claude/                  # Claude config (single source of truth)
│   ├── agents/
│   ├── commands/
│   └── hooks/
│
├── apps/                     # Assembly targets
│   ├── oneie/               # Main site (full structure)
│   │   ├── web/            # Synced from /web
│   │   ├── one/            # Synced from /one
│   │   ├── .claude/        # Synced from /.claude
│   │   └── package.json
│   │   → Pushed to one-ie/oneie → Deployed to one.ie
│   │
│   └── one/                 # Demo site (full structure)
│       ├── web/            # Synced from /web
│       ├── one/            # Synced from /one
│       ├── .claude/        # Synced from /.claude
│       └── package.json
│       → Pushed to one-ie/one → Deployed to demo.one.ie
│
├── cli/                     # npm package
│   └── index.js            # Downloads entire one-ie/one repo
│
└── scripts/
    └── release.sh          # Multi-target release script

GitHub Repositories (full structure):

one-ie/oneie/                # Main site repo
├── web/                    # Website code
├── one/                    # Documentation
└── .claude/                # Claude config

one-ie/one/                 # Demo/starter repo (what npx oneie clones)
├── web/                    # Website code
├── one/                    # Documentation
└── .claude/                # Claude config
```

---

## Key Benefits

### ✅ Single Codebase
- Develop in one place (`/web`)
- No duplicate code to maintain
- Changes propagate to both sites

### ✅ Environment-Based
- Simple `.env` files control features
- No complex build configuration
- Easy to test both versions locally

### ✅ Clean Separation
- Main site has full features
- Demo site is minimal starter
- No development artifacts in production

### ✅ Consistent User Experience
- `npx oneie` downloads exact same code as web.one.ie
- Users can try online before downloading
- No surprises when they clone locally

### ✅ Independent Deployments
- Deploy main site without affecting demo
- Update demo without touching main site
- Test in production safely

### ✅ Version Control
- Each site tracks its own history
- `one-ie/one` for main site
- `one-ie/oneie` for demo/starter
- Clean git history per deployment

---

## Comparison to Current Setup

| Aspect | Before | After |
|--------|--------|-------|
| **Development** | `/web` | `/web` (unchanged) |
| **Main Site** | ❌ N/A | ✅ `one.ie` (full platform) |
| **Demo Site** | ❌ N/A or mixed | ✅ `demo.one.ie` (starter only) |
| **Downloadable** | ❌ Mixed with main | ✅ `one-ie/one` (clean starter) |
| **Deployments** | 1 (everything) | 2 (main + demo) |
| **Repositories** | 1 (`one-ie/one`) | 2 (`one-ie/one` + `one-ie/oneie`) |
| **Cloudflare** | 1 project | 2 projects (`oneie` + `one`) |
| **Feature Control** | ❌ No separation | ✅ Environment flags |
| **CLI Downloads** | Mixed content | Clean starter template |

---

## Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Create `web/.env.main` with main site config
- [ ] Create `web/.env.demo` with demo config
- [ ] Create `web/src/config/features.ts` with feature flags
- [ ] Test both builds locally

### Phase 2: Infrastructure (Week 2)
- [ ] Create GitHub repository: `one-ie/oneie` (main site)
- [ ] `one-ie/one` already exists (demo/starter)
- [ ] Create Cloudflare project: `oneie` (for one.ie)
- [ ] Create Cloudflare project: `one` (for demo.one.ie)
- [ ] Configure custom domains

### Phase 3: Release Script (Week 3)
- [ ] Update `scripts/release.sh` with multi-target support
- [ ] Add logic to sync to `apps/oneie/`
- [ ] Add logic to push to `one-ie/oneie`
- [ ] Test sync without deployment

### Phase 4: Components (Week 3)
- [ ] Update components to use feature flags
- [ ] Gate admin features
- [ ] Simplify navigation for demo
- [ ] Test both versions

### Phase 5: Deploy (Week 4)
- [ ] Deploy main site: `./scripts/release.sh patch main`
- [ ] Verify one.ie works correctly
- [ ] Deploy demo site: `./scripts/release.sh patch demo`
- [ ] Verify demo.one.ie works correctly
- [ ] Verify `one-ie/one` repo updated

### Phase 6: CLI (Week 4)
- [ ] Update CLI to download from `one-ie/one`
- [ ] Test `npx oneie` downloads correct version
- [ ] Verify downloaded code matches demo.one.ie

---

## Quick Reference

**Develop:**
```bash
cd web && bun run dev
```

**Test main site build:**
```bash
cp web/.env.main web/.env.local && cd web && bun run build
```

**Test demo build:**
```bash
cp web/.env.demo web/.env.local && cd web && bun run build
```

**Deploy main site:**
```bash
./scripts/release.sh patch main
```

**Deploy demo site:**
```bash
./scripts/release.sh patch demo
```

**Deploy both:**
```bash
./scripts/release.sh patch main && ./scripts/release.sh patch demo
```

**URLs:**
- Main: https://one.ie
- Demo: https://demo.one.ie
- CLI: npx oneie (downloads from one-ie/one)

**Repositories:**
- Main: https://github.com/one-ie/oneie (main website)
- Demo: https://github.com/one-ie/one (starter template)
- CLI: https://github.com/one-ie/cli (downloads from one-ie/one)

---

**Result:** Clean separation between development, main site, and demo/starter template with single codebase.

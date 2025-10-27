# ONE Platform Deployment Architecture - Quick Reference

## ✅ CORRECT Architecture

```
/web (development - single source of truth)
  ├─→ git push → one-ie/web (website source repo)
  ├─→ sync to apps/oneie/ → git push → one-ie/oneie → one.ie
  └─→ sync to apps/one/ → git push → one-ie/one → demo.one.ie
                                           ↓
                                    npx oneie clones
```

---

## Projects & Repositories

| Purpose | Project Name | GitHub Repo | Cloudflare Project | Domain |
|---------|-------------|-------------|-------------------|---------|
| **Website Source** | web | one-ie/web | N/A | (source only) |
| **Main Website** | oneie | one-ie/oneie | oneie | one.ie |
| **Demo/Starter** | one | one-ie/one | one | demo.one.ie |

---

## Key Mappings

### Website Source (one-ie/web)
- **Source:** Local `/web` (development - single source of truth)
- **Repo:** `one-ie/web` (website code only, git repo)
- **Purpose:** Website source repository
- **Usage:** Pushed from local `/web` development

### Main Website (one.ie)
- **Source:** Local `/web`, `/one`, `/.claude` synced to `apps/oneie/`
- **Repo:** `one-ie/oneie` (full structure: web/, one/, .claude/)
- **Cloudflare:** `oneie` project
- **Domain:** https://one.ie
- **Purpose:** Full platform + marketing
- **Features:** Backend ON, Admin OFF, Full navigation

### Demo/Starter (demo.one.ie)
- **Source:** Local `/web`, `/one`, `/.claude` synced to `apps/one/`
- **Repo:** `one-ie/one` (full structure: web/, one/, .claude/)
- **Cloudflare:** `one` project
- **Domain:** https://demo.one.ie
- **Also:** `npx oneie` clones `one-ie/web` for website
- **Purpose:** Starter template for developers
- **Features:** Backend OFF, No admin, Minimal navigation

---

## Release Commands

```bash
# Push website source
cd web && git push origin main
# → Updates one-ie/web (single source of truth)

# Deploy main website
./scripts/release.sh patch main
# → Syncs /web, /one, /.claude to apps/oneie/
# → Pushes apps/oneie/ to one-ie/oneie
# → Deploys to one.ie

# Deploy demo/starter
./scripts/release.sh patch demo
# → Syncs /web, /one, /.claude to apps/one/
# → Pushes apps/one/ to one-ie/one
# → Deploys to demo.one.ie

# Deploy all
cd web && git push && cd .. && ./scripts/release.sh patch main && ./scripts/release.sh patch demo
```

---

## Environment Files

```bash
# web/.env.local (development - full features)
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=true
SITE_TYPE=development

# web/.env.main (for one.ie)
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=false
SITE_TYPE=main

# web/.env.demo (for demo.one.ie)
ORG_NAME=one
ORG_WEBSITE=https://demo.one.ie
ONE_BACKEND=off
ENABLE_ADMIN_FEATURES=false
SITE_TYPE=demo
```

---

## Directory Structure

```
ONE/                        # Local workspace
├── web/                   # Development website (all features)
├── one/                   # Documentation
├── .claude/               # Claude configuration
│
└── apps/
    ├── oneie/            # Main site assembly
    │   ├── web/         # → one.ie
    │   ├── one/         # Documentation copy
    │   └── .claude/     # Claude config copy
    │
    └── one/              # Demo site assembly
        ├── web/         # → demo.one.ie
        ├── one/         # Documentation copy
        └── .claude/     # Claude config copy

GitHub Repositories (synced from apps/):

one-ie/oneie/             # Main site repo
├── web/                 # Main website code
├── one/                 # Documentation
└── .claude/             # Claude config

one-ie/one/              # Demo/starter repo
├── web/                 # Demo website code
├── one/                 # Documentation
└── .claude/             # Claude config
```

---

## User Flows

### Flow 1: Visit Main Website
```
User → one.ie
  → Full platform experience
  → Backend enabled
  → Can sign up/sign in
  → Access all features
```

### Flow 2: Try Demo Online
```
User → demo.one.ie
  → Starter template preview
  → Backend disabled (frontend-only)
  → See what they'll download
  → No signup required
```

### Flow 3: Download Starter
```
Developer → npx oneie
  → Clones entire one-ie/one repo
  → Gets:
    • web/ (same as demo.one.ie)
    • one/ (full documentation)
    • .claude/ (Claude config)
  → Complete starter kit
  → Can customize locally
  → Can connect own backend
```

---

## Cloudflare Projects to Create

1. **Project: oneie**
   - Custom domain: one.ie
   - Build command: `cd web && bun run build`
   - Build output: `web/dist`
   - Root directory: `/` (repo has web/, one/, .claude/)
   - Environment: Production (main site)

2. **Project: one**
   - Custom domain: demo.one.ie
   - Build command: `cd web && bun run build`
   - Build output: `web/dist`
   - Root directory: `/` (repo has web/, one/, .claude/)
   - Environment: Demo (starter)

---

## GitHub Repositories

1. **one-ie/web** (EXISTING)
   - Website source code only
   - Pushed from: `/web` (local development)
   - Cloned by: `npx oneie` (for website)
   - Purpose: Single source of truth for website

2. **one-ie/oneie** (NEW - create this)
   - Full structure: `web/`, `one/`, `.claude/`
   - Synced from: `apps/oneie/`
   - Deploys: `web/` to one.ie
   - Purpose: Main website assembly

3. **one-ie/one** (EXISTING)
   - Full structure: `web/`, `one/`, `.claude/`
   - Synced from: `apps/one/`
   - Deploys: `web/` to demo.one.ie
   - Purpose: Demo/starter assembly

4. **one-ie/cli** (EXISTING)
   - CLI package on npm
   - Clones `one-ie/web` for website
   - Bundles `one/` and `.claude/` docs

---

## Quick Checklist

**Setup:**
- [ ] Create `one-ie/oneie` repo on GitHub
- [ ] Create Cloudflare project `oneie` → one.ie
- [ ] Create Cloudflare project `one` → demo.one.ie
- [ ] Create environment files (`.env.main`, `.env.demo`)
- [ ] Create feature flags config (`src/config/features.ts`)

**Test:**
- [ ] Build main site locally: `cp .env.main .env.local && bun run build`
- [ ] Build demo locally: `cp .env.demo .env.local && bun run build`
- [ ] Verify feature flags work correctly

**Deploy:**
- [ ] Deploy main: `./scripts/release.sh patch main`
- [ ] Deploy demo: `./scripts/release.sh patch demo`
- [ ] Verify one.ie works (full platform)
- [ ] Verify demo.one.ie works (starter)
- [ ] Test `npx oneie` downloads correct version

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Deploy development environment to production
- Mix main site and demo features
- Forget to sync demo to one-ie/one repo
- Use wrong Cloudflare project for deployment

✅ **DO:**
- Keep `/web` as single source of truth
- Use environment files to control features
- Test both builds before deploying
- Sync demo to one-ie/one for npx distribution

---

## Summary

**One Codebase, Two Outputs:**

1. **one.ie** (oneie project)
   - Full platform
   - Marketing site
   - Backend enabled
   - For: Public visitors

2. **demo.one.ie + npx oneie** (one project)
   - Starter template
   - Minimal features
   - Backend disabled
   - For: Developers

**Single command to deploy both:**
```bash
./scripts/release.sh patch main && ./scripts/release.sh patch demo
```

---

**For complete documentation, see:**
- `separate-demo.md` - Full implementation guide
- `deployment-architecture.md` - Visual architecture overview

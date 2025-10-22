# Dual Website Strategy: one.ie + web.one.ie

**Status:** 🎯 Active Plan
**Created:** 2025-10-19
**Ontology:** Things (Infrastructure Planning)

---

## Vision

Deploy two distinct websites from the ONE Platform codebase:

1. **one.ie** - Main marketing site (landing, pricing, features, about)
2. **web.one.ie** - Demo/playground site (interactive examples, docs, tutorials)

**Developer Experience Goal:** Develop both sites simultaneously with minimal context switching and maximum code reuse.

---

## Current State Analysis

### Existing Architecture

```
/web/
├── src/
│   ├── pages/          # File-based routing
│   ├── components/     # React + shadcn/ui
│   ├── layouts/        # Shared layouts
│   └── content/        # Blog posts
├── astro.config.mjs    # Single config
├── wrangler.toml       # Single Cloudflare config
└── package.json        # Single dependencies

Deployment:
- Project: "web"
- Current: web.one.ie
- Build: bun run build
- Deploy: wrangler pages deploy dist --project-name=web
```

### Current Limitations

- ❌ One domain per deployment
- ❌ No site-specific routing
- ❌ Single build output
- ❌ No way to distinguish marketing vs demo content

---

## Ultrathinking: 4 Possible Approaches

### Approach 1: Two Separate Projects

```
/web-marketing/  → one.ie
/web-demo/       → web.one.ie
```

**Pros:**
- ✅ Complete separation
- ✅ Different dependencies possible
- ✅ Clear boundaries
- ✅ Independent deploys

**Cons:**
- ❌ Code duplication
- ❌ Two component libraries to maintain
- ❌ Two build processes
- ❌ Design system drift risk

**Verdict:** ⚠️ Too much duplication for similar sites

---

### Approach 2: Monorepo with Workspaces

```
/web/
  /apps/
    /marketing/   → one.ie
    /demo/        → web.one.ie
  /packages/
    /ui/          → shared components
    /config/      → shared configuration
  package.json    → workspace root
```

**Pros:**
- ✅ Shared component library
- ✅ Single `node_modules`
- ✅ Consistent design system
- ✅ Independent builds
- ✅ Clear separation of concerns

**Cons:**
- ⚠️ More complex initial setup
- ⚠️ Need bun workspace configuration
- ⚠️ Requires restructuring

**Verdict:** ⭐ Best long-term solution (but not immediate)

---

### Approach 3: Single Project, Multi-Config

```
/web/
  /src/
    /sites/
      /marketing/
      /demo/
  astro.config.marketing.mjs
  astro.config.demo.mjs
  package.json → scripts for each site
```

**Pros:**
- ✅ Single codebase
- ✅ Shared components
- ✅ Environment-based builds

**Cons:**
- ❌ Complex build configuration
- ❌ Hard to reason about routing
- ❌ Risk of mixing concerns
- ❌ Two separate builds needed

**Verdict:** ⚠️ Clever but confusing

---

### Approach 4: Content-Based Routing (Shared Build)

```
/web/
  /src/pages/
    /index.astro              → one.ie homepage
    /pricing.astro            → one.ie pricing
    /demo/index.astro         → web.one.ie homepage
    /demo/playground.astro    → web.one.ie playground
  /src/config/
    site.ts                   → PUBLIC_SITE_MODE env var
```

**Deploy same build to two Cloudflare projects:**
- Project "marketing" with domain one.ie
- Project "demo" with domain web.one.ie

**Routing Logic:**
```typescript
// src/config/site.ts
export const SITE_MODE = import.meta.env.PUBLIC_SITE_MODE || 'marketing';

// src/layouts/Layout.astro
const showDemoNav = Astro.url.hostname.startsWith('web.');
```

**Pros:**
- ✅ **FASTEST** to implement (< 1 hour)
- ✅ Zero config changes
- ✅ One build process
- ✅ Maximum code reuse
- ✅ Same components everywhere

**Cons:**
- ⚠️ Sites must be similar architecturally
- ⚠️ Bundle includes both sites
- ⚠️ Less flexibility for divergent tech

**Verdict:** ⭐⭐⭐ **WINNER for Phase 1** (Quick Win)

---

## Recommended Strategy: Two-Phase Approach

### 🚀 Phase 1: Quick Win (Approach 4)

**Goal:** Get two separate sites live in < 1 hour

**Implementation:**

1. **Add Demo Routes**
   ```
   /web/src/pages/demo/
     index.astro          # Demo homepage
     playground.astro     # Interactive playground
     examples.astro       # Code examples
     docs.astro          # Documentation
   ```

2. **Add Site Detection**
   ```typescript
   // src/config/site.ts
   export const getSiteConfig = (hostname: string) => {
     if (hostname.startsWith('web.')) {
       return {
         mode: 'demo',
         title: 'ONE Platform Demo',
         nav: ['Playground', 'Examples', 'Docs'],
       };
     }
     return {
       mode: 'marketing',
       title: 'ONE Platform',
       nav: ['Features', 'Pricing', 'About'],
     };
   };
   ```

3. **Create Second Cloudflare Project**
   ```bash
   # Deploy to marketing (one.ie)
   wrangler pages deploy dist --project-name=marketing

   # Deploy to demo (web.one.ie)
   wrangler pages deploy dist --project-name=demo
   ```

4. **Configure Custom Domains**
   - Cloudflare Dashboard → Pages → "marketing" → Add domain: one.ie
   - Cloudflare Dashboard → Pages → "demo" → Keep domain: web.one.ie

**Time to Deploy:** ~30-60 minutes

**Result:**
- ✅ one.ie shows marketing content
- ✅ web.one.ie shows demo content
- ✅ Shared components, single build
- ✅ Easy to develop both simultaneously

---

### 🏗️ Phase 2: Scale to Monorepo (Approach 2)

**Goal:** When sites diverge significantly, migrate to proper monorepo

**Trigger Conditions:**
- Different dependencies needed
- Separate deployment cadences
- Different team ownership
- Significantly different page count (>50 pages each)

**Implementation:**

1. **Create Workspace Structure**
   ```
   /web/
     package.json          # workspace root
     /apps/
       /marketing/
         package.json
         astro.config.mjs
         src/
       /demo/
         package.json
         astro.config.mjs
         src/
     /packages/
       /ui/
         package.json
         src/components/
       /config/
         package.json
         src/
   ```

2. **Bun Workspace Configuration**
   ```json
   // /web/package.json
   {
     "name": "one-platform-web",
     "workspaces": [
       "apps/*",
       "packages/*"
     ]
   }
   ```

3. **Shared UI Package**
   ```json
   // /web/packages/ui/package.json
   {
     "name": "@one/ui",
     "exports": {
       "./button": "./src/components/ui/button.tsx",
       "./card": "./src/components/ui/card.tsx"
     }
   }
   ```

4. **Independent Deployments**
   ```bash
   # Marketing site
   cd apps/marketing && bun run build
   wrangler pages deploy dist --project-name=marketing

   # Demo site
   cd apps/demo && bun run build
   wrangler pages deploy dist --project-name=demo
   ```

**Time to Migrate:** ~4-8 hours

**Result:**
- ✅ Complete separation
- ✅ Shared component library
- ✅ Independent deploys
- ✅ Scalable architecture

---

## Development Workflow (Phase 1)

### Daily Development

```bash
# Start dev server
cd web
bun run dev

# Browse both sites locally
open http://localhost:4321           # Marketing site
open http://localhost:4321/demo      # Demo site

# Make changes to shared components
# Both sites update automatically
```

### Creating Marketing Pages

```bash
# Create new marketing page
touch web/src/pages/pricing.astro

# It's automatically available at:
# - http://localhost:4321/pricing
# - https://one.ie/pricing (after deploy)
```

### Creating Demo Pages

```bash
# Create new demo page
touch web/src/pages/demo/playground.astro

# It's automatically available at:
# - http://localhost:4321/demo/playground
# - https://web.one.ie/demo/playground (after deploy)
```

### Deployment Workflow

```bash
# Build once
cd web
bun run build

# Deploy to both sites
wrangler pages deploy dist --project-name=marketing  # → one.ie
wrangler pages deploy dist --project-name=demo       # → web.one.ie

# Or use deploy script
./scripts/deploy-both-sites.sh
```

---

## Implementation Checklist

### Phase 1 Setup (< 1 Hour)

- [ ] Create `/web/src/pages/demo/` directory
- [ ] Add demo homepage (`demo/index.astro`)
- [ ] Add site detection to `src/config/site.ts`
- [ ] Update navigation component to show different menus
- [ ] Create Cloudflare Pages project "marketing"
- [ ] Configure custom domain one.ie on "marketing" project
- [ ] Deploy build to both projects
- [ ] Test both sites work independently
- [ ] Update documentation

### Phase 2 Migration (When Needed)

- [ ] Create workspace structure
- [ ] Extract shared components to `/packages/ui`
- [ ] Split pages into `/apps/marketing` and `/apps/demo`
- [ ] Configure bun workspaces
- [ ] Update build scripts
- [ ] Test independent deploys
- [ ] Migrate CI/CD pipelines

---

## File Structure (Phase 1)

```
/web/
├── src/
│   ├── pages/
│   │   ├── index.astro              # one.ie homepage
│   │   ├── features.astro           # one.ie features
│   │   ├── pricing.astro            # one.ie pricing
│   │   └── demo/
│   │       ├── index.astro          # web.one.ie homepage
│   │       ├── playground.astro     # Interactive playground
│   │       ├── examples.astro       # Code examples
│   │       └── docs/
│   │           └── [...slug].astro  # Documentation pages
│   ├── components/
│   │   ├── marketing/               # Marketing-specific components
│   │   ├── demo/                    # Demo-specific components
│   │   └── ui/                      # Shared shadcn/ui components
│   ├── layouts/
│   │   ├── MarketingLayout.astro    # Layout for one.ie
│   │   └── DemoLayout.astro         # Layout for web.one.ie
│   └── config/
│       └── site.ts                  # Site detection logic
├── astro.config.mjs                 # Single config
├── wrangler.toml                    # Single config
└── package.json                     # Single dependencies
```

---

## Deployment Configuration

### Cloudflare Projects

```toml
# Project 1: "marketing"
name = "marketing"
pages_build_output_dir = "dist"
custom_domain = "one.ie"

# Project 2: "demo"
name = "demo"
pages_build_output_dir = "dist"
custom_domain = "web.one.ie"
```

### Environment Variables

Both projects use the same env vars:

```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_URL=https://one.ie  # or https://web.one.ie
```

### Deploy Script

```bash
#!/usr/bin/env bash
# scripts/deploy-both-sites.sh

set -e

echo "🔨 Building web app..."
cd web
bun run build

echo "🚀 Deploying to one.ie..."
wrangler pages deploy dist --project-name=marketing --branch=main

echo "🚀 Deploying to web.one.ie..."
wrangler pages deploy dist --project-name=demo --branch=main

echo "✅ Both sites deployed successfully!"
echo "   • Marketing: https://one.ie"
echo "   • Demo: https://web.one.ie"
```

---

## Benefits of This Strategy

### Immediate Benefits (Phase 1)

1. **Speed** - Live in < 1 hour
2. **Simplicity** - One build, two deploys
3. **Code Reuse** - Shared components automatically
4. **Easy Development** - See both sites at once
5. **Low Risk** - Minimal changes to existing setup

### Long-Term Benefits (Phase 2)

1. **Scalability** - Independent scaling per site
2. **Team Structure** - Different teams can own different sites
3. **Deploy Independence** - Deploy marketing without affecting demo
4. **Dependency Isolation** - Different tech stacks if needed
5. **Performance** - Smaller bundles per site

---

## Success Metrics

### Phase 1 Success

- [ ] one.ie resolves to marketing content
- [ ] web.one.ie resolves to demo content
- [ ] Both sites share same components
- [ ] Single `bun run dev` works for both
- [ ] Deploy time < 5 minutes for both sites

### Phase 2 Success

- [ ] Independent builds complete in parallel
- [ ] Shared UI package used by both apps
- [ ] Marketing deploy doesn't affect demo
- [ ] Bundle size reduced by 30%+
- [ ] Team velocity increases

---

## Migration Path

### Now → Phase 1 (Week 1)

```bash
# Day 1: Setup
- Create demo pages
- Add site detection
- Create marketing Cloudflare project

# Day 2: Deploy
- Deploy to both projects
- Configure custom domains
- Test both sites

# Day 3: Polish
- Update documentation
- Train team on workflow
```

### Phase 1 → Phase 2 (When Needed)

**Trigger:** Site complexity reaches threshold

**Process:**
1. Create workspace structure (1 day)
2. Extract shared components (2 days)
3. Split pages (1 day)
4. Update CI/CD (1 day)
5. Test & validate (1 day)

**Total:** ~1 week

---

## Decision Matrix

| Factor | Approach 1 | Approach 2 | Approach 3 | Approach 4 |
|--------|-----------|-----------|-----------|-----------|
| **Speed to Ship** | 🟡 Medium | 🔴 Slow | 🟡 Medium | 🟢 Fast |
| **Code Reuse** | 🔴 Low | 🟢 High | 🟢 High | 🟢 High |
| **Complexity** | 🟢 Low | 🟡 Medium | 🔴 High | 🟢 Low |
| **Scalability** | 🟡 Medium | 🟢 High | 🟡 Medium | 🔴 Low |
| **Maintenance** | 🔴 High | 🟢 Low | 🟡 Medium | 🟢 Low |
| **Team Velocity** | 🔴 Slow | 🟢 Fast | 🟡 Medium | 🟢 Fast |

**Winner:** Approach 4 now → Approach 2 later

---

## Open Questions

1. **Content Strategy**
   - What pages go on one.ie vs web.one.ie?
   - How much overlap is acceptable?

2. **User Journey**
   - Should users seamlessly move between sites?
   - Or keep them completely separate?

3. **Analytics**
   - Separate tracking for each site?
   - Or unified view?

4. **SEO**
   - How to handle duplicate content?
   - Canonical URLs strategy?

---

## Next Steps

1. **Review this plan** with team
2. **Answer open questions** above
3. **Create demo pages** structure
4. **Implement Phase 1** (< 1 day)
5. **Deploy and test** both sites
6. **Monitor** for 1-2 months
7. **Decide** on Phase 2 migration

---

## References

- [Astro Docs: Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Cloudflare Pages: Custom Domains](https://developers.cloudflare.com/pages/platform/custom-domains/)
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- `/web/astro.config.mjs` - Current Astro config
- `/web/wrangler.toml` - Current Cloudflare config
- `/scripts/cloudflare-deploy.sh` - Deployment script

---

**Status:** 📝 Ready for Implementation
**Recommended:** Start with Phase 1 (Approach 4)
**Timeline:** Phase 1 in 1 day, Phase 2 when needed

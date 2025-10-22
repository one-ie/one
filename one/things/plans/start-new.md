# Frontend-First Onboarding

**Status:** Planning
**Version:** 1.0.0
**Created:** 2025-10-22

## Vision

Enable instant frontend development without backend complexity. New organizations get a clean, branded starting point with a simple prompt interface. Backend is optional and can be enabled when needed.

## The Flow

```
User runs: npx oneie
    ↓
CLI prompts for org details
    ↓
Creates .env.local + org folder
    ↓
Launches frontend-only site
    ↓
Simple prompt: "Create an ecommerce store..."
    ↓
AI generates pages/components
    ↓
(Optional) Enable backend when ready
```

## Environment Configuration

### .env.local (Created by CLI)

```bash
# Organization Identity
ORG_NAME=acme              # Reserved: "one"
ORG_WEBSITE=https://acme.com  # Reserved: "https://one.ie"
ORG_FOLDER=acme            # Reserved: "onegroup"

# Backend Control
ONE_BACKEND=off            # Default: off (no Convex, no auth)

# Only needed when ONE_BACKEND=on
# PUBLIC_CONVEX_URL=...
# BETTER_AUTH_SECRET=...
```

### Reserved Values (ONE Platform Only)

```bash
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ORG_FOLDER=onegroup
```

## CLI Initialization Flow

### Command: `npx oneie`

```bash
npx oneie

   ██████╗ ███╗   ██╗███████╗
  ██╔═══██╗████╗  ██║██╔════╝
  ██║   ██║██╔██╗ ██║█████╗
  ██║   ██║██║╚██╗██║██╔══╝
  ╚██████╔╝██║ ╚████║███████╗
   ╚═════╝ ╚═╝  ╚═══╝╚══════╝

     Make Your Ideas Real

────────────────────────────────

Let's set up your organization!

Organization name: acme
Organization website: https://acme.com
Organization folder (acme): [Enter]

✓ Created .env.local
✓ Created /acme folder structure
✓ Created brand guide template
✓ Ready to start!

Run: cd web && bun run dev
```

### Validation Rules

```typescript
// CLI validation
const RESERVED_NAMES = {
  name: ["one"],
  folder: ["onegroup", "one"],
  website: ["https://one.ie", "http://one.ie", "one.ie"]
};

if (RESERVED_NAMES.name.includes(orgName.toLowerCase())) {
  throw new Error("Organization name 'one' is reserved");
}

if (RESERVED_NAMES.folder.includes(orgFolder.toLowerCase())) {
  throw new Error(`Folder name '${orgFolder}' is reserved`);
}

if (RESERVED_NAMES.website.some(url => orgWebsite.includes(url))) {
  throw new Error("Website 'one.ie' is reserved");
}
```

### Folder Structure Created

```
/<org-folder>/
├── knowledge/
│   ├── brand-guide.md      # Template with org name
│   └── features.md         # Empty template
└── groups/                 # Empty, ready for group docs
```

## Frontend Behavior

### Layout Changes (Non-ONE Orgs)

**File:** `web/src/layouts/Layout.astro`

```astro
---
const isONE = import.meta.env.ORG_NAME === "one";
const orgName = import.meta.env.ORG_NAME || "ONE";
const orgWebsite = import.meta.env.ORG_WEBSITE || "https://one.ie";
---

<header>
  {isONE ? (
    <!-- Full ONE logo with graphic -->
    <Logo />
  ) : (
    <!-- Text-based org name -->
    <h1 class="text-2xl font-bold">{orgName}</h1>
  )}
</header>

<aside>
  {isONE ? (
    <!-- Full sidebar: Solutions, Platform, etc. -->
    <FullSidebar />
  ) : (
    <!-- Minimal sidebar: Blog + License only -->
    <MinimalSidebar orgWebsite={orgWebsite} />
  )}
</aside>
```

### Homepage Changes (Non-ONE Orgs)

**File:** `web/src/pages/index.astro`

```astro
---
const isONE = import.meta.env.ORG_NAME === "one";
---

{isONE ? (
  <!-- Full ONE homepage -->
  <ONEHomePage />
) : (
  <!-- Simple prompt interface -->
  <GetStartedPrompt />
)}
```

### Get Started Prompt Component

**File:** `web/src/components/GetStartedPrompt.tsx`

```tsx
export function GetStartedPrompt() {
  const orgName = import.meta.env.ORG_NAME;

  return (
    <div class="min-h-screen flex items-center justify-center">
      <div class="max-w-2xl w-full space-y-8 text-center">
        <h1 class="text-6xl font-bold">
          Welcome to {orgName}
        </h1>

        <p class="text-xl text-muted-foreground">
          What would you like to build?
        </p>

        <div class="space-y-4">
          <input
            type="text"
            placeholder="Create an ecommerce store..."
            class="w-full text-lg p-4 border rounded-lg"
          />

          <div class="grid grid-cols-2 gap-4 text-sm">
            <button class="p-4 border rounded-lg hover:bg-accent">
              🛍️ Ecommerce Store
            </button>
            <button class="p-4 border rounded-lg hover:bg-accent">
              📝 Blog Platform
            </button>
            <button class="p-4 border rounded-lg hover:bg-accent">
              👥 Community Site
            </button>
            <button class="p-4 border rounded-lg hover:bg-accent">
              📊 Dashboard App
            </button>
          </div>
        </div>

        <div class="text-sm text-muted-foreground">
          <p>Powered by ONE Platform</p>
          <p>Frontend-only mode • No backend required</p>
        </div>
      </div>
    </div>
  );
}
```

### Minimal Sidebar Component

**File:** `web/src/components/MinimalSidebar.tsx`

```tsx
export function MinimalSidebar({ orgWebsite }: { orgWebsite: string }) {
  return (
    <nav class="space-y-4">
      <a href="/blog" class="block p-2 hover:bg-accent rounded">
        Blog
      </a>
      <a href="/license" class="block p-2 hover:bg-accent rounded">
        License
      </a>
      <a href={orgWebsite} class="block p-2 hover:bg-accent rounded text-xs text-muted-foreground">
        {orgWebsite.replace('https://', '')}
      </a>
    </nav>
  );
}
```

## Backend Control

### ONE_BACKEND=off (Default)

**Behavior:**
- No Convex connection attempts
- No auth flows (signup, signin, etc.)
- No database queries
- Pure frontend development
- All pages work statically

**Implementation:**

```typescript
// web/src/lib/convex.ts
const backendEnabled = import.meta.env.ONE_BACKEND === "on";

export function useConvex() {
  if (!backendEnabled) {
    console.warn("Backend disabled. Enable with ONE_BACKEND=on");
    return null;
  }

  return new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
}
```

```astro
---
// web/src/pages/account/signin.astro
const backendEnabled = import.meta.env.ONE_BACKEND === "on";

if (!backendEnabled) {
  return Astro.redirect("/");
}
---
```

### ONE_BACKEND=on (Optional)

**When to enable:**
- Need user authentication
- Need database storage
- Need real-time features
- Ready for backend complexity

**Required additional config:**

```bash
ONE_BACKEND=on
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_SECRET=your-secret-here
```

## User Journey

### Day 1: Frontend Only

```bash
# Initialize
npx oneie
> Organization: Acme Corp
> Website: https://acme.com

# Develop
cd web && bun run dev

# See branded site
- Logo: "Acme Corp" (text)
- Sidebar: Blog + License
- Homepage: "What would you like to build?"

# Build pages with AI
> Create an ecommerce store
→ AI generates product pages, cart, checkout (all static)

# Deploy frontend
bun run build
wrangler pages deploy dist
```

### Week 1: Add Backend

```bash
# Update .env.local
ONE_BACKEND=on
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Now auth works
- /account/signin
- /account/signup
- Database queries
- Real-time subscriptions
```

## Benefits

### For New Users

1. **Zero barrier to entry**: No backend setup required
2. **Instant gratification**: See branded site immediately
3. **AI-powered**: Build with simple prompts
4. **Progressive**: Add backend when needed
5. **Clean slate**: No ONE branding confusion

### For ONE Platform

1. **Brand protection**: Reserved names prevent confusion
2. **Clear distinction**: ONE site vs customer sites
3. **Gradual adoption**: Frontend → Backend → Full platform
4. **Reduced support**: No backend questions until enabled
5. **Viral growth**: Easy to try, easy to share

## Technical Implementation

### Phase 1: CLI Enhancement (Infer 1-20)

1. Add org prompts to `npx oneie`
2. Validate reserved names
3. Create `.env.local` with defaults
4. Create org folder structure
5. Generate brand guide template

### Phase 2: Frontend Detection (Infer 21-40)

1. Read `ORG_NAME` from env
2. Conditionally render logo
3. Conditionally render sidebar
4. Conditionally render homepage
5. Add `GetStartedPrompt` component

### Phase 3: Backend Control (Infer 41-60)

1. Check `ONE_BACKEND` flag
2. Disable Convex client if off
3. Redirect auth routes if off
4. Show frontend-only mode indicator
5. Document backend enablement

### Phase 4: AI Prompt System (Infer 61-80)

1. Create prompt input component
2. Parse user intent
3. **Use templates as scaffolding** (already installed)
4. Copy + customize templates to src/
5. Apply org branding
6. Show preview

### Phase 5: Documentation (Infer 81-100)

1. Update README with flow
2. Add CLI usage docs
3. Document env variables
4. Create migration guide (off → on)
5. Add troubleshooting

## Example Flows

### Ecommerce Store

```
User: "Create an ecommerce store"

AI flow:
1. Detects ecommerce intent
2. Copies src/templates/ecommerce/* → src/
3. Customizes with org branding (Acme Corp)
4. Shows preview:
   - /products (product listing)
   - /products/[slug] (product detail)
   - /cart (shopping cart)
   - /checkout (checkout form)
5. All static, no backend yet
6. Note: "Enable ONE_BACKEND=on for real cart persistence"
```

### Blog Platform

```
User: "Create a blog"

AI flow:
1. Detects blog intent
2. Copies src/templates/blog/* → src/
3. Customizes content collections
4. Adds sample posts with org name
5. Shows preview:
   - /blog (blog listing)
   - /blog/[slug] (blog post)
   - /about (about page)
6. Uses Astro content collections
7. Pure static site
```

### Community Site

```
User: "Create a community site"

AI flow:
1. Detects community intent
2. Copies src/templates/community/* → src/
3. Customizes with org identity
4. Shows preview:
   - / (community home)
   - /members (member listing - static)
   - /events (event calendar - static)
   - /join (join form - static)
5. Note: "Enable ONE_BACKEND=on for user accounts & real-time features"
```

## Migration Path

### From Frontend-Only to Full Platform

```bash
# Step 1: Create Convex deployment
cd backend
npx convex deploy

# Step 2: Update .env.local
ONE_BACKEND=on
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Step 3: Update static pages to use Convex
# Products now load from database
# Cart now persists to backend
# Checkout creates orders

# Step 4: Deploy
bun run build
wrangler pages deploy dist
```

## Security Considerations

### Reserved Names

- Prevents brand confusion
- Protects ONE identity
- Clear separation of concerns
- No accidental overrides

### Backend Disabled by Default

- Reduces attack surface
- No auth vulnerabilities
- No database exposure
- Pure static site security

### Progressive Enhancement

- Add security as needed
- Start simple, scale up
- No premature optimization
- Clear security boundaries

## Success Metrics

### Time to First Site

- **Target:** < 60 seconds
- **Measure:** `npx oneie` → visible site
- **Current:** N/A (new feature)

### Backend Adoption Rate

- **Target:** 30% enable backend within 7 days
- **Measure:** Track `ONE_BACKEND=on` in telemetry
- **Hypothesis:** Most start frontend-only, add backend when needed

### Prompt Success Rate

- **Target:** 80% of prompts generate usable pages
- **Measure:** User ratings after generation
- **Improvement:** Learn from successful patterns

## Template System (Auto-Installed, Opt-In)

**Strategy:** All templates are automatically installed but hidden by default.

### Implementation

**File:** `web/tsconfig.json`

```json
{
  "exclude": [
    "node_modules",
    "dist",
    "test",
    "tests",
    "**/*.test.ts",
    "**/*.test.tsx",
    "src/templates"  // ← Templates excluded from build
  ]
}
```

### Available Templates (Hidden by Default)

**Location:** `web/src/templates/`

```
src/templates/
├── ecommerce/           # Full ecommerce store
│   ├── pages/
│   ├── components/
│   └── lib/
├── blog/                # Blog platform
├── community/           # Community site
└── saas/                # SaaS starter
```

### Opt-In When Ready

```bash
# User decides they want ecommerce
# Copy template to main src/
cp -r src/templates/ecommerce/pages/* src/pages/

# Or AI does it via prompt
User: "Add ecommerce store"
→ AI copies relevant templates to src/
→ Customizes with org branding
→ Ready to use
```

### Benefits

1. **Zero decision fatigue**: Templates there when needed
2. **No cluttered build**: Excluded by default
3. **Instant scaffolding**: Copy when ready
4. **AI-friendly**: Templates are examples for AI to learn from
5. **No downloads**: Everything already local

## Open Questions

1. **AI Generation:** Which AI model for prompt → pages?
   - Claude via API?
   - Local model?
   - Hybrid approach?
   - **Answer:** Use templates as scaffolding + AI customization

2. **Template Discovery:** How do users find templates?
   - `/templates` page listing all available?
   - AI suggests based on prompt?
   - Both?

3. **Deployment:** Auto-deploy to Cloudflare?
   - One-click deploy button
   - Auto-create Cloudflare project
   - Connect domain

4. **Monetization:** When to prompt for payment?
   - After N pages generated?
   - When enabling backend?
   - Never (pure OSS)?

## Related Documents

- `one/knowledge/ontology.md` - 6-dimension ontology (for when backend enabled)
- `one/connections/workflow.md` - Development workflow
- `CLAUDE.md` - Claude Code instructions
- `.claude/commands/release.md` - Release process

## Implementation Status

### Phase 1: CLI Enhancement ✅ COMPLETE

- [x] Added reserved name validation (one, onegroup, one.ie)
- [x] Created `isReservedName`, `isReservedFolder`, `isReservedWebsite` validators
- [x] Updated init command to use validation
- [x] Created `updateOrgEnvFile` function for org-specific env vars
- [x] CLI now creates `.env.local` with:
  - `ORG_NAME` (validated against reserved)
  - `ORG_WEBSITE` (validated against reserved)
  - `ORG_FOLDER` (validated against reserved)
  - `ONE_BACKEND=off` (default)

**Files Modified:**
- `cli/src/utils/validation.ts` - Added reserved name validation
- `cli/src/commands/init.ts` - Added validation to prompts
- `cli/src/utils/installation-setup.ts` - Added `updateOrgEnvFile` function

### Phase 2: Frontend Detection ✅ COMPLETE

- [x] Created `GetStartedPrompt` component for customer orgs
- [x] Created `MinimalSidebar` component (Blog + License only)
- [x] Updated `Layout.astro` to detect `ORG_NAME` environment variable
- [x] Updated `index.astro` to conditionally render homepage
- [x] ONE Platform (ORG_NAME=one): Full homepage
- [x] Customer Org (ORG_NAME=acme): GetStartedPrompt

**Files Created:**
- `web/src/components/GetStartedPrompt.tsx` - Simple prompt interface
- `web/src/components/MinimalSidebar.tsx` - Minimal navigation

**Files Modified:**
- `web/src/layouts/Layout.astro` - Conditional sidebar rendering
- `web/src/pages/index.astro` - Conditional homepage rendering

### Phase 3: Backend Control ✅ COMPLETE

- [x] Environment variable `ONE_BACKEND` controls backend availability
- [x] Default: `off` (frontend-only mode, no Convex)
- [x] Optional: `on` (full platform with backend)
- [x] `.env.local.example` template with comprehensive documentation

**Files Created:**
- `web/.env.local.example` - Complete configuration template with examples

### Phase 4: Documentation ✅ COMPLETE

- [x] Comprehensive plan document (`one/things/plans/start-new.md`)
- [x] `.env.local.example` with inline documentation
- [x] Implementation status tracking
- [x] User journey examples

### Remaining Work

- [ ] AI prompt system implementation (Phase 4 from original plan)
- [ ] Template system setup (`web/src/templates/`)
- [ ] User testing with real customers
- [ ] Production release announcement

## Usage

### For ONE Platform

```bash
# .env.local
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ORG_FOLDER=onegroup
ONE_BACKEND=on
```

Result: Full ONE Platform homepage with complete navigation.

### For Customer Org

```bash
# .env.local
ORG_NAME=acme
ORG_WEBSITE=https://acme.com
ORG_FOLDER=acme
ONE_BACKEND=off
```

Result: Simple "Get Started" prompt with minimal navigation.

### CLI Validation

```bash
npx oneie

Organization name: one
❌ Error: Organization name "one" is reserved for ONE Platform

Organization name: acme
✓ Valid

Website: https://one.ie
❌ Error: Website one.ie is reserved for ONE Platform

Website: https://acme.com
✓ Valid
```

## Next Steps

1. **Test the flow:**
   ```bash
   cd cli && bun run build
   cd ../web && cp .env.local.example .env.local
   # Edit .env.local with custom org name
   bun run dev
   ```

2. **Implement AI prompt handling** in `GetStartedPrompt.tsx`

3. **Create template system** in `web/src/templates/`

4. **User testing** with 3-5 organizations

5. **Release:** Merge to main and deploy

---

**Built for instant gratification and gradual complexity.**

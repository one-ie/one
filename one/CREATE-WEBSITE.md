# Create Website with ONE Platform CLI

**New in v3.6.1:** The CLI now includes a complete platform setup integrated directly into the onboarding flow. When you run `npx oneie`, the CLI will:

1. **Set up the platform** - Copy `/one` (ontology, docs), `.claude/` (agents, commands), and all documentation files
2. **Create your organization folder** - Custom folder for your organization-specific content
3. **Optionally enhance your website** - Clone the complete Astro + React website template configured with your branding

## Quick Start

```bash
# Run onboarding (interactive mode)
npx oneie

# Answer questions:
# 1. Your name
# 2. Organization name
# 3. Website URL
# 4. "Would you like to enhance your website?" → Yes
# 5. Email

# Result: Complete environment ready to use!
```

## What Gets Created

```
your-project/
├── one/                    # Ontology, documentation, specifications
├── .claude/                # AI agents, commands, hooks
│   ├── agents/            # Agent definitions
│   ├── commands/          # Slash commands
│   └── hooks/             # Git hooks
├── web/                    # Astro + React website (if opted in)
├── your-org/               # Your organization folder
├── CLAUDE.md              # Claude Code instructions
├── AGENTS.md              # Agent coordination rules
├── README.md              # Platform overview
├── LICENSE.md             # Free license
├── SECURITY.md            # Security policy
└── .mcp.json              # MCP server configuration
```

## What You Get

```
my-website/
├── src/
│   ├── components/      # React components + shadcn/ui (50+)
│   ├── pages/           # Astro pages
│   ├── layouts/         # Page layouts
│   └── styles/          # Tailwind CSS v4
├── .env.local           # Configured with your org settings
├── astro.config.mjs     # React 19 + Cloudflare edge
├── wrangler.toml        # Cloudflare Pages config
└── package.json         # All dependencies
```

**Features:**
- ✅ Astro 5 + React 19 with edge SSR
- ✅ Tailwind CSS v4 (CSS-based config)
- ✅ shadcn/ui components (50+ pre-installed)
- ✅ Branded with your organization name
- ✅ Conditional homepage (ONE vs Customer)
- ✅ Backend on/off switch
- ✅ Ready to deploy to Cloudflare Pages

## How It Works

When you run `npx oneie` and answer "Yes" to "Would you like to enhance your website?", the CLI:

1. **Clones template** from github.com/one-ie/web to `./web`
2. **Configures environment** with your org settings in `web/.env.local`:
   ```bash
   ORG_NAME=acme
   ORG_WEBSITE=https://acme.com
   ORG_FOLDER=acme
   ONE_BACKEND=off
   ```
3. **Removes .git** directory so you can initialize your own repo
4. **Ready to customize** and run with `bun install && bun run dev`

## Frontend-Only vs Full Platform

### Frontend Only (Recommended to Start)

```bash
ONE_BACKEND=off
```

**Features:**
- Static site generation
- No database required
- Deploy anywhere (Cloudflare, Vercel, Netlify)
- Zero backend costs
- Simple "Get Started" prompt on homepage

**Perfect for:**
- Landing pages
- Marketing sites
- Blogs
- Static documentation

### Full Platform

```bash
ONE_BACKEND=on
```

**Features:**
- Real-time database (Convex)
- User authentication (Better Auth)
- Backend API
- Real-time subscriptions
- Complete ONE Platform homepage

**Requires:**
- Convex account (free tier available)
- Backend configuration in `.env.local`

## Environment Configuration

### Automatically Created (.env.local)

```bash
# Organization Configuration
ORG_NAME=acme
ORG_WEBSITE=https://acme.com
ORG_FOLDER=acme
ONE_BACKEND=off

# Backend Configuration (only if ONE_BACKEND=on)
# PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
# CONVEX_DEPLOYMENT=prod:your-deployment-name
```

### Reserved Values

**These are protected and cannot be used:**
- `ORG_NAME="one"` - Reserved for ONE Platform
- `ORG_WEBSITE="https://one.ie"` - Reserved for ONE Platform
- `ORG_FOLDER="onegroup"` - Reserved for ONE Platform

**The CLI will reject these during setup.**

## Homepage Behavior

### For ONE Platform (ORG_NAME=one)

**Shows:**
- Full marketing homepage
- Complete navigation
- All features
- Platform branding

### For Customer Orgs (ORG_NAME=acme)

**Shows:**
- "Welcome to acme" header
- Simple "Get Started" prompt
- Minimal sidebar (Blog + License)
- Organization website link

## Development

```bash
# Navigate to web directory
cd web

# Install dependencies (if not already done)
bun install

# Start dev server
bun run dev

# Visit http://localhost:4321
# See: "Welcome to [your-org]" with GetStartedPrompt
```

## Deployment

### Build

```bash
bun run build
```

**Output:** `dist/` directory with optimized static site

### Deploy to Cloudflare Pages

```bash
wrangler pages deploy dist --project-name=acme
```

**Live at:** `https://acme.pages.dev`

### Custom Domain

Add in Cloudflare Pages dashboard:
1. Go to Settings → Domains
2. Add `www.acme.com`
3. Configure DNS (automatic with Cloudflare DNS)

## Examples

### Example 1: Complete Platform Setup with Website

```bash
npx oneie

# Answer prompts:
Name: John Doe
Organization: TechCorp
Website: https://techcorp.com
Enhance website? Yes
Email: john@techcorp.com

# Result - Complete environment created:
# ✅ /one/                 → Ontology and documentation
# ✅ /.claude/             → AI agents and commands
# ✅ /techcorp/            → Your organization folder
# ✅ /web/                 → Branded Astro + React website
# ✅ CLAUDE.md, AGENTS.md  → AI instructions
# ✅ README.md, LICENSE.md → Documentation
# ✅ .mcp.json             → MCP configuration

# Next: cd web && bun install && bun run dev
```

### Example 2: Add Backend Later

```bash
# Start with frontend-only (from Example 1)
cd web

# Enable backend in .env.local
# Change: ONE_BACKEND=off → ONE_BACKEND=on

# Configure Convex:
npx convex deploy

# Add to .env.local:
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name

# Restart dev server
bun run dev

# Result: Full platform with auth & database
```

### Example 3: Platform Setup Without Website

```bash
npx oneie

# Answer prompts:
Name: Jane Smith
Organization: StartupCo
Website: https://startupco.com
Enhance website? No  # <-- Skip website creation
Email: jane@startupco.com

# Result - Platform files without website:
# ✅ /one/                 → Ontology and documentation
# ✅ /.claude/             → AI agents and commands
# ✅ /startupco/           → Your organization folder
# ✅ CLAUDE.md, AGENTS.md  → AI instructions
# ✅ README.md, LICENSE.md → Documentation
# ✅ .mcp.json             → MCP configuration
# ❌ /web/                 → Skipped (can add later)

# Next: Run Claude Code and type /one
```

## What Makes It Different

### Integrated Onboarding

**Traditional CLIs:**
```bash
create-react-app my-app
# Generic template, manual configuration
# No branding, no customization
```

**ONE Platform:**
```bash
npx oneie
# Interactive onboarding collects your info
# Automatically brands website with your org
# Everything configured and ready to run!
```

### Smart Defaults

**ONE Platform provides:**
- ✅ Fully branded with your organization name and website
- ✅ Backend toggle (ONE_BACKEND=off for static, =on for full platform)
- ✅ Pre-configured for Cloudflare Pages deployment
- ✅ 50+ shadcn/ui components pre-installed
- ✅ Tailwind CSS v4 with modern CSS-based config
- ✅ React 19 edge-compatible for Cloudflare Workers
- ✅ Conditional homepage (different UI for ONE vs customer orgs)
- ✅ Minimal sidebar for customer orgs (Blog + License only)

### Progressive Enhancement

Start simple, scale when ready:
1. **Frontend-only** (ONE_BACKEND=off): Static site, no database
2. **Add backend** (ONE_BACKEND=on): Real-time DB, auth, Convex
3. **Deploy** (wrangler pages deploy): Production on Cloudflare Edge

## Customization

### Change Organization Settings

Edit `.env.local`:
```bash
ORG_NAME=new-name
ORG_WEBSITE=https://new-site.com
```

Restart dev server to see changes.

### Add Backend Later

```bash
# 1. Enable backend in .env.local
ONE_BACKEND=on

# 2. Create Convex deployment
npx convex deploy

# 3. Add backend URL
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name

# 4. Restart dev server
bun run dev
```

### Customize Homepage

Edit `src/pages/index.astro`:
```astro
---
const isONE = import.meta.env.ORG_NAME === "one";
const orgName = import.meta.env.ORG_NAME;
---

{!isONE ? (
  <!-- Your custom homepage here -->
  <MyCustomHomepage orgName={orgName} />
) : (
  <!-- ONE Platform homepage -->
  <ONEHomepage />
)}
```

## Troubleshooting

### Directory already exists

```
Error: Directory "acme-website" already exists
```

**Solution:** Choose a different directory name or remove the existing one

### Git clone failed

```
Error: Failed to clone template
```

**Solution:** Check internet connection and retry

### Dependencies installation failed

```
Warning: Failed to install dependencies
```

**Solution:** Run manually:
```bash
cd acme-website
bun install
```

## File Structure

### Core Files

```
acme-website/
├── .env.local                 # Your org configuration ✓
├── .env.local.example         # Template for reference
├── astro.config.mjs           # Astro + React 19 edge config
├── wrangler.toml              # Cloudflare Pages config
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind CSS v4
└── tsconfig.json              # TypeScript config
```

### Source Files

```
src/
├── components/
│   ├── GetStartedPrompt.tsx   # Customer org homepage ✓
│   ├── MinimalSidebar.tsx     # Customer org sidebar ✓
│   ├── Sidebar.tsx            # Full navigation
│   └── ui/                    # shadcn/ui components (50+)
├── layouts/
│   └── Layout.astro           # Main layout
├── pages/
│   └── index.astro            # Homepage (conditional) ✓
└── styles/
    └── global.css             # Tailwind CSS v4
```

## Next Steps

After creating your website:

1. **Customize content** in `src/pages/`
2. **Add blog posts** to `src/content/blog/`
3. **Configure Cloudflare** for deployment
4. **Add custom domain** in Cloudflare dashboard
5. **Enable backend** when you need it

## Support

- **Documentation:** https://one.ie
- **GitHub:** https://github.com/one-ie/web
- **Issues:** https://github.com/one-ie/web/issues

---

**Built for instant gratification and gradual complexity.**

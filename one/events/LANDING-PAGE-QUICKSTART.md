# Landing Page Generator - Quick Start Guide

Generate a beautiful, performant landing page in under 5 minutes using your brand colors and content.

## Quick Start (3 Commands)

```bash
# 1. Create your brand config
cp .onboarding.json.example .onboarding.json
# Edit with your brand data

# 2. Generate landing page
bun scripts/generate-landing-page.ts

# 3. Preview locally
cd web && bun run dev
# Visit http://localhost:4321
```

## What Gets Generated

### Components (`/web/src/components/landing/`)

1. **Hero.tsx** - Logo, headline, tagline, CTA buttons
2. **Features.tsx** - 3-column feature grid with icons
3. **CTA.tsx** - Call-to-action with gradient background
4. **Footer.tsx** - Multi-column footer with links

### Pages & Layouts

- **index.astro** - Landing page entry point
- **LandingLayout.astro** - Clean layout without sidebar

### Styling

- **landing-theme.css** - Brand colors in Tailwind v4 format

## Customization

### Step 1: Configure `.onboarding.json`

```json
{
  "organizationName": "Your Company",
  "tagline": "Your Tagline",
  "logoUrl": "/logo.svg",
  "colors": {
    "primary": "216 55% 25%",
    "secondary": "219 14% 28%",
    "accent": "105 22% 25%",
    "background": "36 8% 88%",
    "foreground": "0 0% 13%"
  },
  "features": [
    {
      "title": "Feature 1",
      "description": "Description of your first feature",
      "icon": "cpu"
    },
    {
      "title": "Feature 2",
      "description": "Description of your second feature",
      "icon": "users"
    },
    {
      "title": "Feature 3",
      "description": "Description of your third feature",
      "icon": "zap"
    }
  ],
  "cta": {
    "title": "Ready to Get Started?",
    "description": "Join thousands of happy customers today",
    "buttonText": "Sign Up Free",
    "buttonLink": "/account/signup"
  }
}
```

### Step 2: Add Your Logo

```bash
# Place your logo in the public directory
cp your-logo.svg web/public/logo.svg
```

**Logo Requirements**:
- Format: SVG (recommended for best quality)
- Size: Any (will be displayed at 128px-160px)
- Background: Transparent recommended

### Step 3: Convert Colors to HSL

Your brand colors need to be in HSL format **without** the `hsl()` wrapper.

**From HEX**:
```javascript
// #2563eb → "217 91% 60%"
// Use: https://htmlcolors.com/hsl-color-picker
```

**From RGB**:
```javascript
// rgb(37, 99, 235) → "217 91% 60%"
// Use: https://www.w3schools.com/colors/colors_converter.asp
```

**Format**:
- ✅ Correct: `"primary": "217 91% 60%"`
- ❌ Wrong: `"primary": "hsl(217, 91%, 60%)"`
- ❌ Wrong: `"primary": "#2563eb"`

## Available Icons

Choose from these icons for your features:

| Icon | Use Case |
|------|----------|
| `cpu` | Technology, AI, Processing |
| `users` | Team, Community, People |
| `zap` | Speed, Energy, Performance |
| `box` | Product, Package, Platform |

## Deployment

### Preview Deployment

```bash
./scripts/deploy-landing-page.sh preview
```

### Production Deployment

```bash
./scripts/deploy-landing-page.sh production
```

The deployment script will:
1. Install dependencies
2. Run TypeScript checks
3. Build for production
4. Deploy to Cloudflare Pages
5. Optionally run Lighthouse tests

## Performance Targets

The generated landing page is optimized for:

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Static HTML, optimized images |
| FID | < 100ms | Minimal JavaScript (< 30KB) |
| CLS | < 0.1 | No layout shifts |
| Lighthouse | 90+ | Static-first architecture |

**Hydration Strategy**:
- Hero: `client:load` (interactive buttons)
- Features: Static HTML (CSS-only hover)
- CTA: `client:load` (interactive button)
- Footer: Static HTML (no JavaScript)

**Result**: 90% of landing page is static HTML with zero JavaScript.

## Accessibility

All generated components are WCAG 2.1 AA compliant:

- ✅ Semantic HTML (proper heading hierarchy)
- ✅ Keyboard navigation
- ✅ Screen reader optimized
- ✅ 4.5:1 contrast ratio (body text)
- ✅ 3:1 contrast ratio (large text)
- ✅ Skip to main content link
- ✅ Focus indicators

## Example Workflows

### Workflow 1: First Time Setup

```bash
# 1. Create config with your brand
cat > .onboarding.json << EOF
{
  "organizationName": "Acme Corp",
  "tagline": "Innovation at Scale",
  "logoUrl": "/logo.svg",
  "colors": {
    "primary": "217 91% 60%",
    "secondary": "142 76% 36%",
    "accent": "38 92% 50%"
  }
}
EOF

# 2. Generate landing page
bun scripts/generate-landing-page.ts

# 3. Test locally
cd web && bun run dev

# 4. Deploy preview
cd .. && ./scripts/deploy-landing-page.sh preview
```

### Workflow 2: Update Existing Landing Page

```bash
# 1. Edit brand config
nano .onboarding.json

# 2. Regenerate components
bun scripts/generate-landing-page.ts

# 3. Test locally
cd web && bun run dev

# 4. Deploy to production
cd .. && ./scripts/deploy-landing-page.sh production
```

### Workflow 3: A/B Testing Different Colors

```bash
# 1. Save current config
cp .onboarding.json .onboarding.backup.json

# 2. Test variant A (blue)
cat > .onboarding.json << EOF
{
  "colors": {
    "primary": "217 91% 60%"
  }
}
EOF
bun scripts/generate-landing-page.ts
./scripts/deploy-landing-page.sh preview

# 3. Test variant B (green)
cat > .onboarding.json << EOF
{
  "colors": {
    "primary": "142 76% 36%"
  }
}
EOF
bun scripts/generate-landing-page.ts
./scripts/deploy-landing-page.sh preview

# 4. Compare Lighthouse scores and choose winner
```

## Testing Checklist

Before deploying to production:

- [ ] Logo displays correctly
- [ ] All brand colors applied
- [ ] Tagline and features accurate
- [ ] CTA button links to correct URL
- [ ] Mobile responsive (test at 375px, 768px, 1440px)
- [ ] Dark mode works
- [ ] Keyboard navigation functional
- [ ] Screen reader reads content correctly
- [ ] Lighthouse score 90+

## Troubleshooting

### Logo Not Showing

```bash
# Check logo exists
ls -la web/public/logo.svg

# Verify path in config
cat .onboarding.json | grep logoUrl
# Should be: "logoUrl": "/logo.svg"
```

### Colors Not Applying

```bash
# Check HSL format (no hsl() wrapper)
cat .onboarding.json | grep primary
# ✅ Correct: "primary": "217 91% 60%"
# ❌ Wrong: "primary": "hsl(217, 91%, 60%)"

# Verify theme CSS generated
cat web/src/styles/landing-theme.css
```

### Build Fails

```bash
# Check TypeScript errors
cd web && bunx astro check

# Check syntax
bun run lint
```

### Deployment Fails

```bash
# Ensure Cloudflare CLI installed
wrangler --version

# Check build succeeds locally
cd web && bun run build

# Verify dist directory created
ls -la dist/
```

## File Locations

Quick reference for where everything is:

```
.onboarding.json              # Your brand config (create this)
scripts/
  generate-landing-page.ts    # Generator script
  deploy-landing-page.sh      # Deployment script
web/
  src/
    components/landing/       # Generated components
      Hero.tsx
      Features.tsx
      CTA.tsx
      Footer.tsx
      README.md               # Component docs
    layouts/
      LandingLayout.astro     # Landing layout
    pages/
      index.astro             # Landing page
    styles/
      landing-theme.css       # Brand colors
  public/
    logo.svg                  # Your logo (add this)
```

## Advanced Customization

### Custom Icons

Add more icons in `/scripts/generate-landing-page.ts`:

```typescript
function getIconPath(icon: string): string {
  const icons: Record<string, string> = {
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/>...',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6..."/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9..."/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7..."/>',
    // Add your custom icon:
    rocket: '<path d="M4.5 16.5c-1.5 1.5..."/>'  // Get from lucide.dev
  };
  return icons[icon] || icons.box;
}
```

### Multiple Landing Pages

Generate different landing pages for different audiences:

```bash
# B2B landing page
cat > .onboarding.b2b.json << EOF
{
  "organizationName": "Acme for Business",
  "tagline": "Enterprise Solutions"
}
EOF

# B2C landing page
cat > .onboarding.b2c.json << EOF
{
  "organizationName": "Acme",
  "tagline": "For Everyone"
}
EOF

# Generate and deploy separately
bun scripts/generate-landing-page.ts --config=.onboarding.b2b.json
```

## Support

For issues or questions:

- **Component Docs**: `/web/src/components/landing/README.md`
- **Deployment Docs**: `/one/events/landing-page-generator.md`
- **Astro Patterns**: `/one/things/frontend.md`
- **Tailwind v4**: `/web/src/styles/global.css`

## Next Steps

After your landing page is live:

1. **Analytics**: Add event tracking for CTA clicks
2. **A/B Testing**: Test different headlines and colors
3. **Personalization**: Show different content based on UTM params
4. **Lead Capture**: Add email signup form
5. **Social Proof**: Add testimonials and customer logos

---

**Ready to build?** Start with: `bun scripts/generate-landing-page.ts`

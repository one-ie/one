# Landing Page Generator - Infer 1-10

This directory contains auto-generated landing page components created by the ONE Platform landing page generator.

## Overview

The landing page generator reads brand data from `.onboarding.json` and generates:

1. **Hero Component** - Logo, headline, tagline, and CTA buttons
2. **Features Grid** - 3-column responsive feature cards
3. **CTA Section** - Call-to-action with gradient background
4. **Footer** - Multi-column footer with links

## Architecture

### Static-First Approach

Following Astro's islands architecture with strategic hydration:

- **Hero**: `client:load` (interactive CTA buttons)
- **Features**: Static HTML (no JavaScript)
- **CTA**: `client:load` (interactive button)
- **Footer**: Static HTML (no JavaScript)

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: 90+

### Accessibility

- Semantic HTML (proper heading hierarchy)
- WCAG 2.1 AA contrast ratios
- Keyboard navigation support
- Screen reader optimized
- Skip to main content link

## Components

### Hero.tsx

Main hero section with:
- Logo (reads from `.onboarding.json`)
- Gradient headline using brand colors
- Tagline
- Primary and secondary CTA buttons
- Decorative gradient background

**Hydration**: `client:load` for button interactivity

**Props**: None (reads from onboarding data)

### Features.tsx

Features grid with:
- Section title and description
- 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Feature cards with icons, titles, descriptions
- Hover effects

**Hydration**: None (static HTML)

**Props**: None (reads from onboarding data)

### CTA.tsx

Call-to-action section with:
- Gradient background using brand colors
- Section title and description
- Primary CTA button
- Decorative overlay

**Hydration**: `client:load` for button interactivity

**Props**: None (reads from onboarding data)

### Footer.tsx

Multi-column footer with:
- Brand section
- Product links
- Company links
- Resources links
- Copyright notice

**Hydration**: None (static HTML)

**Props**: None (reads from onboarding data)

## Customization

### Using .onboarding.json

Create a `.onboarding.json` file at the project root:

```json
{
  "organizationName": "Your Company",
  "tagline": "Your Tagline",
  "logoUrl": "/your-logo.svg",
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
      "description": "Description of feature 1",
      "icon": "cpu"
    },
    {
      "title": "Feature 2",
      "description": "Description of feature 2",
      "icon": "users"
    },
    {
      "title": "Feature 3",
      "description": "Description of feature 3",
      "icon": "zap"
    }
  ],
  "cta": {
    "title": "Ready to Start?",
    "description": "Join thousands of happy customers",
    "buttonText": "Sign Up Free",
    "buttonLink": "/signup"
  }
}
```

### Available Icons

- `cpu` - Processor/technology
- `users` - People/team
- `zap` - Speed/energy
- `box` - Product/package

### Color Format

Colors must be in HSL format without the `hsl()` wrapper:

- **Correct**: `"primary": "216 55% 25%"`
- **Incorrect**: `"primary": "hsl(216, 55%, 25%)"`

The `hsl()` wrapper is applied automatically in CSS.

## Generation

### Generate Landing Page

```bash
bun scripts/generate-landing-page.ts
```

This will:
1. Read `.onboarding.json` (or use defaults)
2. Generate all components in `src/components/landing/`
3. Generate `index.astro` at `src/pages/`
4. Generate `landing-theme.css` with brand colors
5. Create example `.onboarding.json` if missing

### Re-generate After Changes

After updating `.onboarding.json`, re-run the generator:

```bash
bun scripts/generate-landing-page.ts
```

All files will be regenerated with new brand data.

## Deployment

### Preview Deployment

```bash
./scripts/deploy-landing-page.sh preview
```

### Production Deployment

```bash
./scripts/deploy-landing-page.sh production
```

The deployment script:
1. Installs dependencies
2. Runs TypeScript checks
3. Builds for production
4. Deploys to Cloudflare Pages
5. Optionally runs Lighthouse tests

## File Structure

```
web/
├── src/
│   ├── components/
│   │   └── landing/
│   │       ├── Hero.tsx          # Hero section
│   │       ├── Features.tsx      # Features grid
│   │       ├── CTA.tsx           # Call-to-action
│   │       ├── Footer.tsx        # Footer
│   │       └── README.md         # This file
│   ├── layouts/
│   │   └── LandingLayout.astro   # Landing page layout
│   ├── pages/
│   │   └── index.astro           # Landing page
│   └── styles/
│       └── landing-theme.css     # Brand colors theme
└── public/
    └── logo.svg                   # Your logo
```

## Styling

### Tailwind Classes

Components use shadcn/ui semantic color variables:

- `bg-background` / `text-foreground` - Base colors
- `bg-primary` / `text-primary-foreground` - Primary brand
- `bg-secondary` / `text-secondary-foreground` - Secondary brand
- `bg-accent` / `text-accent-foreground` - Accent color
- `bg-muted` / `text-muted-foreground` - Muted backgrounds
- `bg-card` / `text-card-foreground` - Card backgrounds

### Custom Gradients

Hero and CTA use brand color gradients:

```tsx
className="bg-gradient-to-r from-primary via-secondary to-accent"
```

### Dark Mode

The landing theme includes dark mode overrides. Toggle with the theme switcher.

## Testing

### Visual Testing

```bash
cd web
bun run dev
# Visit http://localhost:4321
```

### Lighthouse Testing

```bash
# After deployment
lighthouse https://your-url.com \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-report.html
```

### Accessibility Testing

```bash
# Install axe-core
npm install -g @axe-core/cli

# Run accessibility tests
axe https://your-url.com
```

## Best Practices

### Performance

1. **Images**: Use optimized SVG for logo
2. **Hydration**: Only Hero and CTA need `client:load`
3. **Fonts**: Use system fonts for speed
4. **CSS**: All styles in Tailwind (no runtime CSS-in-JS)

### Accessibility

1. **Headings**: Proper h1-h6 hierarchy
2. **Alt Text**: Descriptive alt text on all images
3. **Contrast**: WCAG 2.1 AA minimum (4.5:1 body text, 3:1 large text)
4. **Focus**: Visible focus indicators
5. **Keyboard**: All interactive elements keyboard accessible

### SEO

1. **Title**: Descriptive page title
2. **Meta**: Description, Open Graph, Twitter cards
3. **Headings**: Semantic heading structure
4. **Links**: Descriptive link text

## Troubleshooting

### Logo Not Showing

1. Check logo path in `.onboarding.json`
2. Ensure logo exists in `public/` directory
3. Use SVG format for best quality

### Colors Not Applying

1. Verify HSL format (without `hsl()` wrapper)
2. Check `landing-theme.css` is imported in `LandingLayout.astro`
3. Run `bun run dev` to rebuild

### Build Errors

```bash
# Check TypeScript
bunx astro check

# Check syntax
bun run lint
```

### Hydration Errors

If you see hydration mismatches:
1. Ensure `client:load` is on correct components
2. Check for dynamic content (use static data)
3. Verify no server/client data discrepancies

## Support

For issues or questions:
- Read `/one/things/frontend.md` for Astro patterns
- Check `/one/knowledge/rules.md` for best practices
- Review existing landing pages in `src/pages/`

---

**Generated by**: ONE Platform Landing Page Generator
**Version**: 1.0.0 (Infer 1-10)
**Documentation**: `/one/things/frontend.md`

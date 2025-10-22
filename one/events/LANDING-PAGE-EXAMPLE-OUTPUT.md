# Landing Page Generator - Example Output

This document shows exactly what gets generated when you run the landing page generator.

## Input: .onboarding.json

```json
{
  "organizationName": "ONE Platform",
  "tagline": "Make Your Ideas Real",
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
      "title": "AI-Native Architecture",
      "description": "Built on a 6-dimension ontology that models reality through Groups, People, Things, Connections, Events, and Knowledge.",
      "icon": "cpu"
    },
    {
      "title": "Multi-Tenant by Design",
      "description": "Hierarchical groups from friend circles to global governments. Complete data isolation with flexible access control.",
      "icon": "users"
    },
    {
      "title": "Real-Time Everything",
      "description": "Powered by Convex for instant updates. Effect.ts for pure business logic. Type-safe from database to UI.",
      "icon": "zap"
    }
  ],
  "cta": {
    "title": "Ready to Build?",
    "description": "Start creating with the ONE Platform today.",
    "buttonText": "Get Started",
    "buttonLink": "/account/signup"
  }
}
```

## Output 1: Hero Component

**File**: `/web/src/components/landing/Hero.tsx`

```tsx
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40">
            <img
              src="/logo.svg"
              alt="ONE Platform"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ONE Platform
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Make Your Ideas Real
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="/account/signup">
                Get Started
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="/docs">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    </section>
  );
}
```

**Visual Result**:
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                      [LOGO IMAGE]                            │
│                                                              │
│                   ONE Platform                               │
│                  (gradient text)                             │
│                                                              │
│              Make Your Ideas Real                            │
│            (muted foreground text)                           │
│                                                              │
│         [Get Started]    [Learn More]                        │
│           (primary)       (outline)                          │
│                                                              │
│         (subtle gradient background)                         │
└──────────────────────────────────────────────────────────────┘
```

## Output 2: Features Component

**File**: `/web/src/components/landing/Features.tsx`

```tsx
export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Why Choose ONE Platform?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for speed, scalability, and developer experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="text-primary" width="24" height="24">
                  {/* CPU icon SVG path */}
                </svg>
              </div>
              <h3 className="text-xl font-semibold">AI-Native Architecture</h3>
              <p className="text-muted-foreground">
                Built on a 6-dimension ontology that models reality through Groups, People, Things, Connections, Events, and Knowledge.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="text-primary" width="24" height="24">
                  {/* Users icon SVG path */}
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Multi-Tenant by Design</h3>
              <p className="text-muted-foreground">
                Hierarchical groups from friend circles to global governments. Complete data isolation with flexible access control.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="text-primary" width="24" height="24">
                  {/* Zap icon SVG path */}
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Real-Time Everything</h3>
              <p className="text-muted-foreground">
                Powered by Convex for instant updates. Effect.ts for pure business logic. Type-safe from database to UI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Visual Result**:
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              Why Choose ONE Platform?                        │
│     Built for speed, scalability, and developer experience   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   [CPU ICON] │  │ [USERS ICON] │  │  [ZAP ICON]  │      │
│  │              │  │              │  │              │      │
│  │  AI-Native   │  │ Multi-Tenant │  │  Real-Time   │      │
│  │ Architecture │  │  by Design   │  │  Everything  │      │
│  │              │  │              │  │              │      │
│  │ Description  │  │ Description  │  │ Description  │      │
│  │   text...    │  │   text...    │  │   text...    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│         (hover for shadow effect)                            │
└──────────────────────────────────────────────────────────────┘
```

## Output 3: CTA Component

**File**: `/web/src/components/landing/CTA.tsx`

```tsx
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-12 md:p-20 text-center">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">
              Ready to Build?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Start creating with the ONE Platform today.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                asChild
              >
                <a href="/account/signup">
                  Get Started
                </a>
              </Button>
            </div>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
```

**Visual Result**:
```
┌──────────────────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════════════════╗  │
│  ║                                                        ║  │
│  ║           Ready to Build?                              ║  │
│  ║      (white text on gradient background)               ║  │
│  ║                                                        ║  │
│  ║   Start creating with the ONE Platform today.          ║  │
│  ║                                                        ║  │
│  ║              [Get Started]                             ║  │
│  ║            (secondary button)                          ║  │
│  ║                                                        ║  │
│  ║     (gradient: primary → secondary → accent)           ║  │
│  ╚════════════════════════════════════════════════════════╝  │
└──────────────────────────────────────────────────────────────┘
```

## Output 4: Footer Component

**File**: `/web/src/components/landing/Footer.tsx`

```tsx
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">ONE Platform</h3>
            <p className="text-sm text-muted-foreground">
              Make Your Ideas Real
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/features">Features</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/support">Support</a></li>
              <li><a href="/status">Status</a></li>
              <li><a href="https://github.com/one-ie">GitHub</a></li>
              <li><a href="/changelog">Changelog</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ONE Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

**Visual Result**:
```
┌──────────────────────────────────────────────────────────────┐
│ ────────────────────────────────────────────────────────────│
│                                                              │
│  ONE Platform     Product       Company      Resources      │
│  Make Your        Features      About        Support        │
│  Ideas Real       Pricing       Contact      Status         │
│                   Docs          Careers      GitHub         │
│                   Blog          Privacy      Changelog      │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│           © 2025 ONE Platform. All rights reserved.          │
└──────────────────────────────────────────────────────────────┘
```

## Output 5: Landing Theme CSS

**File**: `/web/src/styles/landing-theme.css`

```css
/* Landing page theme generated from .onboarding.json */

@theme {
  /* Brand colors from onboarding */
  --color-primary: 216 55% 25%;
  --color-secondary: 219 14% 28%;
  --color-accent: 105 22% 25%;
  --color-background: 36 8% 88%;
  --color-foreground: 0 0% 13%;

  /* Derived colors */
  --color-primary-foreground: 36 8% 96%;
  --color-secondary-foreground: 36 8% 96%;
  --color-accent-foreground: 36 8% 96%;

  /* Semantic colors */
  --color-card: 36 10% 74%;
  --color-card-foreground: 0 0% 13%;
  --color-muted: 219 14% 92%;
  --color-muted-foreground: 219 14% 30%;
  --color-border: 0 0% 100% / 0.1;
}

/* Dark mode overrides */
.dark {
  --color-background: 0 0% 13%;
  --color-foreground: 36 8% 96%;
  --color-card: 0 0% 10%;
  --color-card-foreground: 36 8% 96%;
  --color-muted: 216 63% 17%;
  --color-muted-foreground: 36 8% 80%;
}
```

## Output 6: Index Page

**File**: `/web/src/pages/index.astro`

```astro
---
import LandingLayout from '@/layouts/LandingLayout.astro';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
---

<LandingLayout title="ONE Platform - Make Your Ideas Real">
  <Hero client:load />
  <Features />
  <CTA client:load />
  <Footer />
</LandingLayout>
```

## Full Page Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER (Hero)                            │
│                                                                 │
│                       [LOGO IMAGE]                              │
│                                                                 │
│                      ONE Platform                               │
│                     (gradient text)                             │
│                                                                 │
│                 Make Your Ideas Real                            │
│                                                                 │
│            [Get Started]    [Learn More]                        │
│                                                                 │
│          (subtle gradient background)                           │
├─────────────────────────────────────────────────────────────────┤
│                     FEATURES SECTION                            │
│                                                                 │
│               Why Choose ONE Platform?                          │
│      Built for speed, scalability, and developer experience     │
│                                                                 │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐          │
│   │ [ICON CPU] │    │[ICON USERS]│    │ [ICON ZAP] │          │
│   │            │    │            │    │            │          │
│   │ AI-Native  │    │Multi-Tenant│    │ Real-Time  │          │
│   │Architecture│    │ by Design  │    │ Everything │          │
│   │            │    │            │    │            │          │
│   │Description │    │Description │    │Description │          │
│   │  text...   │    │  text...   │    │  text...   │          │
│   └────────────┘    └────────────┘    └────────────┘          │
│                                                                 │
│            (muted background, cards on hover)                   │
├─────────────────────────────────────────────────────────────────┤
│                       CTA SECTION                               │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║                                                           ║ │
│  ║                  Ready to Build?                          ║ │
│  ║         (white text on gradient background)               ║ │
│  ║                                                           ║ │
│  ║      Start creating with the ONE Platform today.          ║ │
│  ║                                                           ║ │
│  ║                  [Get Started]                            ║ │
│  ║                                                           ║ │
│  ║       (gradient: primary → secondary → accent)            ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────────────────┤
│                       FOOTER                                    │
│                                                                 │
│  ONE Platform    Product      Company      Resources           │
│  Make Your       Features     About        Support             │
│  Ideas Real      Pricing      Contact      Status              │
│                  Docs         Careers      GitHub              │
│                  Blog         Privacy      Changelog           │
│                                                                 │
│  ───────────────────────────────────────────────────────────── │
│          © 2025 ONE Platform. All rights reserved.              │
└─────────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Mobile (375px)

```
┌────────────────┐
│   [LOGO]       │
│                │
│ ONE Platform   │
│ (stacked)      │
│                │
│ Make Your      │
│ Ideas Real     │
│                │
│ [Get Started]  │
│ [Learn More]   │
│                │
├────────────────┤
│ Why Choose?    │
│                │
│ ┌────────────┐ │
│ │  Feature 1 │ │
│ └────────────┘ │
│ ┌────────────┐ │
│ │  Feature 2 │ │
│ └────────────┘ │
│ ┌────────────┐ │
│ │  Feature 3 │ │
│ └────────────┘ │
│                │
├────────────────┤
│ ╔════════════╗ │
│ ║Ready to    ║ │
│ ║Build?      ║ │
│ ║            ║ │
│ ║[Get Started║ │
│ ╚════════════╝ │
│                │
├────────────────┤
│ ONE Platform   │
│ Product        │
│ Company        │
│ Resources      │
│                │
│ © 2025         │
└────────────────┘
```

### Tablet (768px)

```
┌──────────────────────────────┐
│         [LOGO]               │
│                              │
│      ONE Platform            │
│                              │
│   Make Your Ideas Real       │
│                              │
│  [Get Started] [Learn More]  │
│                              │
├──────────────────────────────┤
│   Why Choose ONE Platform?   │
│                              │
│ ┌───────────┐ ┌───────────┐ │
│ │ Feature 1 │ │ Feature 2 │ │
│ └───────────┘ └───────────┘ │
│ ┌───────────┐               │
│ │ Feature 3 │               │
│ └───────────┘               │
│                              │
├──────────────────────────────┤
│ ╔══════════════════════════╗ │
│ ║   Ready to Build?        ║ │
│ ║                          ║ │
│ ║   [Get Started]          ║ │
│ ╚══════════════════════════╝ │
│                              │
├──────────────────────────────┤
│ ONE    Product    Company    │
│        Resources             │
│                              │
│        © 2025                │
└──────────────────────────────┘
```

### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────┐
│                       [LOGO]                                 │
│                                                              │
│                   ONE Platform                               │
│                                                              │
│              Make Your Ideas Real                            │
│                                                              │
│         [Get Started]    [Learn More]                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│              Why Choose ONE Platform?                        │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │Feature 1 │    │Feature 2 │    │Feature 3 │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════╗  │
│  ║          Ready to Build?                               ║  │
│  ║                                                        ║  │
│  ║          [Get Started]                                 ║  │
│  ╚════════════════════════════════════════════════════════╝  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ONE Platform    Product      Company      Resources        │
│                                                              │
│                    © 2025                                    │
└──────────────────────────────────────────────────────────────┘
```

## Performance Analysis

### Network Tab (Expected)

```
Name                 Size (gzipped)  Type        Load Time
──────────────────────────────────────────────────────────
index.html           15 KB           document    200ms
landing-theme.css    8 KB            stylesheet  50ms
logo.svg             2 KB            image       30ms
hero-bundle.js       8 KB            script      80ms
cta-bundle.js        6 KB            script      60ms
button.js            4 KB            script      40ms
react-runtime.js     12 KB           script      100ms
──────────────────────────────────────────────────────────
TOTAL                55 KB                       560ms
```

### Lighthouse Report (Expected)

```
Performance:     95/100
  FCP:          0.9s
  LCP:          1.5s
  TBT:          20ms
  CLS:          0.05
  Speed Index:  1.2s

Accessibility:   100/100
  Contrast:     ✓ 4.5:1 minimum
  Navigation:   ✓ Keyboard accessible
  ARIA:         ✓ Proper labels
  Headings:     ✓ Logical hierarchy

Best Practices:  100/100
  HTTPS:        ✓
  Console:      ✓ No errors
  Images:       ✓ Proper sizing

SEO:             100/100
  Meta:         ✓ Description present
  Headings:     ✓ H1 present
  Links:        ✓ Descriptive text
  Mobile:       ✓ Responsive
```

## CLI Output Example

```bash
$ bun scripts/generate-landing-page.ts

🎨 Landing Page Generator - Infer 1-10

⚠️  No .onboarding.json found, using defaults
📋 Organization: ONE Platform
📋 Tagline: Make Your Ideas Real
✅ Created components/landing directory
✅ Generated Hero.tsx
✅ Generated Features.tsx
✅ Generated CTA.tsx
✅ Generated Footer.tsx
✅ Generated index.astro
✅ Generated landing-theme.css

✨ Landing page generated successfully!

📝 Next steps:
   1. Import landing-theme.css in your Layout.astro
   2. Add logo file to public/ directory
   3. Run: cd web && bun run dev
   4. Visit: http://localhost:4321

📄 Created example .onboarding.json
   Customize this file with your brand data
```

---

This example shows the complete output of the landing page generator, from input JSON to generated components, styling, and final visual appearance across all device sizes.

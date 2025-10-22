# Feature-Based Multi-Site Architecture

**Status:** 🎯 Active Plan
**Created:** 2025-10-19
**Ontology:** Things (Infrastructure Planning)

---

## Vision

Build websites by **enabling features**, not selecting templates. Users mix and match features to create exactly what they need.

### The Shift: From Templates to Features

**❌ Template-Based (Rigid):**
```bash
PUBLIC_SITE_TEMPLATE=creator     # Gets: portfolio, blog, courses
PUBLIC_SITE_TEMPLATE=ecommerce   # Gets: shop, cart, checkout
# Problem: What if you want portfolio + shop + courses?
```

**✅ Feature-Based (Flexible):**
```bash
# Enable exactly what you need
PUBLIC_FEATURES=blog,portfolio,shop,courses,community,tokens
# Or start blank and add features one at a time
PUBLIC_FEATURES=blank  # Minimal starter, add features later
```

---

## Core Concept: Feature Flags

### Environment Variables Control Features

```bash
# .env.local or Cloudflare environment
PUBLIC_SITE_NAME="Jane Doe"
PUBLIC_FEATURES=portfolio,blog,courses,shop,community,tokens

# Each feature adds:
# - Routes (/courses, /shop, etc.)
# - Components (CourseCard, ProductGrid, etc.)
# - Navigation items
# - Database tables/functions
```

### How Features Work

```typescript
// src/config/features.ts
export type Feature =
  | 'blank'        // Minimal starter (homepage, about, contact)
  | 'blog'         // Content hub
  | 'portfolio'    // Project showcase
  | 'courses'      // Course platform
  | 'shop'         // Ecommerce
  | 'community'    // Forums/chat
  | 'tokens'       // Creator tokens
  | 'library'      // Resource library
  | 'events'       // Event management
  | 'booking'      // Appointment scheduling
  | 'membership'   // Subscription tiers
  | 'analytics';   // Dashboard & insights

export const FEATURES = (
  import.meta.env.PUBLIC_FEATURES || 'blank'
).split(',').map(f => f.trim()) as Feature[];

export const hasFeature = (feature: Feature) =>
  FEATURES.includes(feature) || FEATURES.includes('all');
```

---

## Feature Catalog

### 1. Blank (Starter)

**Perfect for:** Starting from scratch, custom builds

**Includes:**
- Homepage (hero + CTA)
- About page
- Contact page
- Basic navigation

**Routes:**
- `/`
- `/about`
- `/contact`

**No backend needed** - Pure static pages

---

### 2. Blog

**Perfect for:** Content creators, writers, marketers

**Includes:**
- Blog listing (grid/list views)
- Individual blog posts
- Categories & tags
- Search & filtering
- RSS feed

**Routes:**
- `/blog`
- `/blog/[slug]`
- `/blog/category/[category]`

**Backend needs:** `things` table (type: `blog_post`)

---

### 3. Portfolio

**Perfect for:** Artists, designers, developers

**Includes:**
- Project showcase
- Case studies
- Image galleries
- Client testimonials

**Routes:**
- `/portfolio`
- `/portfolio/[project-slug]`

**Backend needs:** `things` table (type: `project`)

---

### 4. Courses

**Perfect for:** Educators, coaches, trainers

**Includes:**
- Course catalog
- Lesson pages
- Progress tracking
- Quizzes & assessments
- Certificates

**Routes:**
- `/courses`
- `/courses/[slug]`
- `/courses/[slug]/lessons/[lesson]`
- `/dashboard` (student progress)

**Backend needs:**
- `things` table (type: `course`, `lesson`)
- `connections` table (relationshipType: `enrolled_in`)
- `events` table (type: `lesson_completed`)

---

### 5. Shop

**Perfect for:** Product sellers, brands, merchants

**Includes:**
- Product catalog
- Product pages
- Shopping cart
- Checkout flow
- Order management

**Routes:**
- `/shop`
- `/shop/[product-slug]`
- `/cart`
- `/checkout`
- `/orders`

**Backend needs:**
- `things` table (type: `product`)
- `connections` table (relationshipType: `purchased`)
- `events` table (type: `order_placed`)
- Stripe integration

---

### 6. Community

**Perfect for:** Building engaged audiences

**Includes:**
- Discussion forums
- Chat rooms
- Member directory
- Direct messaging

**Routes:**
- `/community`
- `/community/topics/[topic]`
- `/community/members`
- `/community/messages`

**Backend needs:**
- `things` table (type: `forum_topic`, `message`)
- `connections` table (relationshipType: `follows`, `member_of`)
- Real-time subscriptions

---

### 7. Tokens

**Perfect for:** Creator economy, fan engagement

**Includes:**
- Token overview
- Buy/sell interface
- Holder benefits
- Token-gated content

**Routes:**
- `/tokens`
- `/tokens/buy`
- `/tokens/holders`

**Backend needs:**
- `things` table (type: `token`)
- `connections` table (relationshipType: `holds_tokens`)
- `events` table (type: `tokens_purchased`)
- Blockchain integration

---

### 8. Library

**Perfect for:** Resource hubs, knowledge bases

**Includes:**
- Document library
- File uploads
- Search & categories
- Download tracking

**Routes:**
- `/library`
- `/library/[category]`
- `/library/[slug]`

**Backend needs:**
- `things` table (type: `document`)
- `events` table (type: `document_downloaded`)

---

### 9. Events

**Perfect for:** Event organizers, conferences

**Includes:**
- Event calendar
- Event pages
- RSVP/ticketing
- Attendee list

**Routes:**
- `/events`
- `/events/[slug]`
- `/events/[slug]/register`

**Backend needs:**
- `things` table (type: `event`)
- `connections` table (relationshipType: `registered_for`)
- `events` table (type: `event_registered`)

---

### 10. Booking

**Perfect for:** Consultants, coaches, service providers

**Includes:**
- Calendar availability
- Appointment booking
- Payment integration
- Reminders

**Routes:**
- `/book`
- `/book/confirm`
- `/appointments`

**Backend needs:**
- `things` table (type: `appointment`)
- `events` table (type: `appointment_booked`)
- Calendar integration

---

### 11. Membership

**Perfect for:** Subscription businesses

**Includes:**
- Membership tiers
- Subscription management
- Member-only content
- Recurring billing

**Routes:**
- `/membership`
- `/membership/[tier]`
- `/members/dashboard`

**Backend needs:**
- `things` table (type: `membership_tier`)
- `connections` table (relationshipType: `subscribed_to`)
- `events` table (type: `subscription_created`)
- Stripe subscriptions

---

### 12. Analytics

**Perfect for:** Data-driven creators

**Includes:**
- Traffic dashboard
- Revenue analytics
- User insights
- Export reports

**Routes:**
- `/analytics`
- `/analytics/revenue`
- `/analytics/audience`

**Backend needs:**
- `events` table (all event types)
- Aggregation queries

---

## Feature Combinations

### Starter Pack (Blank)

```bash
PUBLIC_FEATURES=blank
```

**Use case:** Simple landing page, portfolio

---

### Content Creator

```bash
PUBLIC_FEATURES=blog,portfolio,community,tokens
```

**Use case:** Influencer, artist, writer with engaged fans

**Routes unlocked:**
- `/` - Homepage
- `/blog` - Content hub
- `/portfolio` - Work showcase
- `/community` - Fan forum
- `/tokens` - Creator economy

---

### Online Educator

```bash
PUBLIC_FEATURES=courses,library,community,membership
```

**Use case:** Teacher, coach, trainer with paid content

**Routes unlocked:**
- `/` - Homepage
- `/courses` - Course catalog
- `/library` - Resources
- `/community` - Student forum
- `/membership` - Subscription tiers

---

### Ecommerce + Content

```bash
PUBLIC_FEATURES=shop,blog,membership
```

**Use case:** Brand with products + content marketing

**Routes unlocked:**
- `/` - Homepage
- `/shop` - Product catalog
- `/blog` - Content marketing
- `/membership` - Loyalty program

---

### Full Stack Creator

```bash
PUBLIC_FEATURES=blog,portfolio,courses,shop,community,tokens,events,library
```

**Use case:** Power creator with multiple revenue streams

**Routes unlocked:** Everything!

---

## File Structure

```
/web/
├── src/
│   ├── features/
│   │   ├── blank/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── about.astro
│   │   │   │   └── contact.astro
│   │   │   └── components/
│   │   │       └── Hero.astro
│   │   │
│   │   ├── blog/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   └── [...slug].astro
│   │   │   └── components/
│   │   │       ├── BlogList.astro
│   │   │       └── BlogPost.astro
│   │   │
│   │   ├── portfolio/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   └── [...slug].astro
│   │   │   └── components/
│   │   │       └── ProjectGrid.astro
│   │   │
│   │   ├── courses/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── [slug]/index.astro
│   │   │   │   └── [slug]/lessons/[lesson].astro
│   │   │   └── components/
│   │   │       ├── CourseCard.astro
│   │   │       └── LessonList.astro
│   │   │
│   │   ├── shop/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── [slug].astro
│   │   │   │   ├── cart.astro
│   │   │   │   └── checkout.astro
│   │   │   └── components/
│   │   │       ├── ProductGrid.astro
│   │   │       └── ShoppingCart.tsx
│   │   │
│   │   ├── community/
│   │   ├── tokens/
│   │   ├── library/
│   │   ├── events/
│   │   ├── booking/
│   │   ├── membership/
│   │   └── analytics/
│   │
│   ├── config/
│   │   ├── features.ts          # Feature detection
│   │   ├── navigation.ts        # Dynamic nav based on features
│   │   └── site.ts              # Site metadata
│   │
│   ├── components/ui/            # Shared shadcn/ui
│   │
│   └── pages/
│       └── [...feature].astro   # Dynamic router
│
├── astro.config.mjs
└── .env
```

---

## Dynamic Routing

### Feature-Based Page Resolution

```astro
---
// src/pages/[...route].astro
import { FEATURES, hasFeature } from '@/config/features';

const route = Astro.params.route || '';

// Resolve feature from route
const featureMap = {
  '': 'blank',           // Homepage
  'blog': 'blog',
  'portfolio': 'portfolio',
  'courses': 'courses',
  'shop': 'shop',
  'community': 'community',
  'tokens': 'tokens',
  'library': 'library',
  'events': 'events',
  'book': 'booking',
  'membership': 'membership',
  'analytics': 'analytics',
};

const feature = featureMap[route.split('/')[0]];

// Check if feature is enabled
if (!hasFeature(feature)) {
  return Astro.redirect('/404');
}

// Import feature page dynamically
const Page = await import(`@/features/${feature}/pages/${route}.astro`);
---

<Page.default {...Astro.props} />
```

---

## Navigation Generation

### Dynamic Nav Based on Enabled Features

```typescript
// src/config/navigation.ts
import { hasFeature } from './features';

export const generateNavigation = () => {
  const nav = [];

  // Always include home
  nav.push({ label: 'Home', href: '/' });

  // Add feature-specific nav items
  if (hasFeature('blog')) {
    nav.push({ label: 'Blog', href: '/blog' });
  }

  if (hasFeature('portfolio')) {
    nav.push({ label: 'Portfolio', href: '/portfolio' });
  }

  if (hasFeature('courses')) {
    nav.push({ label: 'Courses', href: '/courses' });
  }

  if (hasFeature('shop')) {
    nav.push({ label: 'Shop', href: '/shop' });
  }

  if (hasFeature('community')) {
    nav.push({ label: 'Community', href: '/community' });
  }

  if (hasFeature('events')) {
    nav.push({ label: 'Events', href: '/events' });
  }

  // Always include about & contact
  nav.push({ label: 'About', href: '/about' });
  nav.push({ label: 'Contact', href: '/contact' });

  return nav;
};
```

---

## NPX OneIE Integration

### Feature Selection UI

```bash
npx oneie init

# Interactive prompts:
✓ What's your name? Jane Doe
✓ Site tagline? Artist, Educator, Creator

? Select features (space to select, enter to continue):
  ◯ Blank (minimal starter)
  ◉ Blog (content hub)
  ◉ Portfolio (project showcase)
  ◉ Courses (course platform)
  ◉ Shop (ecommerce)
  ◯ Community (forums/chat)
  ◉ Tokens (creator economy)
  ◯ Library (resources)
  ◯ Events (event management)
  ◯ Booking (appointments)
  ◯ Membership (subscriptions)
  ◯ Analytics (dashboard)

✓ Deploy now? y
```

### Generated .env.local

```bash
# Site Configuration
PUBLIC_SITE_NAME="Jane Doe"
PUBLIC_SITE_TAGLINE="Artist, Educator, Creator"

# Features (comma-separated)
PUBLIC_FEATURES=blog,portfolio,courses,shop,tokens

# Backend Connection
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Authentication
BETTER_AUTH_SECRET=generated-secret-key
BETTER_AUTH_URL=https://janedoe.pages.dev
```

---

## Development Workflow

### Local Development

```bash
# Start with blank template
PUBLIC_FEATURES=blank bun run dev

# Add blog feature
PUBLIC_FEATURES=blank,blog bun run dev

# Add multiple features
PUBLIC_FEATURES=blog,portfolio,courses,shop bun run dev

# Enable everything
PUBLIC_FEATURES=all bun run dev
```

### Build for Production

```bash
# Build with specific features
PUBLIC_FEATURES=blog,courses,shop bun run build

# Deploy to Cloudflare
wrangler pages deploy dist --project-name=janedoe-creator
```

---

## Benefits

### Maximum Flexibility

- ✅ **Mix & match** any features
- ✅ **Start minimal** (blank template)
- ✅ **Add features** as you grow
- ✅ **Remove features** you don't need

### No Rigid Templates

- ❌ No "creator" vs "ecommerce" choice
- ✅ Enable exactly what you need
- ✅ Creator + ecommerce + courses? Yes!
- ✅ Portfolio + shop + events? Yes!

### Easy Customization

```bash
# Start blank
PUBLIC_FEATURES=blank

# Add blog
PUBLIC_FEATURES=blank,blog

# Add shop later
PUBLIC_FEATURES=blank,blog,shop

# Add courses when ready
PUBLIC_FEATURES=blank,blog,shop,courses
```

### Backend Efficiency

Only loads/generates code for enabled features:

```typescript
// Conditionally load feature services
if (hasFeature('shop')) {
  const { ProductService } = await import('@/features/shop/services/ProductService');
}

if (hasFeature('courses')) {
  const { CourseService } = await import('@/features/courses/services/CourseService');
}
```

---

## Feature Dependencies

Some features depend on others:

```typescript
// src/config/features.ts
export const FEATURE_DEPENDENCIES: Record<Feature, Feature[]> = {
  membership: ['shop'],      // Memberships need payment
  tokens: ['community'],     // Tokens need community
  analytics: [],             // No dependencies
  booking: ['shop'],         // Booking needs payment
  library: [],               // No dependencies
  events: ['shop'],          // Events may need ticketing
  // etc.
};

// Auto-enable dependencies
export const resolveFeatures = (requested: Feature[]): Feature[] => {
  const enabled = new Set(requested);

  for (const feature of requested) {
    const deps = FEATURE_DEPENDENCIES[feature] || [];
    deps.forEach(dep => enabled.add(dep));
  }

  return Array.from(enabled);
};
```

---

## Pre-Built Feature Combinations

For convenience, offer pre-built combos:

```typescript
// src/config/presets.ts
export const PRESETS = {
  blank: ['blank'],

  blogger: ['blog', 'portfolio'],

  creator: ['blog', 'portfolio', 'community', 'tokens'],

  educator: ['courses', 'library', 'community', 'membership'],

  ecommerce: ['shop', 'blog'],

  powerhouse: ['blog', 'portfolio', 'courses', 'shop', 'community', 'tokens', 'events'],
};

// Usage
PUBLIC_FEATURES_PRESET=creator
// Expands to: blog,portfolio,community,tokens
```

---

## Implementation Timeline

### Week 1: Core Infrastructure
- Create feature system
- Build blank template
- Add feature detection logic

### Week 2: Core Features
- Build blog feature
- Build portfolio feature
- Test feature combinations

### Week 3-4: Additional Features
- Build courses feature
- Build shop feature
- Build community feature

### Week 5-6: Advanced Features
- Build tokens feature
- Build events feature
- Build membership feature

### Week 7: CLI Integration
- Update `npx oneie` to support features
- Add feature selection UI
- Test end-to-end

---

## Success Metrics

- [ ] Blank template works (homepage, about, contact)
- [ ] Feature flags control routes correctly
- [ ] Navigation updates based on enabled features
- [ ] Can combine any features without conflicts
- [ ] Bundle only includes enabled feature code
- [ ] `npx oneie` allows feature selection
- [ ] Users can start blank and add features later

---

## Next Steps

1. **Create blank template** (Day 1)
2. **Build feature system** (Day 2)
3. **Add blog feature** (Day 3)
4. **Add portfolio feature** (Day 4)
5. **Test feature combinations** (Day 5)
6. **Add shop & courses features** (Week 2)
7. **Integrate with npx oneie** (Week 3)

---

**This is way more flexible than templates!** 🚀

Users start blank, then enable exactly what they need. Want blog + shop? Done. Want courses + community + tokens? Done. Want everything? Enable `all`!

No more rigid templates - just features you can mix and match infinitely.

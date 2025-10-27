# /build - Build Features with Frontend-First Approach

🚀 **Build frontend features using existing /web components, or custom backend when needed**

## Quick Usage

```bash
/build                              # Show available features to build
/build [feature-name]              # Build frontend feature (default)
/build backend [feature-name]      # Build custom backend feature (explicit)
/build list                        # List available components in /web
/build help                        # Show this help
```

## Frontend-First Strategy

**By default, all builds use frontend agent only** and reuse existing `/web` components.

### Available Features Ready to Build

#### Shop (E-commerce)
```bash
/build shop                        # Customize shop page
/build shop-product-cards          # Add product card variants
/build shop-recommendations        # Add AI product recommendations
/build shop-reviews                # Add product review section
```
**Location:** `/web/src/pages/shop.astro`
**Components:** Cart, checkout, product filters, payment integration

#### Blog (Content)
```bash
/build blog-featured               # Add featured articles section
/build blog-search                 # Add blog search & filtering
/build blog-categories             # Add category navigation
/build blog-newsletter             # Add newsletter signup
```
**Location:** `/web/src/pages/blog/`
**Components:** Article cards, RSS feeds, tags, archives

#### Portfolio (Showcase)
```bash
/build portfolio-gallery           # Add portfolio gallery with filtering
/build portfolio-case-studies      # Add detailed case study pages
/build portfolio-testimonials      # Add client testimonials
/build portfolio-projects          # Add project showcase
```
**Location:** `/web/src/pages/portfolio.astro`
**Components:** Project cards, filtering, lightbox gallery

#### Courses
```bash
/build courses-preview             # Add course preview cards
/build courses-enrollment          # Add course enrollment UI
/build courses-progress            # Add student progress tracking
/build courses-certificates        # Add certificate generation UI
```
**Location:** `/web/src/components/features/courses/`
**Components:** Course cards, lesson player, progress bar

#### Landing & Marketing
```bash
/build landing-hero                # Redesign hero section
/build landing-features            # Add features showcase
/build landing-pricing             # Add pricing section
/build landing-cta                 # Add call-to-action sections
```
**Location:** `/web/src/pages/index.astro`
**Components:** Hero, feature cards, pricing tables

### Customization Examples

```bash
# Redesign existing features
/build shop --rebrand              # Update shop branding
/build blog --dark-mode            # Add dark mode support
/build portfolio --animation       # Add animated transitions

# Add to existing features
/build shop --add-wishlist         # Add wishlist to shop
/build blog --add-comments         # Add comments to articles
/build portfolio --add-filters     # Add advanced filtering
```

## Custom Backend Features

**When you need NEW backend logic, explicitly request it:**

```bash
/build backend ai-tutors           # Custom AI tutor system
/build backend token-economy       # Custom token economy
/build backend analytics           # Custom analytics dashboard
/build backend enrollment          # Custom enrollment system
```

### Backend Request Format

```bash
/build backend [feature-name]      # Triggers agent-backend + agent-frontend
```

**Examples of valid backend requests:**
```bash
/build backend ai-tutors           # AI tutor integration
/build backend token-economy       # Token economy system
/build backend custom-analytics    # Custom analytics
/build backend member-tiers        # Membership tier system
/build backend invoice-system      # Invoice/billing system
```

## Workflow

### Step 1: Describe What You Want

```bash
/build shop-recommendations
# or
/build portfolio --add-filters
# or
/build backend ai-tutors
```

### Step 2: Agent-Director Validates

1. **Check existing /web components**
2. **Decide: Frontend-only or Backend-required?**
3. **Create 100-inference plan**
4. **Assign to specialist(s)**

### Step 3: See the Plan

```bash
/plan show
# Shows:
# - 100-inference breakdown
# - Agent assignments
# - Timeline & dependencies
# - Quality loops
```

### Step 4: Execute

```bash
/now                               # See current inference
/next                              # Advance to next
/done                              # Mark complete & learn
```

## Examples

### Example 1: Frontend-Only (DEFAULT)

```bash
/build shop-recommendations

Agent-director processes:
✅ No "build backend" → Frontend-only
✅ /web/src/pages/shop.astro exists → Reuse
✅ Assign to: agent-frontend
✅ Timeline: 2-3 days
✅ Inferences: 20-40 (fast plan)
```

### Example 2: Backend-Required (EXPLICIT)

```bash
/build backend ai-tutors

Agent-director processes:
✅ "build backend" found → Backend + Frontend
✅ New backend logic needed → Assign agent-backend
✅ Frontend for UI → Assign agent-frontend
✅ Timeline: 7-14 days
✅ Inferences: 60-80 (comprehensive plan)
```

### Example 3: Customization

```bash
/build blog --add-comments

Agent-director processes:
✅ /web/src/pages/blog/ exists → Reuse
✅ Add comments feature → Frontend enhancement
✅ Assign to: agent-frontend
✅ Timeline: 1-2 days
✅ Inferences: 15-25 (quick enhancement)
```

## Available Components by Feature

### Shop Components
- Product cards with images, pricing, ratings
- Shopping cart with quantity management
- Checkout flow with shipping & payment
- Product filters (category, price, rating)
- Search functionality
- Order history & tracking

### Blog Components
- Article cards with preview & metadata
- Featured articles section
- Category/tag navigation
- Search & filtering
- RSS feeds
- Newsletter signup
- Comment system (optional)

### Portfolio Components
- Project showcase cards
- Portfolio filtering (by category, skills)
- Lightbox image gallery
- Case study detail pages
- Client testimonials
- Skills/expertise listing
- Project links & CTAs

### Course Components
- Course cards with preview
- Course detail pages
- Lesson player
- Progress tracking
- Quiz/assessment UI
- Certificate preview
- Instructor profiles
- Student reviews

### Landing Components
- Hero section with CTA
- Feature showcase with icons
- Pricing tables with tiers
- Testimonial carousel
- FAQ accordion
- Email capture forms
- Social proof (reviews, numbers)
- Footer with links

## Speed Comparison

| Type | Speed | Inferences | Agents |
|------|-------|-----------|--------|
| Frontend-only (reuse) | 1-3 days | 20-40 | agent-frontend |
| Frontend enhancement | 1-2 days | 15-25 | agent-frontend |
| Custom backend | 7-14 days | 60-80 | agent-backend + agent-frontend |

## Tips for Faster Builds

✅ **Use existing components** - Fast, proven, tested
✅ **Frontend-only changes** - No backend complexity
✅ **Customize styling** - Change colors, fonts, layout
✅ **Add filtering/search** - Enhance existing features
✅ **Personalize content** - Reorder, rename, brand

❌ **Avoid backend changes** - Unless explicitly "build backend"
❌ **Avoid new data models** - Stick with existing schema
❌ **Avoid complex logic** - Keep frontend-only simple

## Getting Help

```bash
/build list                        # List all available components
/build help                        # Show this help
/plan show                         # Show your current plan
/now                              # See current inference
```

## Integration with /one Command

The `/build` command works seamlessly with `/one`:

```bash
/one                              # Show welcome & commands
/plan convert [idea]              # Convert idea to plan
/plan show                        # Show plan with assignments
/build [feature]                  # Start building (uses plan)
/now                              # See current inference
/next                             # Advance through inferences
/done                             # Mark complete & learn
```

## Frontend-First Principles

1. **Check /web first** - Reuse proven components
2. **Default to frontend** - Don't build backend unless needed
3. **Explicit backend** - User must say "build backend"
4. **Fast iteration** - Frontend changes deploy in days, not weeks
5. **Simple > Complex** - Use existing features, customize as needed

---

**Remember:** Frontend-only builds are 5-7x faster than backend work.
Always ask: "Can I do this with existing components?"
Only say "build backend" when you truly need new backend logic.

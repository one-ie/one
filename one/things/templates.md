# Templates - Starter Kits for ONE Platform

**Version**: 1.0.0
**Status**: Active
**Location**: `web/src/templates/`

## Overview

Pre-built, polished starter templates for rapid deployment. Each template is a complete 3-page site optimized for a specific use case.

## Available Templates

### 1. E-commerce Template (`/ecommerce`)

**Purpose**: Product-focused online store
**Pages**: 3 (Home, Shop, Product Detail)
**Use Case**: Sell physical/digital products

**Features**:
- Hero section with featured products
- Product grid with filters
- Individual product pages with cart
- Mobile-responsive design
- Real product images via Unsplash API
- Shopping cart with localStorage

**Brand Customization**:
- Color scheme (primary, secondary, accent)
- Typography (font family, weights)
- Logo and favicon
- Product categories
- Payment integration ready

**Examples**:
- Fashion store (SHOS, Nine Padel)
- Electronics shop
- Handmade goods marketplace
- Digital product store

---

### 2. LMS Template (`/lms`)

**Purpose**: Learning management and course delivery
**Pages**: 3 (Home, Courses, Course Detail)
**Use Case**: Teach and sell online courses

**Features**:
- Course catalog with search/filter
- Individual course pages with curriculum
- Instructor profiles
- Progress tracking UI
- Video player integration ready
- Certificate generation ready

**Brand Customization**:
- Course categories
- Instructor branding
- Learning pathways
- Certification styling

**Examples**:
- Online academy
- Corporate training
- Skill-based learning
- Certification programs

---

### 3. Creator Template (`/creator`)

**Purpose**: Personal brand and audience monetization
**Pages**: 3 (Home, Content, Subscribe)
**Use Case**: Build and monetize creator audience

**Features**:
- Personal brand showcase
- Content feed (blog/videos/podcasts)
- Subscription tiers
- Member-only content gates
- Social proof (testimonials, stats)
- Newsletter signup

**Brand Customization**:
- Personal branding
- Content types
- Monetization models (tips, subscriptions, products)
- Social integrations

**Examples**:
- YouTuber merchandise
- Podcast subscriptions
- Newsletter monetization
- Artist portfolio + shop

---

## Template Structure

Each template follows this structure:

```
web/src/templates/{template-name}/
├── pages/
│   ├── index.astro           # Homepage
│   ├── [collection].astro    # Listing page (shop/courses/content)
│   └── [collection]/[id].astro # Detail page
├── components/
│   ├── Hero.tsx              # Hero section
│   ├── Grid.tsx              # Product/Course/Content grid
│   └── Detail.tsx            # Detail view component
├── lib/
│   ├── data.ts               # Sample data
│   └── types.ts              # TypeScript types
├── config/
│   └── template.ts           # Template configuration
└── README.md                 # Template-specific docs
```

---

## Usage

### Quick Start

```bash
# From web/ directory
cd src/templates

# Copy template to project
cp -r ecommerce/* ../pages/
cp -r ecommerce/components/* ../components/
cp -r ecommerce/lib/* ../lib/

# Customize branding
# Edit src/config/site.ts with your brand details
```

### Customization Checklist

**Every template includes**:
- [ ] Brand name and tagline
- [ ] Color scheme (3 colors minimum)
- [ ] Typography (font family + weights)
- [ ] Logo and favicon
- [ ] Navigation menu items
- [ ] Footer content
- [ ] Sample content/products/courses

**Template-specific**:
- [ ] Product categories (e-commerce)
- [ ] Course curriculum (LMS)
- [ ] Content types (creator)

---

## Design Principles

### 1. Minimal but Complete
- Only 3 pages per template
- Each page serves a clear purpose
- No unnecessary features

### 2. Polished and Professional
- High-quality stock images
- Consistent spacing and typography
- Responsive design (mobile-first)
- Smooth animations and transitions

### 3. Easy to Customize
- Single config file for branding
- Clear component structure
- Well-documented code
- TypeScript for type safety

### 4. Production-Ready
- Performance optimized
- SEO meta tags
- Accessibility standards
- Error handling

---

## Technical Stack

**Same across all templates**:
- Astro 5+ (SSR)
- React 19 (interactive components)
- Tailwind v4 (styling)
- shadcn/ui (component library)
- TypeScript (type safety)
- Convex (backend - optional)

---

## Color Schemes

### E-commerce Template Defaults
- **Primary**: Dark navy `#1D1D1D`
- **Secondary**: Warm tan `#CEA177`
- **Accent**: Purple `#785499` / Teal `#6EC1E4`

### LMS Template Defaults
- **Primary**: Deep blue `#1E40AF`
- **Secondary**: Orange `#F59E0B`
- **Accent**: Green `#10B981`

### Creator Template Defaults
- **Primary**: Black `#000000`
- **Secondary**: Pink `#EC4899`
- **Accent**: Yellow `#FBBF24`

---

## Typography

### E-commerce
- **Font**: Outfit (300, 400, 700, 900)
- **Style**: Modern, clean, professional

### LMS
- **Font**: Inter (400, 600, 700)
- **Style**: Academic, trustworthy, clear

### Creator
- **Font**: Poppins (400, 600, 800)
- **Style**: Bold, personality-driven, engaging

---

## Next Steps

1. **Create template files** in `web/src/templates/`
2. **Build sample data** for each template
3. **Document customization** process
4. **Add deployment scripts** for one-click launch
5. **Create video tutorials** for each template

---

## Contributing

To add a new template:

1. Create folder: `web/src/templates/{template-name}/`
2. Build 3 pages (home, listing, detail)
3. Add sample data
4. Write README.md
5. Document customization process
6. Submit PR with examples

---

**Built with clarity, simplicity, and rapid deployment in mind.**

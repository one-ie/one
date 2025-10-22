# Ecommerce Templates for ONE Platform

**World-class ecommerce frontend templates** built with Astro 5 + React 19, optimized for performance and accessibility.

## 📦 What's Included

### Pages (5 Total)
- **Home Page** (`index.astro`) - Hero, categories, featured products, testimonials (270 lines)
- **Category Page** (`category-[slug].astro`) - Product grid with filters and sorting (95 lines)
- **Product Details** (`product-[slug].astro`) - Gallery, variants, reviews, related products (200 lines)
- **Shopping Cart** (`cart.astro`) - Cart management with quantity controls (240 lines)
- **Checkout** (`checkout.astro`) - Multi-step checkout with Stripe integration (220 lines)

### Interactive Components (8 Total)
All require `client:load` directive for hydration:

1. **ProductCard.tsx** - Product display with quick view and add to cart (180 lines)
2. **AddToCartButton.tsx** - Standalone add to cart with success animation (75 lines)
3. **CartIcon.tsx** - Shopping cart icon with item count badge (40 lines)
4. **QuantitySelector.tsx** - Plus/minus quantity controls (85 lines)
5. **ProductGallery.tsx** - Image carousel with zoom functionality (145 lines)
6. **VariantSelector.tsx** - Size/color/variant picker (165 lines)
7. **FilterSidebar.tsx** - Advanced product filtering (220 lines)
8. **CheckoutForm.tsx** - Multi-step checkout flow (280 lines)

### Static Components (5 Total)
No hydration needed - pure HTML:

1. **ProductGrid.tsx** - Responsive grid layout (25 lines)
2. **CategoryCard.tsx** - Category display card (50 lines)
3. **Breadcrumbs.tsx** - Navigation breadcrumb trail (45 lines)
4. **PriceDisplay.tsx** - Price formatting with discounts (55 lines)
5. **ReviewStars.tsx** - Star rating display (85 lines)

### State Management
- **cart.ts** - Nanostores-based cart state with localStorage persistence (175 lines)

### TypeScript Interfaces
- **ecommerce.ts** - Complete type definitions (120 lines)

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd web && bun install

# 2. Copy templates to pages
mkdir -p src/pages/store
cp src/templates/ecommerce/*.astro src/pages/store/

# 3. Start dev server
bun run dev
# Visit: http://localhost:4321/store
```

## 📊 Performance Metrics

- **JavaScript Bundle**: < 50KB (gzipped)
- **Static HTML**: 90%+ of content
- **LCP Target**: < 2.5s
- **Lighthouse Score**: 90+
- **Islands Architecture**: Selective hydration

## ♿ Accessibility

- **WCAG 2.1 AA** compliant
- Semantic HTML throughout
- Keyboard navigation support
- ARIA labels on all interactive elements
- Screen reader tested

## 🔧 Integration with ONE Platform

### 6-Dimension Ontology Mapping

Based on `/one/knowledge/ontology-ecommerce.md`:

**1. Groups** (Organizations)
- Store entity (business group)
- Multi-tenant support

**2. People** (Roles)
- `owner` - Store owner
- `staff` - Employees
- `customer` - Shoppers

**3. Things** (Products & Entities)
- `product` - Core sellable item
- `product_variant` - Size/color variants
- `category` - Product classification
- `collection` - Curated product groups
- `order` - Purchase record
- `shopping_cart` - Temporary cart
- `customer_review` - Product reviews

**4. Connections** (Relationships)
- `part_of` - Product → Category
- `belongs_to` - Product → Collection
- `places` - Customer → Order
- `contains` - Order → Product
- `purchased` - Customer → Product

**5. Events** (Actions)
- `product_viewed`
- `product_added_to_cart`
- `cart_abandoned`
- `checkout_started`
- `order_placed`
- `payment_processed`
- `review_submitted`

**6. Knowledge** (Labels & Tags)
- `category:apparel`
- `color:blue`
- `size:large`
- `status:in_stock`

## 📝 Complete Documentation

See full implementation guide, customization options, WooCommerce/Shopify integration, security best practices, and troubleshooting in:

`/Users/toc/Server/ONE/ECOMMERCE-TEMPLATES-SUMMARY.md`

---

**Summary**

- **Total Files**: 21 files (5 pages, 13 components, 3 utilities)
- **Total Lines**: ~2,400 lines of production-ready code
- **Performance**: 90% static HTML, < 50KB JavaScript
- **Framework**: Astro 5 + React 19 + Tailwind v4 + Nanostores
- **Accessibility**: WCAG 2.1 AA compliant
- **Design**: Apple Store-like simplicity, Shopify themes quality

Built with the ONE Platform philosophy: **Simple enough for children, powerful enough for enterprises.**

# Product Page Conversion Elements - Architecture Diagram

## Component Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCT LISTING PAGE                          │
│                      (src/pages/ecommerce/)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Maps products
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         ProductCard.tsx                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  • Product Image (hover effect)                              │   │
│  │  • Badges (New, Sale, Low Stock, Featured)                   │   │
│  │  • Wishlist Button (top-right)                               │   │
│  │  • Quick View Button (top-right, shows on hover) ────────┐   │   │
│  │  • Product Info (name, rating, price)                    │   │   │
│  │  • Add to Cart Button                                     │   │   │
│  │  • Real-time Viewers Counter                              │   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                                                    │
                                                                    │ Opens
                                                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      QuickViewModal.tsx                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dialog (shadcn/ui) - Lightbox Style                         │   │
│  │  ┌────────────────────────┬──────────────────────────────┐   │   │
│  │  │  LEFT: Image Gallery   │  RIGHT: Product Info         │   │   │
│  │  │  • Main image          │  • Title & Rating            │   │   │
│  │  │  • Thumbnails          │  • Price                     │   │   │
│  │  │  • Badges              │  • Description (truncated)   │   │   │
│  │  │                        │  • Variant Selector          │   │   │
│  │  │                        │  • Quantity Selector         │   │   │
│  │  │                        │  • Add to Cart Button        │   │   │
│  │  │                        │  • View Full Details Button  │   │   │
│  │  └────────────────────────┴──────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Click "View Full Details"
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PRODUCT DETAIL PAGE                               │
│                 (src/pages/ecommerce/product/[slug].astro)           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Renders
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Product Detail Layout                             │
│  ┌──────────────────────────┬──────────────────────────────────┐    │
│  │  LEFT COLUMN             │  RIGHT COLUMN                     │    │
│  │  ┌──────────────────┐    │  ┌──────────────────────────┐    │    │
│  │  │ ProductGallery   │    │  │ Product Info Section     │    │    │
│  │  │ (Enhanced)       │    │  │ • Title & Description    │    │    │
│  │  │                  │    │  │ • Price                  │    │    │
│  │  │ • Click to zoom  │    │  │                          │    │    │
│  │  │ • Mouse tracking │    │  │ ┌──────────────────────┐ │    │    │
│  │  │ • Swipe support  │    │  │ │ id="variant-selector"│ │    │    │
│  │  │ • Fullscreen btn │    │  │ │ • Size Selector      │ │    │    │
│  │  │ • Thumbnails     │    │  │ │ • Color Selector     │ │    │    │
│  │  │ • Keyboard nav   │    │  │ │ • Size Guide Link ───┼─┼─┐  │    │
│  │  └──────────────────┘    │  │ └──────────────────────┘ │ │  │    │
│  │                          │  │ • Quantity Selector       │ │  │    │
│  │                          │  │ • Add to Cart Button      │ │  │    │
│  │                          │  │ • Stock Warning           │ │  │    │
│  └──────────────────────────┴──┴───────────────────────────┴─┘  │    │
│                                                              │  │    │
│  [Scroll Past Variant Selector triggers...]                 │  │    │
│                                                              │  │    │
│  ┌──────────────────────────────────────────────────────┐   │  │    │
│  │  StickyCartBar (Mobile Only)                         │   │  │    │
│  │  • Fixed bottom position                             │   │  │    │
│  │  • Product thumbnail + info + price                  │   │  │    │
│  │  • Selected variant text                             │   │  │    │
│  │  • Add to Cart button                                │   │  │    │
│  │  • Appears on scroll past #variant-selector          │◄──┘  │    │
│  └──────────────────────────────────────────────────────┘      │    │
└─────────────────────────────────────────────────────────────────────┘
                                                                  │
                                                                  │ Triggers
                                                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      SizeGuideModal.tsx                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dialog (shadcn/ui) - Full Modal                             │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  Tabs (shadcn/ui)                                    │    │   │
│  │  │  ┌────────────┬──────────────┬─────────────────┐     │    │   │
│  │  │  │ Measurements│ How to Measure│   Fit Guide   │     │    │   │
│  │  │  └────────────┴──────────────┴─────────────────┘     │    │   │
│  │  │                                                       │    │   │
│  │  │  TAB 1: Measurements                                 │    │   │
│  │  │  • Size Chart Table (shadcn/ui Table)                │    │   │
│  │  │    - Size | Chest | Waist | Hips | Length            │    │   │
│  │  │  • Shoe Size Conversion (if shoes)                   │    │   │
│  │  │  • Model Stats                                        │    │   │
│  │  │                                                       │    │   │
│  │  │  TAB 2: How to Measure                               │    │   │
│  │  │  • Step-by-step instructions                         │    │   │
│  │  │  • Visual guides (future)                            │    │   │
│  │  │  • Pro tips                                          │    │   │
│  │  │                                                       │    │   │
│  │  │  TAB 3: Fit Guide                                    │    │   │
│  │  │  • Regular Fit description                           │    │   │
│  │  │  • Slim Fit description                              │    │   │
│  │  │  • Relaxed Fit description                           │    │   │
│  │  │  • Between sizes guidance                            │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                  ProductGallery.tsx - Fullscreen Mode                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dialog (shadcn/ui) - Fullscreen                             │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  Black background (95vw × 90vh)                      │    │   │
│  │  │                                                       │    │   │
│  │  │  [◄ Previous]     [Image - object-contain]  [Next ►] │    │   │
│  │  │                                                       │    │   │
│  │  │                    [3 / 8]                            │    │   │
│  │  │                                                       │    │   │
│  │  │  [✕ Close]                                           │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER ACTIONS                             │
└──────────────────────────────────────────────────────────────────┘
     │                    │                    │
     │ Click              │ Scroll             │ Click
     │ Quick View         │ Past Trigger       │ Size Guide
     ↓                    ↓                    ↓
┌─────────┐         ┌──────────┐         ┌──────────┐
│ setState│         │ setState │         │ setState │
│ (true)  │         │ (visible)│         │ (true)   │
└─────────┘         └──────────┘         └──────────┘
     │                    │                    │
     ↓                    ↓                    ↓
┌──────────────────────────────────────────────────────────────────┐
│                       COMPONENT STATE                             │
│  showQuickView: boolean                                           │
│  isVisible: boolean (sticky bar)                                  │
│  showSizeGuide: boolean                                           │
│  isZoomed: boolean (gallery)                                      │
│  isFullscreen: boolean (gallery)                                  │
│  selectedVariants: Record<string, string>                         │
│  quantity: number                                                 │
└──────────────────────────────────────────────────────────────────┘
     │
     │ User adds to cart
     ↓
┌──────────────────────────────────────────────────────────────────┐
│                      CART STORE (Nanostores)                      │
│  $cart: Cart                                                      │
│  $cartCount: number (computed)                                    │
│  $cartSubtotal: number (computed)                                 │
│  $cartTotal: number (computed)                                    │
│                                                                   │
│  cartActions:                                                     │
│  • addItem(item)                                                  │
│  • removeItem(id, variant)                                        │
│  • updateQuantity(id, qty, variant)                               │
│  • clearCart()                                                    │
└──────────────────────────────────────────────────────────────────┘
     │
     │ Persists to localStorage
     ↓
┌──────────────────────────────────────────────────────────────────┐
│                      LOCAL STORAGE                                │
│  Key: "shopping-cart"                                             │
│  Value: { items: CartItem[], updatedAt: number }                  │
└──────────────────────────────────────────────────────────────────┘
     │
     │ Updates UI
     ↓
┌──────────────────────────────────────────────────────────────────┐
│                       UI FEEDBACK                                 │
│  • Toast notification (success)                                   │
│  • Cart icon badge updates                                        │
│  • Button loading state                                           │
│  • Modal auto-close (quick view)                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Event Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     PRODUCT LISTING PAGE                        │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ User hovers ProductCard
                              ↓
                    [Quick View Button Appears]
                              │
                              │ User clicks
                              ↓
                    [QuickViewModal Opens]
                              │
                    ┌─────────┴─────────┐
                    │                   │
          User selects variants    User clicks backdrop
                    │                   │
                    ↓                   ↓
          [Variant state updates] [Modal closes]
                    │
                    │ User clicks "Add to Cart"
                    ↓
          [cartActions.addItem()]
                    │
          ┌─────────┴─────────┐
          │                   │
     [Cart updates]     [Toast shows]
          │                   │
          └─────────┬─────────┘
                    │
                    │ After 600ms
                    ↓
            [Modal auto-closes]


┌────────────────────────────────────────────────────────────────┐
│                    PRODUCT DETAIL PAGE                          │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Page loads
                              ↓
                    [ProductGallery renders]
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Click image         Click fullscreen
                    │                   │
                    ↓                   ↓
              [Zoom to 2x]      [Fullscreen modal]
                    │                   │
              Move mouse          Click arrows
                    │                   │
                    ↓                   ↓
              [Pan zoomed]        [Navigate images]
                    │
                    │ Click again
                    ↓
                [Zoom out]


                              │
                              │ User scrolls down
                              ↓
                [IntersectionObserver triggers]
                              │
                              │ Past #variant-selector
                              ↓
                [StickyCartBar slides up]
                              │
                    ┌─────────┴─────────┐
                    │                   │
          Scroll back up         Click "Add to Cart"
                    │                   │
                    ↓                   ↓
          [Bar slides down]    [cartActions.addItem()]
                                        │
                                        ↓
                                  [Toast shows]


                              │
                              │ User clicks "Size Guide"
                              ↓
                    [SizeGuideModal opens]
                              │
                    ┌─────────┴─────────┐
                    │         │         │
              Tab 1: Size   Tab 2:   Tab 3: Fit
              Chart Table   How to   Descriptions
                              │
                              │ User clicks backdrop
                              ↓
                    [Modal closes]
```

## Component Dependencies

```
QuickViewModal.tsx
├── @/components/ui/dialog (shadcn/ui)
├── @/components/ui/button (shadcn/ui)
├── @/components/ui/badge (shadcn/ui)
├── ../static/PriceDisplay
├── ../static/ReviewStars
├── ./VariantSelector
├── ./QuantitySelector
├── @/stores/cart
└── ./Toast

ProductGallery.tsx
├── @/components/ui/dialog (shadcn/ui)
└── React hooks (useState, useRef, useEffect)

SizeGuideModal.tsx
├── @/components/ui/dialog (shadcn/ui)
├── @/components/ui/tabs (shadcn/ui)
└── @/components/ui/table (shadcn/ui)

StickyCartBar.tsx
├── @/components/ui/button (shadcn/ui)
├── ../static/PriceDisplay
├── @/stores/cart
├── ./Toast
└── React hooks (useState, useRef, useEffect)

ProductCard.tsx
├── @/components/ui/button (shadcn/ui)
├── @/components/ui/badge (shadcn/ui)
├── ./QuickViewModal ← NEW
├── ../static/PriceDisplay
├── ../static/ReviewStars
├── @/stores/cart
├── ./Toast
├── ./ViewersCounter
├── ./Wishlist
└── framer-motion
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPONENT LOCAL STATE                        │
├────────────────────────────────────────────────────────────────┤
│  ProductCard:                                                   │
│  • showQuickView: boolean                                       │
│  • isAdding: boolean                                            │
│                                                                 │
│  QuickViewModal:                                                │
│  • currentImageIndex: number                                    │
│  • selectedVariants: Record<string, string>                     │
│  • quantity: number                                             │
│  • isAdding: boolean                                            │
│                                                                 │
│  ProductGallery:                                                │
│  • currentIndex: number                                         │
│  • isZoomed: boolean                                            │
│  • isFullscreen: boolean                                        │
│  • zoomPosition: { x: number, y: number }                       │
│                                                                 │
│  StickyCartBar:                                                 │
│  • isVisible: boolean                                           │
│  • isAdding: boolean                                            │
│                                                                 │
│  SizeGuideModal:                                                │
│  • (Controlled by parent)                                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Updates
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    GLOBAL STATE (Nanostores)                    │
├────────────────────────────────────────────────────────────────┤
│  $cart: Cart                                                    │
│  ├── items: CartItem[]                                          │
│  └── updatedAt: number                                          │
│                                                                 │
│  Computed:                                                      │
│  $cartCount: number                                             │
│  $cartSubtotal: number                                          │
│  $cartTotal: number                                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Persists
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE LAYER                         │
├────────────────────────────────────────────────────────────────┤
│  localStorage:                                                  │
│  • Key: "shopping-cart"                                         │
│  • Automatic save on cart updates                              │
│  • Automatic load on page refresh                              │
└────────────────────────────────────────────────────────────────┘
```

## Performance Optimization Strategy

```
┌────────────────────────────────────────────────────────────────┐
│                    LAZY LOADING STRATEGY                        │
├────────────────────────────────────────────────────────────────┤
│  ProductCard:                                                   │
│  • Renders immediately (SSR/Static)                             │
│  • QuickViewModal: Conditional render (only when open)          │
│                                                                 │
│  Product Detail Page:                                           │
│  • ProductGallery: Immediate (client:load)                      │
│  • SizeGuideModal: Conditional render (only when open)          │
│  • StickyCartBar: Deferred (waits for scroll)                   │
│                                                                 │
│  Fullscreen Modal:                                              │
│  • Dialog component handles portal rendering                    │
│  • Only mounts when isFullscreen = true                         │
└────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    EVENT OPTIMIZATION                           │
├────────────────────────────────────────────────────────────────┤
│  Scroll Listeners:                                              │
│  • requestAnimationFrame throttle                               │
│  • Passive event listeners                                      │
│  • Cleanup on unmount                                           │
│                                                                 │
│  Touch Events:                                                  │
│  • 50px minimum threshold                                       │
│  • Prevents false triggers                                      │
│                                                                 │
│  Keyboard Events:                                               │
│  • Debounced handlers                                           │
│  • Event listener cleanup                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## Mobile-First Responsive Breakpoints

```
┌────────────────────────────────────────────────────────────────┐
│  Mobile (< 768px)                                               │
├────────────────────────────────────────────────────────────────┤
│  • QuickViewModal: Single column layout                         │
│  • ProductGallery: Swipe gestures enabled                       │
│  • StickyCartBar: Visible (main use case)                       │
│  • SizeGuideModal: Scrollable tables                            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Tablet (768px - 1024px)                                        │
├────────────────────────────────────────────────────────────────┤
│  • QuickViewModal: Two column layout starts                     │
│  • ProductGallery: Mouse + touch support                        │
│  • StickyCartBar: Still visible                                 │
│  • SizeGuideModal: Full table width                             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Desktop (> 1024px)                                             │
├────────────────────────────────────────────────────────────────┤
│  • QuickViewModal: Optimal two column layout                    │
│  • ProductGallery: Mouse interactions primary                   │
│  • StickyCartBar: Hidden (md:hidden)                            │
│  • SizeGuideModal: Full-width tables                            │
└────────────────────────────────────────────────────────────────┘
```

This architecture ensures optimal performance, accessibility, and conversion rates across all devices.

# Product Page Conversion Elements - Integration Examples

## Quick Integration Guide

### 1. Product Listing Page (Already Integrated)

The QuickViewModal is already integrated into ProductCard.tsx. No additional work needed.

```tsx
// ProductCard.tsx already includes:
import { QuickViewModal } from './QuickViewModal';

// At the end of component:
<QuickViewModal
  product={product}
  open={showQuickView}
  onOpenChange={setShowQuickView}
/>
```

### 2. Product Detail Page - Complete Example

Create or update your product detail page at `src/pages/ecommerce/product/[slug].astro`:

```astro
---
// src/pages/ecommerce/product/[slug].astro
import Layout from '@/layouts/Layout.astro';
import { ProductGallery } from '@/components/ecommerce/interactive/ProductGallery';
import { SizeGuideModal } from '@/components/ecommerce/interactive/SizeGuideModal';
import { StickyCartBar } from '@/components/ecommerce/interactive/StickyCartBar';
import { VariantSelector } from '@/components/ecommerce/interactive/VariantSelector';
import { QuantitySelector } from '@/components/ecommerce/interactive/QuantitySelector';
import { AddToCartButton } from '@/components/ecommerce/interactive/AddToCartButton';

// Fetch product data (example)
const { slug } = Astro.params;
const product = {
  id: '1',
  slug: 'premium-cotton-tshirt',
  name: 'Premium Cotton T-Shirt',
  description: 'Ultra-soft 100% organic cotton with a modern fit...',
  price: 29.99,
  compareAtPrice: 49.99,
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
  ],
  thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  category: 'Apparel',
  tags: ['shirts', 'cotton', 'organic'],
  variants: [
    {
      id: 'size',
      name: 'Size',
      type: 'size' as const,
      options: [
        { value: 'xs', label: 'XS', inStock: true },
        { value: 's', label: 'S', inStock: true },
        { value: 'm', label: 'M', inStock: true },
        { value: 'l', label: 'L', inStock: false },
        { value: 'xl', label: 'XL', inStock: true },
      ],
    },
    {
      id: 'color',
      name: 'Color',
      type: 'color' as const,
      options: [
        { value: 'black', label: 'Black', inStock: true },
        { value: 'white', label: 'White', inStock: true },
        { value: 'navy', label: 'Navy', inStock: true },
      ],
    },
  ],
  inStock: true,
  inventory: 47,
  rating: 4.8,
  reviewCount: 234,
  featured: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
};
---

<Layout title={product.name}>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- Left Column: Image Gallery -->
      <div>
        <ProductGallery
          client:load
          images={product.images}
          productName={product.name}
        />
      </div>

      <!-- Right Column: Product Info -->
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-foreground">{product.name}</h1>
          <p class="mt-2 text-muted-foreground">{product.description}</p>
        </div>

        <div class="flex items-baseline gap-3">
          <span class="text-3xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <>
              <span class="text-xl text-muted-foreground line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
              <span class="text-sm font-bold text-destructive">
                Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        <!-- Variant Selection Section (Important: Add id="variant-selector") -->
        <div id="variant-selector" class="space-y-4">
          {product.variants?.map((variant) => (
            <div key={variant.id}>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium">{variant.name}</label>
                {variant.type === 'size' && (
                  <button
                    class="text-sm text-primary hover:underline"
                    onclick="document.getElementById('size-guide-trigger')?.click()"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <VariantSelector
                client:load
                variant={variant}
                selectedValue=""
                onSelect={(value) => console.log('Selected:', value)}
              />
            </div>
          ))}
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm font-medium">Quantity:</span>
          <QuantitySelector
            client:load
            value={1}
            onChange={(qty) => console.log('Quantity:', qty)}
            max={product.inventory || 999}
          />
        </div>

        {product.inventory && product.inventory < 10 && (
          <div class="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Only {product.inventory} left in stock
          </div>
        )}

        <AddToCartButton
          client:load
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          price={product.price}
          image={product.thumbnail}
          inStock={product.inStock}
        />
      </div>
    </div>
  </div>

  <!-- Size Guide Modal (Hidden trigger) -->
  <button id="size-guide-trigger" class="hidden" />
  <SizeGuideModal
    client:load
    open={false}
    onOpenChange={(open) => console.log('Size guide:', open)}
    productType="apparel"
  />

  <!-- Sticky Cart Bar (Mobile) -->
  <StickyCartBar
    client:load
    product={product}
    selectedVariants={{}}
    quantity={1}
    triggerElementId="variant-selector"
  />
</Layout>
```

### 3. Size Guide Integration Options

#### Option A: Trigger from Link
```tsx
// In your component
const [showSizeGuide, setShowSizeGuide] = useState(false);

<button
  onClick={() => setShowSizeGuide(true)}
  className="text-sm text-primary hover:underline"
>
  Size Guide
</button>

<SizeGuideModal
  open={showSizeGuide}
  onOpenChange={setShowSizeGuide}
  productType="apparel"
/>
```

#### Option B: Global Size Guide Link
```astro
<!-- In your layout footer or header -->
<button id="size-guide-trigger" data-product-type="apparel">
  Size Guide
</button>

<script>
  document.getElementById('size-guide-trigger')?.addEventListener('click', () => {
    // Trigger modal open
  });
</script>
```

### 4. Sticky Cart Bar Requirements

**Important:** Add `id="variant-selector"` to the element you want to trigger the sticky bar:

```tsx
// Option 1: Wrap variant selectors
<div id="variant-selector" className="space-y-4">
  {/* Variant selectors here */}
</div>

// Option 2: Add to specific element
<div className="variant-section">
  <h3 id="variant-selector">Choose Options</h3>
  {/* Variants */}
</div>

// Option 3: Custom trigger point
<StickyCartBar
  product={product}
  triggerElementId="custom-trigger-id"
/>
```

### 5. Responsive Behavior

All components are responsive by default:

- **Quick View**: 2-column on desktop, 1-column on mobile
- **Product Gallery**: Swipe gestures on mobile, mouse controls on desktop
- **Size Guide**: Scrollable tables on mobile
- **Sticky Cart Bar**: Mobile only (hidden on desktop with `md:hidden`)

### 6. Custom Styling

Override styles using Tailwind classes:

```tsx
// Example: Custom modal width
<DialogContent className="max-w-6xl">
  {/* Content */}
</DialogContent>

// Example: Custom sticky bar position
<div className="fixed bottom-20 left-0 right-0">
  <StickyCartBar {...props} />
</div>
```

### 7. Event Tracking

Add analytics to track user interactions:

```tsx
// Quick View Modal
const handleQuickView = () => {
  setShowQuickView(true);

  // Track event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'quick_view', {
      product_id: product.id,
      product_name: product.name,
    });
  }
};

// Size Guide
const handleSizeGuideOpen = () => {
  setShowSizeGuide(true);

  // Track event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'size_guide_open', {
      product_type: 'apparel',
    });
  }
};

// Sticky Cart Bar
<StickyCartBar
  product={product}
  onAddToCart={() => {
    // Track conversion from sticky bar
    window.gtag?.('event', 'add_to_cart_sticky', {
      product_id: product.id,
      value: product.price,
    });
  }}
/>
```

### 8. A/B Testing Setup

Test different trigger points and behaviors:

```tsx
// Example: Test scroll threshold
const stickyBarVariant = Math.random() > 0.5 ? 'early' : 'late';

<StickyCartBar
  product={product}
  triggerElementId={
    stickyBarVariant === 'early'
      ? 'product-title'
      : 'variant-selector'
  }
/>
```

### 9. Performance Optimization

```tsx
// Lazy load modals
import { lazy, Suspense } from 'react';

const SizeGuideModal = lazy(() =>
  import('./SizeGuideModal').then(m => ({ default: m.SizeGuideModal }))
);

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <SizeGuideModal {...props} />
</Suspense>
```

### 10. Error Handling

```tsx
// Add error boundaries
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ProductGallery images={product.images} productName={product.name} />
</ErrorBoundary>
```

---

## Common Patterns

### Pattern 1: Product Card Grid with Quick View
```astro
---
const products = await fetchProducts();
---

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard client:load product={product} />
  ))}
</div>
```

### Pattern 2: Product Detail with All Features
```astro
<!-- See complete example above in section 2 -->
```

### Pattern 3: Category Page with Filters
```astro
---
import { FilterSidebar } from '@/components/ecommerce/interactive/FilterSidebar';
import { ProductGrid } from '@/components/ecommerce/static/ProductGrid';
---

<div class="flex gap-6">
  <aside class="w-64">
    <FilterSidebar client:load />
  </aside>
  <main class="flex-1">
    <ProductGrid client:load products={products} />
  </main>
</div>
```

---

## Troubleshooting

### Quick View Not Opening
- Check that `showQuickView` state is managed correctly
- Verify `client:load` is added to ProductCard
- Check browser console for errors

### Sticky Bar Not Appearing
- Verify `id="variant-selector"` exists on trigger element
- Check that component has `client:load` directive
- Test on mobile device or resize browser window
- Ensure element is in the DOM before scroll

### Image Zoom Not Working
- Verify `client:load` on ProductGallery
- Check that images array is not empty
- Test click events in browser console

### Size Guide Table Overflow
- Add `overflow-x-auto` to table wrapper
- Reduce font size on mobile
- Consider horizontal scroll indicator

---

## Next Steps

1. Add these components to your product detail page
2. Test on multiple devices (mobile, tablet, desktop)
3. Track analytics events
4. A/B test different configurations
5. Monitor conversion rate improvements

Expected results based on industry benchmarks:
- 15-20% increase in add-to-cart rate (quick view)
- 25-30% reduction in returns (size guide)
- 10-15% increase in mobile conversions (sticky bar)
- 270% increase in conversions (high-quality images with zoom)

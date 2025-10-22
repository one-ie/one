# Ecommerce Quick Start Guide

Get up and running with ecommerce content collections in 5 minutes.

## Step 1: Add a Product (2 minutes)

Create a new file: `src/content/products/my-product.md`

```markdown
---
name: "My Awesome Product"
slug: "my-awesome-product"
description: "A great product that solves a real problem."
price: 49.99
images:
  - "/images/products/my-product.jpg"
category: "apparel"
inStock: true
featured: false
tags: ["new", "popular"]
---

## Product Details

Write your product description here. This supports full markdown including:

- Bullet points
- **Bold text**
- Images
- Links

### Features

- Feature 1
- Feature 2
- Feature 3
```

## Step 2: Display Products on a Page (1 minute)

Create or update `src/pages/shop.astro`:

```astro
---
import Layout from '@/layouts/Layout.astro';
import { getAllProducts, formatCurrency } from '@/lib/ecommerce';

const products = await getAllProducts();
---

<Layout title="Shop">
  <h1>Shop All Products</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {products.map(product => (
      <div class="border rounded-lg p-4">
        <img
          src={product.data.images[0]}
          alt={product.data.name}
          class="w-full h-64 object-cover rounded"
        />
        <h2 class="text-xl font-bold mt-4">{product.data.name}</h2>
        <p class="text-gray-600 mt-2">{product.data.description}</p>
        <p class="text-lg font-bold mt-4">
          {formatCurrency(product.data.price)}
        </p>
        <a
          href={`/products/${product.slug}`}
          class="block mt-4 bg-blue-600 text-white px-4 py-2 rounded text-center"
        >
          View Details
        </a>
      </div>
    ))}
  </div>
</Layout>
```

## Step 3: Create Product Detail Page (1 minute)

Create `src/pages/products/[slug].astro`:

```astro
---
import Layout from '@/layouts/Layout.astro';
import { getCollection } from 'astro:content';
import { formatCurrency } from '@/lib/ecommerce';

export async function getStaticPaths() {
  const products = await getCollection('products');
  return products.map(product => ({
    params: { slug: product.slug },
    props: { product }
  }));
}

const { product } = Astro.props;
const { Content } = await product.render();
---

<Layout title={product.data.name}>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Image Gallery -->
      <div>
        <img
          src={product.data.images[0]}
          alt={product.data.name}
          class="w-full rounded-lg"
        />
      </div>

      <!-- Product Info -->
      <div>
        <h1 class="text-3xl font-bold">{product.data.name}</h1>
        <p class="text-2xl font-bold mt-4">
          {formatCurrency(product.data.price)}
        </p>

        {product.data.compareAtPrice && (
          <p class="text-gray-500 line-through">
            {formatCurrency(product.data.compareAtPrice)}
          </p>
        )}

        <div class="mt-6">
          <button class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg">
            Add to Cart
          </button>
        </div>

        <div class="mt-8 prose">
          <Content />
        </div>
      </div>
    </div>
  </div>
</Layout>
```

## Step 4: Add Product with Variants (1 minute)

Update your product with size/color options:

```markdown
---
name: "T-Shirt"
slug: "tshirt"
description: "Comfortable cotton t-shirt"
price: 29.99
images:
  - "/images/tshirt.jpg"
category: "apparel"
variants:
  - id: "tshirt-s-blue"
    name: "Small / Blue"
    sku: "TS-S-BLU"
    price: 29.99
    inStock: true
    options:
      size: "S"
      color: "Blue"
  - id: "tshirt-m-blue"
    name: "Medium / Blue"
    sku: "TS-M-BLU"
    price: 29.99
    inStock: true
    options:
      size: "M"
      color: "Blue"
inStock: true
---
```

Display variant selector:

```astro
---
import { getVariantOptions } from '@/lib/ecommerce';

const colors = getVariantOptions(product.data, 'color');
const sizes = getVariantOptions(product.data, 'size');
---

<div class="space-y-4">
  <div>
    <label>Color:</label>
    <select class="border rounded px-3 py-2">
      {colors.map(color => (
        <option value={color}>{color}</option>
      ))}
    </select>
  </div>

  <div>
    <label>Size:</label>
    <select class="border rounded px-3 py-2">
      {sizes.map(size => (
        <option value={size}>{size}</option>
      ))}
    </select>
  </div>
</div>
```

## Common Tasks

### Filter by Category

```astro
---
import { getProductsByCategory } from '@/lib/ecommerce';

const apparelProducts = await getProductsByCategory('apparel');
---
```

### Show Featured Products

```astro
---
import { getFeaturedProducts } from '@/lib/ecommerce';

const featured = await getFeaturedProducts(4);
---
```

### Display Collection

```astro
---
import { getProductsByCollection } from '@/lib/ecommerce';

const bestsellers = await getProductsByCollection('bestsellers');
---
```

### Search Products

```astro
---
import { searchProducts } from '@/lib/ecommerce';

const results = await searchProducts('cotton');
---
```

### Show Price Range

```astro
---
import { getPriceRange } from '@/lib/ecommerce';

const priceRange = getPriceRange(product.data);
---

<p>{priceRange}</p>
<!-- Output: "$29.99 - $85.00" -->
```

## Utility Functions Reference

### Product Queries
```typescript
getAllProducts()                      // All products
getProductsByCategory(slug)          // By category
getProductsByCollection(slug)        // By collection
getFeaturedProducts(limit?)          // Featured only
getRelatedProducts(product, limit)   // Similar products
getProductsByTag(tag)                // By tag
getInStockProducts()                 // Available only
searchProducts(query)                // Search
```

### Price Functions
```typescript
calculatePrice(product, variant?)    // Get price
formatCurrency(amount, currency?)    // Format display
isOnSale(product)                    // Check sale
getDiscountPercentage(product)       // % off
getPriceRange(product)               // Range string
getLowestPrice(product)              // Min price
getHighestPrice(product)             // Max price
```

### Variant Functions
```typescript
getInStockVariants(product)          // Available variants
getVariantOptions(product, 'color')  // Unique colors
findVariant(product, { color, size }) // Find specific
hasInStockVariant(product)           // Any available?
```

### Category/Collection Functions
```typescript
getAllCategories()                   // All categories
getCategoryBySlug(slug)             // Single category
getAllCollections()                  // All collections
getFeaturedCollections()            // Featured only
getCollectionBySlug(slug)           // Single collection
```

## TypeScript Types

```typescript
import type {
  Product,
  ProductVariant,
  Category,
  ProductCollection,
  Cart,
  CartItem,
  Order,
  Review,
  DiscountCode
} from '@/types/products';
```

## Tips

### 1. Use Ontology Events
Log actions for analytics:
```typescript
// In your backend/Convex
await ctx.db.insert('events', {
  type: 'product_viewed',
  thingId: productId,
  timestamp: Date.now(),
});
```

### 2. Add Connections
Link products to creators:
```typescript
await ctx.db.insert('connections', {
  fromThingId: creatorId,
  toThingId: productId,
  relationshipType: 'created',
});
```

### 3. Use Knowledge Labels
Tag products for better search:
```markdown
tags: ["category:apparel", "color:blue", "material:cotton"]
```

### 4. Optimize Images
- Use WebP format
- Resize to max 1200x1200px
- Use lazy loading
- Provide alt text

### 5. SEO Best Practices
- Descriptive product names
- Detailed descriptions (150+ words)
- Use semantic HTML
- Add structured data

## Next Steps

1. **Add Images**: Create `/public/images/products/` directory
2. **Create Cart**: Implement shopping cart with Nanostores
3. **Add Checkout**: Build checkout flow
4. **Backend Sync**: Sync products to Convex database
5. **Track Events**: Log product views, cart additions
6. **Add Reviews**: Implement customer reviews
7. **Recommendations**: Build "Related Products" feature

## Full Documentation

See `/src/content/ECOMMERCE-README.md` for complete documentation.

---

**Happy selling! 🛍️**

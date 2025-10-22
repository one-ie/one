# Ecommerce Content Collections

This directory contains Astro content collections for ecommerce functionality, mapped to the ONE Platform ecommerce ontology.

## Ontology Mapping

All ecommerce content maps to the **6-dimension ontology**:

### Things (Entities)
- `product` - Core sellable item
- `product_variant` - Specific version of product (size, color)
- `category` - Product classification
- `collection` - Curated product group
- `shopping_cart` - Customer's cart
- `order` - Completed purchase
- `payment` - Financial transaction
- `customer_review` - Customer feedback
- `discount_code` - Promotional code

### Connections (Relationships)
- `part_of` - Product → Category
- `belongs_to` - Product → Collection
- `contains` - Order → Product
- `purchased` - Customer → Product
- `is_about` - Review → Product

### Events (Actions)
- `product_viewed` - Customer views product
- `product_added_to_cart` - Item added to cart
- `cart_abandoned` - Customer leaves without purchasing
- `checkout_started` - Customer begins checkout
- `order_placed` - Order completed
- `payment_processed` - Payment successful
- `order_shipped` - Order dispatched
- `review_submitted` - Customer reviews product

### Knowledge (Labels)
- Product tags: `category:apparel`, `color:blue`, `material:cotton`
- Customer segments: `status:loyal`, `ltv_tier:gold`
- Operational: `stock_status:in_stock`, `order_status:shipped`

## Content Collections

### Products (`/content/products/`)

**Schema:**
```typescript
{
  name: string;                  // Product name
  slug: string;                  // URL-friendly identifier
  description: string;           // Product description
  price: number;                 // Base price
  compareAtPrice?: number;       // Original price (for sales)
  images: string[];              // Product images
  category: string;              // Category slug
  collections?: string[];        // Collection slugs
  variants?: ProductVariant[];   // Size/color options
  inStock: boolean;              // Availability
  featured: boolean;             // Featured status
  tags?: string[];               // Tags for search/filter
  metadata?: Record<any>;        // Custom metadata
}
```

**Example:** `products/example-tshirt.md`

### Categories (`/content/categories/`)

**Schema:**
```typescript
{
  name: string;           // Category name
  slug: string;           // URL-friendly identifier
  description?: string;   // Category description
  image?: string;         // Category image
  parent?: string;        // Parent category slug (hierarchy)
  order: number;          // Sort order
}
```

**Example:** `categories/apparel.md`

### Collections (`/content/collections/`)

**Schema:**
```typescript
{
  name: string;           // Collection name
  slug: string;           // URL-friendly identifier
  description: string;    // Collection description
  image?: string;         // Collection image
  featured: boolean;      // Featured on homepage
  products: string[];     // Product slugs in collection
}
```

**Example:** `collections/bestsellers.md`

## Example Files

### Products
1. **example-tshirt.md** - T-shirt with variants (colors, sizes)
2. **example-mug.md** - Simple product (no variants)
3. **example-poster.md** - Art print with size variants

### Categories
1. **apparel.md** - Clothing category
2. **accessories.md** - Accessories category
3. **home.md** - Home goods category

### Collections
1. **bestsellers.md** - Popular products
2. **new-arrivals.md** - Recently added products

## Using Content Collections

### In Astro Pages

```astro
---
import { getCollection } from 'astro:content';
import { getProductsByCategory } from '@/lib/ecommerce';

// Get all products
const products = await getCollection('products');

// Get products by category
const apparelProducts = await getProductsByCategory('apparel');

// Get featured products
const featured = products.filter(p => p.data.featured);
---

<div>
  {products.map(product => (
    <div>{product.data.name}</div>
  ))}
</div>
```

### In React Components

```typescript
import { useEffect, useState } from 'react';
import type { CollectionEntry } from 'astro:content';

export function ProductList({ category }: { category: string }) {
  const [products, setProducts] = useState<CollectionEntry<'products'>[]>([]);

  useEffect(() => {
    // Fetch from API endpoint that uses getProductsByCategory
  }, [category]);

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.slug} product={product.data} />
      ))}
    </div>
  );
}
```

## Utility Functions

All utility functions are in `/src/lib/ecommerce.ts`:

### Product Queries
- `getAllProducts()` - Get all products
- `getProductsByCategory(slug)` - Filter by category
- `getProductsByCollection(slug)` - Filter by collection
- `getFeaturedProducts(limit?)` - Get featured products
- `getRelatedProducts(product, limit)` - Get similar products
- `searchProducts(query)` - Search by name/description

### Price Calculations
- `calculatePrice(product, variant?)` - Get effective price
- `isOnSale(product)` - Check if on sale
- `getDiscountPercentage(product)` - Calculate discount %
- `formatCurrency(amount, currency)` - Format price display
- `getPriceRange(product)` - Get variant price range

### Variant Helpers
- `getInStockVariants(product)` - Filter available variants
- `getVariantOptions(product, key)` - Get unique option values
- `findVariant(product, options)` - Find variant by options
- `hasInStockVariant(product)` - Check availability

### Cart Calculations
- `calculateCartTotals(items)` - Compute subtotal, tax, shipping, total

## TypeScript Types

All types are in `/src/types/products.ts`:

```typescript
import type { Product, ProductVariant, Category, ProductCollection } from '@/types/products';
```

Additional types:
- `Cart` - Shopping cart
- `CartItem` - Cart line item
- `Order` - Order object
- `Payment` - Payment record
- `Review` - Customer review
- `DiscountCode` - Discount code

## Content Guidelines

### Product Content
- Use high-quality images (at least 1200x1200px)
- Write detailed descriptions (150+ words)
- Include key features and specifications
- Add care/usage instructions
- Use consistent variant naming

### Category Content
- Clear, concise descriptions
- Representative category images
- Logical hierarchy (use `parent` field)
- Consistent ordering

### Collection Content
- Curated selection (3-12 products ideal)
- Compelling descriptions
- Seasonal or thematic grouping
- Keep collections fresh and updated

## Adding New Products

1. Create markdown file in `/content/products/`
2. Use kebab-case filename: `product-name.md`
3. Fill out frontmatter with required fields
4. Add product description in markdown body
5. Reference category and collections by slug
6. Run `bunx astro sync` to update types

## Adding New Categories

1. Create markdown file in `/content/categories/`
2. Use kebab-case filename matching slug
3. Set `order` field for sorting
4. Optionally set `parent` for hierarchy
5. Run `bunx astro sync` to update types

## Adding New Collections

1. Create markdown file in `/content/collections/`
2. Add product slugs to `products` array
3. Set `featured: true` for homepage display
4. Run `bunx astro sync` to update types

## Type Generation

After adding/modifying content:

```bash
bunx astro sync
```

This generates TypeScript types in `src/content/_types.generated.d.ts`

## Backend Integration

While content collections work standalone, they can integrate with Convex backend:

1. **Sync to Database**: Use Convex mutations to sync products to `things` table
2. **Track Events**: Log `product_viewed`, `product_added_to_cart` events
3. **Store Orders**: Save orders to database with connections to products
4. **Manage Inventory**: Update stock levels in real-time
5. **Customer Reviews**: Store reviews in database linked to products

Example sync pattern:
```typescript
// In Convex mutation
export const syncProduct = mutation({
  args: { productData: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('things', {
      type: 'product',
      name: args.productData.name,
      properties: args.productData,
      status: 'active',
      createdAt: Date.now(),
    });
  }
});
```

## Event Logging

Log ecommerce events to track customer behavior:

```typescript
// Log product view
await ctx.db.insert('events', {
  type: 'product_viewed',
  thingId: productId,
  actorId: customerId,
  timestamp: Date.now(),
  metadata: { source: 'web' }
});

// Log add to cart
await ctx.db.insert('events', {
  type: 'product_added_to_cart',
  thingId: productId,
  actorId: customerId,
  timestamp: Date.now(),
  metadata: { quantity: 1, variantId: 'variant-123' }
});
```

## Best Practices

### Content
- Keep product names under 60 characters
- Use consistent image aspect ratios
- Write SEO-friendly descriptions
- Include all relevant metadata
- Tag products for better discoverability

### Performance
- Optimize images before adding
- Use lazy loading for product images
- Cache product queries when possible
- Paginate large product lists

### Data Integrity
- Validate category/collection slugs exist
- Check variant data consistency
- Keep prices as numbers (not strings)
- Use ISO currency codes

### Ontology Alignment
- Map all products to ontology thing types
- Use ontology connection types for relationships
- Log ontology events for actions
- Apply knowledge labels consistently

## Future Enhancements

Potential additions:
- **Inventory Management**: Track stock levels per variant
- **Multi-currency Support**: Prices in multiple currencies
- **Product Bundles**: Group products as bundles
- **Reviews Integration**: Customer reviews and ratings
- **Wishlist**: Save products for later
- **Recommendations**: AI-powered product suggestions
- **A/B Testing**: Test different product presentations

---

**Built on the ONE Platform 6-dimension ontology**

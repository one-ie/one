# Ecommerce Template - Ontology Integration

This document explains how the ecommerce template integrates with the ONE Platform's multi-ontology architecture.

## Overview

The ecommerce template uses the **shop ontology** (defined in `/one/knowledge/ontology-shop.yaml`) while maintaining familiar ecommerce types (`Product`, `CartItem`). This gives you:

- ✅ **Type safety** - Full TypeScript types from template to database
- ✅ **Multi-tenant** - Automatic isolation via `groupId`
- ✅ **Backend-agnostic** - Template works with any backend implementing the ontology
- ✅ **Event tracking** - Complete audit trail of all shopping actions
- ✅ **Relationships** - Rich connections between products, users, orders

## Architecture

```
Template Types (Product, CartItem)
         ↓
   Ontology Adapter
         ↓
6-Dimension Ontology (Thing, Connection, Event)
         ↓
   Backend (Convex)
```

### The Shop Ontology

From `ontology-shop.yaml`:

**Thing Types:**
- `product` - Physical or digital products
- `product_variant` - Product variations (size, color)
- `shopping_cart` - User shopping carts
- `order` - Completed orders
- `discount_code` - Promotional codes
- `payment` - Payment transactions

**Connection Types:**
- `purchased` - User purchased product
- `in_cart` - Product in user's cart
- `variant_of` - Variant belongs to product
- `ordered` - User placed order
- `paid_for` - Payment for order

**Event Types:**
- `product_added_to_cart`
- `cart_updated`
- `order_placed`
- `payment_processed`
- `product_viewed`
- And more...

## Usage Examples

### 1. Convert Product to Ontology Thing

```typescript
import { productToThing } from './lib/ontology-adapter';
import type { Product } from './lib/types';

const product: Product = {
  id: '1',
  name: 'Classic White T-Shirt',
  description: 'Premium cotton blend',
  price: 29.99,
  category: 'men',
  subcategory: 'tops',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['White', 'Black'],
  images: ['https://...'],
  isNew: true,
  isSale: false,
  stock: 150,
};

// Convert to ontology thing
const thingInput = productToThing(product, groupId);

// thingInput is ready to save to database:
// {
//   groupId: "...",
//   type: "product",
//   name: "Classic White T-Shirt",
//   properties: {
//     slug: "classic-white-t-shirt",
//     description: "Premium cotton blend",
//     price: 29.99,
//     images: [...],
//     inventory: 150,
//     category: "men",
//     subcategory: "tops",
//     sizes: ['S', 'M', 'L', 'XL'],
//     colors: ['White', 'Black'],
//     isNew: true,
//     isSale: false,
//     stock: 150,
//   },
//   status: "active"
// }
```

### 2. Convert Ontology Thing to Product

```typescript
import { thingToProduct } from './lib/ontology-adapter';

// Fetch from backend
const thing = await convex.query(api.queries.entities.get, {
  id: productId,
});

// Convert to template type
const product = thingToProduct(thing);

// product is now a familiar Product type:
// {
//   id: "...",
//   name: "Classic White T-Shirt",
//   description: "Premium cotton blend",
//   price: 29.99,
//   category: "men",
//   ...
// }
```

### 3. Add Product to Cart (Creates Connection)

```typescript
import {
  cartItemToConnection,
  createProductAddedToCartEvent,
} from './lib/ontology-adapter';
import type { CartItem } from './lib/types';

const cartItem: CartItem = {
  product: product,
  quantity: 2,
  selectedSize: 'M',
  selectedColor: 'White',
};

// 1. Create connection (user → product)
const connectionInput = cartItemToConnection(cartItem, userId, groupId);

// Save connection to database
await convex.mutation(api.mutations.connections.create, connectionInput);

// 2. Log event
const eventInput = createProductAddedToCartEvent(cartItem, userId, groupId);

await convex.mutation(api.mutations.events.create, eventInput);
```

### 4. Query User's Cart (via Connections)

```typescript
import { connectionToCartItem, thingToProduct } from './lib/ontology-adapter';

// Get all cart connections for user
const connections = await convex.query(api.queries.connections.list, {
  fromEntityId: userId,
  relationshipType: 'in_cart',
});

// Get products for each connection
const cartItems = await Promise.all(
  connections.map(async (connection) => {
    const product = await convex.query(api.queries.entities.get, {
      id: connection.toEntityId,
    });
    return connectionToCartItem(connection, product);
  })
);

// cartItems is now CartItem[]
```

### 5. Track Product Views (Events)

```typescript
import { createProductViewedEvent } from './lib/ontology-adapter';

// Log product view
const eventInput = createProductViewedEvent(productId, userId, groupId);

await convex.mutation(api.mutations.events.create, eventInput);

// Query popular products (most viewed)
const events = await convex.query(api.queries.events.list, {
  type: 'product_viewed',
  groupId,
});

// Count views per product
const viewCounts = events.reduce((acc, event) => {
  const productId = event.targetId!;
  acc[productId] = (acc[productId] || 0) + 1;
  return acc;
}, {});
```

## Migration Guide

### From Template Types to Ontology

**Before (Template-only):**
```typescript
// products.ts - hardcoded array
export const products: Product[] = [...];

// cart.ts - localStorage only
import { atom } from 'nanostores';
export const cartItems = atom<CartItem[]>([]);
```

**After (With Ontology):**
```typescript
// Use Convex queries
import { useQuery } from 'convex/react';
import { thingToProduct } from './lib/ontology-adapter';

function ProductList() {
  const things = useQuery(api.queries.entities.list, {
    groupId,
    type: 'product',
  });

  const products = things?.map(thingToProduct) ?? [];

  return <div>{products.map(p => <ProductCard product={p} />)}</div>;
}
```

### Gradual Migration Strategy

1. **Phase 1: Add Adapters (✅ Done)**
   - Template types work as before
   - Ontology adapter available when needed
   - No breaking changes

2. **Phase 2: Backend Integration**
   - Create Convex queries/mutations for shop ontology
   - Test adapters with real backend
   - Validate type safety

3. **Phase 3: Replace Static Data**
   - Replace `products.ts` with backend queries
   - Replace localStorage cart with connections
   - Add event tracking

4. **Phase 4: Add Features**
   - Product recommendations (via connections)
   - Purchase history (via events)
   - Order tracking
   - Analytics dashboard

## Benefits of Integration

### 1. Type Safety

```typescript
// ❌ Before: Any type, runtime errors
const product = JSON.parse(localStorage.getItem('product'));
product.price // Could be undefined, wrong type, etc.

// ✅ After: Full type safety
const thing = await convex.query(api.queries.entities.get, { id });
const product = thingToProduct(thing); // TypeScript validates
product.price // Guaranteed to be number
```

### 2. Multi-Tenant Isolation

```typescript
// Every entity automatically scoped to group
const products = await convex.query(api.queries.entities.list, {
  groupId: currentGroupId, // Automatic isolation
  type: 'product',
});

// Users in Group A can't see Group B's products
```

### 3. Event-Driven Analytics

```typescript
// Complete audit trail of all actions
const orderEvents = await convex.query(api.queries.events.list, {
  type: 'order_placed',
  groupId,
});

// Analyze shopping patterns
const abandonedCarts = await convex.query(api.queries.events.list, {
  type: 'cart_abandoned',
  groupId,
});
```

### 4. Rich Relationships

```typescript
// Find products purchased together
const purchasedConnections = await convex.query(
  api.queries.connections.list,
  {
    fromEntityId: userId,
    relationshipType: 'purchased',
  }
);

// Recommend based on connections
```

### 5. Backend Flexibility

```typescript
// Same adapter works with ANY backend:
// - Convex
// - Supabase
// - Firebase
// - WordPress
// - Custom API

// Just implement the DataProvider interface
```

## File Structure

```
web/src/templates/ecommerce/
├── lib/
│   ├── types.ts                   # Template types (Product, CartItem)
│   ├── ontology-adapter.ts        # Conversion layer (NEW)
│   ├── products.ts                # Static data (will migrate to backend)
│   └── cart.ts                    # Cart logic (will use connections)
├── components/                    # UI components
├── pages/                         # Route pages
├── ONTOLOGY-INTEGRATION.md        # This file
└── README.md                      # Template documentation
```

## Next Steps

1. **Set up Convex backend** with shop ontology
2. **Create queries/mutations** for products, cart, orders
3. **Test adapters** with real data
4. **Replace static data** with backend queries
5. **Add event tracking** throughout template
6. **Build analytics dashboard** using events

## Advanced Patterns

### Product Variants (Connections)

```typescript
// Create product variant thing
const variantThing = await convex.mutation(api.mutations.entities.create, {
  groupId,
  type: 'product_variant',
  name: 'White T-Shirt - Size M',
  properties: {
    sku: 'TS-WHT-M',
    price: 29.99,
    inventory: 50,
    options: { size: 'M', color: 'White' },
  },
});

// Create variant_of connection
await convex.mutation(api.mutations.connections.create, {
  groupId,
  fromEntityId: variantThing._id,
  toEntityId: productId,
  relationshipType: 'variant_of',
});
```

### Order Processing

```typescript
// 1. Create order thing
const orderThing = await convex.mutation(api.mutations.entities.create, {
  groupId,
  type: 'order',
  name: `Order #${orderNumber}`,
  properties: {
    orderNumber,
    items: cartItems,
    subtotal,
    tax,
    shipping,
    total,
    status: 'pending',
    shippingAddress,
    billingAddress,
  },
});

// 2. Create ordered connection
await convex.mutation(api.mutations.connections.create, {
  groupId,
  fromEntityId: userId,
  toEntityId: orderThing._id,
  relationshipType: 'ordered',
});

// 3. Log order_placed event
await convex.mutation(api.mutations.events.create, {
  groupId,
  type: 'order_placed',
  actorId: userId,
  targetId: orderThing._id,
  metadata: { orderNumber, total, items: cartItems.length },
});
```

### Discount Codes

```typescript
// Create discount code thing
const discountThing = await convex.mutation(api.mutations.entities.create, {
  groupId,
  type: 'discount_code',
  name: 'SUMMER25',
  properties: {
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    minPurchase: 50,
    maxUses: 100,
    usedCount: 0,
    validFrom: Date.now(),
    validTo: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});

// Apply to order and log event
await convex.mutation(api.mutations.events.create, {
  groupId,
  type: 'discount_applied',
  actorId: userId,
  targetId: discountThing._id,
  metadata: { orderId, discountAmount },
});
```

## Support

- **Documentation**: `/one/knowledge/ontology-shop.yaml`
- **Type Definitions**: `/backend/convex/types/ontology.ts`
- **Template Bridge**: `/web/src/lib/template-ontology.ts`
- **Adapter**: `/web/src/templates/ecommerce/lib/ontology-adapter.ts`

---

**Built for flexibility. Aligned with ontology. Type-safe throughout.**

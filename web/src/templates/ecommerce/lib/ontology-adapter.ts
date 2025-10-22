/**
 * Ecommerce Template - Ontology Adapter
 *
 * This adapter converts between the ecommerce template types and the
 * shop ontology from the backend (ontology-shop.yaml).
 *
 * Shop Ontology Types:
 * - Things: product, product_variant, shopping_cart, order, discount_code, payment
 * - Connections: purchased, in_cart, variant_of, ordered, paid_for
 * - Events: product_added_to_cart, cart_updated, order_placed, payment_processed, etc.
 *
 * This allows the template to:
 * 1. Use familiar ecommerce types (Product, CartItem)
 * 2. Store data in the ontology (Thing with type: 'product')
 * 3. Maintain type safety throughout
 * 4. Support multi-tenant isolation via groupId
 */

import type { Id } from 'convex/_generated/dataModel';
import type { Product, CartItem } from './types';
import {
  type Thing,
  type Connection,
  type CreateThingInput,
  type CreateConnectionInput,
  type CreateEventInput,
  getProperty,
  getRequiredProperty,
  validateThingType,
  validateThingProperties,
  mapStatus,
  templateToThing,
  thingToTemplate,
} from '@/lib/template-ontology';

// ============================================================================
// Shop Ontology Types (from ontology-shop.yaml)
// ============================================================================

/**
 * Thing types from shop ontology
 */
export type ShopThingType =
  | 'product'
  | 'product_variant'
  | 'shopping_cart'
  | 'order'
  | 'discount_code'
  | 'payment';

/**
 * Connection types from shop ontology
 */
export type ShopConnectionType =
  | 'purchased'
  | 'in_cart'
  | 'variant_of'
  | 'ordered'
  | 'paid_for';

/**
 * Event types from shop ontology
 */
export type ShopEventType =
  | 'product_added_to_cart'
  | 'cart_updated'
  | 'cart_abandoned'
  | 'order_placed'
  | 'order_fulfilled'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_processed'
  | 'payment_failed'
  | 'product_viewed'
  | 'discount_applied';

// ============================================================================
// Product Conversions (Thing type: 'product')
// ============================================================================

/**
 * Convert ontology Thing to template Product
 *
 * Maps from the ontology 'product' thing type to the template Product interface.
 * Validates that the thing has all required properties.
 */
export function thingToProduct(thing: Thing): Product {
  // Validate thing type
  validateThingType(thing, 'product');

  // Validate required properties
  validateThingProperties(thing, [
    'description',
    'price',
    'category',
    'subcategory',
    'sizes',
    'colors',
    'images',
    'stock',
  ]);

  return {
    id: thing._id,
    name: thing.name,
    description: getRequiredProperty<string>(thing, 'description'),
    price: getRequiredProperty<number>(thing, 'price'),
    salePrice: getProperty<number>(thing, 'compareAtPrice'),
    category: getRequiredProperty<'men' | 'women' | 'unisex'>(
      thing,
      'category'
    ),
    subcategory: getRequiredProperty<
      'tops' | 'bottoms' | 'outerwear' | 'accessories' | 'shoes'
    >(thing, 'subcategory'),
    sizes: getRequiredProperty<string[]>(thing, 'sizes'),
    colors: getRequiredProperty<string[]>(thing, 'colors'),
    images: getRequiredProperty<string[]>(thing, 'images'),
    isNew: getProperty<boolean>(thing, 'isNew') ?? false,
    isSale: getProperty<boolean>(thing, 'isSale') ?? false,
    stock: getRequiredProperty<number>(thing, 'stock'),
  };
}

/**
 * Convert template Product to ontology Thing input
 *
 * Maps from the template Product interface to a CreateThingInput for the
 * 'product' thing type in the ontology.
 */
export function productToThing(
  product: Product,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    product,
    'product',
    groupId,
    (p) => ({
      // From ontology-shop.yaml product properties
      slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      description: p.description,
      price: p.price,
      compareAtPrice: p.salePrice,
      images: p.images,
      inventory: p.stock,
      sku: p.id, // Using product ID as SKU for now
      status:
        p.stock > 0
          ? 'active'
          : 'inactive',

      // Template-specific properties (preserved in properties object)
      category: p.category,
      subcategory: p.subcategory,
      sizes: p.sizes,
      colors: p.colors,
      isNew: p.isNew,
      isSale: p.isSale,
      stock: p.stock,
    })
  );
}

/**
 * Batch convert Things to Products
 */
export function batchThingsToProducts(things: Thing[]): Product[] {
  return things.map(thingToProduct);
}

/**
 * Batch convert Products to Things
 */
export function batchProductsToThings(
  products: Product[],
  groupId: Id<'groups'>
): CreateThingInput[] {
  return products.map((product) => productToThing(product, groupId));
}

// ============================================================================
// Cart Item Conversions (Connection type: 'in_cart')
// ============================================================================

/**
 * Cart item metadata stored in the connection
 */
export interface CartItemMetadata {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  addedAt: number;
}

/**
 * Convert Connection to CartItem
 *
 * Requires fetching the product Thing separately.
 */
export function connectionToCartItem(
  connection: Connection,
  product: Thing
): CartItem {
  validateThingType(product, 'product');

  const metadata = connection.metadata as CartItemMetadata | undefined;

  if (!metadata) {
    throw new Error(
      `Connection ${connection._id} is missing required cart metadata`
    );
  }

  return {
    product: thingToProduct(product),
    quantity: metadata.quantity,
    selectedSize: metadata.selectedSize,
    selectedColor: metadata.selectedColor,
  };
}

/**
 * Create cart connection input
 *
 * Creates a connection between a user (or session) and a product
 * with cart item metadata.
 */
export function cartItemToConnection(
  cartItem: CartItem,
  userId: Id<'entities'>, // Can be user entity or session entity
  groupId: Id<'groups'>
): CreateConnectionInput {
  const metadata: CartItemMetadata = {
    quantity: cartItem.quantity,
    selectedSize: cartItem.selectedSize,
    selectedColor: cartItem.selectedColor,
    addedAt: Date.now(),
  };

  return {
    groupId,
    fromEntityId: userId,
    toEntityId: cartItem.product.id as Id<'entities'>,
    relationshipType: 'in_cart',
    metadata,
  };
}

// ============================================================================
// Event Helpers (Shop Events)
// ============================================================================

/**
 * Create 'product_added_to_cart' event
 */
export function createProductAddedToCartEvent(
  cartItem: CartItem,
  userId: Id<'entities'>,
  groupId: Id<'groups'>
): CreateEventInput {
  return {
    groupId,
    type: 'product_added_to_cart',
    actorId: userId,
    targetId: cartItem.product.id as Id<'entities'>,
    metadata: {
      quantity: cartItem.quantity,
      selectedSize: cartItem.selectedSize,
      selectedColor: cartItem.selectedColor,
      price: cartItem.product.salePrice || cartItem.product.price,
    },
  };
}

/**
 * Create 'product_viewed' event
 */
export function createProductViewedEvent(
  productId: Id<'entities'>,
  userId: Id<'entities'>,
  groupId: Id<'groups'>
): CreateEventInput {
  return {
    groupId,
    type: 'product_viewed',
    actorId: userId,
    targetId: productId,
    metadata: {
      timestamp: Date.now(),
    },
  };
}

/**
 * Create 'cart_updated' event
 */
export function createCartUpdatedEvent(
  userId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata: {
    action: 'added' | 'removed' | 'updated';
    productId: Id<'entities'>;
    quantity?: number;
  }
): CreateEventInput {
  return {
    groupId,
    type: 'cart_updated',
    actorId: userId,
    metadata,
  };
}

/**
 * Create 'order_placed' event
 */
export function createOrderPlacedEvent(
  orderId: Id<'entities'>,
  userId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata: {
    orderNumber: string;
    total: number;
    items: number;
  }
): CreateEventInput {
  return {
    groupId,
    type: 'order_placed',
    actorId: userId,
    targetId: orderId,
    metadata,
  };
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Filter products by category
 */
export function filterProductsByCategory(
  products: Product[],
  category: 'men' | 'women' | 'unisex'
): Product[] {
  return products.filter((p) => p.category === category);
}

/**
 * Filter products by subcategory
 */
export function filterProductsBySubcategory(
  products: Product[],
  subcategory: 'tops' | 'bottoms' | 'outerwear' | 'accessories' | 'shoes'
): Product[] {
  return products.filter((p) => p.subcategory === subcategory);
}

/**
 * Filter products on sale
 */
export function filterSaleProducts(products: Product[]): Product[] {
  return products.filter((p) => p.isSale);
}

/**
 * Filter new products
 */
export function filterNewProducts(products: Product[]): Product[] {
  return products.filter((p) => p.isNew);
}

/**
 * Filter in-stock products
 */
export function filterInStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.stock > 0);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that a product has valid data
 */
export function validateProduct(product: Product): void {
  if (!product.id) throw new Error('Product must have an ID');
  if (!product.name) throw new Error('Product must have a name');
  if (product.price <= 0) throw new Error('Product price must be positive');
  if (product.stock < 0) throw new Error('Product stock cannot be negative');
  if (product.sizes.length === 0) {
    throw new Error('Product must have at least one size');
  }
  if (product.colors.length === 0) {
    throw new Error('Product must have at least one color');
  }
  if (product.images.length === 0) {
    throw new Error('Product must have at least one image');
  }
}

/**
 * Validate that a cart item is valid
 */
export function validateCartItem(cartItem: CartItem): void {
  validateProduct(cartItem.product);

  if (cartItem.quantity <= 0) {
    throw new Error('Cart item quantity must be positive');
  }

  if (!cartItem.product.sizes.includes(cartItem.selectedSize)) {
    throw new Error(
      `Invalid size: ${cartItem.selectedSize} not available for product`
    );
  }

  if (!cartItem.product.colors.includes(cartItem.selectedColor)) {
    throw new Error(
      `Invalid color: ${cartItem.selectedColor} not available for product`
    );
  }

  if (cartItem.quantity > cartItem.product.stock) {
    throw new Error('Cart item quantity exceeds available stock');
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ShopThingType,
  ShopConnectionType,
  ShopEventType,
  CartItemMetadata,
};

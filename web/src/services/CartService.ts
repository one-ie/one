/**
 * CartService - Shopping Cart Operations
 *
 * Manages shopping cart using 6-dimension ontology:
 * - Cart items are connections between user and product
 * - Connection metadata contains quantity, selected variant (size, color)
 * - Events track cart additions/removals
 */

import { Effect } from "effect";
import { ThingService } from "./ThingService";
import { ConnectionService } from "./ConnectionService";
import { EventService } from "./EventService";

// ============================================================================
// TYPES
// ============================================================================

export interface CartItemMetadata {
  quantity: number;
  selectedSku: string; // SKU of selected variant
  selectedSize?: string;
  selectedColor?: string;
  priceAtAdd: number; // Price when added to cart (for price change tracking)
  addedAt: number;
}

export interface CartItem {
  _id: string;
  productId: string;
  product: any; // Full product thing
  quantity: number;
  selectedSku: string;
  selectedSize?: string;
  selectedColor?: string;
  priceAtAdd: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ============================================================================
// CART SERVICE
// ============================================================================

export class CartService {
  /**
   * Add item to cart
   */
  static addItem = (
    userId: string,
    productId: string,
    quantity: number,
    selectedSku: string,
    selectedSize?: string,
    selectedColor?: string
  ) =>
    Effect.gen(function* () {
      // Get product to verify it exists and get price
      const product = yield* ThingService.get(productId);
      const props = product.properties as any;

      // Find variant price
      const variant = props.variants.find((v: any) => v.sku === selectedSku);
      if (!variant) {
        return yield* Effect.fail(
          new Error(`Variant with SKU ${selectedSku} not found`)
        );
      }

      const priceAtAdd = props.price + (variant.priceModifier || 0);

      // Check if item already in cart
      // Note: Using "purchased" to represent cart items pending purchase
      const existingConnections = yield* ConnectionService.list({
        fromEntityId: userId,
        toEntityId: productId,
        relationshipType: "purchased",
      });

      if (existingConnections.length > 0) {
        // Update quantity of existing item
        const existing = existingConnections[0];
        const currentMetadata = existing.metadata as CartItemMetadata;

        yield* ConnectionService.updateMetadata(existing._id, {
          ...currentMetadata,
          quantity: currentMetadata.quantity + quantity,
        });

        // Log cart updated event
        yield* EventService.create({
          type: "cart_item_updated",
          actorId: userId,
          targetId: productId,
          metadata: {
            previousQuantity: currentMetadata.quantity,
            newQuantity: currentMetadata.quantity + quantity,
          },
        });

        return existing._id;
      }

      // Create new cart item connection
      // Note: Using "purchased" to represent cart items pending purchase
      const connectionId = yield* ConnectionService.create({
        fromEntityId: userId,
        toEntityId: productId,
        relationshipType: "purchased",
        metadata: {
          quantity,
          selectedSku,
          selectedSize,
          selectedColor,
          priceAtAdd,
          addedAt: Date.now(),
        } as CartItemMetadata,
      });

      // Log cart add event
      yield* EventService.create({
        type: "cart_item_added",
        actorId: userId,
        targetId: productId,
        metadata: {
          quantity,
          selectedSku,
          priceAtAdd,
        },
      });

      return connectionId;
    });

  /**
   * Remove item from cart
   */
  static removeItem = (userId: string, productId: string) =>
    Effect.gen(function* () {
      // Find cart connection
      // Note: Using "purchased" to represent cart items
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        toEntityId: productId,
        relationshipType: "purchased",
      });

      if (connections.length === 0) {
        return yield* Effect.fail(new Error("Item not found in cart"));
      }

      const connection = connections[0];
      const metadata = connection.metadata as CartItemMetadata;

      // Delete connection
      yield* ConnectionService.delete(connection._id);

      // Log cart remove event
      yield* EventService.create({
        type: "cart_item_removed",
        actorId: userId,
        targetId: productId,
        metadata: {
          quantity: metadata.quantity,
          removedAt: Date.now(),
        },
      });
    });

  /**
   * Update item quantity
   */
  static updateQuantity = (
    userId: string,
    productId: string,
    newQuantity: number
  ) =>
    Effect.gen(function* () {
      if (newQuantity <= 0) {
        return yield* CartService.removeItem(userId, productId);
      }

      // Find cart connection
      // Note: Using "purchased" to represent cart items
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        toEntityId: productId,
        relationshipType: "purchased",
      });

      if (connections.length === 0) {
        return yield* Effect.fail(new Error("Item not found in cart"));
      }

      const connection = connections[0];
      const metadata = connection.metadata as CartItemMetadata;

      // Update quantity
      yield* ConnectionService.updateMetadata(connection._id, {
        ...metadata,
        quantity: newQuantity,
      });

      // Log quantity update event
      yield* EventService.create({
        type: "cart_item_updated",
        actorId: userId,
        targetId: productId,
        metadata: {
          previousQuantity: metadata.quantity,
          newQuantity,
        },
      });
    });

  /**
   * Get user's cart
   */
  static getCart = (userId: string) =>
    Effect.gen(function* () {
      // Get all cart connections
      // Note: Using "purchased" to represent cart items
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        relationshipType: "purchased",
      });

      // Get product details for each item
      const items: CartItem[] = [];
      let total = 0;
      let itemCount = 0;

      for (const connection of connections) {
        const product = yield* ThingService.get(connection.toEntityId);
        const metadata = connection.metadata as CartItemMetadata;

        const subtotal = metadata.priceAtAdd * metadata.quantity;
        total += subtotal;
        itemCount += metadata.quantity;

        items.push({
          _id: connection._id,
          productId: connection.toEntityId,
          product,
          quantity: metadata.quantity,
          selectedSku: metadata.selectedSku,
          selectedSize: metadata.selectedSize,
          selectedColor: metadata.selectedColor,
          priceAtAdd: metadata.priceAtAdd,
          subtotal,
        });
      }

      return {
        items,
        total,
        itemCount,
      } as Cart;
    });

  /**
   * Clear entire cart
   */
  static clearCart = (userId: string) =>
    Effect.gen(function* () {
      // Get all cart connections
      // Note: Using "purchased" to represent cart items
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        relationshipType: "purchased",
      });

      // Delete all connections
      for (const connection of connections) {
        yield* ConnectionService.delete(connection._id);
      }

      // Log cart cleared event
      yield* EventService.create({
        type: "cart_cleared",
        actorId: userId,
        metadata: {
          itemCount: connections.length,
          clearedAt: Date.now(),
        },
      });
    });

  /**
   * Get cart item count
   */
  static getItemCount = (userId: string) =>
    Effect.gen(function* () {
      const cart = yield* CartService.getCart(userId);
      return cart.itemCount;
    });

  /**
   * Get cart total
   */
  static getTotal = (userId: string) =>
    Effect.gen(function* () {
      const cart = yield* CartService.getCart(userId);
      return cart.total;
    });

  /**
   * Check if product is in cart
   */
  static isInCart = (userId: string, productId: string) =>
    Effect.gen(function* () {
      // Note: Using "purchased" to represent cart items
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        toEntityId: productId,
        relationshipType: "purchased",
      });

      return connections.length > 0;
    });
}

/**
 * OrderService - Order Management Operations
 *
 * Manages orders using 6-dimension ontology:
 * - Orders are things with type: 'order'
 * - Order items stored in properties.items
 * - Order status tracked via events and thing status
 * - Connections link user to orders
 */

import { Effect } from "effect";
import { ThingService } from "./ThingService";
import { ConnectionService } from "./ConnectionService";
import { EventService } from "./EventService";

// ============================================================================
// TYPES
// ============================================================================

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  selectedSku: string;
  selectedSize?: string;
  selectedColor?: string;
  priceAtPurchase: number;
  subtotal: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderProperties {
  orderNumber: string; // Unique order number (e.g., "ORD-2024-00001")
  items: OrderItem[];
  subtotal: number; // Sum of items
  shipping: number; // Shipping cost
  tax: number; // Tax amount
  total: number; // Final total
  currency: string; // "usd"
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentIntentId?: string; // Stripe payment intent ID
  customerEmail: string;
  customerName: string;
  notes?: string;
}

export type OrderStatus =
  | "pending" // Order created, awaiting payment
  | "paid" // Payment received
  | "processing" // Being prepared
  | "shipped" // In transit
  | "delivered" // Completed
  | "cancelled" // Cancelled
  | "refunded"; // Refunded

export interface CreateOrderInput {
  userId: string;
  groupId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  customerEmail: string;
  customerName: string;
  notes?: string;
}

// ============================================================================
// ORDER SERVICE
// ============================================================================

export class OrderService {
  /**
   * Create order from cart
   */
  static createFromCart = (input: CreateOrderInput) =>
    Effect.gen(function* () {
      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
      const shipping = OrderService.calculateShipping(subtotal);
      const tax = OrderService.calculateTax(subtotal, input.shippingAddress.state);
      const total = subtotal + shipping + tax;

      // Generate order number
      const orderNumber = yield* OrderService.generateOrderNumber();

      // Create order thing
      const orderId = yield* ThingService.create({
        type: "order",
        name: `Order ${orderNumber}`,
        groupId: input.groupId,
        properties: {
          orderNumber,
          items: input.items,
          subtotal,
          shipping,
          tax,
          total,
          currency: "usd",
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress || input.shippingAddress,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          notes: input.notes,
        } as OrderProperties,
        status: "draft", // Will change to "pending" after payment intent created
      });

      // Create connection: user owns order
      yield* ConnectionService.create({
        fromEntityId: input.userId,
        toEntityId: orderId,
        relationshipType: "owns",
        groupId: input.groupId,
        metadata: {
          orderNumber,
          total,
          createdAt: Date.now(),
        },
      });

      // Log order created event
      yield* EventService.create({
        type: "order_placed",
        actorId: input.userId,
        targetId: orderId,
        groupId: input.groupId,
        metadata: {
          orderNumber,
          total,
          itemCount: input.items.length,
        },
      });

      return { orderId, orderNumber, total };
    });

  /**
   * Get order by ID
   */
  static get = (id: string) => ThingService.get(id);

  /**
   * Get user's orders
   */
  static listUserOrders = (userId: string, limit?: number) =>
    Effect.gen(function* () {
      // Get order connections
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        relationshipType: "owns",
      });

      // Filter for orders and get order details
      const orderIds = connections
        .map((conn: any) => conn.toEntityId)
        .slice(0, limit);

      const orders = yield* Effect.all(
        orderIds.map((id: string) => ThingService.get(id))
      );

      // Filter only order things and sort by creation date
      return orders
        .filter((thing: any) => thing.type === "order")
        .sort((a: any, b: any) => b.createdAt - a.createdAt);
    });

  /**
   * Update order status
   */
  static updateStatus = (orderId: string, status: OrderStatus, actorId: string) =>
    Effect.gen(function* () {
      // Get current order
      const order = yield* ThingService.get(orderId);
      const currentStatus = order.status;

      // Update status
      yield* ThingService.changeStatus(orderId, status as any);

      // Log status change event
      yield* EventService.create({
        type: "order_status_changed",
        actorId,
        targetId: orderId,
        metadata: {
          previousStatus: currentStatus,
          newStatus: status,
          changedAt: Date.now(),
        },
      });

      // Log specific status events
      if (status === "paid") {
        yield* EventService.create({
          type: "order_paid",
          actorId,
          targetId: orderId,
          metadata: {
            paidAt: Date.now(),
          },
        });
      } else if (status === "shipped") {
        yield* EventService.create({
          type: "order_shipped",
          actorId,
          targetId: orderId,
          metadata: {
            shippedAt: Date.now(),
          },
        });
      } else if (status === "delivered") {
        yield* EventService.create({
          type: "order_delivered",
          actorId,
          targetId: orderId,
          metadata: {
            deliveredAt: Date.now(),
          },
        });
      }
    });

  /**
   * Update payment intent ID
   */
  static updatePaymentIntent = (orderId: string, paymentIntentId: string) =>
    Effect.gen(function* () {
      const order = yield* ThingService.get(orderId);
      const props = order.properties as OrderProperties;

      yield* ThingService.update(orderId, {
        properties: {
          ...props,
          paymentIntentId,
        },
      });
    });

  /**
   * Get order by order number
   */
  static getByOrderNumber = (orderNumber: string, groupId: string) =>
    Effect.gen(function* () {
      const orders = yield* ThingService.list({
        type: "order",
      });

      const order = orders.find(
        (o) => (o.properties as OrderProperties).orderNumber === orderNumber
      );

      if (!order) {
        return yield* Effect.fail(
          new Error(`Order not found: ${orderNumber}`)
        );
      }

      return order;
    });

  /**
   * Cancel order
   */
  static cancel = (orderId: string, actorId: string, reason?: string) =>
    Effect.gen(function* () {
      yield* OrderService.updateStatus(orderId, "cancelled", actorId);

      yield* EventService.create({
        type: "order_cancelled",
        actorId,
        targetId: orderId,
        metadata: {
          reason,
          cancelledAt: Date.now(),
        },
      });
    });

  /**
   * Process refund
   */
  static refund = (orderId: string, actorId: string, amount: number) =>
    Effect.gen(function* () {
      const order = yield* ThingService.get(orderId);
      const props = order.properties as OrderProperties;

      yield* OrderService.updateStatus(orderId, "refunded", actorId);

      yield* EventService.create({
        type: "order_refunded",
        actorId,
        targetId: orderId,
        metadata: {
          refundAmount: amount,
          originalTotal: props.total,
          refundedAt: Date.now(),
        },
      });
    });

  /**
   * Get order history (all events)
   */
  static getHistory = (orderId: string) =>
    Effect.gen(function* () {
      return yield* EventService.listByTarget(orderId);
    });

  /**
   * Generate unique order number
   */
  private static generateOrderNumber = () =>
    Effect.gen(function* () {
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `ORD-${year}-${timestamp}-${random}`;
    });

  /**
   * Calculate shipping cost based on subtotal
   */
  private static calculateShipping = (subtotal: number): number => {
    // Free shipping over $100
    if (subtotal >= 10000) return 0;

    // Flat rate shipping
    return 999; // $9.99
  };

  /**
   * Calculate tax based on location
   */
  private static calculateTax = (subtotal: number, state: string): number => {
    // Simple tax calculation (in real app, use tax API)
    const taxRates: Record<string, number> = {
      CA: 0.0725, // California
      NY: 0.08, // New York
      TX: 0.0625, // Texas
      FL: 0.06, // Florida
      // Add more states as needed
    };

    const rate = taxRates[state] || 0;
    return Math.round(subtotal * rate);
  };

  /**
   * Get order statistics for admin
   */
  static getStatistics = (groupId: string, since?: number, until?: number) =>
    Effect.gen(function* () {
      const orders = yield* ThingService.list({
        type: "order",
      });

      // Filter by date range if provided
      const filteredOrders = orders.filter((order: any) => {
        if (since && order.createdAt < since) return false;
        if (until && order.createdAt > until) return false;
        return true;
      });

      // Calculate statistics
      const totalRevenue = filteredOrders.reduce((sum: number, order: any) => {
        const props = order.properties as OrderProperties;
        return sum + props.total;
      }, 0);

      const ordersByStatus = filteredOrders.reduce((acc: Record<string, number>, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalOrders: filteredOrders.length,
        totalRevenue,
        averageOrderValue: totalRevenue / filteredOrders.length || 0,
        ordersByStatus,
      };
    });
}

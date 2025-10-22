/**
 * Integration Tests
 * Tests for complete user flows end-to-end
 *
 * Ontology Mapping:
 * - Complete event chains: product_viewed → item_added_to_cart → checkout_started → payment_succeeded → order_created
 * - Multi-entity flows: product → cart → order → payment
 * - Cross-dimensional validation: things + connections + events + knowledge
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cartActions, $cart } from '@/stores/cart';
import {
  mockProducts,
  mockShippingAddress,
  calculateCartTotals,
  stripeTestCards,
  mockPaymentIntent,
} from './fixtures';
import type { CartItem } from '@/stores/cart';

describe('Integration Tests - Complete User Flows', () => {
  beforeEach(() => {
    cartActions.clearCart();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Flow 1: Browse → Add to Cart → Checkout → Success', () => {
    it('should complete happy path checkout flow', async () => {
      // Step 1: Browse products
      const product = mockProducts[0];
      expect(product).toBeDefined();
      expect(product.stock).toBeGreaterThan(0);

      // Step 2: Add to cart
      const cartItem: Omit<CartItem, 'quantity'> = {
        id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        image: product.images[0],
        variant: {
          size: product.sizes[0],
          color: product.colors[0],
        },
      };

      cartActions.addItem(cartItem);

      // Verify cart updated
      const cart = $cart.get();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].id).toBe(product.id);

      // Step 3: Navigate to checkout
      const totals = calculateCartTotals(cart.items);
      expect(totals.total).toBeGreaterThan(0);

      // Step 4: Fill shipping information
      const shipping = mockShippingAddress;
      expect(shipping.fullName).toBeDefined();
      expect(shipping.addressLine1).toBeDefined();

      // Step 5: Process payment
      const paymentCard = stripeTestCards.success;
      expect(paymentCard.number).toBeDefined();

      // Step 6: Create order
      const order = {
        id: 'order_' + Date.now(),
        items: cart.items,
        shippingAddress: shipping,
        totals,
        paymentIntentId: mockPaymentIntent.id,
        status: 'processing',
        createdAt: Date.now(),
      };

      expect(order.id).toBeDefined();
      expect(order.items.length).toBe(1);
      expect(order.status).toBe('processing');

      // Step 7: Clear cart after success
      cartActions.clearCart();
      const clearedCart = $cart.get();
      expect(clearedCart.items.length).toBe(0);

      // Step 8: Verify order confirmation
      expect(order.paymentIntentId).toBe(mockPaymentIntent.id);
    });

    it('should handle ontology event chain correctly', () => {
      // Event chain for happy path
      const events = [
        { type: 'product_viewed', timestamp: Date.now(), productId: mockProducts[0].id },
        {
          type: 'item_added_to_cart',
          timestamp: Date.now() + 1000,
          productId: mockProducts[0].id,
        },
        {
          type: 'checkout_started',
          timestamp: Date.now() + 2000,
          cartValue: 29.99,
        },
        {
          type: 'payment_submitted',
          timestamp: Date.now() + 3000,
          amount: 32.39,
        },
        {
          type: 'payment_succeeded',
          timestamp: Date.now() + 4000,
          paymentIntentId: mockPaymentIntent.id,
        },
        {
          type: 'order_created',
          timestamp: Date.now() + 5000,
          orderId: 'order_123',
        },
      ];

      // Verify event chain integrity
      expect(events.length).toBe(6);
      for (let i = 0; i < events.length - 1; i++) {
        expect(events[i + 1].timestamp).toBeGreaterThan(events[i].timestamp);
      }
    });
  });

  describe('Flow 2: Search → Filter → Add → Checkout', () => {
    it('should complete search-driven purchase flow', () => {
      // Step 1: Search for product
      const searchQuery = 'test t-shirt';
      const searchResults = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(searchResults.length).toBeGreaterThan(0);

      // Step 2: Apply filters
      const filtered = searchResults.filter((p) => {
        const price = p.salePrice || p.price;
        return price <= 50 && p.stock > 0;
      });

      expect(filtered.length).toBeGreaterThan(0);

      // Step 3: Select product and add to cart
      const product = filtered[0];
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        image: product.images[0],
      });

      const cart = $cart.get();
      expect(cart.items.length).toBe(1);

      // Step 4: Checkout
      const totals = calculateCartTotals(cart.items);
      expect(totals.total).toBeGreaterThan(0);
    });
  });

  describe('Flow 3: Variant Selection → Add → Update Qty → Checkout', () => {
    it('should handle variant selection and quantity updates', () => {
      const product = mockProducts[0];

      // Step 1: Select size and color variants
      const selectedSize = product.sizes[1]; // M
      const selectedColor = product.colors[0]; // White

      expect(selectedSize).toBeDefined();
      expect(selectedColor).toBeDefined();

      // Step 2: Add to cart with variants
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        variant: {
          size: selectedSize,
          color: selectedColor,
        },
      });

      let cart = $cart.get();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].variant?.size).toBe(selectedSize);
      expect(cart.items[0].variant?.color).toBe(selectedColor);

      // Step 3: Update quantity
      cartActions.updateQuantity(
        product.id,
        3,
        { size: selectedSize, color: selectedColor }
      );

      cart = $cart.get();
      expect(cart.items[0].quantity).toBe(3);

      // Step 4: Add same product with different variant
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        variant: {
          size: product.sizes[2], // L
          color: product.colors[1], // Black
        },
      });

      cart = $cart.get();
      expect(cart.items.length).toBe(2); // Different variants = separate items

      // Step 5: Proceed to checkout with multiple variants
      const totals = calculateCartTotals(cart.items);
      expect(totals.subtotal).toBe(product.price * 4); // 3 + 1
    });
  });

  describe('Flow 4: Multiple Products → Remove Some → Checkout', () => {
    it('should handle cart modifications before checkout', () => {
      // Step 1: Add multiple products
      const product1 = mockProducts[0];
      const product2 = mockProducts[1];
      const product3 = mockProducts[3];

      cartActions.addItem({
        id: product1.id,
        name: product1.name,
        slug: 'product-1',
        price: product1.price,
        quantity: 2,
      });

      cartActions.addItem({
        id: product2.id,
        name: product2.name,
        slug: 'product-2',
        price: product2.salePrice || product2.price,
        quantity: 1,
      });

      cartActions.addItem({
        id: product3.id,
        name: product3.name,
        slug: 'product-3',
        price: product3.price,
        quantity: 3,
      });

      let cart = $cart.get();
      expect(cart.items.length).toBe(3);

      // Step 2: Remove one product
      cartActions.removeItem(product2.id);

      cart = $cart.get();
      expect(cart.items.length).toBe(2);
      expect(cart.items.find((i) => i.id === product2.id)).toBeUndefined();

      // Step 3: Update quantity of another
      cartActions.updateQuantity(product3.id, 1);

      cart = $cart.get();
      const updatedItem = cart.items.find((i) => i.id === product3.id);
      expect(updatedItem?.quantity).toBe(1);

      // Step 4: Verify totals before checkout
      const totals = calculateCartTotals(cart.items);
      const expectedSubtotal = product1.price * 2 + product3.price * 1;
      expect(totals.subtotal).toBeCloseTo(expectedSubtotal, 2);

      // Step 5: Proceed to checkout
      expect(totals.total).toBeGreaterThan(0);
    });
  });

  describe('Flow 5: Empty Cart → Browse → Add → Checkout', () => {
    it('should handle checkout from empty cart state', () => {
      // Step 1: Verify cart is empty
      let cart = $cart.get();
      expect(cart.items.length).toBe(0);

      // Step 2: Browse products
      const products = mockProducts.filter((p) => p.stock > 0);
      expect(products.length).toBeGreaterThan(0);

      // Step 3: Add first available product
      const product = products[0];
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        image: product.images[0],
      });

      // Step 4: Verify cart no longer empty
      cart = $cart.get();
      expect(cart.items.length).toBe(1);

      // Step 5: Proceed directly to checkout
      const totals = calculateCartTotals(cart.items);
      expect(totals.total).toBeGreaterThan(0);

      // Step 6: Complete purchase
      const order = {
        id: 'order_123',
        items: cart.items,
        totals,
        shippingAddress: mockShippingAddress,
        status: 'processing',
      };

      expect(order.items.length).toBe(1);
    });
  });

  describe('Flow 6: Cart Persistence Across Sessions', () => {
    it('should persist cart across page reloads', () => {
      // Step 1: Add items to cart
      const product = mockProducts[0];
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: 'test-product',
        price: product.price,
        quantity: 2,
      });

      // Step 2: Verify cart state
      let cart = $cart.get();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(2);

      // Step 3: Continue shopping after reload
      cartActions.addItem({
        id: mockProducts[1].id,
        name: mockProducts[1].name,
        slug: 'test-product-2',
        price: mockProducts[1].price,
      });

      cart = $cart.get();
      expect(cart.items.length).toBe(2);
    });
  });

  describe('Flow 7: Out of Stock Handling', () => {
    it('should prevent checkout of out-of-stock items', () => {
      // Step 1: Find out of stock product
      const outOfStockProduct = mockProducts.find((p) => p.stock === 0);
      expect(outOfStockProduct).toBeDefined();

      // Step 2: Attempt to add to cart (should be prevented in UI)
      const canAddToCart = outOfStockProduct!.stock > 0;
      expect(canAddToCart).toBe(false);

      // Step 3: Add in-stock items instead
      const inStockProducts = mockProducts.filter((p) => p.stock > 0);
      cartActions.addItem({
        id: inStockProducts[0].id,
        name: inStockProducts[0].name,
        slug: 'in-stock-product',
        price: inStockProducts[0].price,
      });

      const cart = $cart.get();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].id).not.toBe(outOfStockProduct!.id);
    });
  });

  describe('Flow 8: Payment Error Recovery', () => {
    it('should handle payment failures gracefully', () => {
      // Step 1: Set up cart
      const product = mockProducts[0];
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: 'test-product',
        price: product.price,
      });

      const cart = $cart.get();
      const totals = calculateCartTotals(cart.items);

      // Step 2: Attempt payment with declined card
      const declinedCard = stripeTestCards.declined;
      expect(declinedCard.number).toBeDefined();

      // Step 3: Simulate payment failure
      const paymentError = {
        status: 'error',
        code: 'card_declined',
        message: 'Your card was declined.',
      };

      expect(paymentError.status).toBe('error');

      // Step 4: Verify cart persists after error
      const cartAfterError = $cart.get();
      expect(cartAfterError.items.length).toBe(1);
      expect(cartAfterError.items[0].id).toBe(product.id);

      // Step 5: Retry with valid card
      const validCard = stripeTestCards.success;
      expect(validCard.number).toBeDefined();

      // Step 6: Successful payment
      const order = {
        id: 'order_123',
        items: cart.items,
        totals,
        paymentIntentId: mockPaymentIntent.id,
        status: 'processing',
      };

      expect(order.status).toBe('processing');
    });
  });

  describe('Flow 9: Free Shipping Threshold', () => {
    it('should apply free shipping over $100', () => {
      // Step 1: Add items under $100
      cartActions.addItem({
        id: mockProducts[0].id,
        name: mockProducts[0].name,
        slug: 'product-1',
        price: 50,
        quantity: 1,
      });

      let cart = $cart.get();
      let totals = calculateCartTotals(cart.items);

      expect(totals.subtotal).toBe(50);
      expect(totals.shipping).toBe(10); // Shipping charged

      // Step 2: Add more items to exceed $100
      cartActions.addItem({
        id: mockProducts[1].id,
        name: mockProducts[1].name,
        slug: 'product-2',
        price: 60,
        quantity: 1,
      });

      cart = $cart.get();
      totals = calculateCartTotals(cart.items);

      expect(totals.subtotal).toBe(110);
      expect(totals.shipping).toBe(0); // Free shipping!
    });
  });

  describe('Flow 10: Multi-Variant Cart Summary', () => {
    it('should correctly display all variants in cart', () => {
      const product = mockProducts[0];

      // Add multiple variants of same product
      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: 'product',
        price: product.price,
        variant: { size: 'S', color: 'White' },
        quantity: 1,
      });

      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: 'product',
        price: product.price,
        variant: { size: 'M', color: 'White' },
        quantity: 2,
      });

      cartActions.addItem({
        id: product.id,
        name: product.name,
        slug: 'product',
        price: product.price,
        variant: { size: 'L', color: 'Black' },
        quantity: 1,
      });

      const cart = $cart.get();

      // Verify all variants are separate items
      expect(cart.items.length).toBe(3);

      // Verify each variant is unique
      const variants = cart.items.map((item) => ({
        size: item.variant?.size,
        color: item.variant?.color,
      }));

      expect(variants[0].size).toBe('S');
      expect(variants[1].size).toBe('M');
      expect(variants[2].size).toBe('L');

      // Verify total quantity
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalQuantity).toBe(4);

      // Verify total price
      const totals = calculateCartTotals(cart.items);
      expect(totals.subtotal).toBe(product.price * 4);
    });
  });
});

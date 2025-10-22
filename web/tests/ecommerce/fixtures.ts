/**
 * Test Fixtures for Ecommerce Tests
 * Provides mock data for products, cart, orders, etc.
 */

import type { Product } from '@/types/products';
import type { CartItem } from '@/stores/cart';
import type { ShippingAddress } from '@/types/ecommerce';

/**
 * Sample Products
 */
export const mockProducts: Product[] = [
  {
    id: 'test-1',
    name: 'Test T-Shirt',
    description: 'A comfortable cotton t-shirt for testing',
    price: 29.99,
    category: 'men',
    subcategory: 'tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    ],
    isNew: true,
    isSale: false,
    stock: 50,
  },
  {
    id: 'test-2',
    name: 'Test Jeans',
    description: 'Comfortable denim jeans',
    price: 69.99,
    salePrice: 49.99,
    category: 'men',
    subcategory: 'bottoms',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    ],
    isNew: false,
    isSale: true,
    stock: 30,
  },
  {
    id: 'test-3',
    name: 'Test Jacket',
    description: 'Warm winter jacket',
    price: 129.99,
    category: 'men',
    subcategory: 'outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    images: [
      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80',
    ],
    isNew: true,
    isSale: false,
    stock: 0, // Out of stock
  },
  {
    id: 'test-4',
    name: 'Test Sneakers',
    description: 'Comfortable running sneakers',
    price: 89.99,
    category: 'men',
    subcategory: 'shoes',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['White', 'Black'],
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    ],
    isNew: false,
    isSale: false,
    stock: 100,
  },
  {
    id: 'test-5',
    name: 'Test Dress',
    description: 'Elegant evening dress',
    price: 149.99,
    category: 'women',
    subcategory: 'dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Red'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    ],
    isNew: true,
    isSale: false,
    stock: 25,
  },
];

/**
 * Sample Cart Items
 */
export const mockCartItems: CartItem[] = [
  {
    id: 'test-1',
    name: 'Test T-Shirt',
    slug: 'test-t-shirt',
    price: 29.99,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    variant: {
      size: 'M',
      color: 'White',
    },
  },
  {
    id: 'test-2',
    name: 'Test Jeans',
    slug: 'test-jeans',
    price: 49.99,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    variant: {
      size: '32',
      color: 'Blue',
    },
  },
];

/**
 * Sample Shipping Address
 */
export const mockShippingAddress: ShippingAddress = {
  fullName: 'John Doe',
  addressLine1: '123 Test Street',
  addressLine2: 'Apt 4B',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'USA',
  phone: '+1-555-0123',
};

/**
 * Empty Cart State
 */
export const emptyCart = {
  items: [],
  updatedAt: Date.now(),
};

/**
 * Cart with Items
 */
export const cartWithItems = {
  items: mockCartItems,
  updatedAt: Date.now(),
};

/**
 * Mock Stripe Test Cards
 * https://stripe.com/docs/testing
 */
export const stripeTestCards = {
  success: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '12',
    expYear: '2030',
  },
  declined: {
    number: '4000000000000002',
    cvc: '123',
    expMonth: '12',
    expYear: '2030',
  },
  requiresAuth: {
    number: '4000002500003155',
    cvc: '123',
    expMonth: '12',
    expYear: '2030',
  },
  insufficientFunds: {
    number: '4000000000009995',
    cvc: '123',
    expMonth: '12',
    expYear: '2030',
  },
};

/**
 * Mock Payment Intent Response
 */
export const mockPaymentIntent = {
  id: 'pi_test_123456789',
  client_secret: 'pi_test_123456789_secret_test',
  status: 'succeeded',
  amount: 10997, // $109.97 in cents
  currency: 'usd',
};

/**
 * Mock Filter Options
 */
export const mockFilterOptions = {
  categories: ['men', 'women', 'unisex'],
  subcategories: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'],
  priceRanges: [
    { min: 0, max: 50, label: 'Under $50' },
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 200, label: '$100 - $200' },
    { min: 200, max: 999999, label: 'Over $200' },
  ],
  sortOptions: [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
  ],
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // No shipping or tax for empty cart
  if (subtotal === 0) {
    return {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    };
  }

  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

/**
 * Create mock localStorage
 */
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

/**
 * Mock window.matchMedia for responsive tests
 */
export const mockMatchMedia = (width: number) => {
  return (query: string): MediaQueryList => {
    // Parse media query for min-width and max-width
    const minWidthMatch = query.match(/min-width:\s*(\d+)/);
    const maxWidthMatch = query.match(/max-width:\s*(\d+)/);

    let matches = true;

    if (minWidthMatch) {
      const minWidth = parseInt(minWidthMatch[1]);
      matches = matches && width >= minWidth;
    }

    if (maxWidthMatch) {
      const maxWidth = parseInt(maxWidthMatch[1]);
      matches = matches && width <= maxWidth;
    }

    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  };
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock IntersectionObserver for lazy loading tests
 */
export const createMockIntersectionObserver = () => {
  const callbacks: ((entries: IntersectionObserverEntry[]) => void)[] = [];

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];

    constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
      callbacks.push(callback);
    }

    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
    takeRecords = () => [];

    // Helper to trigger callbacks
    static trigger(entries: Partial<IntersectionObserverEntry>[]) {
      callbacks.forEach((cb) => cb(entries as IntersectionObserverEntry[]));
    }
  }

  return MockIntersectionObserver;
};

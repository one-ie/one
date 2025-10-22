/**
 * Shopping Cart State Management
 * Uses Nanostores for lightweight reactive state
 * Persists to localStorage for cart persistence across sessions
 */

import { atom, computed } from 'nanostores';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    size?: string;
    color?: string;
  };
  variants?: Record<string, string>; // Generic variant support
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}

// Load cart from localStorage
const loadCart = (): Cart => {
  if (typeof window === 'undefined') return { items: [], updatedAt: Date.now() };

  try {
    const stored = localStorage.getItem('shopping-cart');
    if (stored) {
      const cart = JSON.parse(stored) as Cart;
      return cart;
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }

  return { items: [], updatedAt: Date.now() };
};

// Save cart to localStorage
const saveCart = (cart: Cart): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

// Cart atom
export const $cart = atom<Cart>(loadCart());

// Cart drawer state (controls slide-out animation)
export const $cartDrawerOpen = atom<boolean>(false);

// Computed values
export const $cartCount = computed($cart, (cart) =>
  cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

export const $cartSubtotal = computed($cart, (cart) =>
  cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export const $cartTotal = computed($cart, (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Add shipping, tax calculations here if needed
  return subtotal;
});

// Cart actions
export const cartActions = {
  /**
   * Add item to cart or increase quantity if already exists
   * 🎉 Automatically opens the cart drawer with slide-out animation!
   */
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const cart = $cart.get();
    const existingItemIndex = cart.items.findIndex((i) => {
      // Check if same product and variant
      if (i.id !== item.id) return false;
      if (!i.variant && !item.variant) return true;
      if (!i.variant || !item.variant) return false;
      return (
        i.variant.size === item.variant.size &&
        i.variant.color === item.variant.color
      );
    });

    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Update quantity
      newItems = cart.items.map((i, idx) =>
        idx === existingItemIndex
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i
      );
    } else {
      // Add new item
      newItems = [...cart.items, { ...item, quantity: item.quantity || 1 }];
    }

    const newCart = { items: newItems, updatedAt: Date.now() };
    $cart.set(newCart);
    saveCart(newCart);

    // ✨ Automatically open cart drawer when item is added!
    $cartDrawerOpen.set(true);
  },

  /**
   * Remove item from cart
   */
  removeItem: (itemId: string, variant?: { size?: string; color?: string }) => {
    const cart = $cart.get();
    const newItems = cart.items.filter((item) => {
      if (item.id !== itemId) return true;
      if (!variant) return false;
      if (!item.variant) return true;
      return (
        item.variant.size !== variant.size ||
        item.variant.color !== variant.color
      );
    });

    const newCart = { items: newItems, updatedAt: Date.now() };
    $cart.set(newCart);
    saveCart(newCart);
  },

  /**
   * Update item quantity
   */
  updateQuantity: (
    itemId: string,
    quantity: number,
    variant?: { size?: string; color?: string }
  ) => {
    if (quantity <= 0) {
      cartActions.removeItem(itemId, variant);
      return;
    }

    const cart = $cart.get();
    const newItems = cart.items.map((item) => {
      if (item.id !== itemId) return item;
      if (variant) {
        if (
          item.variant?.size === variant.size &&
          item.variant?.color === variant.color
        ) {
          return { ...item, quantity };
        }
      } else if (!item.variant) {
        return { ...item, quantity };
      }
      return item;
    });

    const newCart = { items: newItems, updatedAt: Date.now() };
    $cart.set(newCart);
    saveCart(newCart);
  },

  /**
   * Clear entire cart
   */
  clearCart: () => {
    const newCart = { items: [], updatedAt: Date.now() };
    $cart.set(newCart);
    saveCart(newCart);
  },
};

import { atom } from 'nanostores';
import type { CartItem } from './types';

export const cartItems = atom<CartItem[]>([]);

export function addToCart(item: CartItem) {
  const currentItems = cartItems.get();
  const existingItemIndex = currentItems.findIndex(
    (i) =>
      i.product.id === item.product.id &&
      i.selectedSize === item.selectedSize &&
      i.selectedColor === item.selectedColor
  );

  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    const newItems = [...currentItems];
    newItems[existingItemIndex].quantity += item.quantity;
    cartItems.set(newItems);
  } else {
    // Add new item
    cartItems.set([...currentItems, item]);
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cartItems.get()));
  }
}

export function removeFromCart(productId: string, size: string, color: string) {
  const currentItems = cartItems.get();
  const newItems = currentItems.filter(
    (item) =>
      !(
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
      )
  );
  cartItems.set(newItems);

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(newItems));
  }
}

export function updateQuantity(
  productId: string,
  size: string,
  color: string,
  quantity: number
) {
  const currentItems = cartItems.get();
  const newItems = currentItems.map((item) => {
    if (
      item.product.id === productId &&
      item.selectedSize === size &&
      item.selectedColor === color
    ) {
      return { ...item, quantity };
    }
    return item;
  });
  cartItems.set(newItems);

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(newItems));
  }
}

export function clearCart() {
  cartItems.set([]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
  }
}

export function getCartTotal(): number {
  const items = cartItems.get();
  return items.reduce((total, item) => {
    const price = item.product.salePrice || item.product.price;
    return total + price * item.quantity;
  }, 0);
}

export function getCartCount(): number {
  const items = cartItems.get();
  return items.reduce((count, item) => count + item.quantity, 0);
}

// Load cart from localStorage on init
if (typeof window !== 'undefined') {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      cartItems.set(JSON.parse(savedCart));
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }
}

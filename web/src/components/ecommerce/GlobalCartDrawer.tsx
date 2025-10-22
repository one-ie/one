/**
 * Global Cart Drawer
 * Automatically slides out from right when items are added
 * Integrates with Nanostores for reactive cart updates
 */

import { useStore } from '@nanostores/react';
import { $cart, $cartDrawerOpen, cartActions, type CartItem } from '@/stores/cart';
import { CartDrawer } from './interactive/CartDrawer';

export function GlobalCartDrawer() {
  const cart = useStore($cart);
  const isOpen = useStore($cartDrawerOpen);

  const handleClose = () => {
    $cartDrawerOpen.set(false);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    cartActions.updateQuantity(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    cartActions.removeItem(itemId);
  };

  const handleCheckout = () => {
    // Close drawer and navigate to checkout
    $cartDrawerOpen.set(false);
    window.location.href = '/checkout';
  };

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={handleClose}
      items={cart.items}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
      onCheckout={handleCheckout}
    />
  );
}

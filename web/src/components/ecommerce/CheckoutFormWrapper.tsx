'use client';

import { useStore } from '@nanostores/react';
import { $cart, $cartTotal, $cartSubtotal, cartActions } from '@/stores/cart';
import { CheckoutForm } from './interactive/CheckoutForm';

export function CheckoutFormWrapper() {
  const cart = useStore($cart);
  const total = useStore($cartTotal);
  const subtotal = useStore($cartSubtotal);

  const handleSubmit = (data: any) => {
    console.log('Order submitted:', data);

    // Generate unique order ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${timestamp}-${random}`;

    // Store order data in localStorage for confirmation page
    const orderData = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: data.shippingAddress,
      subtotal: subtotal,
      shipping: 0, // Free shipping
      tax: 0,
      total: total,
      email: 'customer@example.com', // In production, get from auth
      status: 'confirmed',
    };

    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Clear cart and redirect
    cartActions.clearCart();
    window.location.href = '/account/order-confirmation';
  };

  return <CheckoutForm total={total} onSubmit={handleSubmit} />;
}

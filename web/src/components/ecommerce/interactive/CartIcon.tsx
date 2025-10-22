/**
 * Cart Icon Component (Interactive)
 * Shopping cart icon with animated badge and hover preview
 * Requires client:load hydration
 */

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cartCount, $cart, $cartSubtotal } from '@/stores/cart';

export function CartIcon() {
  const cartCount = useStore($cartCount);
  const cart = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const [showPreview, setShowPreview] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);

  // Animate badge when count changes
  useEffect(() => {
    if (cartCount > prevCount) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <a
        href="/cart"
        className="relative inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={`Shopping cart with ${cartCount} items`}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {cartCount > 0 && (
          <>
            <span
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-transform ${
                isPulsing ? 'animate-bounce scale-125' : 'scale-100'
              }`}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
            {/* Pulsing ring effect */}
            {isPulsing && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-ping rounded-full bg-primary opacity-75" />
            )}
          </>
        )}
      </a>

      {/* Mini Cart Preview */}
      {showPreview && cartCount > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h3>

            {/* Cart Items Preview (max 3) */}
            <div className="space-y-2">
              {cart.items.slice(0, 3).map((item) => (
                <div key={`${item.id}-${item.variant?.size}-${item.variant?.color}`} className="flex gap-2">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {cart.items.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{cart.items.length - 3} more {cart.items.length - 3 === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>

            {/* Subtotal */}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">Subtotal:</span>
              <span className="text-sm font-bold text-foreground">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* View Cart Button */}
            <a
              href="/cart"
              className="mt-3 block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Cart
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

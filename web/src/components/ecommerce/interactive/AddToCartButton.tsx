/**
 * Add to Cart Button Component (Interactive)
 * Standalone button with add to cart functionality
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { cartActions, type CartItem } from '@/stores/cart';

interface AddToCartButtonProps
  extends Omit<React.ComponentProps<'button'>, 'onClick'>,
    VariantProps<typeof buttonVariants> {
  product: Omit<CartItem, 'quantity'>;
  quantity?: number;
  onSuccess?: () => void;
}

export function AddToCartButton({
  product,
  quantity = 1,
  onSuccess,
  children,
  ...props
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    setIsAdding(true);

    // Add to cart
    cartActions.addItem({ ...product, quantity });

    // Show success state
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(true);
      onSuccess?.();

      // Reset success state
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 300);
  };

  return (
    <Button onClick={handleClick} disabled={isAdding || showSuccess} {...props}>
      {showSuccess ? (
        <>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Added!
        </>
      ) : isAdding ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Adding...
        </>
      ) : (
        children || 'Add to Cart'
      )}
    </Button>
  );
}

/**
 * Sticky Cart Bar Component (Mobile)
 * Appears on scroll past variant selector
 * Fixed position at bottom of screen
 * Requires client:load hydration
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { Product } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '../static/PriceDisplay';
import { cartActions } from '@/stores/cart';
import { toastActions } from './Toast';

interface StickyCartBarProps {
  product: Product;
  selectedVariants?: Record<string, string>;
  quantity?: number;
  triggerElementId?: string;
}

export function StickyCartBar({
  product,
  selectedVariants = {},
  quantity = 1,
  triggerElementId = 'variant-selector',
}: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const triggerElement = document.getElementById(triggerElementId);

      if (!triggerElement) {
        // Fallback: show after scrolling 300px
        setIsVisible(window.scrollY > 300);
        return;
      }

      const triggerRect = triggerElement.getBoundingClientRect();
      const triggerTop = triggerRect.top + window.scrollY;
      const currentScrollY = window.scrollY;

      // Show when scrolled past the trigger element
      // Hide when scrolling back up to the top
      if (currentScrollY > triggerTop + triggerRect.height) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    // Check on mount
    handleScroll();

    // Listen to scroll events with throttle
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [triggerElementId]);

  const handleAddToCart = async () => {
    setIsAdding(true);

    cartActions.addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.thumbnail,
      quantity,
      variants: selectedVariants,
    });

    toastActions.success('Added to cart', `${quantity}x ${product.name} added to your cart`);

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const variantText = Object.entries(selectedVariants)
    .map(([key, value]) => value)
    .filter(Boolean)
    .join(', ');

  return (
    <>
      {/* Mobile only - hidden on desktop */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-lg transition-transform duration-300 md:hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Product Image */}
          <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {product.name}
            </h3>
            {variantText && (
              <p className="text-xs text-muted-foreground truncate">
                {variantText}
              </p>
            )}
            <div className="mt-0.5">
              <PriceDisplay
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="sm"
              />
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            size="sm"
            className="flex-shrink-0 min-w-[100px]"
          >
            {isAdding ? (
              <>
                <svg
                  className="mr-1.5 h-3.5 w-3.5 animate-spin"
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
            ) : !product.inStock ? (
              'Out of Stock'
            ) : (
              <>
                <svg
                  className="mr-1.5 h-3.5 w-3.5"
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
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

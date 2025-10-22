/**
 * Product Card Component (Interactive)
 * Displays product with badges, wishlist, and quick add to cart
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import type { Product } from '@/types/ecommerce';
import { PriceDisplay } from '../static/PriceDisplay';
import { ReviewStars } from '../static/ReviewStars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickViewModal } from './QuickViewModal';
import { cartActions } from '@/stores/cart';
import { toastActions } from './Toast';
import { ViewersCounter } from './ViewersCounter';
import { WishlistButton, wishlistActions } from './Wishlist';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

// Check if product is new (created within last 7 days)
const isNewProduct = (createdAt: Date) => {
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreated <= 7;
};

// Check if low stock (less than 10 items)
const isLowStock = (inventory?: number) => {
  return inventory !== undefined && inventory > 0 && inventory < 10;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);

    cartActions.addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.thumbnail,
    });

    // Show success toast
    toastActions.success('Added to cart', `${product.name} has been added to your cart`);

    // Show feedback animation
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = wishlistActions.toggle(product.id);

    if (added) {
      toastActions.info('Added to wishlist', product.name);
    } else {
      toastActions.info('Removed from wishlist', product.name);
    }
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      {/* Product Image */}
      <a href={`/products/${product.slug}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </a>

      {/* Badges */}
      <div className="absolute left-2 top-2 flex flex-col gap-2">
        {!product.inStock && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Out of Stock
          </Badge>
        )}
        {product.featured && (
          <Badge className="bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="destructive" className="font-bold">
            -{discountPercent}% OFF
          </Badge>
        )}
        {isNewProduct(product.createdAt) && (
          <Badge className="bg-green-600 text-white">
            New
          </Badge>
        )}
        {isLowStock(product.inventory) && product.inStock && (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Badge
              variant="destructive"
              className="bg-red-600 text-white font-bold shadow-lg border-0"
            >
              Only {product.inventory} left!
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Wishlist & Quick View Buttons */}
      <div className="absolute right-2 top-2 flex flex-col gap-2">
        <div onClick={handleWishlistToggle}>
          <WishlistButton productId={product.id} />
        </div>
        <button
          onClick={() => setShowQuickView(true)}
          className="rounded-full bg-background/90 p-2 opacity-0 shadow transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-background"
          aria-label="Quick view"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <a href={`/products/${product.slug}`}>
          <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </a>

        {/* Real-time viewers counter */}
        <div className="mt-2">
          <ViewersCounter productId={product.id} size="sm" />
        </div>

        {product.rating && (
          <div className="mt-2">
            <ReviewStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          </div>
        )}

        <div className="mt-3">
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="md"
          />
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
          className="mt-4 w-full transition-all duration-200"
          size="sm"
        >
          {isAdding ? (
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
          ) : !product.inStock ? (
            'Out of Stock'
          ) : (
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </>
          )}
        </Button>

        {/* Low Stock Warning - Enhanced */}
        {isLowStock(product.inventory) && product.inStock && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Only {product.inventory} left in stock - order soon!</span>
          </motion.div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        open={showQuickView}
        onOpenChange={setShowQuickView}
      />
    </div>
  );
}

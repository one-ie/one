/**
 * Quick View Modal Component
 * Lightbox product preview without leaving listing page
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import type { Product } from '@/types/ecommerce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '../static/PriceDisplay';
import { ReviewStars } from '../static/ReviewStars';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { cartActions } from '@/stores/cart';
import { toastActions } from './Toast';

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
}: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const currentImage = product.images[currentImageIndex] || product.thumbnail;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

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
      onOpenChange(false);
    }, 600);
  };

  const handleViewFullDetails = () => {
    window.location.href = `/products/${product.slug}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />

              {/* Badges */}
              <div className="absolute left-2 top-2 flex flex-col gap-2">
                {!product.inStock && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    Out of Stock
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive" className="font-bold">
                    -{discountPercent}% OFF
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>

              {product.rating && (
                <div className="mt-2">
                  <ReviewStars
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <PriceDisplay
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                {product.variants.map((variant) => (
                  <VariantSelector
                    key={variant.id}
                    variant={variant}
                    selectedValue={selectedVariants[variant.id]}
                    onSelect={(value) =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [variant.id]: value,
                      }))
                    }
                  />
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.inventory || 999}
                disabled={!product.inStock}
              />
            </div>

            {/* Stock Status */}
            {product.inventory !== undefined && product.inStock && product.inventory < 10 && (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Only {product.inventory} left in stock
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAdding}
                className="w-full"
                size="lg"
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

              <Button
                onClick={handleViewFullDetails}
                variant="outline"
                className="w-full"
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

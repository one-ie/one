/**
 * Product Recommendations Carousel (Static with Interactive Elements)
 * Shows "You may also like" section with auto-scroll
 * Uses shadcn/ui Carousel component
 */

'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/types/ecommerce';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ProductCard } from '../interactive/ProductCard';
import Autoplay from 'embla-carousel-autoplay';

interface RecommendationsCarouselProps {
  products: Product[];
  title?: string;
  autoplay?: boolean;
  autoplayDelay?: number; // in milliseconds
}

export function RecommendationsCarousel({
  products,
  title = 'You May Also Like',
  autoplay = true,
  autoplayDelay = 5000,
}: RecommendationsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Initialize autoplay plugin
  const autoplayPlugin = autoplay
    ? Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      })
    : undefined;

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="text-sm text-muted-foreground">
          {current} / {count}
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={autoplayPlugin ? [autoplayPlugin] : undefined}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="md:basis-1/2 lg:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation arrows - always visible on desktop, hidden on mobile */}
          <div className="hidden md:block">
            <CarouselPrevious className="left-0 -translate-x-1/2" />
            <CarouselNext className="right-0 translate-x-1/2" />
          </div>
        </Carousel>

        {/* Status indicator */}
        {autoplay && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="text-xs text-muted-foreground">
              {isHovering ? 'Paused' : 'Auto-scrolling'}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current - 1
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Frequently Bought Together Variant
 * Shows bundle suggestions with discount pricing
 */
interface FrequentlyBoughtTogetherProps {
  mainProduct: Product;
  suggestions: Product[];
  bundleDiscount?: number; // Percentage discount for bundle
}

export function FrequentlyBoughtTogether({
  mainProduct,
  suggestions,
  bundleDiscount = 10,
}: FrequentlyBoughtTogetherProps) {
  const [selected, setSelected] = useState<string[]>(
    suggestions.slice(0, 2).map((p) => p.id)
  );

  const totalPrice = [mainProduct, ...suggestions.filter((p) => selected.includes(p.id))]
    .reduce((sum, p) => sum + p.price, 0);

  const discountedPrice = totalPrice * (1 - bundleDiscount / 100);
  const savings = totalPrice - discountedPrice;

  const toggleProduct = (productId: string) => {
    if (selected.includes(productId)) {
      setSelected(selected.filter((id) => id !== productId));
    } else {
      setSelected([...selected, productId]);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-xl font-bold text-foreground">Frequently Bought Together</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Save {bundleDiscount}% when you buy these items together
      </p>

      <div className="mt-6 space-y-4">
        {/* Main product (always included) */}
        <div className="flex items-center gap-4">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            ✓
          </div>
          <img
            src={mainProduct.thumbnail}
            alt={mainProduct.name}
            className="h-16 w-16 rounded-md object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{mainProduct.name}</p>
            <p className="text-sm font-bold text-primary">${mainProduct.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Suggested products (optional) */}
        {suggestions.map((product) => (
          <div key={product.id} className="flex items-center gap-4">
            <button
              onClick={() => toggleProduct(product.id)}
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                selected.includes(product.id)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground bg-background'
              }`}
            >
              {selected.includes(product.id) && (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth={2} fill="none" />
                </svg>
              )}
            </button>
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-16 w-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <p className="text-sm font-bold text-primary">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bundle pricing */}
      <div className="mt-6 space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="line-through text-muted-foreground">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span className="text-foreground">Bundle Price:</span>
          <div className="text-right">
            <span className="text-primary">${discountedPrice.toFixed(2)}</span>
            <span className="ml-2 text-sm font-normal text-green-600">
              Save ${savings.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Add bundle to cart */}
      <button className="mt-4 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
        Add Bundle to Cart ({selected.length + 1} items)
      </button>
    </div>
  );
}

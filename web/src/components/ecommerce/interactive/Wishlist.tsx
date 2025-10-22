/**
 * Wishlist Component (Interactive)
 * Displays saved wishlist items with localStorage persistence
 * Requires client:load hydration
 */

'use client';

import { useEffect, useState } from 'react';
import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';
import type { Product } from '@/types/ecommerce';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';

interface WishlistItem {
  productId: string;
  addedAt: number;
}

// Wishlist state
const $wishlist = atom<WishlistItem[]>([]);

// Initialize wishlist from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('wishlist');
  if (stored) {
    try {
      $wishlist.set(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse wishlist from localStorage', e);
    }
  }
}

// Persist wishlist to localStorage on changes
$wishlist.subscribe((wishlist) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }
});

// Wishlist actions
export const wishlistActions = {
  add: (productId: string) => {
    const current = $wishlist.get();
    if (!current.find((item) => item.productId === productId)) {
      $wishlist.set([...current, { productId, addedAt: Date.now() }]);
    }
  },

  remove: (productId: string) => {
    $wishlist.set($wishlist.get().filter((item) => item.productId !== productId));
  },

  toggle: (productId: string) => {
    const current = $wishlist.get();
    const exists = current.find((item) => item.productId === productId);
    if (exists) {
      wishlistActions.remove(productId);
      return false;
    } else {
      wishlistActions.add(productId);
      return true;
    }
  },

  isInWishlist: (productId: string): boolean => {
    return $wishlist.get().some((item) => item.productId === productId);
  },

  clear: () => {
    $wishlist.set([]);
  },
};

// Wishlist count badge (for header)
export function WishlistCount() {
  const wishlist = useStore($wishlist);

  if (wishlist.length === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
      {wishlist.length > 9 ? '9+' : wishlist.length}
    </span>
  );
}

// Wishlist page component
interface WishlistPageProps {
  allProducts: Product[]; // Pass all products to filter wishlist items
}

export function WishlistPage({ allProducts }: WishlistPageProps) {
  const wishlist = useStore($wishlist);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const wishlistProducts = allProducts.filter((product) =>
    wishlist.some((item) => item.productId === product.id)
  );

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <svg
          className="mx-auto h-24 w-24 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Start adding products you love to your wishlist
        </p>
        <Button className="mt-6" asChild>
          <a href="/shop">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
        <Button
          variant="outline"
          onClick={() => wishlistActions.clear()}
          size="sm"
        >
          Clear All
        </Button>
      </div>

      <p className="mt-2 text-muted-foreground">
        {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// Wishlist heart button (for product cards and PDP)
interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const wishlist = useStore($wishlist);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`rounded-full bg-background/90 p-2 shadow transition-all duration-200 hover:scale-110 hover:bg-background ${className}`}
        aria-label="Loading wishlist"
        disabled
      >
        <svg
          className="h-5 w-5 text-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  const isWishlisted = wishlist.some((item) => item.productId === productId);

  const handleToggle = () => {
    wishlistActions.toggle(productId);
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full bg-background/90 p-2 shadow transition-all duration-200 hover:scale-110 hover:bg-background ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`h-5 w-5 transition-colors ${
          isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'
        }`}
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

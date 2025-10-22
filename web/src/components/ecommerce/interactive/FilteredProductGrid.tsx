/**
 * Filtered Product Grid Component
 * Handles client-side filtering, sorting, and rendering of products
 * Works with FilterSidebar to provide real-time product filtering
 */

'use client';

import { useState, useMemo } from 'react';
import type { FilterOptions } from '@/types/ecommerce';
import { ProductCard } from './ProductCard';
import { ProductGrid } from '../static/ProductGrid';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  thumbnail: string;
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FilteredProductGridProps {
  products: Product[];
  collectionSlug: string;
  allCollections: Array<{ id: string; name: string; products?: string[] }>;
}

export function FilteredProductGrid({
  products,
  collectionSlug,
  allCollections
}: FilteredProductGridProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    inStockOnly: false,
    priceRange: undefined,
    sortBy: 'newest',
    rating: undefined,
  });

  // Filter and sort products based on current filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by collections (if other collections selected)
    if (filters.categories && filters.categories.length > 0) {
      const selectedCollectionSlugs = filters.categories;
      const allProductSlugs = new Set<string>();

      // Get all product slugs from selected collections
      selectedCollectionSlugs.forEach(collectionId => {
        const collection = allCollections.find(c => c.id === collectionId);
        if (collection?.products) {
          collection.products.forEach(slug => allProductSlugs.add(slug));
        }
      });

      // Filter to only show products in selected collections
      result = result.filter(p => allProductSlugs.has(p.slug));
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(p =>
        filters.tags!.some(tag => p.tags.includes(tag))
      );
    }

    // Filter by in stock
    if (filters.inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Filter by price range
    if (filters.priceRange) {
      result = result.filter(p =>
        p.price >= filters.priceRange!.min &&
        p.price <= filters.priceRange!.max
      );
    }

    // Filter by rating
    if (filters.rating) {
      result = result.filter(p => p.rating >= filters.rating!);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [products, filters, allCollections]);

  // Calculate min/max prices for slider
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 500 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10, // Round down to nearest 10
      max: Math.ceil(Math.max(...prices) / 10) * 10,  // Round up to nearest 10
    };
  }, [products]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <>
      {/* Filter callback - passed to parent via data attribute for FilterSidebar */}
      <div
        data-filter-handler="true"
        data-min-price={priceRange.min}
        data-max-price={priceRange.max}
        style={{ display: 'none' }}
      />

      {filteredProducts.length > 0 ? (
        <ProductGrid columns={3}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      ) : (
        <div className="py-16 text-center">
          <svg
            className="mx-auto h-16 w-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No products found</h3>
          <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {/* Product count */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </>
  );
}

// Export filter handler hook for parent component
export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    inStockOnly: false,
    priceRange: undefined,
    sortBy: 'newest',
    rating: undefined,
  });

  return { filters, setFilters };
}

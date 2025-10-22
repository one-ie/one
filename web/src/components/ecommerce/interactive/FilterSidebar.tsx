/**
 * Filter Sidebar Component (Interactive)
 * Advanced product filtering with price range slider, star ratings, and URL persistence
 * Requires client:load hydration
 */

'use client';

import { useState, useEffect } from 'react';
import type { FilterOptions } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';
import { PriceRangeSlider } from './PriceRangeSlider';

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; count?: number }>;
  tags: string[];
  onFilterChange?: (filters: FilterOptions) => void;
  isMobile?: boolean;
  maxPrice?: number;
  minPrice?: number;
}

export function FilterSidebar({
  categories,
  tags,
  onFilterChange,
  isMobile = false,
  maxPrice = 500,
  minPrice = 0,
}: FilterSidebarProps) {
  // Initialize from URL params
  const getInitialFilters = (): FilterOptions => {
    if (typeof window === 'undefined') {
      return {
        categories: [],
        tags: [],
        inStockOnly: false,
        priceRange: undefined,
        sortBy: 'newest',
      };
    }

    const params = new URLSearchParams(window.location.search);
    return {
      categories: params.get('categories')?.split(',').filter(Boolean) || [],
      tags: params.get('tags')?.split(',').filter(Boolean) || [],
      inStockOnly: params.get('inStock') === 'true',
      priceRange: params.get('minPrice') || params.get('maxPrice')
        ? {
            min: parseFloat(params.get('minPrice') || String(minPrice)),
            max: parseFloat(params.get('maxPrice') || String(maxPrice)),
          }
        : undefined,
      sortBy: (params.get('sort') as FilterOptions['sortBy']) || 'newest',
      rating: params.get('rating') ? parseInt(params.get('rating')!) : undefined,
    };
  };

  const [filters, setFilters] = useState<FilterOptions>(getInitialFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange?.min || minPrice,
    filters.priceRange?.max || maxPrice,
  ]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    filters.rating ? [filters.rating] : []
  );

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    sort: true,
    categories: true,
    price: true,
    rating: true,
    availability: true,
    tags: true,
  });

  // Update URL params when filters change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();

    if (filters.categories?.length) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.tags?.length) {
      params.set('tags', filters.tags.join(','));
    }
    if (filters.inStockOnly) {
      params.set('inStock', 'true');
    }
    if (filters.priceRange) {
      params.set('minPrice', String(filters.priceRange.min));
      params.set('maxPrice', String(filters.priceRange.max));
    }
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy);
    }
    if (filters.rating) {
      params.set('rating', String(filters.rating));
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Count active filters
  const activeFilterCount =
    (filters.categories?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories?.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...(filters.categories || []), categoryId];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags?.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...(filters.tags || []), tag];

    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handlePriceCommit = (value: number[]) => {
    const newFilters = {
      ...filters,
      priceRange: { min: value[0], max: value[1] },
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleRatingToggle = (rating: number) => {
    const newRatings = selectedRatings.includes(rating)
      ? selectedRatings.filter((r) => r !== rating)
      : [...selectedRatings, rating];

    setSelectedRatings(newRatings);

    // Use the highest selected rating
    const maxRating = newRatings.length > 0 ? Math.max(...newRatings) : undefined;

    const newFilters = {
      ...filters,
      rating: maxRating,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleInStockToggle = () => {
    const newFilters = { ...filters, inStockOnly: !filters.inStockOnly };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const newFilters: FilterOptions = {
      categories: [],
      tags: [],
      inStockOnly: false,
      priceRange: undefined,
      sortBy: 'newest',
      rating: undefined,
    };
    setFilters(newFilters);
    setPriceRange([minPrice, maxPrice]);
    setSelectedRatings([]);
    onFilterChange?.(newFilters);
  };

  // Remove single filter chip
  const removeFilter = (type: 'category' | 'tag' | 'price' | 'stock' | 'rating', value?: string) => {
    if (type === 'category' && value) {
      handleCategoryToggle(value);
    } else if (type === 'tag' && value) {
      handleTagToggle(value);
    } else if (type === 'price') {
      const newFilters = { ...filters, priceRange: undefined };
      setFilters(newFilters);
      setPriceRange([minPrice, maxPrice]);
      onFilterChange?.(newFilters);
    } else if (type === 'stock') {
      handleInStockToggle();
    } else if (type === 'rating') {
      setSelectedRatings([]);
      const newFilters = { ...filters, rating: undefined };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Active Filters ({activeFilterCount})
            </h3>
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.categories?.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return cat ? (
                <Badge
                  key={catId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => removeFilter('category', catId)}
                >
                  {cat.name}
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Badge>
              ) : null;
            })}
            {filters.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => removeFilter('tag', tag)}
              >
                {tag}
                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            ))}
            {filters.inStockOnly && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => removeFilter('stock')}
              >
                In Stock Only
                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            )}
            {filters.priceRange && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => removeFilter('price')}
              >
                ${filters.priceRange.min} - ${filters.priceRange.max}
                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            )}
            {filters.rating && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => removeFilter('rating')}
              >
                {filters.rating}+ Stars
                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sort By */}
      <Collapsible open={openSections.sort} onOpenChange={() => toggleSection('sort')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Sort By</h3>
          <svg
            className={`h-4 w-4 transition-transform ${openSections.sort ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Categories</h3>
            {filters.categories && filters.categories.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                {filters.categories.length}
              </Badge>
            )}
          </div>
          <svg
            className={`h-4 w-4 transition-transform ${openSections.categories ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center justify-between gap-2 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.categories?.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </div>
                {category.count !== undefined && (
                  <span className="text-xs text-muted-foreground">({category.count})</span>
                )}
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range Slider */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Price Range</h3>
            {filters.priceRange && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                1
              </Badge>
            )}
          </div>
          <svg
            className={`h-4 w-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <PriceRangeSlider
            min={minPrice}
            max={maxPrice}
            value={priceRange}
            onChange={(value) => setPriceRange(value)}
            onCommit={handlePriceCommit}
            step={5}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Star Rating Filter */}
      <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Customer Rating</h3>
            {filters.rating && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                1
              </Badge>
            )}
          </div>
          <svg
            className={`h-4 w-4 transition-transform ${openSections.rating ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={selectedRatings.includes(rating)}
                  onCheckedChange={() => handleRatingToggle(rating)}
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-foreground group-hover:text-primary transition-colors">
                    {rating === 5 ? '5 stars' : `${rating}+ stars`}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <Collapsible open={openSections.availability} onOpenChange={() => toggleSection('availability')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Availability</h3>
            {filters.inStockOnly && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                1
              </Badge>
            )}
          </div>
          <svg
            className={`h-4 w-4 transition-transform ${openSections.availability ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={handleInStockToggle}
              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-foreground">In Stock Only</span>
          </label>
        </CollapsibleContent>
      </Collapsible>

      {/* Tags */}
      {tags.length > 0 && (
        <Collapsible open={openSections.tags} onOpenChange={() => toggleSection('tags')}>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Tags</h3>
              {filters.tags && filters.tags.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                  {filters.tags.length}
                </Badge>
              )}
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${openSections.tags ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filters.tags?.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );

  // Mobile version with Sheet drawer
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full md:hidden">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return <FilterContent />;
}

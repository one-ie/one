/**
 * Product Search Component (Interactive)
 * Real-time search with suggestions and keyboard navigation
 * Requires client:load hydration
 */

'use client';

/* global Node */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '@/types/ecommerce';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { debounce } from '@/lib/utils';

interface ProductSearchProps {
  products: Product[];
  categories?: Array<{ id: string; name: string }>;
  onSearchResults?: (results: Product[]) => void;
  placeholder?: string;
  showResultsCount?: boolean;
}

export function ProductSearch({
  products,
  categories,
  onSearchResults,
  placeholder = 'Search products...',
  showResultsCount = true,
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [resultsCount, setResultsCount] = useState<number>(products.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recent-searches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to load recent searches:', e);
        }
      }
    }
  }, []);

  // Search function
  const performSearch = useCallback(
    (searchQuery: string, category: string | null = null) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setResultsCount(products.length);
        onSearchResults?.(products);
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const filtered = products.filter((product) => {
        const matchesQuery =
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery) ||
          product.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

        const matchesCategory = category
          ? product.category === category
          : true;

        return matchesQuery && matchesCategory;
      });

      setSuggestions(filtered.slice(0, 5));
      setResultsCount(filtered.length);
      onSearchResults?.(filtered);
    },
    [products, onSearchResults]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, category: string | null) => {
      performSearch(searchQuery, category);
    }, 300),
    [performSearch]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    debouncedSearch(newQuery, selectedCategory);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    performSearch(query, categoryId);
  };

  // Save search to recent
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: Product) => {
    setQuery(product.name);
    setShowSuggestions(false);
    saveRecentSearch(product.name);
    window.location.href = `/products/${product.slug}`;
  };

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    setQuery(search);
    performSearch(search, selectedCategory);
    setShowSuggestions(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          saveRecentSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl space-y-3">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              onSearchResults?.(products);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Results Count */}
      {showResultsCount && query.trim() && (
        <div className="text-sm text-muted-foreground">
          {resultsCount === 0 ? (
            <span>No products found for "{query}"</span>
          ) : (
            <span>
              {resultsCount} {resultsCount === 1 ? 'product' : 'products'} found
              {query && ` for "${query}"`}
            </span>
          )}
        </div>
      )}

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleCategoryChange(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim() || recentSearches.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                Recent Searches
              </p>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(search)}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-border p-2">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                Products
              </p>
              {suggestions.map((product, idx) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className={`flex w-full items-center gap-3 rounded p-2 text-left transition-colors ${
                    idx === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent'
                  }`}
                >
                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.trim() && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

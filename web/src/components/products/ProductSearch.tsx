import { useState, useMemo } from 'react';
import type { CollectionEntry } from 'astro:content';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from './ProductCard';
import { Search, X } from 'lucide-react';

interface ProductSearchProps {
  products: CollectionEntry<'products'>[];
  viewMode: 'list' | 'grid';
  gridColumns: '2' | '3' | '4';
}

export function ProductSearch({
  products,
  viewMode,
  gridColumns,
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.data.category));
    return Array.from(cats).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.data.name.toLowerCase().includes(query) ||
          product.data.description.toLowerCase().includes(query) ||
          product.data.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.data.category === selectedCategory
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter((product) => {
        const price = product.data.price;
        switch (priceFilter) {
          case 'under-50':
            return price < 50;
          case '50-100':
            return price >= 50 && price < 100;
          case '100-200':
            return price >= 100 && price < 200;
          case 'over-200':
            return price >= 200;
          default:
            return true;
        }
      });
    }

    // Stock filter
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter((product) => product.data.inStock);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter((product) => !product.data.inStock);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.data.featured ? 1 : 0) - (a.data.featured ? 1 : 0);
        case 'price-low':
          return a.data.price - b.data.price;
        case 'price-high':
          return b.data.price - a.data.price;
        case 'name-asc':
          return a.data.name.localeCompare(b.data.name);
        case 'name-desc':
          return b.data.name.localeCompare(a.data.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, priceFilter, stockFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setStockFilter('all');
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    priceFilter !== 'all' ||
    stockFilter !== 'all' ||
    sortBy !== 'featured';

  const gridColsClass = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[gridColumns];

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4" data-usal="fade-up duration-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-50">Under $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="over-200">Over $200</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {hasActiveFilters && (
          <Badge variant="secondary">Filters Active</Badge>
        )}
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">
            No products found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? `grid grid-cols-1 ${gridColsClass} gap-6`
              : 'space-y-4'
          }
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

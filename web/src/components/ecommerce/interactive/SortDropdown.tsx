/**
 * Sort Dropdown Component (Interactive)
 * Custom dropdown for sorting products with icons and sort preference persistence
 * Requires client:load hydration
 */

'use client';

/* global Node */

import { useState, useEffect, useRef } from 'react';
import type { FilterOptions } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { ChevronDown, TrendingUp, DollarSign, Clock, Star, Award } from 'lucide-react';

interface SortDropdownProps {
  value?: FilterOptions['sortBy'];
  onChange?: (sortBy: FilterOptions['sortBy']) => void;
  persistPreference?: boolean;
}

interface SortOption {
  value: FilterOptions['sortBy'];
  label: string;
  icon: React.ReactNode;
}

const sortOptions: SortOption[] = [
  {
    value: 'popular',
    label: 'Best Selling',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    value: 'newest',
    label: 'Newest Arrivals',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: 'rating',
    label: 'Highest Rated',
    icon: <Star className="h-4 w-4" />,
  },
];

export function SortDropdown({
  value = 'newest',
  onChange,
  persistPreference = true,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<FilterOptions['sortBy']>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load sort preference from localStorage
  useEffect(() => {
    if (persistPreference && typeof window !== 'undefined') {
      const saved = localStorage.getItem('product-sort-preference');
      if (saved && sortOptions.some((opt) => opt.value === saved)) {
        setSelectedSort(saved as FilterOptions['sortBy']);
        onChange?.(saved as FilterOptions['sortBy']);
      }
    }
  }, [persistPreference, onChange]);

  // Save sort preference to localStorage
  useEffect(() => {
    if (persistPreference && typeof window !== 'undefined') {
      localStorage.setItem('product-sort-preference', selectedSort || 'newest');
    }
  }, [selectedSort, persistPreference]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sortValue: FilterOptions['sortBy']) => {
    setSelectedSort(sortValue);
    setIsOpen(false);
    onChange?.(sortValue);
  };

  const selectedOption = sortOptions.find((opt) => opt.value === selectedSort);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="text-sm">{selectedOption?.label || 'Sort By'}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[220px] rounded-lg border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="p-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  selectedSort === option.value
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className={selectedSort === option.value ? 'text-primary' : 'text-muted-foreground'}>
                  {option.icon}
                </span>
                <span>{option.label}</span>
                {selectedSort === option.value && (
                  <Award className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

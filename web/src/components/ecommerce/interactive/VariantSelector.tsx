/**
 * Variant Selector Component (Interactive)
 * Size, color, and custom variant selection
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import type { ProductVariant } from '@/types/ecommerce';

interface VariantSelectorProps {
  variants?: ProductVariant[];
  variant?: ProductVariant; // Single variant mode
  selectedValue?: string; // For single variant mode
  onSelect?: (value: string) => void; // For single variant mode
  onChange?: (selections: Record<string, string>) => void; // For multiple variants
}

export function VariantSelector({
  variants,
  variant,
  selectedValue,
  onSelect,
  onChange
}: VariantSelectorProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Support both single variant and multiple variants
  const variantList = variant ? [variant] : (variants || []);

  const handleSelect = (variantName: string, optionValue: string) => {
    // Single variant mode uses onSelect
    if (variant && onSelect) {
      onSelect(optionValue);
      return;
    }

    // Multiple variants mode uses onChange
    const newSelections = {
      ...selections,
      [variantName]: optionValue,
    };
    setSelections(newSelections);
    onChange?.(newSelections);
  };

  // Use selectedValue for single variant mode, selections for multiple
  const getSelectedValue = (variantName: string) => {
    if (variant && selectedValue !== undefined) {
      return selectedValue;
    }
    return selections[variantName];
  };

  return (
    <div className="space-y-4">
      {variantList.map((variant) => (
        <div key={variant.id}>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {variant.name}
          </label>

          {variant.type === 'color' ? (
            // Color swatches
            <div className="flex flex-wrap gap-2">
              {variant.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(variant.name, option.value)}
                  disabled={option.inStock === false}
                  className={`group relative h-10 w-10 rounded-full border-2 transition-all ${
                    getSelectedValue(variant.name) === option.value
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-border hover:border-muted-foreground'
                  } ${option.inStock === false ? 'cursor-not-allowed opacity-50' : ''}`}
                  title={option.label}
                  aria-label={option.label}
                >
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-full w-full rounded-full"
                      style={{ backgroundColor: option.value }}
                    />
                  )}
                  {option.inStock === false && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-px w-full rotate-45 bg-destructive" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            // Size and other variants (buttons)
            <div className="flex flex-wrap gap-2">
              {variant.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(variant.name, option.value)}
                  disabled={option.inStock === false}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                    getSelectedValue(variant.name) === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-muted-foreground hover:bg-accent'
                  } ${option.inStock === false ? 'cursor-not-allowed opacity-50 line-through' : ''}`}
                >
                  {option.label}
                  {option.priceModifier && option.priceModifier !== 0 && (
                    <span className="ml-1 text-xs">
                      ({option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Selected value display */}
          {getSelectedValue(variant.name) && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: <span className="font-medium">{getSelectedValue(variant.name)}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

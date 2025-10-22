/**
 * Quantity Selector Component (Interactive)
 * Plus/minus buttons to adjust quantity
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  initialQuantity?: number;
  value?: number; // Allow controlled component
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange?: (quantity: number) => void;
}

export function QuantitySelector({
  initialQuantity = 1,
  value,
  min = 1,
  max = 99,
  disabled = false,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  // Use controlled value if provided, otherwise use internal state
  const currentQuantity = value !== undefined ? value : quantity;

  const handleDecrease = () => {
    if (currentQuantity > min) {
      const newQuantity = currentQuantity - 1;
      if (value === undefined) setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (currentQuantity < max) {
      const newQuantity = currentQuantity + 1;
      if (value === undefined) setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      if (value === undefined) setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={disabled || currentQuantity <= min}
        aria-label="Decrease quantity"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>

      <input
        type="number"
        value={currentQuantity}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-16 rounded-md border border-input bg-background px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        aria-label="Quantity"
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={disabled || currentQuantity >= max}
        aria-label="Increase quantity"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </div>
  );
}

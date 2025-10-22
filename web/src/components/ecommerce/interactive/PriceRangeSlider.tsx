/**
 * Beautiful Price Range Slider
 * Enhanced dual-thumb slider with live tooltips and smooth animations
 */

'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
  step?: number;
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  onCommit,
  step = 5,
}: PriceRangeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: number[]) => {
    // Snap to step increments
    const snappedMin = Math.round(newValue[0] / step) * step;
    const snappedMax = Math.round(newValue[1] / step) * step;
    setLocalValue([snappedMin, snappedMax]);
    onChange([snappedMin, snappedMax]);
  };

  const handleCommit = (newValue: number[]) => {
    setIsDragging(false);
    onCommit([newValue[0], newValue[1]]);
  };

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate percentage positions for tooltips
  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="relative space-y-5">
      {/* Price inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Minimum</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              $
            </span>
            <input
              type="number"
              value={localValue[0]}
              onChange={(e) => {
                const val = Math.max(min, Math.min(Number(e.target.value), localValue[1]));
                handleChange([val, localValue[1]]);
              }}
              onBlur={() => handleCommit(localValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommit(localValue);
                  e.currentTarget.blur();
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const newVal = Math.min(localValue[0] + step, localValue[1]);
                  handleChange([newVal, localValue[1]]);
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const newVal = Math.max(localValue[0] - step, min);
                  handleChange([newVal, localValue[1]]);
                }
              }}
              className="w-full rounded-lg border border-input bg-background pl-7 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              min={min}
              max={localValue[1]}
              step={step}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Maximum</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              $
            </span>
            <input
              type="number"
              value={localValue[1]}
              onChange={(e) => {
                const val = Math.min(max, Math.max(Number(e.target.value), localValue[0]));
                handleChange([localValue[0], val]);
              }}
              onBlur={() => handleCommit(localValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommit(localValue);
                  e.currentTarget.blur();
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const newVal = Math.min(localValue[1] + step, max);
                  handleChange([localValue[0], newVal]);
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const newVal = Math.max(localValue[1] - step, localValue[0]);
                  handleChange([localValue[0], newVal]);
                }
              }}
              className="w-full rounded-lg border border-input bg-background pl-7 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              min={localValue[0]}
              max={max}
              step={step}
            />
          </div>
        </div>
      </div>

      {/* Slider with tooltips */}
      <div className="relative px-1 py-6">
        {/* Tooltip for min value */}
        {isDragging && (
          <div
            className="absolute -top-1 transition-all duration-150 ease-out"
            style={{ left: `${minPercent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
              {formatPrice(localValue[0])}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
            </div>
          </div>
        )}

        {/* Tooltip for max value */}
        {isDragging && (
          <div
            className="absolute -top-1 transition-all duration-150 ease-out"
            style={{ left: `${maxPercent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
              {formatPrice(localValue[1])}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
            </div>
          </div>
        )}

        <Slider
          min={min}
          max={max}
          step={step}
          value={localValue}
          onValueChange={handleChange}
          onValueCommit={handleCommit}
          onPointerDown={handlePointerDown}
          className="w-full"
        />
      </div>

      {/* Range display and reset */}
      <div className="flex items-center justify-between text-xs">
        <div className="space-y-1">
          <div className="text-muted-foreground">
            Selected Range
          </div>
          <div className="font-semibold text-foreground text-sm">
            {formatPrice(localValue[0])} - {formatPrice(localValue[1])}
          </div>
        </div>
        {(localValue[0] !== min || localValue[1] !== max) && (
          <button
            onClick={() => {
              handleChange([min, max]);
              handleCommit([min, max]);
            }}
            className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Visual indicator bar */}
      <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-primary/20 transition-all"
          style={{
            left: '0%',
            width: `${minPercent}%`,
          }}
        />
        <div
          className="absolute h-full bg-primary transition-all"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        <div
          className="absolute h-full bg-primary/20 transition-all"
          style={{
            left: `${maxPercent}%`,
            width: `${100 - maxPercent}%`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Free Shipping Progress Bar Component
 * Shows progress toward free shipping threshold ($50)
 * Real-time updates as items are added/removed from cart
 * Requires client:load hydration
 */

'use client';

import { useStore } from '@nanostores/react';
import { $cartSubtotal } from '@/stores/cart';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Truck } from 'lucide-react';

interface FreeShippingProgressProps {
  threshold?: number;
}

export function FreeShippingProgress({ threshold = 50 }: FreeShippingProgressProps) {
  const subtotal = useStore($cartSubtotal);
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  const isEligible = subtotal >= threshold;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          {isEligible ? 'Free Shipping Unlocked!' : 'Free Shipping'}
        </h3>
      </div>

      {isEligible ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-medium">
            You qualify for free shipping!
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            Add <span className="font-semibold text-foreground">${remaining.toFixed(2)}</span> more for free shipping!
          </p>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${subtotal.toFixed(2)}</span>
              <span>${threshold.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

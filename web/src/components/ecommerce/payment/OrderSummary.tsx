/**
 * OrderSummary Component
 * Displays order line items, subtotal, shipping, tax, and total
 *
 * Usage:
 * <OrderSummary items={cartItems} calculation={orderCalculation} />
 */

import type { CartItem } from '@/types/products';
import type { OrderCalculation } from '@/types/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  items: CartItem[];
  calculation: OrderCalculation;
  showTitle?: boolean;
}

/**
 * Format currency with proper symbol and decimals
 */
function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe uses cents
}

/**
 * Get display price from CartItem
 */
function getDisplayPrice(item: CartItem): number {
  return item.price;
}

export function OrderSummary({
  items,
  calculation,
  showTitle = true,
}: OrderSummaryProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Your cart is empty
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Line Items */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const price = getDisplayPrice(item);
            const lineTotal = price * item.quantity;

            return (
              <div key={index} className="flex gap-3">
                {/* Product Image */}
                {item.image && (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {item.productName}
                      </p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                          {item.selectedColor && item.selectedSize && ' • '}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(lineTotal, calculation.currency)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × {formatCurrency(price, calculation.currency)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(calculation.subtotal, calculation.currency)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {calculation.shipping === 0
              ? 'FREE'
              : formatCurrency(calculation.shipping, calculation.currency)}
          </span>
        </div>

        {/* Tax */}
        {calculation.tax > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(calculation.tax, calculation.currency)}</span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span className="text-lg">
            {formatCurrency(calculation.total, calculation.currency)}
          </span>
        </div>

        {/* Item Count */}
        <p className="text-center text-xs text-muted-foreground">
          {items.reduce((sum, item) => sum + item.quantity, 0)} item
          {items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''} in
          cart
        </p>
      </CardContent>
    </Card>
  );
}

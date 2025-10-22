/**
 * Price Display Component (Static)
 * Formats and displays prices with optional compare-at price
 */

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({
  price,
  compareAtPrice,
  currency = 'USD',
  size = 'md',
}: PriceDisplayProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold text-foreground ${sizeClasses[size]}`}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(compareAtPrice!)}
          </span>
          <span className="rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
            -{discountPercentage}%
          </span>
        </>
      )}
    </div>
  );
}

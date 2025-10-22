/**
 * Product Skeleton Component (Static)
 * Loading placeholder for product cards
 * No hydration needed - pure presentation
 */

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Image Skeleton */}
      <div className="aspect-[4/5] animate-pulse bg-muted" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />

        {/* Rating */}
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />

        {/* Price */}
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />

        {/* Button */}
        <div className="h-9 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </>
  );
}

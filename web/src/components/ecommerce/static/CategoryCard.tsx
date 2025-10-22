/**
 * Collection Card Component (Static)
 * Displays collection with image and product count
 */

import type { Category } from '@/types/ecommerce';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <a
      href={`/collections/${category.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-16 w-16 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
        {category.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
        </p>
      </div>
    </a>
  );
}

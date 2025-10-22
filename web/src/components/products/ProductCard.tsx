import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { CollectionEntry } from 'astro:content';

interface ProductCardProps {
  product: CollectionEntry<'products'>;
  viewMode: 'list' | 'grid';
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const { name, description, price, compareAtPrice, images, category, inStock, featured, tags } = product.data;
  const slug = product.slug;
  const mainImage = images[0] || '/placeholder-product.jpg';
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <a href={`/products/${slug}`} className="flex flex-col md:flex-row">
          <div className="md:w-1/3 aspect-square relative overflow-hidden">
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {featured && (
              <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
            )}
            {hasDiscount && (
              <Badge className="absolute top-2 right-2 bg-red-500">
                -{discountPercent}%
              </Badge>
            )}
            {!inStock && (
              <Badge className="absolute bottom-2 left-2 bg-gray-500">
                Out of Stock
              </Badge>
            )}
          </div>
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-2xl font-semibold mb-1">{name}</h3>
                <Badge variant="outline" className="mb-2">
                  {category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${price.toFixed(2)}</div>
                {hasDiscount && (
                  <div className="text-sm text-muted-foreground line-through">
                    ${compareAtPrice.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{description}</p>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </a>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <a href={`/products/${slug}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {featured && (
            <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              -{discountPercent}%
            </Badge>
          )}
          {!inStock && (
            <Badge className="absolute bottom-2 left-2 bg-gray-500">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2 text-xs">
            {category}
          </Badge>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
        {tags && tags.length > 0 && (
          <CardFooter className="p-4 pt-0">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          </CardFooter>
        )}
      </a>
    </Card>
  );
}

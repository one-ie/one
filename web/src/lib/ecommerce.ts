/**
 * Ecommerce utility functions
 * Maps to ecommerce ontology: products, categories, collections
 * Follows ontology patterns for queries and data access
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import type {
  Product,
  ProductVariant,
  Category,
  ProductCollection,
  CartItem,
} from '@/types/products';

/**
 * Get all products
 */
export async function getAllProducts(): Promise<
  CollectionEntry<'products'>[]
> {
  const products = await getCollection('products');
  return products;
}

/**
 * Get products by category (connection: part_of)
 */
export async function getProductsByCategory(
  categorySlug: string
): Promise<CollectionEntry<'products'>[]> {
  const products = await getCollection('products');
  return products.filter((product) => product.data.category === categorySlug);
}

/**
 * Get products by collection (connection: belongs_to)
 */
export async function getProductsByCollection(
  collectionSlug: string
): Promise<CollectionEntry<'products'>[]> {
  const products = await getCollection('products');
  return products.filter(
    (product) =>
      product.data.collections && product.data.collections.includes(collectionSlug)
  );
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(
  limit?: number
): Promise<CollectionEntry<'products'>[]> {
  const products = await getCollection('products');
  const featured = products.filter((product) => product.data.featured === true);
  return limit ? featured.slice(0, limit) : featured;
}

/**
 * Get related products (same category, different product)
 */
export async function getRelatedProducts(
  product: CollectionEntry<'products'>,
  limit: number = 4
): Promise<CollectionEntry<'products'>[]> {
  const products = await getCollection('products');
  const related = products.filter(
    (p) =>
      p.data.category === product.data.category && p.slug !== product.slug
  );
  return related.slice(0, limit);
}

/**
 * Get products by tag (knowledge layer)
 */
export async function getProductsByTag(
  tag: string
): Promise<CollectionEntry<'products'>[]> {
  const products = await getCollection('products');
  return products.filter(
    (product) => product.data.tags && product.data.tags.includes(tag)
  );
}

/**
 * Get products in stock only
 */
export async function getInStockProducts(): Promise<
  CollectionEntry<'products'>[]
> {
  const products = await getCollection('products');
  return products.filter((product) => product.data.inStock === true);
}

/**
 * Calculate product price (handles variants and sales)
 */
export function calculatePrice(
  product: Product,
  variant?: ProductVariant
): number {
  if (variant) {
    return variant.price;
  }
  return product.price;
}

/**
 * Calculate compare at price (original price if on sale)
 */
export function getCompareAtPrice(
  product: Product,
  variant?: ProductVariant
): number | undefined {
  if (variant) {
    // Variants don't have compareAt price in our schema
    return undefined;
  }
  return product.compareAtPrice;
}

/**
 * Check if product is on sale
 */
export function isOnSale(product: Product): boolean {
  return (
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price
  );
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(product: Product): number {
  if (!isOnSale(product)) return 0;
  const discount =
    ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100;
  return Math.round(discount);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<
  CollectionEntry<'categories'>[]
> {
  const categories = await getCollection('categories');
  return categories.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<CollectionEntry<'categories'> | undefined> {
  const categories = await getCollection('categories');
  return categories.find((cat) => cat.slug === slug);
}

/**
 * Get all collections
 */
export async function getAllCollections(): Promise<
  CollectionEntry<'collections'>[]
> {
  return await getCollection('collections');
}

/**
 * Get featured collections
 */
export async function getFeaturedCollections(): Promise<
  CollectionEntry<'collections'>[]
> {
  const collections = await getCollection('collections');
  return collections.filter((collection) => collection.data.featured === true);
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(
  slug: string
): Promise<CollectionEntry<'collections'> | undefined> {
  const collections = await getCollection('collections');
  return collections.find((col) => col.slug === slug);
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Example tax calculation (10%)
  const tax = subtotal * 0.1;

  // Example shipping calculation (free over $50, otherwise $5)
  const shipping = subtotal >= 50 ? 0 : 5;

  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total,
    itemCount,
  };
}

/**
 * Search products by name or description
 */
export async function searchProducts(
  query: string
): Promise<CollectionEntry<'products'>[]> {
  const products = await getCollection('products');
  const lowerQuery = query.toLowerCase();

  return products.filter(
    (product) =>
      product.data.name.toLowerCase().includes(lowerQuery) ||
      product.data.description.toLowerCase().includes(lowerQuery) ||
      product.data.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get product variants that are in stock
 */
export function getInStockVariants(
  product: Product
): ProductVariant[] | undefined {
  if (!product.variants) return undefined;
  return product.variants.filter((variant) => variant.inStock === true);
}

/**
 * Get unique variant options (e.g., all available colors)
 */
export function getVariantOptions(
  product: Product,
  optionKey: string
): string[] {
  if (!product.variants) return [];

  const options = new Set<string>();
  product.variants.forEach((variant) => {
    if (variant.options[optionKey]) {
      options.add(variant.options[optionKey]);
    }
  });

  return Array.from(options);
}

/**
 * Find variant by options
 */
export function findVariant(
  product: Product,
  options: Record<string, string>
): ProductVariant | undefined {
  if (!product.variants) return undefined;

  return product.variants.find((variant) => {
    return Object.entries(options).every(
      ([key, value]) => variant.options[key] === value
    );
  });
}

/**
 * Check if any variant is in stock
 */
export function hasInStockVariant(product: Product): boolean {
  if (!product.variants) return product.inStock;
  return product.variants.some((variant) => variant.inStock === true);
}

/**
 * Get lowest price from product and variants
 */
export function getLowestPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return product.price;
  }

  const variantPrices = product.variants.map((v) => v.price);
  return Math.min(product.price, ...variantPrices);
}

/**
 * Get highest price from product and variants
 */
export function getHighestPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return product.price;
  }

  const variantPrices = product.variants.map((v) => v.price);
  return Math.max(product.price, ...variantPrices);
}

/**
 * Get price range string (e.g., "$29.99 - $85.00")
 */
export function getPriceRange(product: Product, currency = 'USD'): string {
  const lowest = getLowestPrice(product);
  const highest = getHighestPrice(product);

  if (lowest === highest) {
    return formatCurrency(lowest, currency);
  }

  return `${formatCurrency(lowest, currency)} - ${formatCurrency(
    highest,
    currency
  )}`;
}

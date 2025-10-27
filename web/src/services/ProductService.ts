/**
 * ProductService - Ecommerce Product Operations
 *
 * Manages products using the 6-dimension ontology:
 * - Products are things with type: 'product'
 * - Categories are stored in properties.category
 * - Variants (sizes, colors) in properties.variants
 */

import { Effect } from "effect";
import { ThingService } from "./ThingService";
import { ConnectionService } from "./ConnectionService";
import { EventService } from "./EventService";

// ============================================================================
// TYPES
// ============================================================================

export interface ProductVariant {
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  priceModifier?: number; // Additional cost for this variant
}

export interface ProductProperties {
  category: string; // "t-shirts" | "hoodies" | "pants" | "accessories"
  price: number; // Base price in cents
  currency: string; // "usd"
  images: string[]; // Array of image URLs
  description: string;
  shortDescription?: string;
  variants: ProductVariant[];
  featured?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface CreateProductInput {
  name: string;
  properties: ProductProperties;
  groupId: string;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
}

export interface UpdateProductInput {
  name?: string;
  properties?: Partial<ProductProperties>;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
}

// ============================================================================
// PRODUCT SERVICE
// ============================================================================

export class ProductService {
  /**
   * Create a new product
   */
  static create = (input: CreateProductInput) =>
    Effect.gen(function* () {
      const productId = yield* ThingService.create({
        type: "product",
        name: input.name,
        properties: input.properties,
        status: input.status || "draft",
        groupId: input.groupId,
      });

      // Log product creation event
      yield* EventService.create({
        type: "product_created",
        actorId: "system", // TODO: Get from auth context
        targetId: productId,
        groupId: input.groupId,
        metadata: {
          category: input.properties.category,
          price: input.properties.price,
        },
      });

      return productId;
    });

  /**
   * Get product by ID
   */
  static get = (id: string) => ThingService.get(id);

  /**
   * Update product
   */
  static update = (id: string, input: UpdateProductInput) =>
    Effect.gen(function* () {
      yield* ThingService.update(id, input);

      // Log update event
      yield* EventService.create({
        type: "product_updated",
        actorId: "system",
        targetId: id,
        metadata: {
          updatedFields: Object.keys(input),
        },
      });
    });

  /**
   * List all products
   */
  static list = (groupId?: string, limit?: number) =>
    Effect.gen(function* () {
      // Note: groupId parameter is kept for API compatibility but not used in DataProvider
      // Group scoping should be handled at the caller level if needed
      return yield* ThingService.list({
        type: "product",
        status: "published",
        limit,
      });
    });

  /**
   * List products by category
   */
  static listByCategory = (category: string, groupId?: string) =>
    Effect.gen(function* () {
      const allProducts = yield* ProductService.list(groupId);

      return allProducts.filter(
        (product: any) =>
          (product.properties as ProductProperties).category === category
      );
    });

  /**
   * List featured products
   */
  static listFeatured = (groupId?: string, limit: number = 8) =>
    Effect.gen(function* () {
      const allProducts = yield* ProductService.list(groupId);

      const featured = allProducts.filter(
        (product: any) => (product.properties as ProductProperties).featured === true
      );

      return featured.slice(0, limit);
    });

  /**
   * Search products by name or description
   */
  static search = (query: string, groupId?: string) =>
    Effect.gen(function* () {
      const allProducts = yield* ProductService.list(groupId);
      const lowerQuery = query.toLowerCase();

      return allProducts.filter((product: any) => {
        const props = product.properties as ProductProperties;
        return (
          product.name.toLowerCase().includes(lowerQuery) ||
          props.description?.toLowerCase().includes(lowerQuery) ||
          props.tags?.some((tag: any) => tag.toLowerCase().includes(lowerQuery))
        );
      });
    });

  /**
   * Get product with reviews
   */
  static getWithReviews = (id: string) =>
    Effect.gen(function* () {
      const product = yield* ProductService.get(id);

      // Get review connections
      const reviewConnections = yield* ConnectionService.listTo(
        id,
        "review" as any
      );

      // Get review things
      const reviews = yield* Effect.all(
        reviewConnections.map((conn) => ThingService.get(conn.fromEntityId))
      );

      return {
        ...product,
        reviews,
        reviewCount: reviews.length,
        averageRating: ProductService.calculateAverageRating(reviews),
      };
    });

  /**
   * Calculate average rating from reviews
   */
  private static calculateAverageRating = (reviews: any[]): number => {
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce(
      (acc, review) => acc + (review.properties.rating || 0),
      0
    );
    return sum / reviews.length;
  };

  /**
   * Get related products (same category)
   */
  static getRelated = (id: string, limit: number = 4) =>
    Effect.gen(function* () {
      const product = yield* ProductService.get(id);
      const category = (product.properties as ProductProperties).category;

      const categoryProducts = yield* ProductService.listByCategory(category);

      // Exclude current product and limit results
      return categoryProducts.filter((p: any) => p._id !== id).slice(0, limit);
    });

  /**
   * Update product stock for a variant
   */
  static updateStock = (id: string, sku: string, newStock: number) =>
    Effect.gen(function* () {
      const product = yield* ProductService.get(id);
      const props = product.properties as ProductProperties;

      // Update variant stock
      const updatedVariants = props.variants.map((variant) =>
        variant.sku === sku ? { ...variant, stock: newStock } : variant
      );

      yield* ThingService.update(id, {
        properties: {
          ...props,
          variants: updatedVariants,
        },
      });

      // Log stock update event
      yield* EventService.create({
        type: "product_updated",
        actorId: "system",
        targetId: id,
        metadata: {
          action: "stock_updated",
          sku,
          newStock,
        },
      });
    });

  /**
   * Check if product variant is in stock
   */
  static checkStock = (id: string, sku: string) =>
    Effect.gen(function* () {
      const product = yield* ProductService.get(id);
      const props = product.properties as ProductProperties;

      const variant = props.variants.find((v) => v.sku === sku);
      return variant ? variant.stock > 0 : false;
    });

  /**
   * Get product categories (unique list)
   */
  static getCategories = (groupId?: string) =>
    Effect.gen(function* () {
      const allProducts = yield* ThingService.list({
        type: "product",
      });

      const categories = new Set(
        allProducts.map(
          (product: any) => (product.properties as ProductProperties).category
        )
      );

      return Array.from(categories);
    });

  /**
   * Publish product (change status to published)
   */
  static publish = (id: string) =>
    Effect.gen(function* () {
      yield* ThingService.changeStatus(id, "published");

      yield* EventService.create({
        type: "product_published",
        actorId: "system",
        targetId: id,
        metadata: {
          publishedAt: Date.now(),
        },
      });
    });

  /**
   * Archive product (soft delete)
   */
  static archive = (id: string) =>
    Effect.gen(function* () {
      yield* ThingService.delete(id); // Soft delete (changes status to archived)

      yield* EventService.create({
        type: "product_archived",
        actorId: "system",
        targetId: id,
        metadata: {
          archivedAt: Date.now(),
        },
      });
    });
}

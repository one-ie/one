/**
 * ReviewService - Product Review Operations
 *
 * Manages product reviews using 6-dimension ontology:
 * - Reviews are things with type: 'review'
 * - Connections link reviews to products (reviewed_by)
 * - Connections link users to reviews (owns)
 * - Events track review lifecycle
 */

import { Effect } from "effect";
import { ThingService } from "./ThingService";
import { ConnectionService } from "./ConnectionService";
import { EventService } from "./EventService";

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewProperties {
  rating: number; // 1-5 stars
  title: string;
  content: string;
  verified: boolean; // Did they purchase the product?
  helpful: number; // Count of helpful votes
  reported: boolean;
  images?: string[]; // Optional review images
}

export interface CreateReviewInput {
  userId: string;
  productId: string;
  groupId: string;
  rating: number;
  title: string;
  content: string;
  verified?: boolean;
  images?: string[];
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// REVIEW SERVICE
// ============================================================================

export class ReviewService {
  /**
   * Create a new review
   */
  static create = (input: CreateReviewInput) =>
    Effect.gen(function* () {
      // Validate rating
      if (input.rating < 1 || input.rating > 5) {
        return yield* Effect.fail(
          new Error("Rating must be between 1 and 5")
        );
      }

      // Check if user already reviewed this product
      const existing = yield* ReviewService.getUserReviewForProduct(
        input.userId,
        input.productId
      );

      if (existing.length > 0) {
        return yield* Effect.fail(
          new Error("You have already reviewed this product")
        );
      }

      // Create review thing
      const reviewId = yield* ThingService.create({
        type: "review",
        name: `Review by ${input.userId}`,
        groupId: input.groupId,
        properties: {
          rating: input.rating,
          title: input.title,
          content: input.content,
          verified: input.verified || false,
          helpful: 0,
          reported: false,
          images: input.images || [],
        } as ReviewProperties,
        status: "published",
      });

      // Create connection: review -> product (review)
      yield* ConnectionService.create({
        fromEntityId: reviewId,
        toEntityId: input.productId,
        relationshipType: "review" as any,
        groupId: input.groupId,
        metadata: {
          rating: input.rating,
          createdAt: Date.now(),
        },
      });

      // Create connection: user -> review (owns)
      yield* ConnectionService.create({
        fromEntityId: input.userId,
        toEntityId: reviewId,
        relationshipType: "owns",
        groupId: input.groupId,
        metadata: {
          createdAt: Date.now(),
        },
      });

      // Log review posted event
      yield* EventService.create({
        type: "review_posted",
        actorId: input.userId,
        targetId: input.productId,
        groupId: input.groupId,
        metadata: {
          reviewId,
          rating: input.rating,
        },
      });

      return reviewId;
    });

  /**
   * Get review by ID
   */
  static get = (id: string) => ThingService.get(id);

  /**
   * Update review
   */
  static update = (reviewId: string, userId: string, input: UpdateReviewInput) =>
    Effect.gen(function* () {
      // Verify user owns this review
      const isOwner = yield* ReviewService.isReviewOwner(reviewId, userId);
      if (!isOwner) {
        return yield* Effect.fail(
          new Error("You can only edit your own reviews")
        );
      }

      // Get current review
      const review = yield* ThingService.get(reviewId);
      const props = review.properties as ReviewProperties;

      // Update review
      yield* ThingService.update(reviewId, {
        properties: {
          ...props,
          ...input,
        },
      });

      // Log review updated event
      yield* EventService.create({
        type: "review_updated",
        actorId: userId,
        targetId: reviewId,
        metadata: {
          updatedFields: Object.keys(input),
        },
      });
    });

  /**
   * Delete review
   */
  static delete = (reviewId: string, userId: string) =>
    Effect.gen(function* () {
      // Verify user owns this review
      const isOwner = yield* ReviewService.isReviewOwner(reviewId, userId);
      if (!isOwner) {
        return yield* Effect.fail(
          new Error("You can only delete your own reviews")
        );
      }

      // Soft delete review
      yield* ThingService.delete(reviewId);

      // Log review deleted event
      yield* EventService.create({
        type: "review_deleted",
        actorId: userId,
        targetId: reviewId,
        metadata: {
          deletedAt: Date.now(),
        },
      });
    });

  /**
   * Get reviews for a product
   */
  static getProductReviews = (productId: string, limit?: number) =>
    Effect.gen(function* () {
      // Get review connections
      const connections = yield* ConnectionService.listTo(
        productId,
        "review" as any
      );

      // Get review details
      const reviewIds = limit
        ? connections.slice(0, limit).map((conn: any) => conn.fromEntityId)
        : connections.map((conn: any) => conn.fromEntityId);

      const reviews = yield* Effect.all(
        reviewIds.map((id: string) => ThingService.get(id))
      );

      // Get user details for each review
      const reviewsWithUsers: Review[] = [];
      for (const review of reviews) {
        const userConnections = yield* ConnectionService.listTo(review._id, "owns");
        const userId = userConnections[0]?.fromEntityId || "unknown";

        const user = userConnections[0]
          ? yield* ThingService.get(userId)
          : null as any;

        const props = review.properties as ReviewProperties;

        reviewsWithUsers.push({
          _id: review._id,
          userId,
          userName: user?.name || "Anonymous",
          productId,
          rating: props.rating,
          title: props.title,
          content: props.content,
          verified: props.verified,
          helpful: props.helpful,
          images: props.images,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        });
      }

      // Sort by most recent first
      return reviewsWithUsers.sort((a, b) => b.createdAt - a.createdAt);
    });

  /**
   * Get user's reviews
   */
  static getUserReviews = (userId: string, limit?: number) =>
    Effect.gen(function* () {
      // Get review connections
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        relationshipType: "owns",
      });

      // Filter for reviews and get details
      const reviewIds = connections
        .map((conn: any) => conn.toEntityId)
        .slice(0, limit);

      const reviews = yield* Effect.all(
        reviewIds.map((id: string) => ThingService.get(id))
      );

      return reviews.filter((thing: any) => thing.type === "review");
    });

  /**
   * Get user's review for specific product
   */
  static getUserReviewForProduct = (userId: string, productId: string) =>
    Effect.gen(function* () {
      const userReviews = yield* ReviewService.getUserReviews(userId);

      // Find review for this product
      const productReviews: any[] = [];

      for (const review of userReviews) {
        const productConnections = yield* ConnectionService.list({
          fromEntityId: review._id,
          toEntityId: productId,
          relationshipType: "review" as any,
        });

        if (productConnections.length > 0) {
          productReviews.push(review);
        }
      }

      return productReviews;
    });

  /**
   * Mark review as helpful
   */
  static markHelpful = (reviewId: string, userId: string) =>
    Effect.gen(function* () {
      const review = yield* ThingService.get(reviewId);
      const props = review.properties as ReviewProperties;

      // Increment helpful count
      yield* ThingService.update(reviewId, {
        properties: {
          ...props,
          helpful: props.helpful + 1,
        },
      });

      // Log helpful event
      yield* EventService.create({
        type: "review_marked_helpful",
        actorId: userId,
        targetId: reviewId,
        metadata: {
          newCount: props.helpful + 1,
        },
      });
    });

  /**
   * Report review
   */
  static report = (reviewId: string, userId: string, reason: string) =>
    Effect.gen(function* () {
      const review = yield* ThingService.get(reviewId);
      const props = review.properties as ReviewProperties;

      // Mark as reported
      yield* ThingService.update(reviewId, {
        properties: {
          ...props,
          reported: true,
        },
      });

      // Log report event
      yield* EventService.create({
        type: "review_reported",
        actorId: userId,
        targetId: reviewId,
        metadata: {
          reason,
          reportedAt: Date.now(),
        },
      });
    });

  /**
   * Calculate average rating for product
   */
  static getProductAverageRating = (productId: string) =>
    Effect.gen(function* () {
      const reviews = yield* ReviewService.getProductReviews(productId);

      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / reviews.length;

      return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal
        count: reviews.length,
      };
    });

  /**
   * Get rating distribution for product
   */
  static getRatingDistribution = (productId: string) =>
    Effect.gen(function* () {
      const reviews = yield* ReviewService.getProductReviews(productId);

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      reviews.forEach((review) => {
        distribution[review.rating as keyof typeof distribution]++;
      });

      return distribution;
    });

  /**
   * Check if user owns review
   */
  private static isReviewOwner = (reviewId: string, userId: string) =>
    Effect.gen(function* () {
      const connections = yield* ConnectionService.list({
        fromEntityId: userId,
        toEntityId: reviewId,
        relationshipType: "owns",
      });

      return connections.length > 0;
    });
}

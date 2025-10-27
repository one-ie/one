/**
 * Shop Services - Ecommerce functionality
 *
 * Exports all ecommerce services built on the 6-dimension ontology
 */

export { ProductService } from "./ProductService";
export type {
  ProductVariant,
  ProductProperties,
  CreateProductInput,
  UpdateProductInput,
} from "./ProductService";

export { CartService } from "./CartService";
export type { CartItemMetadata, CartItem, Cart } from "./CartService";

export { OrderService } from "./OrderService";
export type {
  OrderItem,
  ShippingAddress,
  OrderProperties,
  OrderStatus,
  CreateOrderInput,
} from "./OrderService";

export { ReviewService } from "./ReviewService";
export type {
  ReviewProperties,
  CreateReviewInput,
  UpdateReviewInput,
  Review,
} from "./ReviewService";

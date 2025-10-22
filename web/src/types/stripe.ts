/**
 * Stripe Payment Integration Types
 * Type-safe interfaces for Stripe Elements checkout
 */

/**
 * Request to create a Stripe PaymentIntent
 */
export interface PaymentIntentRequest {
  items: Array<{
    productId: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }>;
  currency?: string;
  metadata?: Record<string, string>;
}

/**
 * Response from PaymentIntent creation
 */
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

/**
 * Billing address for payment
 */
export interface BillingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Payment confirmation request
 */
export interface PaymentConfirmationRequest {
  paymentIntentId: string;
  billingAddress: BillingAddress;
}

/**
 * Order confirmation response
 */
export interface OrderConfirmation {
  success: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  items: OrderItem[];
  billingAddress: BillingAddress;
  createdAt: number;
  estimatedDelivery?: string;
}

/**
 * Order item details
 */
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  imageUrl?: string;
}

/**
 * Payment status response
 */
export interface PaymentStatusResponse {
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  paymentIntentId: string;
  amount: number;
  currency: string;
  orderId?: string;
  error?: string;
}

/**
 * Stripe error response
 */
export interface StripeError {
  type: 'card_error' | 'validation_error' | 'api_error' | 'network_error';
  code?: string;
  message: string;
  param?: string;
}

/**
 * Order calculation
 */
export interface OrderCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

/**
 * Stripe Elements appearance customization
 */
export interface StripeElementsAppearance {
  theme?: 'stripe' | 'night' | 'flat';
  variables?: {
    colorPrimary?: string;
    colorBackground?: string;
    colorText?: string;
    colorDanger?: string;
    fontFamily?: string;
    spacingUnit?: string;
    borderRadius?: string;
  };
}

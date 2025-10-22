/**
 * POST /api/checkout/confirm
 * Confirms payment and creates order record
 *
 * Security:
 * - Verifies PaymentIntent with Stripe
 * - Creates order only after payment confirmation
 * - Sends confirmation email
 */

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import type {
  PaymentConfirmationRequest,
  OrderConfirmation,
  OrderItem,
} from '@/types/stripe';

// Initialize Stripe
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ONE-${timestamp}-${random}`;
}

/**
 * Create order record in database
 * TODO: Replace with actual database call
 */
async function createOrder(
  paymentIntent: Stripe.PaymentIntent,
  request: PaymentConfirmationRequest
): Promise<OrderConfirmation> {
  // Parse items from metadata
  const items: OrderItem[] = JSON.parse(
    paymentIntent.metadata.items || '[]'
  ).map((item: any) => ({
    productId: item.productId,
    name: 'Product Name', // TODO: Get from database
    quantity: item.quantity,
    price: 2999, // TODO: Get from database
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
    imageUrl: '/placeholder.jpg', // TODO: Get from database
  }));

  // Calculate estimated delivery (7 business days)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  const order: OrderConfirmation = {
    success: true,
    orderId: paymentIntent.id,
    orderNumber: generateOrderNumber(),
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    items,
    billingAddress: request.billingAddress,
    createdAt: Date.now(),
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
  };

  // TODO: Save to database
  // await db.insert('orders', order);

  return order;
}

/**
 * Send order confirmation email
 * TODO: Integrate with Resend or email service
 */
async function sendConfirmationEmail(
  order: OrderConfirmation
): Promise<void> {
  // TODO: Integrate with @convex-dev/resend or Resend API
  console.log('Sending confirmation email to:', order.billingAddress.email);
  console.log('Order number:', order.orderNumber);

  // Example Resend integration:
  // const resend = new Resend(import.meta.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: import.meta.env.RESEND_FROM_EMAIL,
  //   to: order.billingAddress.email,
  //   subject: `Order Confirmation - ${order.orderNumber}`,
  //   html: `
  //     <h1>Thank you for your order!</h1>
  //     <p>Order Number: ${order.orderNumber}</p>
  //     <p>Total: $${(order.amount / 100).toFixed(2)}</p>
  //     <p>Estimated Delivery: ${order.estimatedDelivery}</p>
  //   `,
  // });
}

/**
 * Clear user's cart
 * TODO: Implement cart clearing logic
 */
async function clearCart(userId?: string): Promise<void> {
  // TODO: Clear cart in database or localStorage
  console.log('Clearing cart for user:', userId || 'guest');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = (await request.json()) as PaymentConfirmationRequest;

    // Validate request
    if (!body.paymentIntentId) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request: paymentIntentId is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.billingAddress) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request: billingAddress is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve PaymentIntent from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(
      body.paymentIntentId
    );

    // Verify payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({
          error: 'Payment not completed',
          status: paymentIntent.status,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create order record
    const order = await createOrder(paymentIntent, body);

    // Send confirmation email (async - don't wait)
    sendConfirmationEmail(order).catch((error) => {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the request if email fails
    });

    // Clear cart (async - don't wait)
    clearCart().catch((error) => {
      console.error('Failed to clear cart:', error);
      // Don't fail the request if cart clear fails
    });

    // Return order confirmation
    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          type: 'stripe_error',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({
        error: 'Failed to confirm payment',
        type: 'api_error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

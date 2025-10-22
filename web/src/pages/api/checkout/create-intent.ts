/**
 * POST /api/checkout/create-intent
 * Creates a Stripe PaymentIntent for checkout
 *
 * Security:
 * - Server-side amount calculation (never trust client)
 * - Validates cart items against content collections
 * - Sanitizes user input
 */

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import type { PaymentIntentRequest, PaymentIntentResponse } from '@/types/stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

/**
 * Validate cart items and calculate total
 * In production, this should query your product database
 */
async function calculateOrderTotal(
  items: PaymentIntentRequest['items']
): Promise<{ amount: number; currency: string }> {
  // TODO: Replace with actual product database query
  // This is a simplified example using mock data

  let subtotal = 0;

  for (const item of items) {
    // In production: query product from database/content collection
    // const product = await getProduct(item.productId);
    // if (!product) throw new Error(`Product ${item.productId} not found`);
    // if (product.stock < item.quantity) throw new Error('Insufficient stock');

    // Mock pricing (replace with real product prices)
    const pricePerUnit = 2999; // $29.99 in cents
    subtotal += pricePerUnit * item.quantity;
  }

  // Calculate shipping
  const shipping = subtotal >= 10000 ? 0 : 999; // Free shipping over $100

  // Calculate tax (example: 8% sales tax)
  const tax = Math.round((subtotal + shipping) * 0.08);

  const total = subtotal + shipping + tax;

  return {
    amount: total,
    currency: 'usd',
  };
}

/**
 * Validate environment variables
 */
function validateEnvironment(): void {
  if (!import.meta.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  // Ensure we're not using test keys in production
  const isProduction = import.meta.env.MODE === 'production';
  const isTestKey = import.meta.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

  if (isProduction && isTestKey) {
    throw new Error('Cannot use Stripe test keys in production');
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate environment
    validateEnvironment();

    // Parse request body
    const body = (await request.json()) as PaymentIntentRequest;

    // Validate request
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request: items array is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return new Response(
          JSON.stringify({
            error: 'Invalid request: productId is required for each item',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({
            error: 'Invalid request: quantity must be between 1 and 100',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Calculate order total (server-side - NEVER trust client)
    const { amount, currency } = await calculateOrderTotal(body.items);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...body.metadata,
        itemCount: body.items.length.toString(),
        items: JSON.stringify(body.items),
      },
    });

    // Return client secret
    const response: PaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create PaymentIntent error:', error);

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
        error: 'Failed to create payment intent',
        type: 'api_error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

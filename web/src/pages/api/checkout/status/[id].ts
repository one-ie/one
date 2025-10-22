/**
 * GET /api/checkout/status/[id]
 * Checks payment status and returns order details
 *
 * Security:
 * - Verifies PaymentIntent with Stripe
 * - Returns sanitized order information
 */

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import type { PaymentStatusResponse } from '@/types/stripe';

// Initialize Stripe
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

/**
 * Map Stripe PaymentIntent status to our status
 */
function mapPaymentStatus(
  stripeStatus: Stripe.PaymentIntent.Status
): PaymentStatusResponse['status'] {
  switch (stripeStatus) {
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'succeeded':
      return 'succeeded';
    case 'canceled':
      return 'canceled';
    case 'requires_capture':
      return 'processing';
    default:
      return 'failed';
  }
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const paymentIntentId = params.id;

    // Validate payment intent ID
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({
          error: 'Payment intent ID is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate ID format (Stripe PaymentIntent IDs start with 'pi_')
    if (!paymentIntentId.startsWith('pi_')) {
      return new Response(
        JSON.stringify({
          error: 'Invalid payment intent ID format',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    // Build response
    const response: PaymentStatusResponse = {
      status: mapPaymentStatus(paymentIntent.status),
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };

    // Add order ID if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      response.orderId = paymentIntent.id; // In production, get from database
    }

    // Add error message if payment failed
    if (
      paymentIntent.status === 'canceled' ||
      paymentIntent.last_payment_error
    ) {
      response.error =
        paymentIntent.last_payment_error?.message ||
        paymentIntent.cancellation_reason ||
        'Payment failed';
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Payment status error:', error);

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      // PaymentIntent not found
      if (error.type === 'StripeInvalidRequestError') {
        return new Response(
          JSON.stringify({
            error: 'Payment not found',
            type: 'not_found',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

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
        error: 'Failed to retrieve payment status',
        type: 'api_error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Stripe Configuration and Utilities
 * Handles Stripe SDK initialization and common operations
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Stripe publishable key (from environment variables)
const stripePublishableKey = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (singleton pattern)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.error('Stripe publishable key is not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
}

/**
 * Format currency amount for Stripe
 * Stripe expects amounts in cents (smallest currency unit)
 */
export function formatAmountForStripe(amount: number, currency: string = 'usd'): number {
  // Convert dollar amount to cents
  return Math.round(amount * 100);
}

/**
 * Format Stripe amount for display
 * Convert cents back to dollars
 */
export function formatAmountFromStripe(amount: number, currency: string = 'usd'): number {
  return amount / 100;
}

/**
 * Create payment intent on server
 */
export async function createPaymentIntent(params: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  items?: Array<{ productId: string; quantity: number }>;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
} | null> {
  try {
    const response = await fetch('/api/checkout/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: params.items || [],
        metadata: params.metadata || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create payment intent:', error);
      return null;
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

/**
 * Confirm payment
 */
export async function confirmPayment(params: {
  paymentIntentId: string;
  orderId: string;
}): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error confirming payment:', error);
    return false;
  }
}

/**
 * Stripe test card numbers for development
 */
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  REQUIRE_3DS: '4000002500003155',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
} as const;

/**
 * Get Stripe appearance theme (matches your design system)
 */
export function getStripeAppearance() {
  return {
    theme: 'stripe' as const,
    variables: {
      // Primary color from your design system (deep blue)
      colorPrimary: 'hsl(216, 55%, 25%)',
      colorBackground: 'hsl(36, 8%, 88%)',
      colorText: 'hsl(0, 0%, 13%)',
      colorDanger: 'hsl(0, 84%, 60%)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
      fontSizeBase: '16px',
      fontWeightNormal: '400',
      fontWeightMedium: '500',
      fontWeightBold: '600',
    },
    rules: {
      '.Tab': {
        border: '1px solid hsl(0, 0%, 100%, 0.1)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '12px',
      },
      '.Tab:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      '.Tab--selected': {
        borderColor: 'hsl(216, 55%, 25%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      '.Input': {
        padding: '12px',
        fontSize: '16px',
        border: '1px solid hsl(0, 0%, 100%, 0.1)',
      },
      '.Input:focus': {
        borderColor: 'hsl(216, 55%, 25%)',
        boxShadow: '0 0 0 2px hsl(216, 55%, 25%, 0.2)',
      },
      '.Label': {
        fontWeight: '500',
        marginBottom: '8px',
      },
    },
  };
}

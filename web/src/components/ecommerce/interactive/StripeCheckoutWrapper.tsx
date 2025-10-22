/**
 * Stripe Checkout Wrapper Component
 * Provides Stripe Elements context and handles payment intent creation
 */

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { getStripe, createPaymentIntent, getStripeAppearance } from '@/lib/stripe';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ShippingAddress } from '@/types/ecommerce';
import { $cart } from '@/stores/cart';

interface StripeCheckoutWrapperProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  items?: Array<{ productId: string; quantity: number }>;
  shippingAddress?: ShippingAddress;
  onSuccess: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function StripeCheckoutWrapper({
  amount,
  currency = 'usd',
  metadata = {},
  items,
  shippingAddress,
  onSuccess,
  onError,
}: StripeCheckoutWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializePayment() {
      try {
        // Get cart items if not provided
        const cartItems = items || $cart.get().items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        }));

        const result = await createPaymentIntent({
          amount,
          currency,
          metadata: {
            ...metadata,
            ...(shippingAddress && {
              shipping_name: shippingAddress.fullName,
              shipping_address: `${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
              shipping_country: shippingAddress.country,
            }),
          },
          items: cartItems,
        });

        if (result) {
          setClientSecret(result.clientSecret);
        } else {
          setError('Failed to initialize payment. Please try again.');
        }
      } catch (err) {
        setError('An error occurred while setting up payment.');
      } finally {
        setLoading(false);
      }
    }

    initializePayment();
  }, [amount, currency, items?.length, shippingAddress]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Setting up secure checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Unable to initialize payment. Please refresh and try again.</AlertDescription>
      </Alert>
    );
  }

  const stripePromise = getStripe();

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: getStripeAppearance(),
        // Enable automatic payment methods (Google Pay, Apple Pay, Link, etc.)
        loader: 'auto',
      }}
    >
      <StripeCheckoutForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

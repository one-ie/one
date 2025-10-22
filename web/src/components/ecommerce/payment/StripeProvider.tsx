/**
 * StripeProvider Component
 * Wraps checkout with Stripe Elements context
 *
 * Usage:
 * <StripeProvider clientSecret={clientSecret}>
 *   <PaymentForm />
 * </StripeProvider>
 */

import { useEffect, useState } from 'react';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeElementsAppearance } from '@/types/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret: string;
  appearance?: StripeElementsAppearance;
}

// Load Stripe.js outside of component to avoid recreating on every render
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Missing PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Default appearance for Stripe Elements
 * Matches ONE Platform design system (Tailwind v4)
 */
const defaultAppearance: StripeElementsAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: 'hsl(222.2 47.4% 11.2%)',
    colorBackground: 'hsl(0 0% 100%)',
    colorText: 'hsl(222.2 84% 4.9%)',
    colorDanger: 'hsl(0 84.2% 60.2%)',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '6px',
  },
};

export function StripeProvider({
  children,
  clientSecret,
  appearance = defaultAppearance
}: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await getStripe();
        if (!stripeInstance) {
          setError('Failed to load Stripe. Please check your configuration.');
          return;
        }
        setStripe(stripeInstance);
      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError('Failed to initialize payment system.');
      }
    };

    initStripe();
  }, []);

  // Show error if Stripe failed to load
  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Show loading state while Stripe is loading
  if (!stripe || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Configure Stripe Elements options
  const options = {
    clientSecret,
    appearance,
    loader: 'auto' as const,
  };

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  );
}

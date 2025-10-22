/**
 * Stripe Checkout Form Component
 * Integrates Stripe Elements for secure payment processing
 * Features: Card input, address collection, error handling, loading states
 */

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';

interface StripeCheckoutFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function StripeCheckoutForm({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    wallets: {
      applePay: 'auto',
      googlePay: 'auto',
    },
    defaultValues: {
      billingDetails: {
        // Pre-fill if you have user data
      },
    },
    fields: {
      billingDetails: {
        address: {
          country: 'auto',
        },
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/ecommerce/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
        onError?.(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      onError?.('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Track form completion
  useEffect(() => {
    if (!elements) return;

    const paymentElement = elements.getElement('payment');
    if (!paymentElement) return;

    paymentElement.on('change', (event) => {
      setIsComplete(event.complete);
    });
  }, [elements]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Badges */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
        <Shield className="h-4 w-4 text-primary" />
        <span className="flex items-center gap-1">
          Secured by Stripe
          <Lock className="h-3 w-3" />
        </span>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </h3>
        <PaymentElement options={paymentElementOptions} />
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Address</h3>
        <AddressElement
          options={{
            mode: 'billing',
            fields: {
              phone: 'always',
            },
            validation: {
              phone: {
                required: 'always',
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !isComplete}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          256-bit SSL encryption
        </span>
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          PCI DSS compliant
        </span>
      </div>
    </form>
  );
}

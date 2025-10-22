/**
 * PaymentForm Component
 * Stripe Card Element with billing address and submit button
 *
 * Usage:
 * <PaymentForm
 *   onSuccess={(orderId) => router.push(`/orders/${orderId}`)}
 *   onError={(error) => showToast(error.message)}
 * />
 */

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { BillingAddress, StripeError } from '@/types/stripe';

interface PaymentFormProps {
  onSuccess: (orderId: string) => void;
  onError?: (error: StripeError) => void;
  returnUrl?: string;
}

export function PaymentForm({
  onSuccess,
  onError,
  returnUrl = `${window.location.origin}/orders/confirmation`,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Billing address state
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  // Track when payment element is ready
  useEffect(() => {
    if (!elements) return;

    const paymentElement = elements.getElement('payment');
    if (paymentElement) {
      paymentElement.on('ready', () => {
        setIsReady(true);
      });
    }
  }, [elements]);

  /**
   * Handle billing address field changes
   */
  const handleAddressChange = (
    field: keyof BillingAddress,
    value: string
  ) => {
    setBillingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Validate billing address
   */
  const validateBillingAddress = (): boolean => {
    const required = ['name', 'email', 'line1', 'city', 'state', 'postal_code'];
    for (const field of required) {
      if (!billingAddress[field as keyof BillingAddress]) {
        setError(`Please enter your ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingAddress.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  /**
   * Handle payment submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Stripe is loaded
    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    // Validate billing address
    if (!validateBillingAddress()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name: billingAddress.name,
              email: billingAddress.email,
              address: {
                line1: billingAddress.line1,
                line2: billingAddress.line2 || undefined,
                city: billingAddress.city,
                state: billingAddress.state,
                postal_code: billingAddress.postal_code,
                country: billingAddress.country,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        // Payment failed
        const errorObj: StripeError = {
          type: stripeError.type as StripeError['type'],
          code: stripeError.code,
          message: stripeError.message || 'Payment failed',
          param: stripeError.param,
        };

        setError(errorObj.message);
        if (onError) {
          onError(errorObj);
        }
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - confirm with backend
        try {
          const response = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              billingAddress,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to confirm order');
          }

          const data = await response.json();
          onSuccess(data.orderId);
        } catch (err) {
          setError('Payment succeeded but order confirmation failed. Please contact support.');
          console.error('Order confirmation error:', err);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Address</h3>

        {/* Name & Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={billingAddress.name}
              onChange={(e) => handleAddressChange('name', e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={billingAddress.email}
              onChange={(e) => handleAddressChange('email', e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>
        </div>

        {/* Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="line1">Address *</Label>
          <Input
            id="line1"
            type="text"
            placeholder="123 Main Street"
            value={billingAddress.line1}
            onChange={(e) => handleAddressChange('line1', e.target.value)}
            disabled={isProcessing}
            required
          />
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
          <Input
            id="line2"
            type="text"
            placeholder="Apt 4B"
            value={billingAddress.line2 || ''}
            onChange={(e) => handleAddressChange('line2', e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              placeholder="New York"
              value={billingAddress.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              type="text"
              placeholder="NY"
              value={billingAddress.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">ZIP Code *</Label>
            <Input
              id="postal_code"
              type="text"
              placeholder="10001"
              value={billingAddress.postal_code}
              onChange={(e) => handleAddressChange('postal_code', e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>

        {/* Stripe Payment Element */}
        <div className="rounded-lg border p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !isReady || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing...
          </>
        ) : (
          'Complete Purchase'
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-center text-xs text-muted-foreground">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}

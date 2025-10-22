/**
 * Checkout Form Component (Interactive)
 * Multi-step checkout with Stripe integration
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DemoPaymentForm } from '@/components/ecommerce/interactive/DemoPaymentForm';
import type { ShippingAddress } from '@/types/ecommerce';

interface CheckoutFormProps {
  total: number;
  onSubmit?: (data: { shippingAddress: ShippingAddress }) => void;
}

export function CheckoutForm({ total, onSubmit }: CheckoutFormProps) {
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment processing
    // In production, integrate with Stripe Elements
    await new Promise((resolve) => setTimeout(resolve, 2000));

    onSubmit?.({ shippingAddress });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === 'shipping'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          1
        </div>
        <div className="flex-1 border-t-2 border-border" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === 'payment'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          2
        </div>
      </div>

      {/* Shipping Form */}
      {step === 'shipping' && (
        <form onSubmit={handleShippingSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping Information</h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              required
              value={shippingAddress.fullName}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, fullName: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Address Line 1</label>
            <input
              type="text"
              required
              value={shippingAddress.addressLine1}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={shippingAddress.addressLine2}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                type="text"
                required
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">State</label>
              <input
                type="text"
                required
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, state: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Postal Code</label>
              <input
                type="text"
                required
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <select
                required
                value={shippingAddress.country}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, country: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="GBR">United Kingdom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone (Optional)</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, phone: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </form>
      )}

      {/* Payment Form */}
      {step === 'payment' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payment</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep('shipping')}
            >
              ← Edit Shipping
            </Button>
          </div>

          {/* Demo Payment Form */}
          <DemoPaymentForm
            amount={total}
            currency="usd"
            onSuccess={() => {
              console.log('Payment successful (demo mode)');
              onSubmit?.({ shippingAddress });
            }}
            onError={(error) => {
              console.error('Payment failed:', error);
            }}
          />
        </div>
      )}
    </div>
  );
}

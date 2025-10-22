/**
 * One-Click Payment Buttons Component (Interactive)
 * Apple Pay, Google Pay, Shop Pay integration
 * Mock implementation for demo purposes
 * Requires client:load hydration
 */

'use client';

// Extend Window interface for ApplePaySession
declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments(): boolean;
      new(version: number, request: any): any;
    };
  }

  var ApplePaySession:
    | {
        canMakePayments(): boolean;
        new(version: number, request: any): any;
      }
    | undefined;
}

import { useEffect, useState } from 'react';
import { toastActions } from './Toast';

interface OneClickPaymentsProps {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
  onSuccess?: () => void;
}

export function OneClickPayments({
  productId,
  productName,
  price,
  quantity = 1,
  onSuccess,
}: OneClickPaymentsProps) {
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check Apple Pay availability
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setApplePayAvailable(true);
    }

    // Check Google Pay availability
    // Note: In production, you'd check with Google Pay API
    const isAndroid = /android/i.test(navigator.userAgent);
    const isChrome = /chrome/i.test(navigator.userAgent);
    if (isAndroid || isChrome) {
      setGooglePayAvailable(true);
    }
  }, []);

  const total = price * quantity;

  const handleApplePay = async () => {
    setIsProcessing(true);

    try {
      // Mock Apple Pay flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toastActions.success(
        'Order Placed!',
        `Your order for ${productName} has been confirmed via Apple Pay`
      );

      onSuccess?.();
    } catch (error) {
      toastActions.error('Payment Failed', 'Please try again or use another payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGooglePay = async () => {
    setIsProcessing(true);

    try {
      // Mock Google Pay flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toastActions.success(
        'Order Placed!',
        `Your order for ${productName} has been confirmed via Google Pay`
      );

      onSuccess?.();
    } catch (error) {
      toastActions.error('Payment Failed', 'Please try again or use another payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShopPay = async () => {
    setIsProcessing(true);

    try {
      // Mock Shop Pay flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toastActions.success(
        'Order Placed!',
        `Your order for ${productName} has been confirmed via Shop Pay`
      );

      onSuccess?.();
    } catch (error) {
      toastActions.error('Payment Failed', 'Please try again or use another payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  // If no one-click payment methods available, don't render
  if (!applePayAvailable && !googlePayAvailable) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or buy with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* Apple Pay */}
        {applePayAvailable && (
          <button
            onClick={handleApplePay}
            disabled={isProcessing}
            className="flex items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Buy with Apple Pay"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Apple Pay</span>
              </span>
            )}
          </button>
        )}

        {/* Google Pay */}
        {googlePayAvailable && (
          <button
            onClick={handleGooglePay}
            disabled={isProcessing}
            className="flex items-center justify-center rounded-lg border border-border bg-white px-4 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Buy with Google Pay"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin text-gray-800"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                <span>Google Pay</span>
              </span>
            )}
          </button>
        )}

        {/* Shop Pay - Always available for demo */}
        <button
          onClick={handleShopPay}
          disabled={isProcessing}
          className="flex items-center justify-center rounded-lg bg-[#5A31F4] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Buy with Shop Pay"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.49 20.937a.878.878 0 01-.878.878h-3.224a.879.879 0 01-.879-.878v-4.395a.879.879 0 01.879-.878h3.224a.878.878 0 01.878.878v4.395zm0-8.789a.879.879 0 01-.878.878h-3.224a.879.879 0 01-.879-.878V7.753a.879.879 0 01.879-.878h3.224a.878.878 0 01.878.878v4.395zm0-8.79a.879.879 0 01-.878.878h-3.224a.879.879 0 01-.879-.878V2.879c0-.485.393-.879.879-.879h3.224c.485 0 .878.394.878.879V3.36z" />
              </svg>
              <span>Shop Pay</span>
            </span>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Fast, secure checkout with encrypted payment
      </p>
    </div>
  );
}

/**
 * Compact one-click payment buttons
 * For use in product cards or checkout summary
 */
interface CompactOneClickPaymentsProps {
  productId: string;
  price: number;
  quantity?: number;
}

export function CompactOneClickPayments({
  productId,
  price,
  quantity = 1,
}: CompactOneClickPaymentsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* Apple Pay icon button */}
      <button
        className="flex h-10 flex-1 items-center justify-center rounded-lg bg-black text-white transition-opacity hover:opacity-90"
        aria-label="Apple Pay"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      </button>

      {/* Google Pay icon button */}
      <button
        className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-white transition-colors hover:bg-gray-50"
        aria-label="Google Pay"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          />
        </svg>
      </button>

      {/* Shop Pay icon button */}
      <button
        className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5A31F4] text-white transition-opacity hover:opacity-90"
        aria-label="Shop Pay"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.49 20.937a.878.878 0 01-.878.878h-3.224a.879.879 0 01-.879-.878v-4.395a.879.879 0 01.879-.878h3.224a.878.878 0 01.878.878v4.395zm0-8.789a.879.879 0 01-.878.878h-3.224a.879.879 0 01-.879-.878V7.753a.879.879 0 01.879-.878h3.224a.878.878 0 01.878.878v4.395zm0-8.79a.879.879 0 01-.878.878h-3.224a.879.879 0 01-.879-.878V2.879c0-.485.393-.879.879-.879h3.224c.485 0 .878.394.878.879V3.36z" />
        </svg>
      </button>
    </div>
  );
}

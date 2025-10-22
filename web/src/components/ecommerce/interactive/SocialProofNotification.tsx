/**
 * Social Proof Notification Component
 * Displays "John from NYC purchased this 2h ago" style notifications
 * Auto-shows at random intervals, slides in from bottom-right
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Purchase {
  id: string;
  name: string;
  city: string;
  timeAgo: string;
  productName: string;
  productImage?: string;
}

interface SocialProofNotificationProps {
  enabled?: boolean;
  minInterval?: number; // milliseconds
  maxInterval?: number; // milliseconds
  duration?: number; // how long each notification stays visible
}

// Mock data for realistic notifications
const MOCK_PURCHASES: Omit<Purchase, 'id' | 'timeAgo'>[] = [
  { name: 'John', city: 'NYC', productName: 'Premium Cotton T-Shirt' },
  { name: 'Sarah', city: 'Los Angeles', productName: 'Wireless Headphones' },
  { name: 'Michael', city: 'Chicago', productName: 'Leather Wallet' },
  { name: 'Emily', city: 'Houston', productName: 'Smart Watch' },
  { name: 'David', city: 'Phoenix', productName: 'Designer Sunglasses' },
  { name: 'Jessica', city: 'Philadelphia', productName: 'Running Shoes' },
  { name: 'Chris', city: 'San Antonio', productName: 'Backpack' },
  { name: 'Ashley', city: 'San Diego', productName: 'Yoga Mat' },
  { name: 'Daniel', city: 'Dallas', productName: 'Coffee Maker' },
  { name: 'Amanda', city: 'San Jose', productName: 'Desk Lamp' },
  { name: 'Ryan', city: 'Austin', productName: 'Bluetooth Speaker' },
  { name: 'Lauren', city: 'Jacksonville', productName: 'Water Bottle' },
  { name: 'Brandon', city: 'Fort Worth', productName: 'Phone Case' },
  { name: 'Stephanie', city: 'Columbus', productName: 'Notebook Set' },
  { name: 'Kevin', city: 'Charlotte', productName: 'USB Cable' },
];

const TIME_OPTIONS = [
  '2 minutes ago',
  '5 minutes ago',
  '12 minutes ago',
  '23 minutes ago',
  '45 minutes ago',
  '1 hour ago',
  '2 hours ago',
  '3 hours ago',
];

function generateRandomPurchase(): Purchase {
  const purchase = MOCK_PURCHASES[Math.floor(Math.random() * MOCK_PURCHASES.length)];
  const timeAgo = TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)];

  return {
    ...purchase,
    id: Math.random().toString(36).substring(7),
    timeAgo,
  };
}

export function SocialProofNotification({
  enabled = true,
  minInterval = 30000, // 30s
  maxInterval = 90000, // 90s
  duration = 5000, // 5s
}: SocialProofNotificationProps) {
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function showNotification() {
      const purchase = generateRandomPurchase();
      setCurrentPurchase(purchase);

      // Auto-dismiss after duration
      setTimeout(() => {
        setCurrentPurchase(null);
      }, duration);
    }

    function scheduleNext() {
      const delay = Math.random() * (maxInterval - minInterval) + minInterval;
      return setTimeout(() => {
        showNotification();
        scheduleNext();
      }, delay);
    }

    // Show first notification after initial delay
    const initialDelay = Math.random() * 10000 + 5000; // 5-15s
    const initialTimer = setTimeout(() => {
      showNotification();
      scheduleNext();
    }, initialDelay);

    return () => {
      clearTimeout(initialTimer);
    };
  }, [enabled, minInterval, maxInterval, duration]);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {currentPurchase && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pointer-events-auto"
          >
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className="flex-shrink-0 rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-semibold">{currentPurchase.name}</span>
                    {' from '}
                    <span className="font-semibold">{currentPurchase.city}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                    Purchased {currentPurchase.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentPurchase.timeAgo}
                  </p>
                </div>

                {/* Pulse indicator */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500"
                  aria-hidden="true"
                />
              </div>

              {/* Bottom accent bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 origin-left"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Provider component to enable social proof globally
export function SocialProofProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SocialProofNotification />
    </>
  );
}

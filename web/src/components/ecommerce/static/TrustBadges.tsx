/**
 * Trust Badges Component
 * Displays payment methods, security badges, guarantees, and free returns
 * Grid layout with grayscale icons that gain color on hover
 * Static component - no client-side hydration needed
 */

import { cn } from '@/lib/utils';
import { Shield, RotateCcw, Truck, Lock } from 'lucide-react';

interface TrustBadgesProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function TrustBadges({ className, variant = 'default' }: TrustBadgesProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Payment Methods */}
      <div className="space-y-2">
        <h3 className={cn('text-xs font-semibold text-muted-foreground uppercase tracking-wide', isCompact && 'sr-only')}>
          We Accept
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Visa */}
          <div className="group flex h-8 w-12 items-center justify-center rounded border border-border bg-card p-1 transition-all hover:border-primary">
            <svg className="h-full w-full grayscale transition-all group-hover:grayscale-0" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="white"/>
              <path d="M19.5 10h-3.2l-5 12h2.9l.9-2.3h3.3l.5 2.3h2.6l-2-12zm-2.6 7.7l1.3-3.5.7 3.5h-2zm8.4-7.7l-2.3 12h2.7l2.3-12h-2.7zm10.8 0h-2.5l-4 12h2.8l.7-2h3.8l.4 2h2.5l-3.7-12zm-3 7.7l1.5-4.2.8 4.2h-2.3zm-16-4.7c-.7-.3-1.8-.6-3.2-.6-3.5 0-6 1.9-6 4.6 0 2 1.8 3.1 3.1 3.8 1.4.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2.1 1.3-1.4 0-2.1-.2-3.3-.7l-.4-.2-.5 2.8c.8.4 2.4.7 4 .7 3.7 0 6.1-1.8 6.1-4.7 0-1.6-1-2.8-3.1-3.7-1.3-.6-2.1-1-2.1-1.6 0-.5.6-1.1 1.8-1.1 1 0 1.8.2 2.3.4l.3.1.3-2.8z" fill="#1434CB"/>
            </svg>
          </div>

          {/* Mastercard */}
          <div className="group flex h-8 w-12 items-center justify-center rounded border border-border bg-card p-1 transition-all hover:border-primary">
            <svg className="h-full w-full grayscale transition-all group-hover:grayscale-0" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="white"/>
              <circle cx="18" cy="16" r="7" fill="#EB001B"/>
              <circle cx="30" cy="16" r="7" fill="#F79E1B"/>
              <path d="M24 11.2c1.4 1.3 2.3 3.2 2.3 5.3s-.9 4-2.3 5.3c-1.4-1.3-2.3-3.2-2.3-5.3s.9-4 2.3-5.3z" fill="#FF5F00"/>
            </svg>
          </div>

          {/* Amex */}
          <div className="group flex h-8 w-12 items-center justify-center rounded border border-border bg-card p-1 transition-all hover:border-primary">
            <svg className="h-full w-full grayscale transition-all group-hover:grayscale-0" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#006FCF"/>
              <path d="M17 11h-5l-2 10h7l2-10zm11 0l-3 7-1-7h-5l2 10h3.5l3-6.5.8 6.5h3l2-10h-3l-2.3 5.5zm9 0h-5l-2 10h7l2-10z" fill="white"/>
            </svg>
          </div>

          {/* PayPal */}
          <div className="group flex h-8 w-12 items-center justify-center rounded border border-border bg-card p-1 transition-all hover:border-primary">
            <svg className="h-full w-full grayscale transition-all group-hover:grayscale-0" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="white"/>
              <path d="M20.8 11h-4.2l-2.9 11h2.4l.7-2.8h1.5c2.8 0 4.4-1.4 4.8-3.6.4-2-1-4.6-2.3-4.6zm-1 5.5c-.2.9-.9 1.5-1.8 1.5h-.9l.6-2.5h.9c.9 0 1.4.5 1.2 1zm7.6-5.5h-4.2l-2.9 11h2.4l.7-2.8h1.5c2.8 0 4.4-1.4 4.8-3.6.4-2-1-4.6-2.3-4.6zm-1 5.5c-.2.9-.9 1.5-1.8 1.5h-.9l.6-2.5h.9c.9 0 1.4.5 1.2 1z" fill="#003087"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Security & Guarantees */}
      <div className="space-y-2">
        <h3 className={cn('text-xs font-semibold text-muted-foreground uppercase tracking-wide', isCompact && 'sr-only')}>
          Secure & Safe
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* SSL Security */}
          <div className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-all hover:border-primary hover:bg-primary/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">SSL Secure</p>
              <p className="text-[10px] text-muted-foreground">256-bit encryption</p>
            </div>
          </div>

          {/* Norton */}
          <div className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-all hover:border-primary hover:bg-primary/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950">
              <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Norton</p>
              <p className="text-[10px] text-muted-foreground">Verified secure</p>
            </div>
          </div>

          {/* Money-Back Guarantee */}
          <div className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-all hover:border-primary hover:bg-primary/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
              <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">30-Day</p>
              <p className="text-[10px] text-muted-foreground">Money back</p>
            </div>
          </div>

          {/* Free Returns */}
          <div className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-all hover:border-primary hover:bg-primary/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
              <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Free Returns</p>
              <p className="text-[10px] text-muted-foreground">Easy returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

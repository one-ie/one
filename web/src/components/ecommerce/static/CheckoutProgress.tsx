/**
 * Checkout Progress Indicator Component
 * 3-step progress: Shipping → Payment → Review
 * Visual progress with clickable navigation (to previous steps only)
 * Static component - no client-side hydration needed
 */

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
  className?: string;
}

const steps: Array<{ id: CheckoutStep; label: string; number: number }> = [
  { id: 'shipping', label: 'Shipping', number: 1 },
  { id: 'payment', label: 'Payment', number: 2 },
  { id: 'review', label: 'Review', number: 3 },
];

export function CheckoutProgress({
  currentStep,
  onStepClick,
  className,
}: CheckoutProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const isStepComplete = (stepIndex: number) => stepIndex < currentStepIndex;
  const isStepCurrent = (stepIndex: number) => stepIndex === currentStepIndex;
  const isStepClickable = (stepIndex: number) => stepIndex < currentStepIndex && onStepClick;

  return (
    <div className={cn('w-full', className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isComplete = isStepComplete(index);
            const isCurrent = isStepCurrent(index);
            const isClickable = isStepClickable(index);
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn('relative flex items-center', !isLast && 'flex-1')}
              >
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isComplete && !isCurrent && 'border-muted bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:border-primary/80'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </button>

                {/* Step Label */}
                <span
                  className={cn(
                    'absolute top-12 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap',
                    isCurrent && 'text-primary',
                    isComplete && 'text-primary',
                    !isComplete && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-colors',
                      isComplete ? 'bg-primary' : 'bg-muted'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

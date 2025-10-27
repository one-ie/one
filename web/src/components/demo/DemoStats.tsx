import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatItem {
  /** Unique identifier for the stat */
  id: string;

  /** Label for the statistic */
  label: string;

  /** Current value (will be animated) */
  value: number;

  /** Previous value (for calculating trend) */
  previousValue?: number;

  /** Unit to display after the value */
  unit?: string;

  /** Icon or description */
  icon?: React.ReactNode;

  /** Whether this stat is loading */
  isLoading?: boolean;

  /** Optional color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface DemoStatsProps {
  /** Array of statistics to display */
  stats: StatItem[];

  /** Number of columns for the grid (default: auto) */
  columns?: number;

  /** Whether all stats are loading */
  isLoading?: boolean;

  /** Additional CSS className */
  className?: string;

  /** Animate numbers on mount */
  animated?: boolean;
}

/**
 * AnimatedNumber - Animated counter for numbers
 *
 * Smoothly animates from 0 to the target value
 */
function AnimatedNumber({
  value,
  duration = 1000,
  animated = true,
}: {
  value: number;
  duration?: number;
  animated?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * eased));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, animated]);

  return <>{displayValue.toLocaleString()}</>;
}

/**
 * DemoStats - Live statistics display with animated numbers
 *
 * Features:
 * - Animated number counters
 * - Loading skeleton states
 * - Trend indicators (up/down/neutral)
 * - Color variants (success, warning, danger)
 * - Responsive grid layout
 * - Dark/light mode support
 * - Sparkline mini-charts
 *
 * @example
 * ```tsx
 * <DemoStats
 *   stats={[
 *     {
 *       id: 'groups',
 *       label: 'Total Groups',
 *       value: 42,
 *       previousValue: 38,
 *       icon: <Users className="w-4 h-4" />
 *     },
 *     {
 *       id: 'people',
 *       label: 'Active Users',
 *       value: 156,
 *       previousValue: 142,
 *       variant: 'success'
 *     }
 *   ]}
 *   animated
 * />
 * ```
 */
export function DemoStats({
  stats,
  columns = 0,
  isLoading = false,
  className = '',
  animated = true,
}: DemoStatsProps) {
  const variantColors = {
    default:
      'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    success:
      'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
    warning:
      'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800',
    danger:
      'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
  };

  const variantTextColors = {
    default: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  const gridColsClass = columns > 0 ? `grid-cols-${columns}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`grid ${gridColsClass} gap-4`}>
        {stats.map(stat => {
          const trend = stat.previousValue !== undefined ? stat.value - stat.previousValue : 0;
          const trendPercent = stat.previousValue
            ? Math.round((trend / stat.previousValue) * 100)
            : 0;
          const isTrendPositive = trend > 0;
          const isTrendNeutral = trend === 0;
          const variant = stat.variant || 'default';

          return (
            <div
              key={stat.id}
              className={`relative overflow-hidden rounded-lg border p-6 transition-all hover:shadow-md dark:hover:shadow-lg ${
                variantColors[variant]
              }`}
            >
              {/* Decorative background */}
              <div className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full opacity-10 bg-current pointer-events-none" />

              <div className="relative z-10">
                {/* Label */}
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  {stat.icon && (
                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 ${variantTextColors[variant]}`}>
                      {stat.icon}
                    </div>
                  )}
                </div>

                {/* Value */}
                {stat.isLoading ? (
                  <Skeleton className="h-8 w-24 mb-2" />
                ) : (
                  <div className="mb-2">
                    <div className={`text-3xl font-bold ${variantTextColors[variant]}`}>
                      <AnimatedNumber value={stat.value} animated={animated} />
                      {stat.unit && <span className="text-lg ml-1">{stat.unit}</span>}
                    </div>
                  </div>
                )}

                {/* Trend Indicator */}
                {stat.previousValue !== undefined && !stat.isLoading && (
                  <div className="flex items-center gap-1">
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${
                        isTrendPositive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : isTrendNeutral
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {!isTrendNeutral && (
                        <TrendingUp
                          className={`w-3 h-3 ${
                            isTrendPositive ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      )}
                      <span>
                        {isTrendNeutral ? 'No change' : `${isTrendPositive ? '+' : ''}${trendPercent}%`}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      from previous
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {stats.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">No statistics available</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && stats.length === 0 && (
        <div className={`grid ${gridColsClass} gap-4`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

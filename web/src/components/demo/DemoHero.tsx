import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DemoHeroProps {
  /** The title of the dimension/feature */
  title: string;

  /** Detailed description of what this demo shows */
  description: string;

  /** Lucide React icon component to display */
  icon: LucideIcon;

  /** Status badges to display (e.g., "Interactive", "Backend Connected", "Live Data") */
  badges?: Array<{
    label: string;
    variant?: 'success' | 'warning' | 'info' | 'neutral';
  }>;

  /** CTA button configuration */
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;

  /** Additional CSS className */
  className?: string;
}

/**
 * DemoHero - Hero section for demo pages
 *
 * Features:
 * - Large icon display
 * - Title and detailed description
 * - Status badges with color coding
 * - Call-to-action button
 * - Responsive design
 * - Dark/light mode support
 *
 * @example
 * ```tsx
 * <DemoHero
 *   title="Groups"
 *   description="Understand the Groups dimension - the containers for collaboration"
 *   icon={Users}
 *   badges={[
 *     { label: 'Interactive', variant: 'success' },
 *     { label: 'Backend Connected', variant: 'success' },
 *   ]}
 *   ctaLabel="Explore Groups"
 *   onCtaClick={() => scrollToPlayground()}
 * />
 * ```
 */
export function DemoHero({
  title,
  description,
  icon: Icon,
  badges = [],
  ctaLabel = 'Try It Now',
  ctaHref,
  onCtaClick,
  className = '',
}: DemoHeroProps) {
  const badgeColors = {
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-8 sm:p-12 ${className}`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10">
        {/* Icon Container */}
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
          <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          {title}
        </h2>

        {/* Description */}
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-3xl leading-relaxed">
          {description}
        </p>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  badgeColors[badge.variant || 'neutral']
                }`}
              >
                {badge.label}
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {ctaLabel && (
          <Button
            onClick={onCtaClick}
            asChild={!!ctaHref}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {ctaHref ? (
              <a href={ctaHref}>{ctaLabel}</a>
            ) : (
              <span>{ctaLabel}</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

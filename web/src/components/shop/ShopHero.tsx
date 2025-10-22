/**
 * Ultra-Premium Shop Hero Component
 * World-Class Design with Cinematic Animations
 * Features: Glass morphism, floating elements, particle effects, premium gradients
 */

import { Badge } from '@/components/ui/badge';

interface ShopHeroProps {
  stats?: {
    customers: string;
    rating: string;
    support: string;
  };
}

export function ShopHero({
  stats = {
    customers: '50k+',
    rating: '4.9',
    support: '24/7'
  }
}: ShopHeroProps) {
  return (
    <section className="relative overflow-hidden py-32 md:py-40 lg:py-48">
      {/* Premium Layered Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      {/* Animated Mesh Gradient Orbs */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/20 blur-[120px]"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        <div
          className="absolute right-0 bottom-0 h-[700px] w-[700px] translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-br from-secondary/30 to-pink-500/20 blur-[140px]"
          style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-[100px]"
          style={{ animation: 'float 12s ease-in-out infinite', animationDelay: '4s' }}
        />
      </div>

      {/* Premium Grid Pattern Overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)'
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">

          {/* Glass Morphism Trust Badges */}
          <div
            className="mb-12 flex flex-wrap justify-center gap-4"
            style={{ animation: 'fadeIn 1s ease-out' }}
          >
            <TrustBadge
              icon={<CheckIcon />}
              label="Free Shipping $50+"
            />
            <TrustBadge
              icon={<ShieldIcon />}
              label="30-Day Returns"
            />
            <TrustBadge
              icon={<StarIcon />}
              label="4.9/5 Stars (2.5k)"
            />
          </div>

          {/* Ultra Premium Main Heading */}
          <h1
            className="text-6xl font-black tracking-tight text-foreground md:text-7xl lg:text-8xl xl:text-9xl"
            style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}
          >
            <span className="block mb-4">Premium Quality</span>
            <span className="block bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent animate-gradient">
              Exceptional Design
            </span>
          </h1>

          {/* Elevated Subheading */}
          <p
            className="mx-auto mt-10 max-w-3xl text-xl text-muted-foreground md:text-2xl lg:text-3xl leading-relaxed font-light"
            style={{ animation: 'fadeInUp 1s ease-out 0.4s both' }}
          >
            Discover our handpicked collection of premium products.
            <span className="block mt-3 font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Crafted for excellence
            </span>
            , designed for those who demand the best.
          </p>

          {/* Premium CTA Buttons */}
          <div
            className="mt-14 flex flex-col gap-6 sm:flex-row sm:justify-center"
            style={{ animation: 'fadeInUp 1s ease-out 0.6s both' }}
          >
            <PremiumButton
              href="/products"
              variant="primary"
              icon={<ShoppingBagIcon />}
            >
              Shop Collection
            </PremiumButton>

            <PremiumButton
              href="#collections"
              variant="secondary"
              icon={<ArrowRightIcon />}
              iconPosition="right"
            >
              Explore Collections
            </PremiumButton>
          </div>

          {/* Glass Morphism Stats */}
          <div
            className="mt-20 grid grid-cols-3 gap-8 border-t border-white/10 pt-16"
            style={{ animation: 'fadeInUp 1s ease-out 0.8s both' }}
          >
            <StatCard
              value={stats.customers}
              label="Happy Customers"
            />
            <StatCard
              value={stats.rating}
              label="Average Rating"
            />
            <StatCard
              value={stats.support}
              label="Support Available"
            />
          </div>
        </div>
      </div>

      {/* Floating Particles Effect */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
}

// Trust Badge Component
function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="group relative overflow-hidden rounded-full backdrop-blur-xl bg-background/30 border border-white/10 px-6 py-3 shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/50 hover:bg-background/40">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold tracking-wide">{label}</span>
      </div>
    </div>
  );
}

// Premium Button Component
interface PremiumButtonProps {
  href: string;
  variant: 'primary' | 'secondary';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

function PremiumButton({ href, variant, icon, iconPosition = 'left', children }: PremiumButtonProps) {
  if (variant === 'primary') {
    return (
      <a
        href={href}
        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-primary via-purple-600 to-secondary px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-secondary opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-500" />
        {iconPosition === 'left' && icon && (
          <span className="relative transition-transform duration-500 group-hover:rotate-12">
            {icon}
          </span>
        )}
        <span className="relative">{children}</span>
        {iconPosition === 'right' && icon && (
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">
            {icon}
          </span>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-purple-600 to-secondary blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      </a>
    );
  }

  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border-2 border-primary/50 backdrop-blur-xl bg-background/30 px-10 py-5 text-lg font-bold text-foreground shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary hover:bg-background/50"
    >
      <span className="relative">{children}</span>
      {icon && (
        <span className="relative transition-transform duration-500 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </a>
  );
}

// Stat Card Component
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-background/20 border border-white/10 p-6 transition-all duration-500 hover:scale-105 hover:border-primary/50 hover:bg-background/30">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="text-4xl font-black md:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {value}
        </div>
        <div className="mt-3 text-sm font-semibold text-muted-foreground tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

// Icon Components
function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

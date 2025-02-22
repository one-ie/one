"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
  containerClassName?: string;
}

export function BorderBeam({
  className,
  duration = 8,
  delay = 0,
  children,
  containerClassName,
}: BorderBeamProps) {
  const gradientId = `beam-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", containerClassName)}>
      <svg
        className={cn("absolute inset-0 h-full w-full pointer-events-none", className)}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          "--duration": `${duration}s`,
          "--delay": `${delay}s`,
        } as React.CSSProperties}
      >
        <defs>
          <linearGradient 
            id={gradientId}
            gradientTransform="rotate(45)"
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="100%"
          >
            <stop offset="0%" stopColor="#FF0080" />
            <stop offset="20%" stopColor="#FF4D4D" />
            <stop offset="40%" stopColor="#FF8C00" />
            <stop offset="60%" stopColor="#7928CA" />
            <stop offset="80%" stopColor="#0070F3" />
            <stop offset="100%" stopColor="#FF0080" />
          </linearGradient>
        </defs>
        <path
          d="M 0 0 L 100 0 L 100 100 L 0 100 L 0 0"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={0.75}
          strokeDasharray="60 340"
          className="animate-border-beam [stroke-opacity:1]"
          style={{
            strokeDashoffset: "400",
            animationDelay: "var(--delay)",
          }}
        />
      </svg>
      {children}
    </div>
  );
} 
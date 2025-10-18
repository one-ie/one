"use client";

import { cn } from "@/lib/utils";

interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  startAngle?: number;
}

const OrbitingCircles = ({
  className,
  children,
  reverse,
  duration = 20,
  radius = 50,
  path = true,
  startAngle = 0,
}: OrbitingCirclesProps) => {
  const diameter = radius * 2;

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={
        {
          width: diameter,
          height: diameter,
        } as React.CSSProperties
      }
    >
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          className="pointer-events-none absolute inset-0"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx={radius}
            cy={radius}
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <div
        style={
          {
            "--duration": duration,
            "--radius": radius,
            "--start-angle": startAngle,
            transformOrigin: "center",
          } as React.CSSProperties
        }
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit",
          reverse && "[animation-direction:reverse]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default OrbitingCircles;

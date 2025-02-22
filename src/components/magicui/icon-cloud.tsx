"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

interface IconCloudProps {
  iconSlugs: string[];
}

export default function IconCloud({ iconSlugs }: IconCloudProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoaded(true);

    const icons = containerRef.current.getElementsByClassName("icon-item");
    Array.from(icons).forEach((icon, index) => {
      // Calculate position on a sphere with larger radius
      const phi = Math.acos(-1 + (2 * index) / icons.length);
      const theta = Math.sqrt(icons.length * Math.PI) * phi;
      
      // Convert spherical coordinates to Cartesian with larger radius
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4; // 80% of smallest screen dimension
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);
      
      // Set initial position with larger scale
      const el = icon as HTMLElement;
      el.style.setProperty("--x", `${x * radius}px`);
      el.style.setProperty("--y", `${y * radius}px`);
      el.style.setProperty("--z", `${z * radius}px`);
      el.style.setProperty("--delay", `${index * 100}ms`);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
        {iconSlugs.map((slug) => (
          <div
            key={slug}
            className="icon-item absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: "orbit 30s linear infinite",
              animationDelay: `var(--delay)`,
              transform: "translate3d(var(--x), var(--y), var(--z))",
            }}
          >
            <Icon
              icon={slug}
              className="h-8 w-8 md:h-12 md:w-12 transition-all duration-300 hover:scale-150"
              style={{
                filter: "drop-shadow(0 0 12px rgba(var(--primary-rgb), 0.3))",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 
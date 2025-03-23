import { CSSProperties, FC, ReactNode } from "react";
import { cn } from "../lib/utils";

interface HeroPillProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

const HeroPill: FC<HeroPillProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <div
      style={{
        // Gradient background with sharp contrast for visible shimmer
        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
        // Control the size of the shimmer effect
        backgroundSize: "200% 100%",
        // Start position off-screen
        backgroundPosition: "-100% 0",
        // Apply the animation directly
        animation: "shine 8s linear infinite",
        // Apply to text only
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        // Make text transparent to show gradient
        color: "transparent",
        // Fallback solid color for browsers that don't support the effect
        WebkitTextFillColor: "transparent",
      } as CSSProperties}
      className={cn(
        "mx-auto max-w-md font-bold",
        // Solid background color for the text itself
        "text-gray-800 dark:text-gray-200",
        // Add a base text size to ensure visibility
        "text-xl",
        className,
      )}
    >
      {children}
    </div>
  );
};

export { HeroPill };
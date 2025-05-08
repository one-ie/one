import * as React from "react";
import { cn } from "@/lib/utils";

interface AgentAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  avatarUrl: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export const AgentAvatar = React.forwardRef<HTMLDivElement, AgentAvatarProps>(
  ({ avatarUrl, name, size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      xs: "h-4 w-4",
      sm: "h-8 w-8",
      md: "h-12 w-12",
      lg: "h-48 w-48",
    };

    const borderClasses = {
      xs: "border",
      sm: "border-2",
      md: "border-2",
      lg: "border-4",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-primary/10 -z-10 scale-125",
            sizeClasses[size],
          )}
        />

        <div
          className={cn(
            "relative rounded-full overflow-visible border-primary bg-gradient-to-b from-primary/40  to-primary/5",
            sizeClasses[size],
            borderClasses[size],
          )}
        >
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover scale-110"
          />
        </div>
      </div>
    );
  },
);

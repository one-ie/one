import { FC } from "react";
import { cn } from "../lib/utils";

interface TrustedPillProps {
  className?: string;
}

const TrustedPill: FC<TrustedPillProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center justify-center gap-2 animate-fade-in", className)}>
      <div className="flex items-center gap-6 px-4 py-2 rounded-full bg-muted/5 one-glass-dark">
        <p className="text-sm text-muted-foreground">Trusted by marketers at</p>
        <div className="flex items-center gap-4">
          <img src="/logos/google.svg" alt="Google" className="h-4 opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/logos/hubspot.svg" alt="HubSpot" className="h-4 opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/logos/shopify.svg" alt="Shopify" className="h-4 opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};

export { TrustedPill };
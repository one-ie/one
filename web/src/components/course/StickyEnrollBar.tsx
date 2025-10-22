import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

interface StickyEnrollBarProps {
  currentPrice: string;
  totalSpots: number;
  remainingSpots: number;
  priceIncrease: string;
}

export function StickyEnrollBar({ 
  currentPrice, 
  totalSpots, 
  remainingSpots, 
  priceIncrease 
}: StickyEnrollBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border z-50 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-muted-foreground">Special Launch Price</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-primary">${currentPrice}</p>
              <Badge variant="outline" className="text-xs">Save ${priceIncrease}</Badge>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">Limited Availability</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">{remainingSpots} Spots Left</p>
              <Progress value={((totalSpots - remainingSpots) / totalSpots) * 100} className="w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="hidden md:flex hover:bg-primary/5 transition-all duration-300" 
            asChild
          >
            <a href="#pricing" className="no-underline">
              See Full Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button 
            size="lg" 
            className="text-lg whitespace-nowrap button-glow relative group transition-all duration-300" 
            asChild
          >
            <a href="#pricing" className="no-underline flex items-center">
              <span className="flex flex-col items-start text-left">
                <span className="text-sm opacity-90">🎯 Special Launch Price</span>
                <span>Secure Your Spot - ${currentPrice}
                <span className="block text-xs mt-1">Save ${priceIncrease} Today</span>
                </span>
              </span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { Progress } from '../ui/progress';

interface StickyEnrollBarProps {
  currentPrice: string;
  ctaText: string;
  spots: {
    total: number;
    remaining: number;
  };
  deadline: string;
}

export function StickyEnrollBar({ 
  currentPrice, 
  ctaText, 
  spots, 
  deadline 
}: StickyEnrollBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const spotPercentage = ((spots.total - spots.remaining) / spots.total) * 100;
  
  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling down 1000px
      setIsVisible(window.scrollY > 1000);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-50 py-3 px-4 transform transition-all duration-300">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <p className="text-sm font-medium">AI Marketing Revolution</p>
            <p className="text-xs text-muted-foreground">Closing on {deadline}</p>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
            <span className="text-xs font-medium">Only {spots.remaining} spots left</span>
            <div className="w-16 ml-2">
              <Progress value={spotPercentage} className="h-1" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Special Price</p>
            <p className="text-lg font-bold">${currentPrice}</p>
          </div>
          
          <Button size="sm">
            {ctaText} <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
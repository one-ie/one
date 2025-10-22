import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CheckIcon, ShieldCheckIcon, ArrowRightIcon, XIcon } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

interface PricingFeature {
  title: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  description?: string;
  originalPrice: string;
  currentPrice: string;
  installmentPrice?: {
    amount: string;
    count: number;
  };
  features: PricingFeature[];
  ctaText: string;
  guaranteeDays?: number;
  guaranteeText?: string;
  popular?: boolean;
  className?: string;
  onClickCta?: () => void;
}

export function PricingCard({
  title,
  description,
  originalPrice,
  currentPrice,
  installmentPrice,
  features,
  ctaText,
  guaranteeDays = 30,
  guaranteeText = "Implementation Guarantee",
  popular = false,
  className = "",
  onClickCta
}: PricingCardProps) {
  return (
    <Card className={`overflow-hidden border-2 ${popular ? 'border-primary' : 'border-border'} ${className}`}>
      {popular && (
        <div className="bg-primary text-primary-foreground text-center py-2 font-medium text-sm">
          MOST POPULAR CHOICE
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {description && <p className="text-muted-foreground mb-6">{description}</p>}
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-lg line-through text-muted-foreground">${originalPrice}</span>
            <span className="text-4xl font-bold">${currentPrice}</span>
          </div>
          
          {installmentPrice && (
            <p className="text-sm text-muted-foreground mt-1">
              or {installmentPrice.count} payments of ${installmentPrice.amount}
            </p>
          )}
        </div>
        
        <Button 
          size="lg" 
          className="w-full mb-6"
          onClick={onClickCta}
        >
          {ctaText} <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-sm mb-6">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
          <span>{guaranteeDays}-Day {guaranteeText}</span>
        </div>
        
        <Separator className="mb-6" />
        
        <div>
          <h4 className="font-medium mb-4">What's included:</h4>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.included ? (
                  <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <span className={feature.included ? "" : "text-muted-foreground"}>
                  {feature.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
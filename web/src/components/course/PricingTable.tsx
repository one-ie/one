import React from 'react';
import { PricingCard } from './PricingCard';
import { Progress } from '../ui/progress';
import { ShieldCheckIcon } from 'lucide-react';

interface PricingFeature {
  title: string;
  included: boolean;
}

interface CourseValue {
  item: string;
  value: string;
}

interface PricingTableProps {
  originalPrice: string;
  currentPrice: string;
  paymentOptions: {
    full: string;
    installments: { amount: string; count: number };
  };
  guarantee: string;
  guaranteeDays: number;
  totalValue: number;
  valueBreakdown: CourseValue[];
  features: PricingFeature[];
  ctaText: string;
  spots: {
    total: number;
    remaining: number;
  };
  deadline: string;
}

export function PricingTable({
  originalPrice,
  currentPrice,
  paymentOptions,
  guarantee,
  guaranteeDays,
  totalValue,
  valueBreakdown,
  features,
  ctaText,
  spots,
  deadline
}: PricingTableProps) {
  const spotPercentage = ((spots.total - spots.remaining) / spots.total) * 100;
  
  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Your Investment in AI Marketing Mastery</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of successful marketers who have transformed their business with AI
        </p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Total Value: ${totalValue.toLocaleString()}</h3>
            <div className="space-y-3">
              {valueBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{item.item}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Limited Time Offer</h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Spots Remaining: <strong>{spots.remaining} of {spots.total}</strong></span>
                <span className="text-primary font-semibold">{Math.round(100 - spotPercentage)}%</span>
              </div>
              <Progress value={spotPercentage} className="h-2 mb-4" />
              <p className="text-sm text-center text-muted-foreground">
                Enrollment closes on <strong>{deadline}</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
              <div>
                <h4 className="font-semibold">100% Risk-Free Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  If you implement the strategies taught in the first two modules and don't see measurable improvements within {guaranteeDays} days, we'll refund your entire investment.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <PricingCard
          title="AI Marketing Revolution"
          description="Complete system to automate, convert, and scale your revenue"
          originalPrice={originalPrice}
          currentPrice={currentPrice}
          installmentPrice={paymentOptions.installments}
          features={features}
          ctaText={ctaText}
          guaranteeDays={guaranteeDays}
          guaranteeText={guarantee}
          popular={true}
        />
      </div>
    </div>
  );
}
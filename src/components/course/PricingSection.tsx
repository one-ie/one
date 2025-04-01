import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check, Shield } from "lucide-react";

interface PricingItem {
  item: string;
  value: string;
  description: string;
}

interface PricingBonus {
  title: string;
  value: string;
  description: string;
  expires?: string;
}

interface PricingFeature {
  title: string;
  included: boolean;
  highlight: boolean;
  description: string;
}

interface PricingData {
  originalPrice: string;
  currentPrice: string;
  paymentOptions: {
    full: string;
  };
  guarantee: {
    days: number;
    title: string;
    description: string;
  };
  totalValue: string;
  valueBreakdown: PricingItem[];
  bonuses: PricingBonus[];
  features: PricingFeature[];
  scarcity: {
    spots: {
      total: number;
      remaining: number;
    };
    deadline: string;
    price_increase: string;
  };
}

interface PricingSectionProps {
  pricingData: PricingData;
}

export function PricingSection({ pricingData }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container px-4 mx-auto relative">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="mb-4">Special Launch Offer</Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold">
            Get the Complete AI Growth System Today
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Stop wasting time on AI guesswork. Implement the proven system used by top Ecom owners to accelerate growth predictably.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[1200px] mx-auto">
          {/* Value Stack */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">
                Here's Everything You Get Instant Access To:
              </h3>
              
              <div className="space-y-6">
                {pricingData.valueBreakdown.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.item} <span className="text-primary">(${item.value})</span></p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Launch Bonuses */}
            <Card className="p-6 border-primary/20 bg-primary/5">
              <h3 className="text-2xl font-bold mb-6">
                PLUS: Enroll Before {pricingData.scarcity.deadline} & Get These Fast-Action Bonuses (Value: $991)
              </h3>
              
              <div className="space-y-6">
                {pricingData.bonuses.map((bonus, index) => (
                  <div key={index} className="space-y-2">
                    {bonus.expires && (
                      <Badge variant="destructive" className="mb-2">Expires in {bonus.expires}</Badge>
                    )}
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-5 h-5 mt-1">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">🎁 {bonus.title} <span className="text-primary">(${bonus.value})</span></p>
                        <p className="text-sm text-muted-foreground">{bonus.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pricing Card */}
          <div>
            <Card className="p-8 border-primary sticky top-8">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Regular Price (Post-Launch)</p>
                  <p className="text-2xl line-through text-muted-foreground">${pricingData.originalPrice}</p>
                  
                  <div className="mt-4">
                    <p className="text-muted-foreground">🔥 Special Launch Price (Limited Time) 🔥</p>
                    <p className="text-5xl font-bold text-primary">${pricingData.currentPrice}</p>
                    <p className="text-sm text-muted-foreground mt-1">(One-Time Investment)</p>
                  </div>
                </div>

                <Separator />

                {/* Payment Options */}
                <div className="space-y-4">
                  <Button className="w-full text-lg h-12" size="lg">
                    Enroll Now & Get Instant Access for ${pricingData.paymentOptions.full} →
                  </Button>
                </div>

                <Separator />

                {/* Features Recap */}
                <div>
                  <p className="font-medium mb-3">Here's a Recap of What You Unlock Immediately:</p>
                  <div className="space-y-2">
                    {pricingData.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-1 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm ${feature.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {feature.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Guarantee */}
                <div className="text-center space-y-3">
                  <Shield className="w-12 h-12 text-primary mx-auto" />
                  <h4 className="text-xl font-bold">{pricingData.guarantee.title}</h4>
                  <p className="text-sm text-muted-foreground">{pricingData.guarantee.description}</p>
                </div>

                <Separator />

                {/* Scarcity */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-muted-foreground">Only {pricingData.scarcity.spots.remaining} Spots Remaining at Launch Price!</p>
                    <Progress value={((pricingData.scarcity.spots.total - pricingData.scarcity.spots.remaining) / pricingData.scarcity.spots.total) * 100} className="mt-2" />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Price increases by ${pricingData.scarcity.price_increase} on</p>
                    <p className="font-semibold">{pricingData.scarcity.deadline}</p>
                  </div>
                </div>

                {/* Final CTA */}
                <Button size="lg" className="w-full text-lg">
                  Secure Your Spot & Get the AI System Now →
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Instant Access | Secure Checkout | 30-Day Money-Back Guarantee
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
} 
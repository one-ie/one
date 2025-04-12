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
          <Badge variant="outline" className="mb-4">Special Pre-Launch Offer</Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold">
            Lock In Your Spot at the Special Pre-Launch Price
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Save $1,000 by securing your access today. Get the complete system when it launches May 1, 2025. 
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[1200px] mx-auto">
          {/* Value Stack */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">
                Here's Everything You Get Access To on May 1, 2025:
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

               

                <Separator className="my-6" />

                {/* Platform Compatibility */}
                <div className="space-y-4">
                  <h4 className="font-medium">Works With All Major Ecom Platforms:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Shopify</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>WooCommerce</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Squarespace Commerce</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Wix eCommerce</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>BigCommerce</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Adobe Commerce</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>ClickFunnels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Webflow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>PrestaShop</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ...and virtually any platform where you manage your ads, emails, and website content!
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pricing Card */}
          <div>
            <Card className="p-8 border-primary sticky top-8">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Regular Launch Price (May 1, 2025)</p>
                  <p className="text-2xl line-through text-muted-foreground">${pricingData.originalPrice}</p>
                  
                  <div className="mt-4">
                    <p className="text-muted-foreground">🔥 Special Pre-Launch Price 🔥</p>
                    <p className="text-5xl font-bold text-primary">${pricingData.currentPrice}</p>
                    <Badge variant="outline" className="mt-2">Save $1,000 Today</Badge>
                  </div>
                </div>

                <Separator />

                {/* Payment Options */}
                <div className="space-y-4">
                  <a href="/pay-course">
                    <Button className="w-full text-lg h-12 bg-[#1E3A8A] hover:bg-[#1e3a8aee] text-white border border-white/10 hover:border-white/20" size="lg">
                      Lock In Pre-Launch Price →
                    </Button>
                  </a>
                  <p className="text-sm text-center text-muted-foreground">
                    Full Access Granted May 1, 2025
                  </p>
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
                    <p className="text-muted-foreground">Only {pricingData.scarcity.spots.remaining} Pre-Launch Spots Remaining!</p>
                    <Progress value={((pricingData.scarcity.spots.total - pricingData.scarcity.spots.remaining) / pricingData.scarcity.spots.total) * 100} className="mt-2" />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Price increases to ${pricingData.originalPrice} on</p>
                    <p className="font-semibold">{pricingData.scarcity.deadline}</p>
                  </div>
                </div>

               
                <p className="text-center text-xs text-muted-foreground">
                  Launch Access May 1, 2025 | Secure Checkout | 30-Day Money-Back Guarantee
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
} 
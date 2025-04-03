import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield } from "lucide-react";

interface FinalCTAProps {
  currentPrice: string;
  remainingSpots: number;
  guaranteeText: string;
}

export function FinalCTA({ currentPrice, remainingSpots, guaranteeText }: FinalCTAProps) {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <Card className="max-w-4xl mx-auto p-8 border-primary">
          <div className="text-center space-y-6">
            <Shield className="w-16 h-16 text-primary mx-auto" />
            
            <div>
              <h2 className="text-3xl font-bold mb-2">30-Day Money-Back Guarantee</h2>
              <p className="text-xl text-muted-foreground">
                Try the complete system risk-free for 30 days
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <p className="text-muted-foreground">
                {guaranteeText || "If you're not completely satisfied with the AI Prompt Playbook For Ecommerce and Elevate Framework within 30 days, simply email us for a full refund. No questions asked."}
              </p>
            </div>

            <a href="#pricing">
              <Button className="text-lg px-8" size="lg">
                Get Started Risk-Free - Only ${currentPrice}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <p className="text-sm text-muted-foreground">
              Limited Time: Only {remainingSpots} Spots Remaining at Launch Price
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
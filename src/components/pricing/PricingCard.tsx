import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckIcon, ArrowRightIcon } from "lucide-react";
import { BorderBeam } from "../magicui/border-beam";

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <div className={`relative ${plan.popular ? 'mt-[-1rem] mb-[-1rem]' : ''}`}>
      {plan.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Badge className="bg-white text-black px-3 py-1">Most Popular</Badge>
        </div>
      )}
      
      <Card className={`one-glass-dark p-8 border-[hsla(var(--one-border))] h-full flex flex-col ${plan.popular ? 'shadow-xl' : 'shadow-md'}`}>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-4xl font-bold">
              {plan.price === "Custom" ? "" : "$"}{plan.price}
            </span>
            {plan.price !== "Custom" && (
              <span className="text-muted-foreground ml-2">{plan.period}</span>
            )}
          </div>
          {plan.price === "Custom" && (
            <span className="text-muted-foreground">{plan.period}</span>
          )}
        </div>
        
        <ul className="space-y-3 mb-8 flex-grow" role="list">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          {plan.popular ? (
            <BorderBeam duration={8} containerClassName="w-full rounded-md">
              <Button size="lg" className="w-full one-button bg-white text-black hover:bg-white/90">
                {plan.cta}
                <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </BorderBeam>
          ) : (
            <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white/10">
              {plan.cta}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
} 
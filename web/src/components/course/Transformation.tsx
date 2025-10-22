import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Trophy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricItem {
  title: string;
  description: string;
  step?: string;
}

interface SuccessStory {
  name: string;
  title: string;
  beforeSituation: string;
  afterResults: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

export function Transformation() {
  const increaseMetrics: MetricItem[] = [
    {
      title: "Profits",
      description: "Through systematic sales optimization",
      step: "SELL, NURTURE, & UPSELL"
    },
    {
      title: "Sales",
      description: "Using AI-powered conversion copy",
      step: "SELL, ENGAGE, & NURTURE"
    },
    {
      title: "Lead Quality",
      description: "With refined targeting and qualification",
      step: "HOOK, GIFT, & IDENTIFY"
    },
    {
      title: "Average Order Value",
      description: "Strategic upsell timing and offers",
      step: "UPSELL"
    },
    {
      title: "Conversion Rates",
      description: "Optimized across entire funnel",
      step: "HOOK, GIFT, SELL"
    },
    {
      title: "Customer Lifetime Value",
      description: "Full framework implementation",
      step: "NURTURE, UPSELL, UNDERSTAND"
    },
    {
      title: "Email Performance",
      description: "AI-crafted sequences and content",
      step: "NURTURE"
    },
    {
      title: "Customer Engagement",
      description: "Personalized content and support",
      step: "ENGAGE, UNDERSTAND"
    }
  ];

  const decreaseMetrics: MetricItem[] = [
    {
      title: "Customer Acquisition Costs",
      description: "Higher conversion efficiency",
      step: "HOOK, GIFT, & SELL"
    },
    {
      title: "Cost Per Lead",
      description: "Optimized lead generation",
      step: "GIFT & NURTURE"
    },
    {
      title: "Unqualified Leads",
      description: "Precise targeting with Foundation",
      step: "HOOK & IDENTIFY"
    },
    {
      title: "Time To Sale",
      description: "Automated nurture sequences",
      step: "NURTURE"
    },
    {
      title: "Cart Abandonment",
      description: "Timely recovery sequences",
      step: "ENGAGE & NURTURE"
    },
    {
      title: "Response Times",
      description: "AI-powered automation",
      step: "ENGAGE"
    },
    {
      title: "Manual Work Hours",
      description: "Framework + AI efficiency",
      step: "ALL STEPS"
    },
    {
      title: "Marketing Waste",
      description: "Better performing content",
      step: "ALL STEPS"
    }
  ];

  const successStory: SuccessStory = {
    name: "Sarah K.",
    title: "Ecommerce Store Owner",
    beforeSituation: "Wasting 15+ hours weekly tweaking AI prompts. Generated content was hit-or-miss, rarely matching our brand voice.",
    afterResults: "Cut AI workflow time by 73%. Now consistently producing on-brand content that converts at 2.8X our previous rate.",
    metrics: [
      { label: "Time Saved", value: "15hr/wk" },
      { label: "Content Quality", value: "+180%" },
      { label: "Conversion Rate", value: "2.8X" },
      { label: "Revenue Growth", value: "+156%" }
    ]
  };

  return (
    <section className="py-24 bg-gradient-to-b from-primary/5 via-transparent to-transparent" id="transformation">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            Complete Business Transformation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by The Elevate Ecommerce Framework & AI Playbook
          </h2>
          <p className="text-lg text-muted-foreground">
            This Course Isn't Just About AI Prompts – It's About Systematically Implementing Them Within a Proven Growth Framework
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Increase Column */}
          <Card className="p-8 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Increase</h3>
            </div>
            <div className="space-y-6">
              {increaseMetrics.map((metric, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowUpRight className="w-5 h-5 mt-1 flex-shrink-0 text-primary" />
                  <div>
                    <h4 className="font-semibold text-lg">{metric.title}</h4>
                    <p className="text-muted-foreground">{metric.description}</p>
                    {metric.step && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {metric.step}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Decrease Column */}
          <Card className="p-8 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold">Decrease</h3>
            </div>
            <div className="space-y-6">
              {decreaseMetrics.map((metric, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowDownRight className="w-5 h-5 mt-1 flex-shrink-0 text-destructive" />
                  <div>
                    <h4 className="font-semibold text-lg">{metric.title}</h4>
                    <p className="text-muted-foreground">{metric.description}</p>
                    {metric.step && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {metric.step}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Success Story */}
        <Card className="max-w-3xl mx-auto p-8 mb-12">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-xl">{successStory.name}</h4>
                <Badge variant="outline">{successStory.title}</Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                <span className="font-medium">Before: </span>
                {successStory.beforeSituation}
              </p>
              <p className="text-muted-foreground mb-6">
                <span className="font-medium">After: </span>
                {successStory.afterResults}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {successStory.metrics.map((metric, index) => (
                  <div key={index} className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="font-bold text-xl text-primary">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <a href="#pricing">
            <Button size="lg" className="text-lg px-8 group">
              Achieve Total Transformation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            Join successful store owners implementing the complete AI-powered Elevate System
          </p>
        </div>
      </div>
    </section>
  );
} 
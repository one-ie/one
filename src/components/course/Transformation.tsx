import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransformationItem {
  before: string;
  after: string;
}

export function Transformation() {
  const transformations: TransformationItem[] = [
    {
      before: "Random AI experiments with inconsistent results",
      after: "Systematic AI implementation with predictable outcomes"
    },
    {
      before: "Hours spent writing prompts with mediocre outputs",
      after: "Minutes to generate high-converting content every time"
    },
    {
      before: "Disconnected marketing efforts across channels",
      after: "Cohesive customer journey from first touch to advocacy"
    },
    {
      before: "Wasted ad spend on untested messaging",
      after: "Data-driven hook creation with proven frameworks"
    },
    {
      before: "Slow content creation bottlenecking growth",
      after: "On-demand content pipeline scaling with your needs"
    },
    {
      before: "Frustration with AI's potential vs. reality",
      after: "Confidence in leveraging AI as your strategic advantage"
    }
  ];

  const businessImpacts = [
    {
      metric: "Time Savings",
      value: "15+ hrs/week",
      description: "Reclaim hours previously spent on content creation and testing"
    },
    {
      metric: "Revenue Lift",
      value: "186%",
      description: "Average revenue growth in first 6 months of implementation"
    },
    {
      metric: "Conversion Rate",
      value: "3.2X",
      description: "Increase in conversion rates across marketing assets"
    },
    {
      metric: "Content Output",
      value: "10X",
      description: "Produce more high-quality content in less time"
    }
  ];

  return (
    <section className="py-20 bg-primary/5" id="transformation">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="bg-primary/10 mb-4">
            Results That Matter
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Complete Business Transformation
          </h2>
          <p className="text-xl text-muted-foreground">
            Powered by the Elevate Framework & AI Playbook
          </p>
        </div>

        {/* Before & After */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-10">Before & After</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-red-200 bg-red-50/20 dark:bg-red-950/10">
              <h4 className="text-xl font-semibold mb-6 text-center text-red-600 dark:text-red-400">Before Framework</h4>
              <ul className="space-y-4">
                {transformations.map((item, index) => (
                  <li key={`before-${index}`} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                      ✖
                    </div>
                    <p>{item.before}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-green-200 bg-green-50/20 dark:bg-green-950/10">
              <h4 className="text-xl font-semibold mb-6 text-center text-green-600 dark:text-green-400">After Framework</h4>
              <ul className="space-y-4">
                {transformations.map((item, index) => (
                  <li key={`after-${index}`} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p>{item.after}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Business Impact */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-10">Measurable Business Impact</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {businessImpacts.map((impact, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:border-primary/20 group">
                <h4 className="text-lg font-medium text-muted-foreground mb-2">{impact.metric}</h4>
                <p className="text-4xl font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-300">{impact.value}</p>
                <p className="text-sm text-muted-foreground">{impact.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-primary/20">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <Badge className="mb-4 bg-primary/5 text-primary">SUCCESS STORY</Badge>
                  <h3 className="text-2xl font-bold mb-4">From Testing to Transforming</h3>
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground mb-6">
                    "Before implementing the Elevate Framework, we spent weeks writing and testing prompts with little to show for it. Within days of following the system, we generated more high-converting ad copy than our previous quarter, and our revenue jumped 213% in just 60 days."
                  </blockquote>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Founder, StyleScope Boutique</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-4 md:w-1/3">
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-primary">213%</span>
                    <span className="text-muted-foreground">Revenue Increase</span>
                  </div>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-primary">87%</span>
                    <span className="text-muted-foreground">Time Savings</span>
                  </div>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-primary">5X</span>
                    <span className="text-muted-foreground">Content Output</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Transform Your Business With AI</h3>
          <p className="text-muted-foreground mb-8">
            Join successful ecommerce leaders who've turned AI from a random experiment into their strategic advantage
          </p>
          <Button size="lg" className="text-lg px-8 group">
            Get The Complete System 
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
} 
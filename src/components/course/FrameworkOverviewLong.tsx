import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, GraduationCap, Trophy, Check } from "lucide-react";
import Elevate from "./Elevate";

export function FrameworkOverview() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="container px-4 mx-auto relative">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6">The Elevate Ecommerce Framework</h2>
        <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Your Complete AI Growth System
          Transform random AI experiments into a systematic approach for predictable ecommerce growth
        </p>
        <Elevate />

        {/* Framework Overview */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Strategic Framework */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Strategic Framework</h3>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">The Strategic Map for Growth</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The Elevate Ecommerce Framework provides your complete roadmap for systematic ecommerce growth. It transforms scattered marketing efforts into a cohesive, predictable system that consistently delivers results.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Clear, logical 9-step process covering your entire customer journey</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Proven sequence that builds momentum and compounds results</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Strategic checkpoints to ensure consistent progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prompt Playbook For Ecommerce */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" />
                <h3 className="text-lg font-semibold">AI Prompt Playbook For Ecommerce</h3>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">The High-Speed Engine</h4>
                <p className="text-muted-foreground leading-relaxed">
                  While the framework provides direction, the AI Prompt Playbook For Ecommerce delivers the tools for rapid execution. Get field-tested prompts designed specifically for each step of your journey.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">200+ proven prompts optimized for ecommerce growth</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Step-by-step implementation guides for each framework stage</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Ready-to-use templates for instant deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Power */}
          <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4 text-center">The Power of Framework + Playbook</h3>
            <p className="text-center text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The Elevate Ecommerce Framework provides the strategic map, while the AI Prompt Playbook For Ecommerce provides the high-speed engine, creating a powerful system for achieving predictable, scalable e-commerce growth.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="p-4 text-center">
                <h4 className="font-semibold mb-2">Systematic Approach</h4>
                <p className="text-sm text-muted-foreground">Transform random experiments into predictable growth</p>
              </Card>
              <Card className="p-4 text-center">
                <h4 className="font-semibold mb-2">Rapid Implementation</h4>
                <p className="text-sm text-muted-foreground">Execute strategies 10x faster with AI automation</p>
              </Card>
              <Card className="p-4 text-center">
                <h4 className="font-semibold mb-2">Proven Results</h4>
                <p className="text-sm text-muted-foreground">Follow the exact system our successful students use</p>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <a href="#pricing">
              <Button size="lg" className="text-lg px-8">
                Get Access to the Complete System
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              Join successful store owners using our proven system to scale with AI
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 
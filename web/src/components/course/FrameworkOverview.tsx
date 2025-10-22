import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, MessageSquare, Check } from "lucide-react";

export function FrameworkOverview() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="container px-4 mx-auto relative">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6">Your AI Growth System: Playbook, Ebook, Community</h2>
        <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          The ONE Playbook is your complete toolkit designed to systematize and accelerate your e-commerce growth using Artificial Intelligence effectively.
        </p>

        {/* System Components */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Strategy Ebook */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Strategy Ebook</h3>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">Master the "Why"</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive guide through building the crucial Foundation for AI success. Learn timeless principles to define your irresistible offer.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Deep Customer Avatar understanding</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Irresistible Offer crafting framework</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Market Positioning clarity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 100 Prompt System */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <ArrowRight className="w-5 h-5" />
                <h3 className="text-lg font-semibold">100 Prompt System</h3>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">Execute & Scale</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Get straight to results with our curated system of 100+ field-tested, Ecom-specific prompts designed for rapid implementation.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">100+ proven prompts for Ecom growth</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Organized by marketing goals</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Works with all major AI platforms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Expert Community</h3>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">Learn & Grow</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Join a thriving community of Ecom leaders using AI. Get support, share insights, and stay ahead of the curve.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">24/7 peer support & collaboration</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Expert insights & best practices</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">Regular strategy updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4 text-center">The Power of System + Support</h3>
            <p className="text-center text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The ONE Playbook combines strategic knowledge, proven prompts, and community support to create a complete solution for achieving predictable, scalable e-commerce growth with AI.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="p-4 text-center">
                <h4 className="font-semibold mb-2">Foundation First</h4>
                <p className="text-sm text-muted-foreground">Build your strategic bedrock</p>
              </Card>
              <Card className="p-4 text-center">
                <h4 className="font-semibold mb-2">Rapid Execution</h4>
                <p className="text-sm text-muted-foreground">Implement with proven prompts</p>
              </Card>
              <Card className="p-4 text-center">
                <h4 className="font-semibold mb-2">Ongoing Growth</h4>
                <p className="text-sm text-muted-foreground">Learn from the community</p>
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
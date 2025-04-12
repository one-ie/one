import React from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ModuleContentProps {
  module: {
    title: string;
    description: string;
    features: string[];
    details: {
      overview: string;
      benefits: string[];
      implementation: string[];
    };
  };
}

export function CourseModuleContent({ module }: ModuleContentProps) {
  return (
    <Card className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Module Header */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">{module.title}</h3>
          <p className="text-xl text-muted-foreground">{module.description}</p>
        </div>

        {/* Overview Section */}
        <div className="mb-12">
          <h4 className="text-xl font-semibold mb-4">Overview</h4>
          <p className="text-muted-foreground leading-relaxed">{module.details.overview}</p>
        </div>

        {/* Key Benefits */}
        <div className="mb-12">
          <h4 className="text-xl font-semibold mb-4">Key Benefits</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {module.details.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Steps */}
        <div className="mb-12">
          <h4 className="text-xl font-semibold mb-4">Implementation Steps</h4>
          <div className="space-y-4">
            {module.details.implementation.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-muted-foreground pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features List */}
        <div>
          <h4 className="text-xl font-semibold mb-4">What's Included</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {module.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-muted-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 
'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpenIcon, 
  PenToolIcon, 
  RocketIcon, 
  BarChartIcon,
  LucideIcon 
} from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  timeline: string;
}

const steps: Step[] = [
  {
    icon: BookOpenIcon,
    title: "Learn the Framework",
    description: "Master the 9-step ELEVATE framework and understand how each component drives ecommerce growth",
    timeline: "Day 1-2"
  },
  {
    icon: PenToolIcon,
    title: "Implement Key Prompts",
    description: "Start with high-impact prompts for your most pressing needs - product descriptions, ads, or email sequences",
    timeline: "Day 3-5"
  },
  {
    icon: RocketIcon,
    title: "Build Your System",
    description: "Set up your complete AI workflow using our templates and step-by-step implementation guides",
    timeline: "Week 1-2"
  },
  {
    icon: BarChartIcon,
    title: "Optimize & Scale",
    description: "Fine-tune your results and expand implementation across your entire customer journey",
    timeline: "Week 2-4"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container px-4 mx-auto relative">
        <div className="text-center mb-12">
          <div className="mb-4">
            <Badge variant="outline">Implementation Process</Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Path to Predictable Growth
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow our proven implementation process to transform your AI experiments into systematic success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {step.timeline}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Get expert guidance and support at every step of your implementation
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline">Step-by-Step Guides</Badge>
            <Badge variant="outline">Live Q&A Support</Badge>
            <Badge variant="outline">Private Community</Badge>
          </div>
        </div>
      </div>
    </section>
  );
} 
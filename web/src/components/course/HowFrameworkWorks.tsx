import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, MessageSquare, Zap } from "lucide-react";

export function HowFrameworkWorks() {
  const steps = [
    {
      number: "01",
      title: "Establish Your Foundation",
      description: "Build the essential strategic bedrock using the Ebook & worksheets to define your Company Context, Market Awareness, and Ideal Customer Avatar. This rich data fuels the prompt system.",
      focus: ["Unique Offers", "Brand Voice", "Customer Pains/Desires"],
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Choose Your Play & Prompts",
      description: "Navigate the 100 Prompt System, organized by key marketing objectives. Find the specific prompts designed for your task (writing ads, emails, product descriptions, etc.).",
      focus: ["Select marketing goal", "Choose relevant prompts", "Customize with your data"],
      icon: <Zap className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Execute, Learn & Grow",
      description: "Generate assets with AI, implement your strategy, and improve with community support. Get feedback, share insights, and stay updated with the latest AI marketing trends.",
      focus: ["Generate content", "Get community feedback", "Optimize & scale"],
      icon: <MessageSquare className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">How the ONE Playbook Works</h2>
          <p className="text-xl text-muted-foreground">
            Your Simplified Path to AI-Powered Ecom Growth
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <Card key={step.number} className="p-6 relative">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <div className="absolute top-6 right-6 text-4xl font-bold text-primary/10">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {step.description}
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Focus Areas:</p>
                <ul className="space-y-1">
                  {step.focus.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="text-lg px-8" asChild>
            <a href="#pricing">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Join successful store owners using our proven system
          </p>
        </div>
      </div>
    </section>
  );
} 
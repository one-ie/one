import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, MessageSquare, Zap } from "lucide-react";

export function CourseModules() {
  const modules = [
    {
      title: "Strategy Ebook",
      description: "Master the foundational principles for AI success in e-commerce",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      features: [
        "Company Context Framework",
        "Market Analysis Templates",
        "Customer Avatar Worksheets",
        "Strategic Planning Tools",
        "Implementation Guides",
        "Case Studies & Examples"
      ]
    },
    {
      title: "100 Prompt System",
      description: "Field-tested prompts for rapid implementation across marketing channels",
      icon: <Zap className="w-6 h-6 text-primary" />,
      features: [
        "Product Descriptions",
        "Ad Copy & Headlines",
        "Email Sequences",
        "Social Media Content",
        "SEO Optimization",
        "Customer Support Scripts"
      ]
    },
    {
      title: "Expert Community",
      description: "Connect with successful store owners and get ongoing support",
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      features: [
        "Weekly Strategy Calls",
        "Implementation Support",
        "Peer Networking",
        "Latest AI Updates",
        "Resource Sharing",
        "Success Stories"
      ]
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Inside the ONE Playbook
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to transform your e-commerce business with AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {modules.map((module, index) => (
            <Card key={index} className="p-6">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {module.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {module.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium">Includes:</p>
                <ul className="space-y-2">
                  {module.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {feature}
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
              Get Complete System
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            One-time payment. Lifetime access. No subscriptions.
          </p>
        </div>
      </div>
    </section>
  );
} 
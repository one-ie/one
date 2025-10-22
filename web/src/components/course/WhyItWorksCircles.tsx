import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, MessageCircle, MessagesSquare, MessageSquareDashed, MessageSquarePlus, MessageSquareMore, Lightbulb, MessagesSquare as GroupChat, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhyItWorksCircles() {
  const limitations = [
    {
      title: "Lacks Strategy & Context",
      description: "Asking for an \"ad\" without deep customer understanding is like throwing darts blindfolded",
      icon: <MessageCircle className="w-5 h-5 text-red-500" />
    },
    {
      title: "Yields Generic Output",
      description: "Without rich context, AI defaults to bland, generalized language",
      icon: <MessagesSquare className="w-5 h-5 text-red-500" />
    },
    {
      title: "Endless Trial-and-Error",
      description: "Stuck in a loop of refining prompts without building a repeatable process",
      icon: <MessageSquareDashed className="w-5 h-5 text-red-500" />
    },
    {
      title: "Creates Disconnected Assets",
      description: "Random generations aren't inherently connected to your broader marketing strategy",
      icon: <MessageSquarePlus className="w-5 h-5 text-red-500" />
    },
    {
      title: "Doesn't Guarantee Focus",
      description: "Time wasted on less critical tasks while neglecting major leverage points",
      icon: <MessageSquareMore className="w-5 h-5 text-red-500" />
    }
  ];

  const advantages = [
    {
      title: "Strategic Foundation First",
      description: "The system forces you to start with deep clarity on your Customer, Company Context, and Market. This rich Foundation data becomes the essential fuel for every AI prompt in the Playbook.",
      icon: <MessageCircle className="w-5 h-5 text-green-500" />
    },
    {
      title: "Contextual Relevance",
      description: "Each prompt is designed for a specific Framework Step and its unique objective. The AI knows exactly why it's generating each asset and how it fits into the bigger picture.",
      icon: <GroupChat className="w-5 h-5 text-green-500" />
    },
    {
      title: "Proven Prompts",
      description: "Skip becoming a prompt engineer. Use our tested, pre-engineered prompts specifically designed for ecommerce tasks within this framework. Dramatically reduce trial-and-error.",
      icon: <MessageSquareHeart className="w-5 h-5 text-green-500" />
    },
    {
      title: "System Synergy & Efficiency",
      description: "Assets naturally connect because they originate from the same Foundation and follow the framework's logic. Your HOOK aligns with your GIFT; your NURTURE sequence leads to the SELL page content.",
      icon: <MessagesSquare className="w-5 h-5 text-green-500" />
    }
  ];

  // Rest of the component remains the same as WhyItWorks.tsx
  return (
    <section className="py-20 bg-background" id="why-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="bg-primary/5 mb-4">
            The Science Behind The System
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why You Need Your Own AI Framework
          </h2>
          <p className="text-xl text-muted-foreground">
            Let's break down why our framework delivers superior results compared to standalone, "simple" AI prompting
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Left Column - Limitations */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-red-500">
              Simple Prompting's Limitations
            </h3>
            
            <div className="space-y-6">
              {limitations.map((limitation, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-all duration-300 border-red-200 bg-red-50/10 dark:bg-red-950/5">
                  <div className="flex items-start gap-4">
                    {limitation.icon}
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{limitation.title}</h4>
                      <p className="text-muted-foreground">{limitation.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Advantages */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-green-500">
              How Your System will Excel
            </h3>

            <div className="space-y-6">
              {advantages.map((advantage, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-all duration-300 border-green-200 bg-green-50/10 dark:bg-green-950/5">
                  <div className="flex items-start gap-4">
                    {advantage.icon}
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{advantage.title}</h4>
                      <p className="text-muted-foreground">{advantage.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Blueprint Analogy */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            The Blueprint Analogy
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-red-100 bg-red-50/10 dark:bg-red-950/5">
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-red-500" />
                Simple Prompting Is Like:
              </h4>
              <p className="text-muted-foreground">
                Giving someone a powerful hammer but no blueprints, no specific nails, and no instructions – they might eventually build something, but it will be slow, inefficient, and likely unstable.
              </p>
            </Card>

            <Card className="p-6 border-green-100 bg-green-50/10 dark:bg-green-950/5">
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-green-500" />
                Our System Is Like:
              </h4>
              <p className="text-muted-foreground">
                Providing detailed blueprints (the Framework), specialized power tools with precise settings (the Prompts), fueled by the right materials (your Foundation data).
              </p>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Get The Complete System</h3>
          <p className="text-muted-foreground mb-8">
            Stop experimenting. Start implementing what's proven to work.
          </p>
          <a href="#pricing">
            <Button size="lg" className="text-lg px-8 group">
              Access the Framework & Playbook
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
} 
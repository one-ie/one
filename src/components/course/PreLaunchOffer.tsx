import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, Clock, CheckCircle2, User, Video, FileCheck, Star, Shield, AlertTriangle } from "lucide-react";

export function PreLaunchOffer() {
  return (
    <section className="py-24 bg-gradient-to-b from-primary/5 via-background to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Ultra Exclusive Header */}
        <div className="text-center mb-12">
          <Badge variant="destructive" className="mb-4">
            ONLY 4 SPOTS AVAILABLE WORLDWIDE
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text">
           PRE-LAUNCH Offer: Implement the AI Growth System 1:1 Directly with Anthony O'Connell
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            To get some early feedback and to refine the course I am offering personalised implementation sessions with me. This is your <span className="font-bold">single opportunity</span> before May 2025 to bypass the queue and have The Elevate Ecommerce Framework & AI Prompt Playbook For Ecommerce system <span className="font-bold">personally architected and implemented for YOUR business, directly by me.</span>
          </p>
        </div>

        {/* Scarcity Alert */}
        <Card className="max-w-lg mx-auto mb-12 p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">This level of direct access may never be offered again at any price.</p>
          </div>
        </Card>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto p-8 md:p-12 border-primary/20">
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="lead">The full "AI Prompt Playbook For Ecommerce for Ecom Growth" digital course arrives May 1, 2025, offering a powerful self-paced system.</p>
            <p className="font-bold text-xl">But for 4 Ecom Leaders ONLY, I'm offering something far more potent.</p>
            <p>This is <span className="font-bold">not</span> the digital course. This is a <span className="font-bold">white-glove, personalized implementation program</span> designed for maximum speed and impact.</p>
          </div>

          {/* Implementation Steps */}
          <div className="space-y-6 mb-12">
            <h3 className="text-2xl font-semibold">Work 1:1 via private video coaching sessions to:</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: User,
                  title: "Forensically Analyze YOUR Store",
                  description: "Apply Foundation principles with surgical precision to your specific customers, products, market position, and biggest growth bottlenecks."
                },
                {
                  icon: FileCheck,
                  title: "Custom-Build YOUR Framework Strategy",
                  description: "Map the 9 steps (Hook to Share) directly onto your business objectives for immediate relevance."
                },
                {
                  icon: Star,
                  title: "Deploy High-Impact AI Prompts TOGETHER",
                  description: "Get personal guidance using the most crucial Playbook prompts to generate initial, high-performance assets tailored for you."
                },
                {
                  icon: CheckCircle2,
                  title: "Forge YOUR AI Growth Blueprint",
                  description: "Leave with the core structure already implemented and a clear, actionable roadmap designed by the system's creator."
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-12" />

          {/* What You Get */}
          <div className="space-y-8 mb-12">
            <h3 className="text-2xl font-semibold text-center">What You Secure Today for $1,499:</h3>
            <div className="space-y-4">
              {[
                {
                  value: "$4,997+",
                  title: "Direct 1:1 Implementation Coaching with Anthony O'Connell",
                  description: "Intensive, personalized video sessions laser-focused on implementing the system in your specific Ecom business."
                },
                {
                  value: "$997",
                  title: "Guaranteed Lifetime Access to the Digital Course",
                  description: "Full access to all modules, complete prompt library, and future updates (May 1, 2025 launch)."
                },
                {
                  value: "Priceless",
                  title: "Your Bespoke AI System Blueprint",
                  description: "A documented, personalized strategy and action plan crafted during our sessions."
                },
                {
                  value: "Exclusive",
                  title: "Unparalleled Early Mover Advantage",
                  description: "Leverage the system's power months before your competitors even know it exists."
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">${item.value}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extreme Scarcity */}
          <Card className="bg-destructive/5 p-6 mb-12">
            <h3 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              EXTREME SCARCITY: ONLY 4 SPOTS. PERIOD.
            </h3>
            <p className="text-sm mb-4">
              Let me be blunt: My time for 1:1 work is severely limited. I am making <span className="font-bold">only four (4)</span> of these personalized coaching spots available before the official course launch.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                This is strictly first-come, first-served.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                Once these 4 spots are claimed, this specific offer disappears completely and WILL NOT be repeated.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                This level of direct, personal access to implement the system with me may genuinely never be available again at any price.
              </li>
            </ul>
          </Card>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">Secure this unique, high-touch implementation package for just</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl md:text-5xl font-bold text-primary">$1,499</span>
                <Badge variant="outline" className="text-sm">Total Value: Over $6,000+</Badge>
              </div>
            </div>

            <div className="max-w-lg mx-auto">
              <a href="/pay-coaching" className="block p-[1px] bg-white shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-all duration-300">
                <Button size="lg" className="w-full text-lg h-14 bg-[#1E3A8A] hover:bg-black text-white border border-white hover:border-white rounded-none transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                     Work 1:1 with Anthony
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-3">
                Only 4 Spots Worldwide | Offer Vanishes When Full | Includes Lifetime Course Access | Secure Checkout
              </p>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Process & Guarantee */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                The Simple Process
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Click above to claim 1 of 4 spots for $1,499
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Receive my personal email within 24-48 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  Schedule our bespoke implementation sessions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  Get full course access on May 1, 2025
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                My Personal Implementation Guarantee
              </h4>
              <p className="text-sm text-muted-foreground">
                My commitment is to ensure that during our dedicated 1:1 coaching time, we successfully tailor and begin implementing the core pillars of The Elevate Ecommerce Framework & AI Prompt Playbook For Ecommerce system specifically for your business. If, by the end of our scheduled sessions, you don't feel we have achieved this foundational implementation together, I will personally work with you to find a solution or offer a full refund.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
} 
import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight, 
  GraduationCap, 
  Trophy, 
  Zap, 
  Star,
  User,
  Building,
  Globe,
  Megaphone,
  ShoppingCart,
  TrendingUp,
  Code as CodeIcon,
  BarChart,
  LayoutGrid,
  BookOpen,
  Hourglass,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FrameworkStepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FrameworkStep = ({ number, title, description, icon, children }: FrameworkStepProps) => (
  <div className="mb-20">
    <div className="flex items-center gap-5 mb-8">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white border border-white/20">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">STEP {number}</Badge>
          <h3 className="text-3xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-xl text-gray-300 mt-2 max-w-3xl">
          {description}
        </p>
      </div>
    </div>
    <div className="pl-8 md:pl-20">
      {children}
    </div>
  </div>
);

export function HowFrameworkWorks() {
  return (
    <section className="py-24" id="how-it-works">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="bg-white/5 border-white/20 text-white mb-4 px-4 py-1">
            Systematic Implementation
          </Badge>
          <h2 className="text-4xl md:text-4xl font-bold mb-6 text-white">
            How The Elevate Ecommerce Framework Works
          </h2>
          <p className="text-xl text-gray-300">
            Your Complete System for AI-Accelerated Ecommerce Growth
          </p>
        </div>

        {/* Step 1: Foundation */}
        <FrameworkStep 
          number="01"
          title="Start with Your Foundation" 
          description="Before taking any marketing action, establish deep clarity by defining your essential building blocks."
          icon={<GraduationCap className="w-7 h-7" />}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold text-white">Customer Avatar</h4>
              </div>
              <p className="text-gray-300">Map out your ideal customer's pains and desires (like "Sam Store")</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Deep understanding of motivations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Specific pain points & desires</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold text-white">Company Context</h4>
              </div>
              <p className="text-gray-300">Define your offers and unique brand voice</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Clear value proposition</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Consistent brand messaging</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold text-white">Market Awareness</h4>
              </div>
              <p className="text-gray-300">Understand your market positioning and competition</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Competitive advantage identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Market trend analysis</span>
                </li>
              </ul>
            </Card>
          </div>
        </FrameworkStep>
        
        {/* Step 2: 9 Sequential Steps */}
        <FrameworkStep 
          number="02"
          title="Follow the 9 Sequential Steps" 
          description="Build momentum logically through our proven sequence, addressing each critical part of the customer journey."
          icon={<Trophy className="w-7 h-7" />}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/20 border-blue-800/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <Megaphone className="w-4 h-4 text-blue-400" />
                </div>
                Attract
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">1</div>
                  <span className="text-gray-300">Hook</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">2</div>
                  <span className="text-gray-300">Gift</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">3</div>
                  <span className="text-gray-300">Identify</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-950/50 to-purple-900/20 border-purple-800/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <ShoppingCart className="w-4 h-4 text-purple-400" />
                </div>
                Convert
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">4</div>
                  <span className="text-gray-300">Engage</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">5</div>
                  <span className="text-gray-300">Sell</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">6</div>
                  <span className="text-gray-300">Nurture</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-950/50 to-green-900/20 border-green-800/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                Grow
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-xs font-bold text-green-300">7</div>
                  <span className="text-gray-300">Upsell</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-xs font-bold text-green-300">8</div>
                  <span className="text-gray-300">Understand</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-xs font-bold text-green-300">9</div>
                  <span className="text-gray-300">Share</span>
                </li>
              </ul>
            </Card>
          </div>
        </FrameworkStep>
        
        {/* Step 3: AI Prompt Playbook For Ecommerce */}
        <FrameworkStep 
          number="03"
          title="Leverage the AI Prompt Playbook For Ecommerce" 
          description="Accelerate your implementation with pre-tested prompts designed for each step's objective."
          icon={<Zap className="w-7 h-7" />}
        >
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <CodeIcon className="w-4 h-4 text-primary" />
                </div>
                Example Workflow (HOOK Step)
              </h4>
              <ol className="space-y-4 relative">
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-white/10"></div>
                {[
                  "Identify goal: Create compelling Ad Headlines",
                  "Select relevant prompt from Playbook",
                  "Insert Foundation data into prompt",
                  "Generate multiple draft headlines instantly"
                ].map((step, index) => (
                  <li key={index} className="pl-12 relative">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-black">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{step}</p>
                  </li>
                ))}
              </ol>
            </Card>
            
            <div className="space-y-10">
              <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-xl font-semibold text-white">Review & Refine</h4>
                </div>
                <p className="text-gray-300">
                  AI output is your first draft. Review, refine, and ensure brand alignment before implementation.
                </p>
              </Card>
              
              <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart className="w-5 h-5 text-primary" />
                  <h4 className="text-xl font-semibold text-white">Measure & Optimize</h4>
                </div>
                <p className="text-gray-300">
                  Track key metrics for each step to measure impact and identify optimization opportunities.
                </p>
              </Card>
            </div>
          </div>
        </FrameworkStep>
        
        {/* Framework Benefits */}
        <div className="max-w-4xl mx-auto mt-20 mb-20">
          <Card className="bg-gradient-to-br from-gray-900 to-black border-white/10 p-10 shadow-xl">
            <h3 className="text-2xl font-bold text-center mb-10 text-white">
              The Framework Transforms AI From a Confusing Novelty Into Your Strategic Growth Engine
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { title: "Structure", desc: "Clear, logical 9-step roadmap", icon: <LayoutGrid className="w-5 h-5 text-primary" /> },
                { title: "Strategy", desc: "Deep Foundation knowledge", icon: <BookOpen className="w-5 h-5 text-primary" /> },
                { title: "Speed", desc: "Efficient AI integration", icon: <Hourglass className="w-5 h-5 text-primary" /> },
                { title: "Control", desc: "You guide implementation", icon: <UserCheck className="w-5 h-5 text-primary" /> }
              ].map((benefit, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <p className="font-semibold text-white text-xl mb-2">{benefit.title}</p>
                  <p className="text-gray-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
} 
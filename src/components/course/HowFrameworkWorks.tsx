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
          title="Establish Your Foundation" 
          description="Before taking any marketing action, you must establish deep clarity by defining your essential strategic building blocks. This ensures every subsequent step and AI prompt is hyper-relevant."
          icon={<GraduationCap className="w-7 h-7" />}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold text-white">Company Context</h4>
              </div>
              <p className="text-gray-300">Define your unique offers, powerful brand voice, and core value proposition</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Clear differentiation and product/service articulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Consistent and authentic brand messaging</span>
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
              <p className="text-gray-300">Understand your competitive landscape and market positioning</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Identify competitive advantages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Leverage current market dynamics</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold text-white">Customer Avatar</h4>
              </div>
              <p className="text-gray-300">Map out your specific ideal customer's pains, desires, and motivations</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Deep understanding of THEIR specific motivations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Clarity on the specific pain points & desires THEY face</span>
                </li>
              </ul>
            </Card>
          </div>
        </FrameworkStep>
        
        {/* Step 2: 9 Sequential Steps */}
        <FrameworkStep 
          number="02"
          title="Follow the 9 Sequential Steps" 
          description="Build momentum logically through our proven sequence. The framework guides you step-by-step, addressing each critical part of the customer journey for systematic growth."
          icon={<Trophy className="w-7 h-7" />}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/20 border-blue-800/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <Megaphone className="w-4 h-4 text-blue-400" />
                </div>
                Attract (Elevate Reach)
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">1</div>
                  <span className="text-gray-300">FIND</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">2</div>
                  <span className="text-gray-300">GIFT</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">3</div>
                  <span className="text-gray-300">IDENTIFY</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-950/50 to-purple-900/20 border-purple-800/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <ShoppingCart className="w-4 h-4 text-purple-400" />
                </div>
                Convert (Elevate Sales)
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">4</div>
                  <span className="text-gray-300">ENGAGE</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">5</div>
                  <span className="text-gray-300">SELL</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">6</div>
                  <span className="text-gray-300">NURTURE</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-950/50 to-green-900/20 border-green-800/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                Grow (Elevate Value)
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-xs font-bold text-green-300">7</div>
                  <span className="text-gray-300">UPSELL</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-xs font-bold text-green-300">8</div>
                  <span className="text-gray-300">UNDERSTAND</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-xs font-bold text-green-300">9</div>
                  <span className="text-gray-300">SHARE</span>
                </li>
              </ul>
            </Card>
          </div>
        </FrameworkStep>
        
        {/* Step 3: AI Prompt Playbook For Ecommerce */}
        <FrameworkStep 
          number="03"
          title="Leverage the AI Prompt Playbook For Ecommerce" 
          description="Accelerate your implementation at every stage. Use pre-tested, Ecom-specific prompts designed for each framework step's objective."
          icon={<Zap className="w-7 h-7" />}
        >
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30 p-8">
              <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <CodeIcon className="w-4 h-4 text-primary" />
                </div>
                Example Workflow (Step 1: FIND)
              </h4>
              <ol className="space-y-4 relative">
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-white/10"></div>
                {[
                  "Identify Goal: Strategically locate ideal customers and create compelling initial engagement headlines/messages",
                  "Select relevant prompt from the FIND module in the Playbook",
                  "Insert your detailed Foundation data into prompt placeholders",
                  "Generate multiple draft FIND assets instantly via AI"
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
                  AI output is your powerful first draft. You always review, refine, and ensure perfect brand alignment before implementation. You remain in control.
                </p>
              </Card>
              
              <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart className="w-5 h-5 text-primary" />
                  <h4 className="text-xl font-semibold text-white">Measure & Optimize</h4>
                </div>
                <p className="text-gray-300">
                  Track key metrics related to each framework step to measure impact and continuously optimize your system.
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
                { title: "Structure", desc: "Clear, logical 9-step roadmap for action", icon: <LayoutGrid className="w-5 h-5 text-primary" /> },
                { title: "Strategy", desc: "Decisions fueled by deep Foundation knowledge", icon: <BookOpen className="w-5 h-5 text-primary" /> },
                { title: "Speed", desc: "Efficient AI integration via the Prompt Playbook", icon: <Hourglass className="w-5 h-5 text-primary" /> },
                { title: "Control", desc: "You guide the AI and the implementation", icon: <UserCheck className="w-5 h-5 text-primary" /> }
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
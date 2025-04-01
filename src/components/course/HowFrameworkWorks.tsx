import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, GraduationCap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HowFrameworkWorks() {
  return (
    <section className="py-20 text-white" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="bg-transparent border-white/20 text-white mb-4">
            Systematic Implementation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            How the Elevate Ecommerce Framework Works
          </h2>
          <p className="text-xl text-gray-300">
            Your Complete System for AI-Accelerated Growth
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1: Foundation */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <GraduationCap className="w-8 h-8 text-white" />
              <h3 className="text-3xl font-bold text-white">1. Start with Your Foundation</h3>
            </div>
            <p className="text-xl text-gray-300 mb-12 max-w-4xl">
              Before taking any marketing action, establish deep clarity by defining your essential building blocks.
            </p>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-2xl font-semibold mb-4 text-white">Customer Avatar</h4>
                <p className="text-gray-300">Map out your ideal customer's pains and desires (like "Sam Store")</p>
              </div>
              
              <div>
                <h4 className="text-2xl font-semibold mb-4 text-white">Company Context</h4>
                <p className="text-gray-300">Define your offers and unique brand voice</p>
              </div>
              
              <div>
                <h4 className="text-2xl font-semibold mb-4 text-white">Market Awareness</h4>
                <p className="text-gray-300">Understand your market positioning and competition</p>
              </div>
            </div>
          </div>
          
          {/* Step 2: 9 Sequential Steps */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Trophy className="w-8 h-8 text-white" />
              <h3 className="text-3xl font-bold text-white">2. Follow the 9 Sequential Steps</h3>
            </div>
            <p className="text-xl text-gray-300 mb-12 max-w-4xl">
              Build momentum logically through our proven sequence, addressing each critical part of the customer journey.
            </p>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-white/5 p-8 rounded-lg">
                <h4 className="text-2xl font-semibold mb-6 text-white">Attract</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Hook
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Gift
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Identify
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/5 p-8 rounded-lg">
                <h4 className="text-2xl font-semibold mb-6 text-white">Convert</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Engage
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Sell
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Nurture
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/5 p-8 rounded-lg">
                <h4 className="text-2xl font-semibold mb-6 text-white">Grow</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Upsell
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Understand
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">•</span> Share
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Step 3: AI Prompt Playbook */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <h3 className="text-3xl font-bold text-white">3. Leverage the AI Prompt Playbook</h3>
            </div>
            <p className="text-xl text-gray-300 mb-12 max-w-4xl">
              Accelerate your implementation with pre-tested prompts designed for each step's objective.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white/5 p-8 rounded-lg">
                <h4 className="text-2xl font-semibold mb-6 text-white">Example Workflow (HOOK Step)</h4>
                <ol className="space-y-4 ml-5 list-decimal text-gray-300">
                  <li className="pl-2">Identify goal: Create compelling Ad Headlines</li>
                  <li className="pl-2">Select relevant prompt from Playbook</li>
                  <li className="pl-2">Insert Foundation data into prompt</li>
                  <li className="pl-2">Generate multiple draft headlines instantly</li>
                </ol>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-semibold mb-2 text-white">Review & Refine</h4>
                  <p className="text-gray-300">
                    AI output is your first draft. Review, refine, and ensure brand alignment before implementation.
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold mb-2 text-white">Measure & Optimize</h4>
                  <p className="text-gray-300">
                    Track key metrics for each step to measure impact and identify optimization opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Framework Benefits */}
        <div className="max-w-4xl mx-auto mt-24 mb-20 bg-white/5 p-10 rounded-xl">
          <h3 className="text-2xl font-bold text-center mb-10 text-white">
            The Framework Transforms AI From a Confusing Novelty Into Your Strategic Growth Engine
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="font-semibold text-white text-xl mb-2">Structure</p>
              <p className="text-gray-400">Clear, logical 9-step roadmap</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white text-xl mb-2">Strategy</p>
              <p className="text-gray-400">Deep Foundation knowledge</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white text-xl mb-2">Speed</p>
              <p className="text-gray-400">Efficient AI integration</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white text-xl mb-2">Control</p>
              <p className="text-gray-400">You guide implementation</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Get Started with the Framework</h3>
          <p className="text-gray-300 mb-8">
            Join successful store owners using our proven system to scale with AI
          </p>
          <Button size="lg" className="text-lg px-8 bg-white text-black hover:bg-gray-200 group">
            Get the Complete System
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
} 
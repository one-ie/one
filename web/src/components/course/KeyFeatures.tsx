import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Check, User } from "lucide-react";
import { ArrowRight, Shield } from "lucide-react";

export function KeyFeatures() {
  return (
    <section className="container mx-auto px-6 py-12 border-b border-border bg-background/30 backdrop-blur-sm">
       
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="rounded-full bg-primary/10 p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Proven System</h3>
            <p className="text-muted-foreground">
              Field-tested framework used by successful ecommerce stores to generate predictable growth with AI
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="rounded-full bg-primary/10 p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">200+ Tested Prompts</h3>
            <p className="text-muted-foreground">
              Skip the experimentation with our library of proven prompts designed specifically for ecommerce
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="rounded-full bg-primary/10 p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Support</h3>
            <p className="text-muted-foreground">
              Get guidance from our community of successful ecommerce owners and AI experts
            </p>
          </Card>
        </div>
{/* Trust Elements */}
<div className="mt-8 space-y-6">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Designed for Ecom Owners & Managers
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Leverage ChatGPT, Claude, Deepseek & Gemini
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Powered by the 9-Step Elevate Framework
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              For Shopify, WooCommerce, Clickfunnels & More
            </span>
          </div>

          {/* Partner Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8">
            <img src="/images/logos/logo-openai.svg" alt="OpenAI" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/logos/logo-antrophic.svg" alt="Anthropic" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/logos/logo-google.svg" alt="Claude" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/logos/logo-shopify.svg" alt="Shopify" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/logos/logo-woocommerce.svg" alt="WooCommerce" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          30 Day Money Back Guarantee
        </p>
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join owners of the world's leading ecommerce stores who have transformed their random AI experiments into systematic growth engines
          </p>
         </div>
      </div>
    </section>
  );
}
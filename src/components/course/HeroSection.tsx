import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Shield } from "lucide-react";

interface HeroStat {
  value: string;
  label: string;
}

interface CourseDetails {
  badge: string;
  title: string;
  subtitle: string;
  valueProposition: string;
  guarantee: string;
  ctaText: string;
  spots: {
    total: number;
    remaining: number;
  };
}

interface HeroSectionProps {
  courseDetails: CourseDetails;
  heroStats: HeroStat[];
}

export function CourseHeroSection({ courseDetails, heroStats }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-6 py-16 border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col items-center gap-8 text-center">
        <Badge variant="outline" className="text-sm md:text-base animate-fade-in">
          {courseDetails.badge}
        </Badge>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground one-animate-fade-in">
          {courseDetails.title}
        </h1>
        
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-muted-foreground mb-4">
          {courseDetails.subtitle}
        </p>
        
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed tracking-wide max-w-2xl">
          {courseDetails.valueProposition}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
          {heroStats.map((stat) => (
            <Card key={stat.value} className="p-6 text-center">
              <h3 className="text-3xl font-bold text-primary mb-2">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 button-shadow button-glow button-primary group transition-all duration-300" 
            asChild
          >
            <a href="#pricing" className="no-underline flex items-center">
              <span className="flex flex-col items-start text-left">
                <span className="badge-glow inline-flex items-center">
                  🔥 Special Launch Price
                </span>
                <span className="mt-1">Save $1,000 Today
                </span>
              </span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 button-shadow button-outline group transition-all duration-300" 
            asChild
          >
            <a href="#framework" className="no-underline flex items-center gap-2">
              See Framework Details
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
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
          {courseDetails.guarantee}
        </p>
      </div>
    </section>
  );
} 
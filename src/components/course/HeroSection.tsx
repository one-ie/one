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

        

       
      </div>
    </section>
  );
} 
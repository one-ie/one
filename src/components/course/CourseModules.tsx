import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseModuleContent } from "./CourseModuleContent";

interface ModuleLesson {
  name: string;
  value: string;
}

interface CourseModule {
  title: string;
  description: string;
  objective: string;
  mainDescription: string;
  output: string;
  lessons: ModuleLesson[];
}

interface CourseModulesProps {
  modules: CourseModule[];
}

export function CourseModules({ modules }: CourseModulesProps) {
  return (
    <section className="container mx-auto px-6 py-20 border-t border-border/40">
      <div className="w-full max-w-[1000px] mx-auto">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="outline" className="mb-4">Complete 10-Module System</Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold">Course Modules</h2>
          
          <h3 className="text-3xl md:text-4xl font-bold bg-clip-text">
            Transform Random AI Experiments into a Systematic Growth Engine
          </h3>
          
          <div className="max-w-3xl mx-auto text-muted-foreground space-y-4 leading-relaxed">
            <p>
              Stop wasting time with trial-and-error AI prompts. Our proven 10-module system gives you everything you need to systematically scale your ecommerce store using AI – from initial customer attraction to lasting advocacy.
            </p>
            <p>
              Each module delivers concrete, implementable assets you can use immediately in your business. No theory, just practical systems that work.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-5 h-5 text-primary" />
              <span>Step-by-Step Framework</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-5 h-5 text-primary" />
              <span>200+ Proven Prompts</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-5 h-5 text-primary" />
              <span>Ready-to-Use Templates</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-5 h-5 text-primary" />
              <span>Implementation Guides</span>
            </div>
          </div>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
          {modules.map((module, index) => (
            <div key={index} className="relative flex items-start">
              <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-mono text-lg font-bold ring-1 ring-primary/20 shadow-sm hover:shadow-md hover:bg-primary/20 transition-all duration-300">
                {index + 1}
              </div>
              <div className="ml-12 w-full">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20 bg-card group">
                  <div className="space-y-4">
                    {/* Module Header */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{module.title}</h3>
                        <p className="text-muted-foreground">{module.description}</p>
                      </div>
                      <div className="md:ml-auto flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/5">
                          {module.lessons.length} Lessons
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Module Details */}
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="font-semibold text-primary mb-2">Objective:</p>
                        <p className="text-muted-foreground">{module.objective}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {module.mainDescription}
                        </p>
                      </div>

                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="font-semibold text-primary mb-2">What You'll Create:</p>
                        <p className="text-muted-foreground">{module.output}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Module Content */}
                    <CourseModuleContent lessons={module.lessons} moduleNumber={index} />
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Check } from "lucide-react"; 
import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Check, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join owners of the world's leading ecommerce stores who have transformed their random AI experiments into systematic growth engines
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Badge variant="outline" className="text-sm py-1 px-4">73% Faster Results</Badge>
            <Badge variant="outline" className="text-sm py-1 px-4">3X Better Outputs</Badge>
            <Badge variant="outline" className="text-sm py-1 px-4">186% Growth</Badge>
          </div>
        </div>
      </div>
    </section>
  );
} 
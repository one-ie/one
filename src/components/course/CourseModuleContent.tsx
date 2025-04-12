import { ModuleContentProps } from "@/types/course";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function CourseModuleContent({ module, lessons, moduleNumber }: ModuleContentProps) {
  // Handle legacy format
  if (lessons) {
    return (
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">{lesson.name}</h3>
                <p className="text-muted-foreground">{lesson.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Handle new format
  if (module) {
    return (
      <div className="space-y-8">
        {/* Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <p className="text-muted-foreground">{module.details?.overview}</p>
        </div>

        {/* Benefits */}
        {module.details?.benefits && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Benefits</h3>
            <div className="grid gap-3">
              {module.details.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Steps */}
        {module.details?.implementation && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Implementation</h3>
            <div className="space-y-4">
              {module.details.implementation.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p>{step}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Features</h3>
          <div className="grid gap-3">
            {module.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
} 
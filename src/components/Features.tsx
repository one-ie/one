import { Card } from './ui/card';
import { cn } from '../lib/utils';

export interface Feature {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FeaturesProps {
  features: Feature[];
  className?: string;
}

export default function Features({ features, className }: FeaturesProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {features.map((feature, index) => (
        <Card key={index} className="p-6">
          {feature.icon && (
            <feature.icon className="h-8 w-8 text-primary mb-4" />
          )}
          <h3 className="font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </Card>
      ))}
    </div>
  );
}
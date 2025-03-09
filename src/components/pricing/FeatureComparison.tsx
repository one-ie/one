export interface FeatureItem {
  name: string;
  starter: string;
  pro: string;
  enterprise: string;
}

interface FeatureComparisonProps {
  features: FeatureItem[];
}

export function FeatureComparison({ features }: FeatureComparisonProps) {
  return (
    <div className="one-glass-dark border border-[hsla(var(--one-border))] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-[hsla(var(--one-border))]">
              <th scope="col" className="text-left p-4">Feature</th>
              <th scope="col" className="text-center p-4">Starter</th>
              <th scope="col" className="text-center p-4 bg-[hsla(var(--one-background-nav))]">Professional</th>
              <th scope="col" className="text-center p-4">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr 
                key={feature.name}
                className={index !== features.length - 1 ? "border-b border-[hsla(var(--one-border))]" : ""}
              >
                <td className="p-4 font-medium">{feature.name}</td>
                <td className="text-center p-4">{feature.starter}</td>
                <td className="text-center p-4 bg-[hsla(var(--one-background-nav))]">{feature.pro}</td>
                <td className="text-center p-4">{feature.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
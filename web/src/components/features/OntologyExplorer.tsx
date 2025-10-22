/**
 * Ontology Explorer Component
 *
 * Demonstrates runtime ontology discovery
 * Shows enabled features, thing types, connection types, and event types
 */

import { useOntology, useFeatureBreakdown } from '@/hooks/useOntology';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function OntologyExplorer() {
  const { ontology, isLoading } = useOntology();
  const breakdown = useFeatureBreakdown();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!ontology) {
    return <div>No ontology data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Metadata Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ontology Composition</CardTitle>
          <CardDescription>
            Generated at {new Date(ontology.metadata.generatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {ontology.metadata.thingTypeCount}
              </div>
              <div className="text-sm text-muted-foreground">Thing Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {ontology.metadata.connectionTypeCount}
              </div>
              <div className="text-sm text-muted-foreground">Connection Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {ontology.metadata.eventTypeCount}
              </div>
              <div className="text-sm text-muted-foreground">Event Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {ontology.features.length}
              </div>
              <div className="text-sm text-muted-foreground">Features</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enabled Features */}
      <Card>
        <CardHeader>
          <CardTitle>Enabled Features</CardTitle>
          <CardDescription>
            Features included in this ontology composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ontology.features.map(feature => (
              <Badge key={feature} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Breakdown */}
      {breakdown && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Feature Breakdown</h2>
          {Object.entries(breakdown).map(([featureName, feature]) => {
            if (!feature) return null;

            return (
              <Card key={featureName}>
                <CardHeader>
                  <CardTitle className="capitalize">{featureName}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Thing Types ({feature.thingTypes.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {feature.thingTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Connection Types ({feature.connectionTypes.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {feature.connectionTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Event Types ({feature.eventTypes.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {feature.eventTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* All Thing Types */}
      <Card>
        <CardHeader>
          <CardTitle>All Thing Types</CardTitle>
          <CardDescription>Complete list of entity types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ontology.thingTypes.map(type => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Connection Types */}
      <Card>
        <CardHeader>
          <CardTitle>All Connection Types</CardTitle>
          <CardDescription>Complete list of relationship types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ontology.connectionTypes.map(type => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Event Types */}
      <Card>
        <CardHeader>
          <CardTitle>All Event Types</CardTitle>
          <CardDescription>Complete list of event types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ontology.eventTypes.map(type => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

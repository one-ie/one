/**
 * Ontology Discovery Hook
 *
 * React hooks for runtime ontology feature detection
 * Use this to build feature-conditional UI that adapts to enabled ontology composition
 *
 * TODO: This hook requires backend integration. For now, commented out to allow frontend-only development.
 * Uncomment when connecting to Convex backend.
 */

// import { useQuery } from "convex/react";
// import { api } from "../../../backend/convex/_generated/api";

// Type definitions for ontology data
export interface OntologyMetadata {
  features: string[];
  thingTypeCount: number;
  connectionTypeCount: number;
  eventTypeCount: number;
  generatedAt: number;
}

export interface Ontology {
  metadata: OntologyMetadata;
  features: string[];
  thingTypes: string[];
  connectionTypes: string[];
  eventTypes: string[];
}

export interface FeatureDetail {
  description: string;
  thingTypes: string[];
  connectionTypes: string[];
  eventTypes: string[];
}

export interface FeatureBreakdown {
  [featureName: string]: FeatureDetail | undefined;
}

/**
 * Hook to get complete ontology information
 * Returns all enabled features, types, and metadata
 *
 * @returns Ontology state with features, types, and helper functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ontology, hasFeature, isLoading } = useOntology();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {hasFeature('blog') && <BlogSection />}
 *       {hasFeature('shop') && <ShopSection />}
 *       <p>Available thing types: {ontology?.thingTypes.join(', ')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOntology() {
  // const ontology = useQuery(api.queries.ontology.getOntology);

  return {
    /** Complete ontology information */
    ontology: null as Ontology | null,
    /** Array of enabled features (e.g., ['core', 'blog', 'portfolio']) */
    features: [] as string[],
    /** Array of available thing types (e.g., ['page', 'user', 'blog_post']) */
    thingTypes: [] as string[],
    /** Array of available connection types (e.g., ['created_by', 'posted_in']) */
    connectionTypes: [] as string[],
    /** Array of available event types (e.g., ['thing_created', 'blog_post_published']) */
    eventTypes: [] as string[],
    /** Metadata about ontology composition (counts, generation time) */
    metadata: undefined as OntologyMetadata | undefined,
    /** Check if a specific feature is enabled */
    hasFeature: (feature: string) => false,
    /** True while ontology data is loading */
    isLoading: false,
  };
}

/**
 * Hook to check if a specific feature is enabled
 * More efficient than useOntology() when you only need to check one feature
 *
 * @param feature - Feature name to check (e.g., 'blog', 'shop', 'portfolio')
 * @returns true if feature is enabled, false otherwise
 *
 * @example
 * ```tsx
 * function BlogButton() {
 *   const hasBlog = useHasFeature('blog');
 *
 *   if (!hasBlog) return null;
 *
 *   return <Button onClick={() => navigate('/blog')}>Blog</Button>;
 * }
 * ```
 */
export function useHasFeature(feature: string) {
  // const hasFeature = useQuery(api.queries.ontology.hasFeature, { feature });
  return false;
}

/**
 * Hook to get ontology metadata
 * Returns counts and generation information
 *
 * @returns Metadata about the current ontology composition
 *
 * @example
 * ```tsx
 * function OntologyStats() {
 *   const metadata = useOntologyMetadata();
 *
 *   if (!metadata) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>Features: {metadata.features.join(', ')}</p>
 *       <p>Thing Types: {metadata.thingTypeCount}</p>
 *       <p>Connection Types: {metadata.connectionTypeCount}</p>
 *       <p>Event Types: {metadata.eventTypeCount}</p>
 *       <p>Generated: {new Date(metadata.generatedAt).toLocaleString()}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOntologyMetadata(): OntologyMetadata | undefined {
  // return useQuery(api.queries.ontology.getMetadata);
  return undefined;
}

/**
 * Hook to get thing types
 * Returns array of all available entity types
 *
 * @returns Array of thing types or empty array while loading
 *
 * @example
 * ```tsx
 * function ThingTypeSelector() {
 *   const thingTypes = useThingTypes();
 *
 *   return (
 *     <select>
 *       {thingTypes.map(type => (
 *         <option key={type} value={type}>{type}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useThingTypes() {
  // const types = useQuery(api.queries.ontology.getThingTypes);
  return [];
}

/**
 * Hook to get connection types
 * Returns array of all available relationship types
 *
 * @returns Array of connection types or empty array while loading
 *
 * @example
 * ```tsx
 * function ConnectionTypeFilter() {
 *   const connectionTypes = useConnectionTypes();
 *
 *   return (
 *     <div>
 *       {connectionTypes.map(type => (
 *         <Checkbox key={type} label={type} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useConnectionTypes() {
  // const types = useQuery(api.queries.ontology.getConnectionTypes);
  return [];
}

/**
 * Hook to get event types
 * Returns array of all available event types
 *
 * @returns Array of event types or empty array while loading
 *
 * @example
 * ```tsx
 * function EventTypeFilter() {
 *   const eventTypes = useEventTypes();
 *
 *   return (
 *     <select multiple>
 *       {eventTypes.map(type => (
 *         <option key={type} value={type}>{type}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useEventTypes() {
  // const types = useQuery(api.queries.ontology.getEventTypes);
  return [];
}

/**
 * Hook to get enabled features
 * Returns array of features included in current ontology composition
 *
 * @returns Array of feature names or empty array while loading
 *
 * @example
 * ```tsx
 * function FeatureList() {
 *   const features = useEnabledFeatures();
 *
 *   return (
 *     <ul>
 *       {features.map(feature => (
 *         <li key={feature}>{feature}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useEnabledFeatures() {
  // const features = useQuery(api.queries.ontology.getEnabledFeatures);
  return [];
}

/**
 * Hook to get feature breakdown
 * Returns detailed information about what each feature provides
 *
 * @returns Feature breakdown with descriptions and type lists
 *
 * @example
 * ```tsx
 * function FeatureBreakdown() {
 *   const breakdown = useFeatureBreakdown();
 *
 *   if (!breakdown) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {breakdown.blog && (
 *         <div>
 *           <h3>Blog Feature</h3>
 *           <p>{breakdown.blog.description}</p>
 *           <p>Thing Types: {breakdown.blog.thingTypes.join(', ')}</p>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureBreakdown(): FeatureBreakdown | undefined {
  // return useQuery(api.queries.ontology.getFeatureBreakdown);
  return undefined;
}

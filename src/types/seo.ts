import { z } from 'zod';

// Image metadata schema
const imageSchema = z.object({
  url: z.string().url({ message: "Must be a valid URL" }),
  width: z.number().min(200).max(5120),
  height: z.number().min(200).max(5120),
  alt: z.string().min(1),
  type: z.string().optional(),
});

// Video metadata schema
const videoSchema = z.object({
  url: z.string().url(),
  type: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
});

// OpenGraph schema with enhanced validation
const openGraphSchema = z.object({
  type: z.enum(['website', 'article', 'profile', 'book']),
  locale: z.string(),
  site_name: z.string(),
  title: z.string().min(1).max(70),
  description: z.string().min(1).max(200),
  url: z.string().url().optional(),
  image: imageSchema,
  videos: z.array(videoSchema).optional(),
  article: z.object({
    publishedTime: z.string().datetime().optional(),
    modifiedTime: z.string().datetime().optional(),
    authors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

// Twitter card schema with enhanced validation
const twitterSchema = z.object({
  card: z.enum(['summary', 'summary_large_image', 'app', 'player']),
  site: z.string(),
  creator: z.string(),
  title: z.string().min(1).max(70),
  description: z.string().min(1).max(200),
  image: z.string().url(),
  imageAlt: z.string().optional(),
});

// Define SEO defaults
export const defaultSeo = {
  stream: {
    metaRobots: "index, follow",
    openGraph: {
      type: 'article',
      locale: 'en_IE',
      site_name: 'ONE'
    },
    twitter: {
      card: 'summary_large_image',
      site: '@onedotie',
      creator: '@tonyoconnell'
    }
  },
  chat: {
    metaRobots: "index, follow",
    openGraph: {
      type: 'website',
      locale: 'en_IE',
      site_name: 'ONE'
    }
  }
};

// Main SEO schema with fallback support
export const seoSchema = z.object({
  canonical: z.string().url(),
  title: z.string().min(1).max(70),
  metaTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(200),
  metaKeywords: z.array(z.string()),
  metaRobots: z.string().default("index, follow"),
  // OpenGraph
  openGraph: openGraphSchema.default({
    type: 'article',
    title: '', // Required
    description: '', // Required
    image: { // Required
      url: '',
      width: 1200,
      height: 630,
      alt: '',
      type: 'image/jpeg'
    },
    locale: 'en_IE',
    site_name: 'ONE',
  }),
  
  // Twitter
  twitter: twitterSchema.default({
    title: '', // Required
    description: '', // Required 
    image: '', // Required
    card: 'summary_large_image',
    site: '@onedotie',
    creator: '@tonyoconnell',
  }),
  
  // Additional metadata
  published: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
  author: z.string().optional(),
  section: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Collection-specific metadata
  collection: z.object({
    name: z.string(),
    type: z.string(),
    order: z.number().optional(),
  }).optional(),
  
  // Dynamic metadata
  template: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
}).strict();

// Helper type for partial metadata
export const partialSeoSchema = seoSchema.partial();

// Type for resolved metadata
export type SEO = z.infer<typeof seoSchema>;
export type PartialSEO = z.infer<typeof partialSeoSchema>;

// Metadata resolution helper
export function resolveSeoMetadata(
  page?: PartialSEO,
  collection?: PartialSEO,
  business?: SEO
): SEO {
  if (!business) {
    throw new Error('Business metadata is required for fallback');
  }

  // Deep merge with fallbacks
  const merged = {
    ...business,
    ...collection,
    ...page,
    
    // OpenGraph fallbacks
    openGraph: {
      ...business.openGraph,
      ...collection?.openGraph,
      ...page?.openGraph,
      // Fallback to meta fields if not specified
      title: page?.openGraph?.title || page?.metaTitle || business.metaTitle,
      description: page?.openGraph?.description || page?.metaDescription || business.metaDescription,
      url: page?.openGraph?.url || page?.canonical || business.canonical,
      image: {
        ...business.openGraph.image,
        ...collection?.openGraph?.image,
        ...page?.openGraph?.image,
        alt: page?.openGraph?.image?.alt || page?.metaTitle || business.metaTitle
      }
    },
    
    // Twitter fallbacks
    twitter: {
      ...business.twitter,
      ...collection?.twitter,
      ...page?.twitter,
      // Fallback to OpenGraph then meta fields
      title: page?.twitter?.title || page?.openGraph?.title || page?.metaTitle || business.metaTitle,
      description: page?.twitter?.description || page?.openGraph?.description || page?.metaDescription || business.metaDescription,
      image: page?.twitter?.image || page?.openGraph?.image?.url || business.openGraph.image.url,
      imageAlt: page?.twitter?.imageAlt || page?.openGraph?.image?.alt || page?.metaTitle || business.metaTitle
    }
  };

  return seoSchema.parse(merged);
}

// Template string resolver
export function resolveTemplate(
  template: string,
  data: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => data[key.trim()] || '');
} 
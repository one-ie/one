import { z } from 'zod';
import type { CollectionConfig } from 'astro:content';
import type { SEO } from './seo';

// Contact Point schema
export const contactPointSchema = z.object({
  "@type": z.string(),
  telephone: z.string(),
  contactType: z.string(),
  email: z.string(),
  areaServed: z.string(),
  availableLanguage: z.array(z.string()),
});

// Seller schema
export const sellerSchema = z.object({
  "@type": z.string(),
  name: z.string(),
  url: z.string(),
  contactPoint: contactPointSchema,
});

// Offer schema
export const offerSchema = z.object({
  "@type": z.string(),
  price: z.number(),
  priceCurrency: z.string(),
  availability: z.string(),
  seller: sellerSchema,
});

// Author schema
export const authorSchema = z.object({
  "@type": z.string(),
  name: z.string(),
  email: z.string(),
  url: z.string(),
  sameAs: z.array(z.string()),
});

// Schema.org schema
export const schemaOrgSchema = z.object({
  "@context": z.string(),
  "@type": z.string(),
  name: z.string(),
  applicationCategory: z.string(),
  applicationSubCategory: z.string(),
  operatingSystem: z.string(),
  offers: offerSchema,
  author: authorSchema,
});

export type ContactPoint = z.infer<typeof contactPointSchema>;
export type Seller = z.infer<typeof sellerSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type Author = z.infer<typeof authorSchema>;
export type SchemaOrg = z.infer<typeof schemaOrgSchema>;

export type ExtendedCollectionConfig = CollectionConfig<z.ZodObject<any>> & {
  defaults?: {
    seo?: Partial<SEO>;
  };
}; 
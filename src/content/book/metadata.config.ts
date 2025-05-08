import { z } from 'zod';

// Define the metadata schema
export const BookMetadataSchema = z.object({
  // Common fields
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  status: z.enum(['draft', 'published']).default('published'),
  tags: z.array(z.string()).default(() => ['ecommerce', 'ai', 'business', 'growth']),
  image: z.string().default('assets/Playbook.png'),

  // Book-specific fields (Schema.org/Book)
  author: z.string().default("Anthony O'Connell"),
  language: z.string().default('en-US'),
  publisher: z.object({
    name: z.string().default('ONE Publishing'),
    url: z.string().default('https://one.ie'),
    '@type': z.literal('Organization').default('Organization')
  }).default({}),
  rights: z.string().default("© 2024 Anthony O'Connell. All rights reserved."),
  identifier: z.object({
    scheme: z.string().default('ISBN-13'),
    text: z.string().default('978-1-916-12345-6')
  }).default({}),
  creator: z.string().default("Anthony O'Connell"),
  contributor: z.string().default('ONE Team'),
  subject: z.string().default('Ecommerce, AI, Business Growth, Digital Marketing'),

  // Schema.org specific fields
  '@type': z.literal('Book').default('Book'),
  '@context': z.literal('https://schema.org').default('https://schema.org'),
  bookFormat: z.enum(['EBook', 'Paperback', 'Hardcover']).default('EBook'),
  inLanguage: z.string().default('en-US'),
  datePublished: z.string().default(() => new Date().toISOString().split('T')[0]),
  dateModified: z.string().default(() => new Date().toISOString().split('T')[0]),
  numberOfPages: z.number().optional(),
  bookEdition: z.string().optional(),
  isbn: z.string().optional(),
  price: z.object({
    amount: z.number().optional(),
    currency: z.string().default('USD')
  }).optional(),
  audience: z.object({
    '@type': z.literal('Audience').default('Audience'),
    audienceType: z.string().default('E-commerce Business Owners and Marketers')
  }).default({}),
  workExample: z.array(z.object({
    '@type': z.literal('Chapter').default('Chapter'),
    name: z.string(),
    position: z.number(),
    url: z.string().optional()
  })).optional(),

  // Optional fields
  css: z.string().optional(),
  coverImage: z.string().optional(),
  chapter: z.number().optional(),
  order: z.number().optional(),

  // SEO fields
  canonical: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  openGraph: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    type: z.string().optional()
  }).optional(),
  twitter: z.object({
    card: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional()
  }).optional()
});

// Default metadata values
export const defaultBookMetadata = {
  '@type': 'Book' as const,
  '@context': 'https://schema.org' as const,
  author: "Anthony O'Connell",
  language: "en-US",
  publisher: {
    name: "ONE Publishing",
    url: "https://one.ie",
    '@type': 'Organization' as const
  },
  rights: "© 2024 Anthony O'Connell. All rights reserved.",
  identifier: {
    scheme: "ISBN-13",
    text: "978-1-916-12345-6"
  },
  creator: "Anthony O'Connell",
  contributor: "ONE Team",
  subject: "Ecommerce, AI, Business Growth, Digital Marketing",
  css: "epub-style.css",
  coverImage: "assets/Playbook.png",
  status: "published" as const,
  date: new Date().toISOString().split('T')[0],
  tags: ['ecommerce', 'ai', 'business', 'growth'],
  image: "assets/Playbook.png",
  bookFormat: "EBook" as const,
  inLanguage: "en-US",
  datePublished: new Date().toISOString().split('T')[0],
  dateModified: new Date().toISOString().split('T')[0],
  isbn: "978-1-916-12345-6",
  price: {
    amount: 29.99,
    currency: "USD"
  },
  audience: {
    '@type': 'Audience' as const,
    audienceType: 'E-commerce Business Owners and Marketers'
  },
  workExample: [
    {
      '@type': 'Chapter' as const,
      name: 'Introduction',
      position: 0
    },
    {
      '@type': 'Chapter' as const,
      name: 'Architecture',
      position: 1
    }
  ],
  canonical: "https://one.ie/book",
  metaTitle: "Elevate Playbook - Beyond Funnels: Architecting Your Predictable Ecommerce Growth System",
  metaDescription: "A comprehensive guide to building a robust e-commerce growth system using the Elevate Framework.",
  metaKeywords: ["ecommerce", "ai", "business", "growth", "digital marketing", "systems thinking"],
  openGraph: {
    title: "Elevate Playbook - Beyond Funnels",
    description: "A comprehensive guide to building a robust e-commerce growth system using the Elevate Framework.",
    image: "assets/Playbook.png",
    type: "book"
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevate Playbook - Beyond Funnels",
    description: "A comprehensive guide to building a robust e-commerce growth system using the Elevate Framework.",
    image: "assets/Playbook.png"
  }
};

// Export the type
export type BookMetadata = z.infer<typeof BookMetadataSchema>; 
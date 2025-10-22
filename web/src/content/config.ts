import { defineCollection, z } from 'astro:content';

// Define the Blog schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  author: z.string().default('ONE'),
  tags: z.array(z.string()).default([]),
  category: z
    .enum(['tutorial', 'news', 'guide', 'review', 'article'])
    .default('article'),
  readingTime: z.number().optional(),
  featured: z.boolean().default(false),
});

// Define the Blog collection schema
const blog = defineCollection({
  type: 'content',
  schema: BlogSchema,
});

// Define the Stream schema - very flexible to accept any markdown file
// Shows real-time activity across the ONE platform
const StreamSchema = z.object({
  title: z.string(), // Required: title of the update
  date: z.date(), // Required: when this happened
  description: z.string().optional(), // Optional description
  author: z.string().optional().default('ONE'), // Who created this
  type: z.string().optional(), // Type of activity: file_created, feature_added, etc.
  tags: z.array(z.string()).optional().default([]), // Any tags
  image: z.string().optional(), // Optional image
  draft: z.boolean().optional().default(false), // Hide if draft
  // All other fields are optional and flexible
  category: z.string().optional(),
  readingTime: z.number().optional(),
  featured: z.boolean().optional(),
  path: z.string().optional(), // Original file path
  repo: z.string().optional(), // Which repo (web, backend, one, etc.)
});

// Define the Stream collection
const stream = defineCollection({
  type: 'content',
  schema: StreamSchema,
});

// Define the Products schema (ecommerce ontology - thing type: product)
const ProductSchema = z.object({
  id: z.string().optional(), // Unique identifier (optional, defaults to slug)
  name: z.string(),
  description: z.string(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  salePrice: z.number().optional(), // Discounted price
  isSale: z.boolean().optional().default(false), // Whether product is on sale
  isNew: z.boolean().optional().default(false), // Whether product is new
  images: z.array(z.string()),
  category: z.string(), // References categories collection
  collections: z.array(z.string()).optional(), // References collections collection
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sku: z.string(),
        price: z.number(),
        inStock: z.boolean(),
        options: z.record(z.string()), // { color: "red", size: "M" }
      })
    )
    .optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Define the Products collection
const products = defineCollection({
  type: 'content',
  schema: ProductSchema,
});

// Define the Categories schema (ecommerce ontology - thing type: category)
const CategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional(), // Slug of parent category for hierarchy
  order: z.number().default(0),
});

// Define the Categories collection
const categories = defineCollection({
  type: 'content',
  schema: CategorySchema,
});

// Define the Collections schema (ecommerce ontology - thing type: collection)
const ProductCollectionSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  products: z.array(z.string()), // Array of product slugs
});

// Define the Collections collection
const productCollections = defineCollection({
  type: 'content',
  schema: ProductCollectionSchema,
});

// Note: Installation-specific documentation is handled via file-resolver utility
// in Astro pages, not through content collections. This allows dynamic resolution
// based on INSTALLATION_NAME environment variable at runtime.

export const collections = {
  blog: blog,
  stream: stream,
  products: products,
  categories: categories,
  collections: productCollections,
};

// Export schema types
export type BlogSchema = z.infer<typeof BlogSchema>;
export type StreamSchema = z.infer<typeof StreamSchema>;
export type ProductSchema = z.infer<typeof ProductSchema>;
export type CategorySchema = z.infer<typeof CategorySchema>;
export type ProductCollectionSchema = z.infer<typeof ProductCollectionSchema>;

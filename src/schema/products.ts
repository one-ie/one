import { z } from "zod";

// Core schemas
const MoneySchema = z.object({
  amount: z.string().or(z.number()),
  currencyCode: z.string().length(3).default("USD")
});

const ImageSchema = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
});

// Variant schema
const ProductVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: MoneySchema,
  compareAtPrice: MoneySchema.optional(),
  sku: z.string().optional(),
  inventoryQuantity: z.number().optional(),
  image: ImageSchema.optional(),
  availableForSale: z.boolean().default(true),
});

// Main product schema
export const ProductSchema = z.object({
  // Core fields
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string().optional(),
  
  // Media
  featuredImage: ImageSchema.optional(),
  images: z.array(ImageSchema).optional(),
  
  // Variants
  variants: z.array(ProductVariantSchema).optional(),
  
  // Pricing
  priceRange: z.object({
    minVariantPrice: MoneySchema,
    maxVariantPrice: MoneySchema
  }).optional(),
  
  // Metadata
  status: z.enum(["ACTIVE", "ARCHIVED", "DRAFT"]).default("ACTIVE"),
  vendor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // SEO
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

// Types
export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// Validation helpers
export const validateProduct = (data: unknown): Product => ProductSchema.parse(data);
export const validateProducts = (data: unknown[]): Product[] => z.array(ProductSchema).parse(data);

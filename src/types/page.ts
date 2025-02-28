import { z } from 'zod';
import { ChatConfigSchema, type ChatConfig } from './chat';
import { partialSeoSchema } from './seo';
import type { SEO } from './seo';

// Page schema
export const pageSchema = z.object({
  // Content fields
  title: z.string(),
  description: z.string(),
  
  // Layout options
  showHeader: z.boolean().optional(),
  showFooter: z.boolean().optional(),
  showSidebar: z.boolean().optional(),
  showChat: z.boolean().optional(),
  
  // Component configs
  chat: ChatConfigSchema.optional(),
  
  // SEO metadata
  seo: partialSeoSchema.optional()
});

export type Page = z.infer<typeof pageSchema>;

// Layout props interface
export interface LayoutProps {
  title: string;
  description?: string;
  seo?: SEO;
  type?: string;
  chat?: ChatConfig;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  showChat?: boolean;
  children: astroHTML.JSX.Element;
} 
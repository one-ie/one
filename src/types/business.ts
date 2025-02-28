import { z } from 'zod';
import { navigationItemSchema } from './navigation';
import { seoSchema } from './seo';
import { brandSchema } from './brand';
import { i18nSchema } from './i18n';
import { contactSchema } from './contact';
import { ChatConfigSchema as chatConfigSchema } from './chat';
import { schemaOrgSchema } from './schema';

// Basic business info schema
export const businessInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  website: z.string(),
  legalName: z.string(),
  type: z.string(),
  founded: z.number(),
  founders: z.array(z.string()),
  vatID: z.string().optional(),
  companyNumber: z.string().optional(),
  hours: z.string(),
  support: z.object({
    email: z.string(),
    hours: z.string(),
    response: z.string(),
  }),
  payments: z.array(z.string()),
  currencies: z.array(z.string()),
});

export type BusinessInfo = z.infer<typeof businessInfoSchema>;

// Full business config schema
export const businessConfigSchema = z.object({
  business: businessInfoSchema,
  search: seoSchema,
  brand: brandSchema,
  i18n: i18nSchema,
  contact: contactSchema,
  schema: schemaOrgSchema,
  chat: chatConfigSchema.optional(),
  navigation: z.object({
    top: z.object({
      logo: z.string(),
      favicon: z.string(),
      items: z.array(navigationItemSchema),
      buttons: z.array(navigationItemSchema),
    }),
    sidebar: z.array(navigationItemSchema),
    footer: z.object({
      columns: z.array(z.object({
        title: z.string(),
        links: z.array(navigationItemSchema),
      })),
      bottom: z.object({
        copyright: z.string().optional(),
        links: z.array(navigationItemSchema),
      }),
    }),
  }),
});

export type BusinessConfig = z.infer<typeof businessConfigSchema>; 
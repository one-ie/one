import { z } from "zod";

// Navigation item schema
export const navigationItemSchema: z.ZodType<any> = z.object({
  title: z.string(),
  path: z.string(),
  variant: z.enum(['default', 'outline', 'primary']).optional(),
  icon: z.object({
    name: z.string(),
    class: z.string().optional(),
  }).optional(),
  description: z.string().optional(),
  items: z.array(z.lazy(() => navigationItemSchema)).optional(),
});

// Navigation schema
export const navigationSchema = z.object({
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
      copyright: z.string(),
      links: z.array(navigationItemSchema),
    }),
  }).optional(),
});

export type NavigationItem = z.infer<typeof navigationItemSchema>;
export type Navigation = z.infer<typeof navigationSchema>; 
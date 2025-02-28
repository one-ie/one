import { z } from 'zod';

// Logo schema
export const logoSchema = z.object({
  default: z.string(),
  dark: z.string(),
  light: z.string(),
});

// Favicon schema
export const faviconSchema = z.object({
  ico: z.string(),
  png: z.string(),
  svg: z.string(),
  sizes: z.array(z.number()),
});

// Colors schema
export const colorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
  light: z.record(z.string()),
  dark: z.record(z.string()),
});

// Fonts schema
export const fontsSchema = z.object({
  heading: z.string(),
  body: z.string(),
  code: z.string(),
  system: z.object({
    sans: z.string(),
    serif: z.string(),
    mono: z.string(),
  }),
});

// Brand schema
export const brandSchema = z.object({
  logos: logoSchema,
  favicon: faviconSchema,
  colors: colorsSchema,
  fonts: fontsSchema,
});

export type Logos = z.infer<typeof logoSchema>;
export type Favicon = z.infer<typeof faviconSchema>;
export type Colors = z.infer<typeof colorsSchema>;
export type Fonts = z.infer<typeof fontsSchema>;
export type Brand = z.infer<typeof brandSchema>; 
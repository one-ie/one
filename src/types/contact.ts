import { z } from 'zod';

export const contactSchema = z.object({
    email: z.string(),
    phone: z.string(),
    whatsapp: z.string(),
    telegram: z.string(),
    address: z.object({
        street: z.string(),
        area: z.string(),
        city: z.string(),
        county: z.string(),
        country: z.string(),
    }),
    social: z.object({
        github: z.string(),
        twitter: z.string(),
        linkedin: z.string(),
        instagram: z.string(),
        youtube: z.string(),
        discord: z.string(),
        medium: z.string().nullable(),
        facebook: z.string(),
        tiktok: z.string().nullable(),
        threads: z.string().nullable(),
        mastodon: z.string().nullable(),
        slack: z.string(),
        telegram_channel: z.string(),
    }),
});

export type Contact = z.infer<typeof contactSchema>; 
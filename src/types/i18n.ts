import { z } from 'zod';

export const i18nSchema = z.object({
    defaultLocale: z.string(),
    locales: z.array(z.string()),
    defaultTimezone: z.string(),
    currencies: z.object({
        default: z.string(),
        supported: z.array(z.string()),
    }),
});

export type I18n = z.infer<typeof i18nSchema>; 
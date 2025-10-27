import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

// Use Node adapter for local dev (avoids miniflare EPIPE issues with Node 20.11.0)
// Use Cloudflare adapter for production builds
const isDev = process.env.NODE_ENV !== 'production';
const adapter = isDev
  ? node({ mode: 'standalone' })
  : cloudflare({ mode: 'directory' });

export default defineConfig({
  site: 'https://one.ie',
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [
      tailwindcss({
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      }),
    ],
    resolve: {
      alias: {
        lodash: 'lodash-es',
        // React 19 + Cloudflare Edge compatibility (production only)
        // In dev mode with Node adapter, use standard server rendering
        ...(isDev ? {} : {
          'react-dom/server': 'react-dom/server.edge',
        }),
      },
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      external: ['node:async_hooks'],
      noExternal: [
        'nanostores',
        '@nanostores/react',
        'lodash-es',
        'use-sync-external-store',
      ],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'lodash-es',
        'use-sync-external-store/shim',
        'recharts',
        'nanostores',
        '@nanostores/react',
      ],
    },
    build: {
      target: 'esnext',
    },
  },
  output: 'server',
  adapter,
});

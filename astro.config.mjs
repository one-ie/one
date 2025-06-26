import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [react(),mdx()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
});
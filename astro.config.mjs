import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    react({
      include: ['**/*.{jsx,tsx}'],
      experimentalReactChildren: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@radix-ui/*', '@assistant-ui/*', 'lucide-react'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@nanostores/react'],
    },
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
  },
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imageService: true,
  }),
});
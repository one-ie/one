import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    react({
      experimentalReactChildren: true
    }),
    mdx()
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@ai-sdk/react', '@nanostores/react', 'swr']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@ai-sdk/react', '@nanostores/react', 'swr'],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    resolve: {
      dedupe: ['react', 'react-dom']
    }
  },
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
});
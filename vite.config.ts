import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      port: 443,
      protocol: 'wss'
    },
    host: true
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-tabs',
      'react',
      'react-dom',
      '@radix-ui/react-slot',
      '@radix-ui/react-primitive'
    ]
  }
}); 
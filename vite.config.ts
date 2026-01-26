import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Support deployments that use an APP_BASE_PATH (e.g. /cahos-ops)
      '/cahos-ops/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Strip the /cahos-ops prefix so backend still receives /api/...
        rewrite: (path) => path.replace(/^\/cahos-ops/, ''),
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/cahos-ops/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cahos-ops/, ''),
      },
    },
  },
});
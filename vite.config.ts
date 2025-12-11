import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Support deployments that use an APP_BASE_PATH (e.g. /minihackathon)
      '/minihackathon/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Strip the /minihackathon prefix so backend still receives /api/...
        rewrite: (path) => path.replace(/^\/minihackathon/, ''),
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/minihackathon/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/minihackathon/, ''),
      },
    },
  },
});
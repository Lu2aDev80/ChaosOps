import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/minihackathon/",
  server: {
    port: 5173,
    proxy: {
      "/minihackathon/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/minihackathon/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

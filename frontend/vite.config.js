import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Split vendor code from app code so a deploy that only changes app
        // logic doesn't invalidate the (larger, slower-changing) vendor
        // bundle in visitors' browser caches. recharts gets its own chunk
        // since it's only pulled in by the Profile page's attribute chart.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite configuration for Football Finder frontend
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 — no tailwind.config.js needed, all templates are auto-discovered
    tailwindcss(),
  ],
  server: {
    // Proxy /api/* requests to the backend during development.
    // Without this, the browser would try to fetch from port 5173 (frontend)
    // instead of port 3000 (backend), causing CORS errors.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});

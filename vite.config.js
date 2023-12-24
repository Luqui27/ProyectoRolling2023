import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true,
    emptyOutDir: true, // Para que Vercel pueda eliminar el directorio dist antes de construir
  },
  server: {
    port: 3000,
  },
});

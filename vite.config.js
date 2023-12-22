import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Puedes ajustar el objetivo de construcción según tus necesidades
    outDir: 'dist',    // Directorio de salida para los archivos construidos
    assetsDir: 'assets', // Directorio para activos estáticos
    minify: 'terser',   // Minificar con Terser
    sourcemap: true,    // Generar sourcemaps
  },
  server: {
    port: 3000,         // Puerto para el servidor de desarrollo
  },
});

import { defineConfig } from 'vite';

// Railway deployment config - NO TERSER - 2025-01-30
export default defineConfig({
  base: '/minecraft-llm-game/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false, // EXPLICITLY DISABLE ALL MINIFICATION
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['three'],
          llm: ['@mlc-ai/web-llm']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    host: true,
    allowedHosts: ['healthcheck.railway.app']
  },
  optimizeDeps: {
    include: ['three', '@mlc-ai/web-llm', 'marked']
  }
});
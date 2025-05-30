import { defineConfig } from 'vite';

export default defineConfig({
  base: '/minecraft-llm-game/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false,
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
  }
});
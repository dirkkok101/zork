import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Configure path aliases
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@testing': path.resolve(process.cwd(), 'testing')
    }
  },
  
  // Root directory for serving files
  root: 'src',
  
  // Public directory for static assets
  publicDir: path.resolve(process.cwd(), 'data'),
  
  // Build configuration
  build: {
    outDir: path.resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'src/index.html')
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: false
  },
  
  // CSS preprocessing
  css: {
    preprocessorOptions: {
      scss: {
        // Add any SCSS global variables or mixins here if needed
      }
    }
  }
});
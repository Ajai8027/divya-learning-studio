import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '.offline-build',
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 10 * 1024 * 1024,
    rollupOptions: {
      input: { index: 'index.dev.html' },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});

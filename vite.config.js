import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

function useDevEntry() {
  return {
    name: 'use-dev-entry',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const [pathname, search] = (request.url || '').split('?');
        if (pathname === '/' || pathname === '/index.html') {
          const suffix = search ? `?${search}` : '';
          request.url = `/index.dev.html${suffix}`;
        }
        next();
      });
    },
  };
}

function nameProductionEntry() {
  return {
    name: 'name-production-entry',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve('dist');
      const source = path.join(outDir, 'index.dev.html');
      const target = path.join(outDir, 'index.html');
      if (fs.existsSync(source)) {
        fs.renameSync(source, target);
      }
    },
  };
}

export default defineConfig({
  plugins: [useDevEntry(), nameProductionEntry()],
  build: {
    rollupOptions: {
      input: { index: 'index.dev.html' },
    },
  },
});

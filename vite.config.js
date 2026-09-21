import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // Inline, so the source maps travel inside the bundle and work on any host,
  // including hosts that refuse to serve separate .map files.
  build: { sourcemap: 'inline' },
  server: { host: true },
});

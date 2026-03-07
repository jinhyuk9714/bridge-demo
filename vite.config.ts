import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolveManualChunk } from './src/build/manualChunks';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveManualChunk
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: true
  }
});

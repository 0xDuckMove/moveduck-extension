import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';

import manifest from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
          manualChunks: undefined,
        },
      },
    },

    plugins: [crx({ manifest }), react()],
    resolve: {
      alias: {
        buffer: 'buffer/',
      },
    },
  };
});

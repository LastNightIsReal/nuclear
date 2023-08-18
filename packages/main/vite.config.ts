import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  resolve: {
    alias: {
      'path': 'path'
    }
  },
  build: {
    ssr: './src/main.ts',
    lib: {
      entry: './src/main.ts',
      formats: ['cjs']
    }
  }
});

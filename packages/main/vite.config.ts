import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '.env',
          dest: '.'
        }
      ]
    })
  ]
});

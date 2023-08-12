import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: [
            'decorators-legacy'
          ]
        }
      }      
    }),
    svgr()
  ],

  server: {
    host: 'localhost',
    port: 8080
  },

  base: './',

  resolve: {
    alias: {
      'react-image': '../../node_modules/react-image'
    }
  },

  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    preprocessorOptions: {
      scss: {
      }
    }
  }
});

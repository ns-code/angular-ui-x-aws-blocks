import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  resolve: {
    conditions: ['browser']
  },
  build: {
    outDir: 'dist'
  }
});

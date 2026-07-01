import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: 'src',
  resolve: {
    conditions: ['browser']
  },
  build: {
    outDir: 'dist'
  },
  plugins: [
    angular(), // Enables Angular support
    tsconfigPaths(), // Resolves paths from tsconfig.json
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup-vitest.ts',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  }, 
});

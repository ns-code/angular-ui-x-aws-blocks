import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    conditions: ['browser']
  },
  build: {
    outDir: 'dist'
  },
  plugins: [
    angular({
      tsconfig: 'tsconfig.spec.json'
    }), // Enables Angular support
    tsconfigPaths(), // Resolves paths from tsconfig.json
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup-vitest.ts',
    include: ['src/**/*.spec.ts'],
    exclude: ['test/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  }, 
});

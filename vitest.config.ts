import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    environment: 'jsdom',
    hookTimeout: 60_000,
    includeSource: ['src/**/*.{js,ts}'],
    mockReset: true,
    open: true,
    testTimeout: 60_000
  }
});

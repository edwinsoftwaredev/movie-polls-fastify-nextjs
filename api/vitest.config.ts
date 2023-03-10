import { defineConfig } from 'vitest/config';

export default defineConfig({
  mode: 'development',
  test: {
    maxConcurrency: 500,
    testTimeout: 1000 * 60 * 2,
    useAtomics: true,
    minThreads: 10,
    maxThreads: 100,
  },
});

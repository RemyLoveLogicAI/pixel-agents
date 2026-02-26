import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/omega/systems/**/*.ts'],
      exclude: ['src/omega/systems/**/*.test.ts', 'src/omega/types.ts'],
    },
  },
})

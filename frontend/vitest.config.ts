import { defineConfig } from 'vitest/config';
import { angular } from '@angular/build/unit-test/vitest-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});

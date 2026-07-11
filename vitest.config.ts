import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: [
                'lens/src/models/lens-url.ts',
                'lens/src/models/map-state.ts',
                'lens/src/runtime-config.mjs',
            ],
        },
        projects: [
            {
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['lens/src/**/*.test.{ts,mjs}', 'site/src/**/*.test.{ts,mjs}'],
                    exclude: ['**/*.browser.test.ts'],
                },
            },
            {
                test: {
                    name: 'browser',
                    include: ['lens/src/**/*.browser.test.ts', 'site/src/**/*.browser.test.ts'],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
});

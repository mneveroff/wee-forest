import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = {
    '@': fileURLToPath(new URL('./lens/src', import.meta.url)),
};

export default defineConfig({
    resolve: {
        alias,
    },
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: [
                'lens/src/models/lens-url.ts',
                'lens/src/models/lens-store.ts',
                'lens/src/runtime-config.mjs',
            ],
        },
        projects: [
            {
                resolve: {
                    alias,
                },
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['lens/src/**/*.test.{ts,tsx,mjs}', 'site/src/**/*.test.{ts,tsx,mjs}'],
                    exclude: ['**/*.browser.test.{ts,tsx}'],
                },
            },
            {
                resolve: {
                    alias,
                },
                test: {
                    name: 'browser',
                    include: ['lens/src/**/*.browser.test.{ts,tsx}', 'site/src/**/*.browser.test.{ts,tsx}'],
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

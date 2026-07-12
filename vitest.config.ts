import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = {
    '@': fileURLToPath(new URL('./lens/src', import.meta.url)),
};

const headed = process.env.VITEST_BROWSER_HEADED === '1' || process.env.VITEST_BROWSER_HEADED === 'true';
const headless = !headed;

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
                    include: [
                        'lens/src/**/*.browser.test.{ts,tsx}',
                        'site/src/**/*.browser.test.{ts,tsx}',
                    ],
                    testTimeout: 30_000,
                    browser: {
                        enabled: true,
                        headless,
                        provider: playwright({
                            launchOptions: headed
                                ? { slowMo: Number(process.env.VITEST_BROWSER_SLOW_MO ?? 75) }
                                : undefined,
                        }),
                        instances: [{
                            browser: 'chromium',
                            viewport: { width: 1024, height: 768 },
                        }],
                    },
                },
            },
        ],
    },
});

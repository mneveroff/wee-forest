import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const lensPath = fileURLToPath(new URL('.', import.meta.url));
const env = loadEnv('development', lensPath, '');
const headed = process.env.VITEST_BROWSER_HEADED === '1' || process.env.VITEST_BROWSER_HEADED === 'true';
const headless = !headed;

export default defineConfig({
    define: {
        'import.meta.env.MAPBOX_TOKEN': JSON.stringify(process.env.MAPBOX_TOKEN ?? env.MAPBOX_TOKEN ?? ''),
    },
    optimizeDeps: {
        include: ['zustand/react/shallow'],
    },
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        include: ['test-harness/**/*.browser.test.{ts,tsx}'],
        testTimeout: 60_000,
        browser: {
            enabled: true,
            headless,
            provider: playwright({
                launchOptions: headed
                    ? { slowMo: Number(process.env.VITEST_BROWSER_SLOW_MO ?? 100) }
                    : undefined,
            }),
            instances: [{
                browser: 'chromium',
                viewport: { width: 1024, height: 768 },
            }],
        },
    },
});

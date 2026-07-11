import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const lensPath = fileURLToPath(new URL('.', import.meta.url));
const env = loadEnv('development', lensPath, '');

export default defineConfig({
    define: {
        'import.meta.env.MAPBOX_TOKEN': JSON.stringify(process.env.MAPBOX_TOKEN ?? env.MAPBOX_TOKEN ?? ''),
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        include: ['test-harness/**/*.browser.test.{ts,tsx}'],
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{
                browser: 'chromium',
                viewport: { width: 1024, height: 768 },
            }],
        },
    },
});

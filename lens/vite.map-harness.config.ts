import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const lensPath = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, lensPath, '');

    return {
        root: fileURLToPath(new URL('./test-harness', import.meta.url)),
        define: {
            'import.meta.env.MAPBOX_TOKEN': JSON.stringify(process.env.MAPBOX_TOKEN ?? env.MAPBOX_TOKEN ?? ''),
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            host: '127.0.0.1',
            port: 4174,
            strictPort: true,
            fs: {
                allow: [lensPath],
            },
        },
    };
});

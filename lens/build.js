import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

const env = (key) => JSON.stringify(process.env[key] || '');

esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  minify: true,
  splitting: true,
  format: 'esm',
  outdir: './public/dist',
  define: {
    'process.env.MAPBOX_TOKEN': env('MAPBOX_TOKEN'),
    'process.env.STATIC_SERVER_PATH': env('STATIC_SERVER_PATH'),
    'process.env.AREA_SERVER_PATH': env('AREA_SERVER_PATH'),
    'process.env.TILE_SERVER_PATH': env('TILE_SERVER_PATH'),
    'process.env.POSTHOG_PUBLIC_API_KEY': env('POSTHOG_PUBLIC_API_KEY'),
    'process.env.POSTHOG_PROXY_PATH': env('POSTHOG_PROXY_PATH')
  },
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".svg": "file",
    ".gif": "file",
  },
});
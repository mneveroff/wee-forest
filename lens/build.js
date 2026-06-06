import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  minify: true,
  splitting: true,
  format: 'esm',
  outdir: './public/dist',
  define: {
    'process.env.MAPBOX_TOKEN': JSON.stringify(process.env.MAPBOX_TOKEN),
    'process.env.STATIC_SERVER_PATH': JSON.stringify(process.env.STATIC_SERVER_PATH),
    'process.env.AREA_SERVER_PATH': JSON.stringify(process.env.AREA_SERVER_PATH),
    'process.env.TILE_SERVER_PATH': JSON.stringify(process.env.TILE_SERVER_PATH),
    'process.env.POSTHOG_PUBLIC_API_KEY': JSON.stringify(process.env.POSTHOG_PUBLIC_API_KEY),
    'process.env.POSTHOG_PROXY_PATH': JSON.stringify(process.env.POSTHOG_PROXY_PATH)
  },
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".svg": "file",
    ".gif": "file",
  },
});
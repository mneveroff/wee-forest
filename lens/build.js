import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

esbuild.build({
  entryPoints: ['./src/index.tsx'],
  alias: {
    '@': srcPath,
  },
  bundle: true,
  minify: true,
  splitting: true,
  format: 'esm',
  outdir: './public/dist',
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".svg": "file",
    ".gif": "file",
  },
});
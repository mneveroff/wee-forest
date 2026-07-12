import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

async function run() {
  let ctx = await esbuild.context({
    entryPoints: ['./src/index.tsx'],
    alias: {
      '@': srcPath,
    },
    bundle: true,
    sourcemap: true,
    format: 'esm',
    outdir: './public/dist',
    logLevel: 'info',
    loader: {
      ".png": "file",
      ".jpg": "file",
      ".jpeg": "file",
      ".svg": "file",
      ".gif": "file",
    },
  });

  await ctx.watch();

  console.log('Watching for changes...');
}

run();
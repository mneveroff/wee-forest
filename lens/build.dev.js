import esbuild from 'esbuild';

async function run() {
  let ctx = await esbuild.context({
    entryPoints: ['./src/index.ts'],
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
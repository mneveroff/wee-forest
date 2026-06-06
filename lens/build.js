import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./src/index.ts'],
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
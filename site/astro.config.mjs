// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRuntimeConfigScript } from '../lens/src/runtime-config.mjs';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  try {
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      if (process.env[key] === undefined) {
        process.env[key] = trimmed.slice(eq + 1);
      }
    }
  } catch {
    // optional env file
  }
}

loadEnvFile(path.join(repoRoot, '../lens/.env'));
loadEnvFile(path.join(repoRoot, '.env'));

const lensDevTarget = process.env.LENS_DEV_TARGET ?? 'http://127.0.0.1:3939';

function runtimeConfigPlugin() {
  return {
    name: 'wee-forest-runtime-config',
    configureServer(server) {
      server.middlewares.use('/runtime-config.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-store');
        res.end(buildRuntimeConfigScript());
      });
    },
  };
}

export default defineConfig({
  site: 'https://weeforest.org',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss(), runtimeConfigPlugin()],
    server: {
      proxy: {
        // Mirror production Caddy routing: /lens* → Lens dev server.
        // Requires lens STATIC_SERVER_PATH=lens and a running Lens process.
        '/lens': {
          target: lensDevTarget,
          changeOrigin: true,
        },
      },
    },
  },
  integrations: [sitemap()],
});

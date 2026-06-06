// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const lensDevTarget = process.env.LENS_DEV_TARGET ?? 'http://127.0.0.1:3939';

function runtimeConfigPlugin() {
  return {
    name: 'wee-forest-runtime-config',
    configureServer(server) {
      server.middlewares.use('/runtime-config.js', (_req, res) => {
        const config = {
          mapboxToken: process.env.MAPBOX_TOKEN || '',
          posthogPublicApiKey:
            process.env.PUBLIC_POSTHOG_PUBLIC_API_KEY || process.env.POSTHOG_PUBLIC_API_KEY || '',
          posthogHost:
            process.env.PUBLIC_POSTHOG_HOST || process.env.POSTHOG_HOST || 'https://eu.i.posthog.com',
          staticServerPath: process.env.STATIC_SERVER_PATH || 'lens',
          areaServerPath: process.env.AREA_SERVER_PATH || 'area',
          tileServerPath: process.env.TILE_SERVER_PATH || 'tiles',
          posthogProxyPath: process.env.POSTHOG_PROXY_PATH || 'ingest',
        };
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-store');
        res.end(`window.__WEEFOREST_RUNTIME__=${JSON.stringify(config)};`);
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

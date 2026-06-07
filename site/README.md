# WeeForest site

Astro static site for [weeforest.org](https://weeforest.org/). Replaces the former Ghost landing page.

## Development

Integrated local routing (Astro proxies `/lens*` to Lens, like production Caddy):

```bash
# from repo root
pnpm install

# Configure lens/.env (see lens/README.md). STATIC_SERVER_PATH=lens is required.
pnpm dev:lens   # terminal 1
pnpm dev:site   # terminal 2
```

Open `http://127.0.0.1:4321/` and use **Explore the Map** — it should load Lens at `/lens/` via the Astro dev proxy.

Set `TILE_SERVER_HOST=http://localhost:4321` in `lens/.env` so tile URLs work through the Astro proxy.

Override the Lens upstream with `LENS_DEV_TARGET` if needed (default `http://127.0.0.1:3939`).

PostHog and Mapbox tokens for local dev are read from `lens/.env` via `/runtime-config.js` (served by Astro dev for `/` and proxied to Lens for `/lens/`). Analytics events from both the landing page and Lens go through `/weef`, proxied to Lens in dev. A separate `site/.env` is optional — see `site/.env.example`.

Note: the `/lens` proxy applies to `astro dev` only, not `astro preview` or the static `dist/` build. Lens area API calls use a trailing slash (`/lens/area/calculate_areas/`) so Astro's `trailingSlash: 'always'` dev server forwards them to Lens instead of returning a 404.

## Build

```bash
pnpm build:site
pnpm --filter @wee-forest/site preview
```

Output is written to `site/dist/`. In production this output is baked into the Docker image and served at `/` by the same container as Lens.

## Deploy

Production uses a **single Docker image** (`wee-forest-lens`) that serves both the Astro site and Lens. Caddy reverse-proxies all traffic to the container.

See [docker/README.md](../docker/README.md) for compose, Caddy, and `.env` setup.

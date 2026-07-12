# Agent notes — wee-forest

Short caveats not obvious from file layout alone. See `docker/README.md`, `site/README.md`, and `lens/README.md` for full instructions.

## Repo layout

- **pnpm monorepo** at root: `lens/` (Express + Mapbox app), `site/` (Astro static landing page), `data/` (notebooks + parquet/mbtiles, mostly gitignored).
- **`lens/.env`** is the primary local config. It is gitignored — never commit or overwrite it when merging branches.
- **`data/`** (tiles, parquet, duckdb) is gitignored — do not delete or replace on deploy/merge.

## Local dev

- Integrated dev mirrors production routing: run **`pnpm dev:lens`** and **`pnpm dev:site`**, open **`http://127.0.0.1:4321/`** (not Lens port alone for full-path testing).
- Astro dev **proxies** `/lens*` and `/weef` to Lens (`:3939`). Lens-only on `:3939` skips Astro quirks but is not the integrated path.
- Lens requires **`STATIC_SERVER_PATH=lens`** in `lens/.env`.
- For proxied dev, set **`TILE_SERVER_HOST=http://localhost:4321`** so tileserver-gl metadata URLs match the Astro origin. Direct Lens dev can use `http://localhost:3939`.
- **`/lens` proxy works only in `astro dev`**, not `astro preview` or static `site/dist/`.

## Runtime config (secrets)

- Mapbox token, PostHog public key, and API path prefixes are **not** baked into JS bundles or the Docker image.
- Express serves **`/runtime-config.js`** (site) and **`/lens/runtime-config.js`** (Lens HTML) from container/server env at runtime.
- Astro dev loads `lens/.env` in `site/astro.config.mjs` to serve root `/runtime-config.js`.
- CI/Docker build needs **no** `MAPBOX_TOKEN` or PostHog keys at build time.

## PostHog

- Shared first-party PostHog proxy at **`/weef`** (both site and Lens). Legacy **`/lens/weef`** still proxied.
- Server-side events use `POSTHOG_API_KEY` in `lens/.env` / `docker/.env` (not the public key).

## Trailing slashes

- Prefer **no** trailing slashes in links and APIs: Lens share URLs, CTAs (`/lens`), area API at `/lens/area/calculate_areas`.
- Astro uses `trailingSlash: 'ignore'` so `/lens/` is not 404'd in `astro dev` before the Vite proxy.
- Express serves Lens at `/lens` (no `express.static` directory redirect) and 301s `/lens/` → `/lens`.
- Lens `index.html` must use **root-absolute** asset URLs (`/lens/dist/...`, `/lens/runtime-config.js`). Relative `./dist/...` resolves to `/dist/...` when the page URL has no trailing slash.

## Lens client state

- **Zustand** holds Lens domain state (mode, dataset, years, view, features).
- **React Context** only injects the store instance so tests/harness can mount an isolated store — not a second state tree.
- **Local `useState`** for ephemeral UI (map bounds, swipe position) that must not live in the store or URL.
- Multi-field object picks from the store should use Zustand `useShallow`. Do not split into slices for this app size.

## Production

- **Single image** `wee-forest-lens`: Express serves Astro `site/dist` at `/` and Lens at `/lens*`. Caddy reverse-proxies everything to `:3939`.
- Reference deploy files: `docker/docker-compose.yml`, `docker/caddy-compose.yml`, `docker/Caddyfile.wee-forest`, `docker/.env.example`.
- GitHub Actions **`docker-image.yml`** runs on PRs, pushes to **`main`**, and manual dispatch. PRs publish the PR head short SHA; `main` publishes short SHA plus `latest`.

## Common mistakes

- Editing only main-repo `lens/` while user works on a feature branch — check `git branch` first.
- Assuming esbuild `define` still inlines env vars — removed; clients read `window.__WEEFOREST_RUNTIME__`.
- Using `astro preview` to test `/lens` routing — use `astro dev` + running Lens.
- Putting secrets in Dockerfile build args or CI lens build step — use runtime `.env` on the server.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in the WeeForest Linear project. See `docs/agents/issue-tracker.md`.

### Triage labels

Linear triage uses the five canonical workflow labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.

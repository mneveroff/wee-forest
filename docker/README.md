# WeeForest deployment

Production runs as a **single Docker image** (`wee-forest-lens`) that serves:

- `/` — Astro static site (`site/dist`)
- `/lens*` — Lens map app, tile proxy, area API, PostHog ingest proxy

Caddy terminates TLS and reverse-proxies all traffic to the app container.

## Quick start

1. Copy `.env.example` to `.env` and set secrets (`MAPBOX_TOKEN`, PostHog keys).
2. Place parquet and mbtiles data under `docker/data/area` and `docker/data/tiles`.
3. Create the external network once: `docker network create wee_forest_net`
4. Start the app: `docker compose up -d`
5. Add `Caddyfile.wee-forest` to your Caddy config and start `caddy-compose.yml`.

## Runtime configuration

Client-side values (Mapbox token, PostHog public key, path prefixes) are **not** compiled into the JS bundle. The Express server serves `/runtime-config.js` from the container environment on each request, so the same image can be deployed with different `.env` files.

Server-only secrets (`POSTHOG_API_KEY` for area-calculation events) are also read from `.env` at runtime.

## Image build

CI builds the image via the root `Dockerfile` (multi-stage: Astro + Lens bundle, no secrets required at build time). Pull by commit tag:

```bash
docker pull mneveroff/wee-forest-lens:<git-sha>
```

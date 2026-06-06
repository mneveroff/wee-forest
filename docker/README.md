# WeeForest deployment

Production runs as a **single Docker image** (`wee-forest-lens`) that serves:

- `/` — Astro static site (`site/dist`)
- `/lens*` — Lens map app, tile proxy, area API
- `/ingest*` — PostHog first-party proxy (shared by site and Lens)

Caddy terminates TLS and reverse-proxies all traffic to the app container.

## Quick start

1. Copy `.env.example` to `.env` and set secrets (`MAPBOX_TOKEN`, PostHog keys).
2. Set `IMAGE_TAG` in `.env` — see [Image tags](#image-tags) below.
3. Place parquet and mbtiles data under `data/area` and `data/tiles` next to this compose file.
4. Create the external network once: `docker network create wee_forest_net` or use an existing one like `caddy_net`
5. Pull and start: `docker compose pull && docker compose up -d`
6. Add `Caddyfile.wee-forest` to your Caddy config and start `caddy-compose.yml`.

## Image tags

CI publishes two tags on every push to `main`:

| Tag | Example | Use |
|-----|---------|-----|
| Short git SHA | `mneveroff/wee-forest-lens:efe5ba3` | Pin production to a known build |
| `latest` | `mneveroff/wee-forest-lens:latest` | Track the most recent `main` build |

`docker-compose.yml` reads `IMAGE_TAG` from `.env` (defaults to `latest` if unset).

Until at least one CI build has completed on `main`, neither tag exists on Docker Hub — set `IMAGE_TAG` to a SHA from a successful workflow run, or wait for CI to push `latest`.

To deploy a specific build:

```bash
# in docker/.env
IMAGE_TAG=efe5ba3

docker compose pull wee_forest_lens
docker compose up -d --force-recreate wee_forest_lens
```

## Runtime configuration

Client-side values (Mapbox token, PostHog public key, path prefixes) are **not** compiled into the JS bundle. The Express server serves `/runtime-config.js` from the container environment on each request, so the same image can be deployed with different `.env` files.

Server-only secrets (`POSTHOG_API_KEY` for area-calculation events) are also read from `.env` at runtime.

## Image build

CI builds the image via the root `Dockerfile` (multi-stage: Astro + Lens bundle, no secrets required at build time).

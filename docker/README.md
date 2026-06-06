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

CI tagging:

| Event | Tags pushed | Architectures |
|-------|-------------|---------------|
| Pull request | `mneveroff/wee-forest-lens:<pr-head-sha>` only | `linux/amd64`, `linux/arm64` |
| Merge to `main` | `<merge-sha>` and `latest` | `linux/amd64`, `linux/arm64` |

Production host is **arm64** (`sites-emerald`). PR SHA tags published before multi-arch was enabled are amd64-only and will not pull — re-run CI on the PR branch or use a `main` tag after merge.

`docker-compose.yml` reads `IMAGE_TAG` from `.env` (defaults to `latest` if unset).

Use a PR's short SHA to test a branch build before merge. After merge, `latest` tracks `main`; pin with `IMAGE_TAG=<sha>` when you need a specific build.

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

CI runs two jobs on every trigger:

| Job | Purpose |
|-----|---------|
| `build` | Build multi-arch image (no registry push); warms layer cache |
| `publish` | Rebuild from cache and push tags (needs `production` env) |

Pull requests push `<pr-head-sha>` only. Merges to `main` push `<sha>` and `:latest`. Manual **workflow dispatch** from `main` matches a merge; from other branches it pushes SHA only.

## Troubleshooting

### `/lens/tiles/...` returns 504 and logs show `ECONNREFUSED` to `localhost:8080`

`tileserver-gl` is not listening. Check container logs for `tileserver-gl exited with code 1`.

Common cause on **arm64**: sqlite3 native bindings linked against a newer glibc than Debian Bookworm-based `node:24` provides (`GLIBC_2.38 not found`). The Dockerfile uses `node:24-trixie` and runs a build-time tileserver/sqlite smoke test; pull a fresh CI tag and redeploy.

Verify tileserver is up:

```bash
docker compose logs wee_forest_lens 2>&1 | grep -E 'tileserver-gl|ECONNREFUSED'
```

# WeeForest Lens - Application

## Overview

The solution is a static TypeScript and React app with Express serving area information, runtime configuration, and tiles.

Main external dependencies and used libraries include:

- React Map GL and Mapbox GL for controlled Timeline, Split, and Swipe maps.
- Zustand for Lens state and synchronized map view state.
- tileserver-gl-light that's serving the .mbtiles files and is deployed as a standalone server, having requests to it routed via express.
- duckdb in file mode used for area calculation, served via an express endpoint.

The subject of data preparation, both parquet area data and the tiles is covered in the [data directory](../data/README.md).
  
## Running WeeForest Lens

For both development and production modes WeeForest Lens can be ran via scripts in the [package.json](./package.json) file. Do note that `tileserver-config.json` expects certain .mbtiles files to be present, so you might want to complete the data preparation process first.

### Environment File

Most of variables are set in the `.env` file. Typical content would be:

```env
MAPBOX_TOKEN=$YOUR_TOKEN
RECREATE_DATABASE=
STATIC_SERVER_PATH=
TILE_SERVER_HOST=http://localhost:3939
TILE_SERVER_PATH=tiles
AREA_SERVER_PATH=area
TILES_PATH=../data/tiles
PARQUET_PATH=../data/area
DUCKDB_PATH=../data/area/wee_forest.duckdb
STATIC_DIR=../public

NODE_ENV=development
AREA_PORT=3939
POSTHOG_API_KEY=
POSTHOG_PUBLIC_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_PROXY_PATH=weef
```

With this setup, your tiles and area files are expected to be in the `../data` folder relative to the lens folder. Fields left empty are left so on purpose.

If you were inclined to serve Lens from a URLPath like it's done on [weeforest.org/lens](https://weeforest.org/lens) you would only have to set the `STATIC_SERVER_PATH` to `lens`.

Browser-facing values (`MAPBOX_TOKEN`, `POSTHOG_PUBLIC_API_KEY`, path prefixes) are served at runtime via `/runtime-config.js` from `server.mjs`, so production secrets stay in the container `.env` and are not baked into the Docker image. Server-only values (`POSTHOG_API_KEY`, `POSTHOG_HOST`, data paths) are also read at runtime.

### Development

1. Check out the repository in a local folder
1. Complete data preparation, resulting in 23 mbtiles and 23 parquet files, 11 per each year for NFI and NFIxAWI overlay and 1 for AWI only.
1. From the repo root, run `pnpm dev:lens` to start the development server. It watches for changes and supports hot reload for everything but environment variables, has source mapping and starts the tileserver as you would on production.

For map interaction and comparison-mode debugging, run `pnpm dev:map-harness` and open `http://127.0.0.1:4174/`. The harness reads `MAPBOX_TOKEN` from `lens/.env`, but all rendered map data is local GeoJSON made of obvious rectangles over a plain ocean background. Run its Browser suite with `pnpm test:map-harness` (headless in CI) or `pnpm test:map-harness:headed` to watch Chromium with slowed interactions. Control-only Browser tests (`pnpm test:browser`) are intentionally map-free and finish quickly; use the harness when you need a real Mapbox GL paint/hit-test environment. The harness is outside the production entry graph and is not included in Lens builds.

Do not use Mapbox `testMode` for harness or visual Browser tests — it silences token errors but disables canvas painting, so popup hit-testing fails. Keep a real `MAPBOX_TOKEN` even when tile data is local.

If you're using VSCode you should also find `dev` and `prod` configurations in the `.vscode/launch.json` file, allowing you to attach the debugger to the browser directly.

> Note that the configuration is rather crude and assumes you're using Brave on MacOS. You might need to adjust the browser path and the port if you're using a different setup.

### Production

Mirror the steps from the Development section but run `pnpm --filter wee-forest-lens prod` instead. This would disable source mapping and enable minification, as well as serve the files once without watching for changes.

## Docker & Compose

For convenience there's also a Dockerfile and Compose files available. If you would like to run the solution in a container, you can do so by running setting up the environment and running the following commands:

### Setup

1. Copy [docker/.env.example](../docker/.env.example) to `docker/.env` and set secrets and paths for production.
1. If you were to use the `docker-compose.yml` provided, create a new docker network: `docker network create wee_forest_net` and add it to the `.env` file under `DOCKER_MY_NETWORK=wee_forest_net`.

### Running

Now you're ready to build & run the container:

1. Build the combined image from the repo root: `docker build -t wee-forest-lens .` (includes Astro site + Lens).
1. Navigate to the compose folder and start it: `cd docker && docker compose up -d`.

> Depending on your environment, you might need to configure buildkit/buildx or other Docker settings to build the image correctly, troubleshoot as needed.

### Deploying

The `Docker Build & Push` GitHub Action runs a multi-arch build for `linux/amd64` and `linux/arm64`, then publishes from the separate `publish` job. Pull requests publish the PR head short SHA only; merges to `main` publish the merge short SHA and `latest`. Mapbox and PostHog public keys are supplied via `docker/.env` at container runtime through `/runtime-config.js`.

Images are tagged with the short git SHA, plus `latest` for the most recent `main` build:

```yaml
image: mneveroff/wee-forest-lens:<short-sha>
# or
image: mneveroff/wee-forest-lens:latest
```

Set `IMAGE_TAG` in `docker/.env` — see [docker/README.md](../docker/README.md).

To update production after a successful workflow run:

```bash
docker compose pull wee_forest_lens
docker compose up -d --force-recreate wee_forest_lens
```

If a workflow is re-run for the same commit, the tag is reused but the digest changes. Pull and recreate the container to pick up the rebuilt image.

### Transferring

Barring the registry workflow, you can also archive the image and transfer it to a server via ssh:

1. `docker save -o wee-forest-lens.tar wee-forest-lens:latest`.
1. `rsync -avz --progress -e ssh wee-forest-lens.tar username@host:~/path`.
1. On the remote machine: `docker load -i wee-forest-lens.tar && rm wee-forest-lens.tar` and finally `docker-compose down && docker-compose up -d`

### Analytics

Plausible has been removed. Browser analytics on both the landing page and Lens use `posthog-js` through a shared first-party `/weef` path (configurable via `POSTHOG_PROXY_PATH`), which forwards to `POSTHOG_HOST` server-side. The legacy `/lens/weef` path is still proxied for compatibility. The server also uses `posthog-node` to capture backend events such as area calculations.

## Contributing

Contributions are encouraged and welcome. The project roadmap, ideas, bugs and issues are tracked in the [Project](https://github.com/users/MNeverOff/projects/4).

With regards to the Lens, there are a few areas where help would be greatly appreciated:

1. Security, Caching and Performance improvements. I have opted to go for a JS backend for simplicity of runtime (both DuckDB and Tileserver supported it out of the box) but it's not the most performant solution, with fastAPI on Python, Go and Kestrel being arguably better options. I also have put in place rather rudimentary caching and security practices so I would appreciate any advise and help in that area.
2. Moving away form Mapbox. It's very costly past the 50,000 map loads but the main thing holding me from shifting to maplibre-gl is lack of easily attainable terrain and hillshading styles for 3D. If you have experience with creating such styles or know of a good source of open data for it, please let me know. **Alternatively**, securing a more generous Mapbox grant would also be a great help as I enjoy working with their tech a fair bit.

## On File Structure

The client keeps configuration and state in `src/models`, React rendering in `src/components`, and the static informational page behavior in `page.ts`. Vitest uses separate Node and Browser projects: Node covers state and URL behavior, while Browser covers user-facing controls in Chromium.

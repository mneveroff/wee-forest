# WeeForest site

Astro static site for [weeforest.org](https://weeforest.org/). Replaces the former Ghost landing page.

## Development

Integrated local routing (Astro proxies `/lens*` to Lens, like production Caddy):

```bash
# from repo root
pnpm install

# lens/.env must include STATIC_SERVER_PATH=lens, then restart Lens after changing it
pnpm dev:lens   # terminal 1
pnpm dev:site   # terminal 2
```

Open `http://127.0.0.1:4321/` and use **Explore the Map** — it should load Lens at `/lens/` via the Astro dev proxy.

**Worktree note:** Lens needs tile/parquet data from the main repo checkout. Symlink `data/tiles` to the main repo and set `lens/.env` paths accordingly (see `lens/.env` in this branch). Set `TILE_SERVER_HOST=http://localhost:4321` so tile URLs work through the Astro proxy.

Override the Lens upstream with `LENS_DEV_TARGET` if needed (default `http://127.0.0.1:3939`).

Copy `site/.env.example` to `site/.env` and set `PUBLIC_POSTHOG_PUBLIC_API_KEY` to match Lens.

Note: the `/lens` proxy applies to `astro dev` only, not `astro preview` or the static `dist/` build.

## Build

```bash
pnpm build:site
pnpm --filter @wee-forest/site preview
```

Output is written to `site/dist/`.

## Deploy

Serve `site/dist/` at the domain root. Keep `/lens*` proxied to the Lens container.

Reference screenshots of the pre-migration site are in `migration/reference-snapshots/`.

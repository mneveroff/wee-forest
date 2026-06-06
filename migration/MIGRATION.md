# Ghost → Astro migration notes

## Migrated

- Landing page at `/` (Ghost `page.home`)
- Static images under `/content/images/`
- Interactive Plotly chart (felled woodland area, 2012–2022)
- Stripe donation buttons
- PostHog browser analytics (`landing_cta_clicked` on Lens CTAs)
- Sitemap via `@astrojs/sitemap`

## Intentionally omitted

- Ghost post/tag/author routes (no public content used them)
- Ghost memberships, comments, newsletters, portal
- Plausible (replaced by PostHog, matching Lens)
- `/lens` Ghost placeholder page (Lens app handles `/lens*`)

## Deployment

Single Docker image (`wee-forest-lens`) serves both the Astro site and Lens:

| Path | Handler |
|------|---------|
| `/` | Astro static build (`site/dist`) |
| `/lens*` | Lens (static UI, tiles, area API, PostHog proxy) |
| `/runtime-config.js` | Runtime public config from container `.env` |

Caddy reverse-proxies all traffic to `wee_forest_lens:3939`. See [docker/README.md](../docker/README.md), [docker/Caddyfile.wee-forest](../docker/Caddyfile.wee-forest), and [docker/docker-compose.yml](../docker/docker-compose.yml).

`www.weeforest.org` should redirect to apex.

### Runtime secrets

Mapbox token and PostHog public key are **not** baked into the JS bundle or Docker image. The server generates `/runtime-config.js` from the container environment (`docker/.env` on the host). CI builds the image without those secrets.

### Local dev equivalent

`site/astro.config.mjs` proxies `/lens*` to `http://127.0.0.1:3939` during `astro dev` and serves `/runtime-config.js` from local env for the landing page.

Lens must run with `STATIC_SERVER_PATH=lens` so paths match production.

## PostHog

- Browser keys come from `/runtime-config.js` at runtime (same project for site and Lens)
- Lens uses first-party `/lens/ingest` proxy; landing page sends directly to `POSTHOG_HOST`

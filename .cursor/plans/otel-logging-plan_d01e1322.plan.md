---
name: otel-logging-plan
overview: Add PostHog Logs via OpenTelemetry for the single deployed Node/Express container that serves both Astro and Lens, while using the PostHog browser SDK for frontend logs on both `/` and `/lens` through the shared `/ingest` proxy. Python notebook/data work is intentionally out of scope.
todos:
  - id: node-otel
    content: Add Node OTLP log exporter and a single logger wrapper for `lens`.
    status: pending
  - id: wide-event
    content: Instrument `/calculate_areas` with one request-completion wide event and error attributes.
    status: pending
  - id: frontend-logs
    content: Add shared frontend PostHog log helpers for Astro and Lens, plus session/distinct-id request headers.
    status: pending
  - id: docs-config
    content: Document env vars and wire runtime config for Docker/CI without committing secrets.
    status: pending
  - id: verify
    content: Run build/smoke checks and verify logs reach PostHog.
    status: pending
isProject: false
---

# OTel Logging Plan

## Recommended Shape

Use two related paths for the deployed app container:

- **Node/Express container (`lens/src/server.mjs`)**: add a real OpenTelemetry logs exporter that sends structured server logs directly to PostHog at `https://eu.i.posthog.com/i/v1/logs`, authenticated with the existing `POSTHOG_API_KEY` project token. This process now serves Astro, Lens, runtime config, the area API, tiles, and the PostHog proxy.
- **Browser frontends (`site` and `lens`)**: use `posthog-js` log capture (`posthog.captureLog` / `posthog.logger.*`) rather than a browser OTLP exporter. Astro at `/` and Lens at `/lens` should both use the shared first-party `/ingest` proxy so browser logs/events carry the current PostHog distinct ID/session ID.
- **Python/data notebooks (`data`)**: intentionally do not instrument. This work is static local analysis and should stay out of the observability pipeline.

The guiding rule is the `/logging-best-practices` wide-event pattern: one structured, context-rich log at request completion, plus `ERROR` logs for actionable failures. Avoid noisy step-by-step logs and avoid request/response bodies.

Current routing already matches this shape:

```130:137:lens/src/server.mjs
// Shared first-party ingest for Astro (/) and Lens (/lens).
app.use('/' + postHogIngestPath, createPostHogProxy(postHogIngestPath));

// Legacy path kept for in-flight clients or bookmarks.
if (staticServerPath) {
    const legacyIngestPath = staticServerPath + postHogIngestPath;
    app.use('/' + legacyIngestPath, createPostHogProxy(legacyIngestPath));
}
```

## Node Implementation

Add dependencies to the Lens workspace package in [`lens/package.json`](lens/package.json) using pnpm from the root workspace:

- `@opentelemetry/sdk-node`
- `@opentelemetry/sdk-logs`
- `@opentelemetry/exporter-logs-otlp-http`
- `@opentelemetry/api-logs`
- `@opentelemetry/resources`

Create a small logging layer instead of scattering OTel calls through handlers:

- [`lens/src/otel-logs.mjs`](lens/src/otel-logs.mjs): initialize `NodeSDK` only when `POSTHOG_API_KEY` and logging are enabled; set resource attributes such as `service.name=wee-forest-lens`, `service.version=GIT_HASH`, `deployment.environment=NODE_ENV`.
- [`lens/src/logger.mjs`](lens/src/logger.mjs): export a single typed-ish JS wrapper around `logs.getLogger('wee-forest-lens')` with `info`, `warn`, `error`, and `shutdownLogs()`.
- [`lens/src/server.mjs`](lens/src/server.mjs): import/init logging early, replace only meaningful `console.*` calls, and add wide events around high-value server operations.

Because the same Express process now serves multiple surfaces, include route/surface context in server logs:

- `surface=site` for Astro static request failures or startup messages.
- `surface=lens` for Lens static, area API, and tile proxy behavior.
- `surface=posthog_proxy` for `/ingest` proxy failures only, not every successful ingestion request.
- `surface=tileserver` for child-process lifecycle logs.

The existing analytics capture should remain separate:

```175:185:lens/src/server.mjs
        captureEvent({
            distinctId: getPostHogDistinctId(req),
            event: 'area calculated',
            properties: {
                dataset,
                type,
                bounds,
                result_count: Object.keys(result).length,
                $current_url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
            },
        });
```

That event says what the user did. The new log should say what the system did, for example `event=area.calculate`, `method`, `path`, `status_code`, `duration_ms`, `dataset`, `type`, `result_count`, `posthogDistinctId`, `sessionId`, and on failure `error_type` / `error_message`.

Also update shutdown to flush both PostHog analytics and OTel logs before exit.

The Docker runtime stage must copy any new Node logging files into the image next to the existing server modules:

```41:47:Dockerfile
COPY --from=builder /repo/lens/public/ ./lens/public/
COPY --from=builder /repo/lens/public/dist/ ./lens/public/dist/
COPY --from=builder /repo/site/dist/ ./site/dist/
COPY lens/src/server.mjs ./lens/src/
COPY lens/src/posthog.mjs ./lens/src/
COPY lens/src/runtime-config.mjs ./lens/src/
COPY lens/tileserver-config.prod.json ./lens/tileserver-config.json
```

Update this list for `otel-logs.mjs` and `logger.mjs`, or switch to copying the required `lens/src/*.mjs` server modules deliberately.

## Frontend Implementation

Add browser logging helpers for both frontend surfaces:

- [`lens/src/browser-logs.ts`](lens/src/browser-logs.ts): wraps PostHog logging behind a narrow API such as `logBrowserError(message, error, attributes)`. This keeps TypeScript call sites typesafe and avoids direct `console.error` as the only observable output.
- [`site/src/components/PostHog.astro`](site/src/components/PostHog.astro) or a small site-side client helper: initialize frontend log capture for the Astro site after the PostHog SDK is ready, including global `error` and `unhandledrejection` handlers.

Astro already initializes PostHog through runtime config and the shared `/ingest` path:

```50:60:site/src/components/PostHog.astro
  function initPostHog() {
    const cfg = window.__WEEFOREST_RUNTIME__ || {};
    const token = cfg.posthogPublicApiKey || devToken;
    if (!token) return;

    const ingestPath = cfg.posthogProxyPath || 'ingest';
    posthog.init(token, {
      api_host: `${window.location.origin}/${ingestPath}`,
      ui_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
    });
  }
```

Lens also uses runtime config and should keep pointing at the same origin-level ingest endpoint, not `/lens/ingest`:

```18:22:lens/src/index.ts
if (runtimeConfig.posthogPublicApiKey) {
    posthog.init(runtimeConfig.posthogPublicApiKey, {
        api_host: getPostHogApiHost(runtimeConfig),
        ui_host: 'https://eu.posthog.com',
    });
}
```

Update the area request in [`lens/src/components/legend.ts`](lens/src/components/legend.ts) to pass correlation headers:

```203:212:lens/src/components/legend.ts
                const fetchPromises = boundsAndDataTypes.map(({ bounds, datasetId }) => {
                    const url = `${this._areaServerPath}/calculate_areas?dataset=${datasetId}&type=${this._datasetDataType.value}&bounds=${bounds.toArray().flat().join(',')}`;
    
                    return fetch(url)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
```

Recommended headers:

- `x-posthog-distinct-id`: from the browser SDK distinct ID.
- `x-posthog-session-id`: from `posthog.getSessionId()`.

Then the Node wide event can include `posthogDistinctId` and `sessionId`, making backend logs navigable to users/session replays in PostHog.

For frontend logs, start narrowly:

- Global `window.onerror` and `unhandledrejection` capture for both Astro and Lens.
- Existing catch blocks in [`lens/src/components/legend.ts`](lens/src/components/legend.ts) and map-related failure paths.
- Astro interaction/runtime failures where JavaScript exists, especially Plotly/chart loading and any future interactive components.
- Attributes like `event`, `component`, `dataset`, `map_mode`, `selected_year`, but no full URLs with sensitive query strings unless intentionally sanitized.

If Astro keeps using the inline snippet instead of importing `posthog-js`, make sure the snippet stubs the log methods we call, or initialize logging only after the loaded SDK exposes them.

## Configuration And Docs

Update [`docker/.env.example`](docker/.env.example), [`docker/README.md`](docker/README.md), [`lens/README.md`](lens/README.md), and possibly [`.github/workflows/docker-image.yml`](.github/workflows/docker-image.yml) with these env vars:

- `POSTHOG_API_KEY`: existing project token, reused for OTLP logs.
- `POSTHOG_HOST`: existing host, default `https://eu.i.posthog.com`.
- `POSTHOG_LOGS_ENDPOINT`: optional override, default derived as `https://eu.i.posthog.com/i/v1/logs`.
- `POSTHOG_LOGS_ENABLED`: default enabled when `POSTHOG_API_KEY` is present, disabled in tests if needed.
- `OTEL_SERVICE_NAME`, `OTEL_SERVICE_VERSION`, `OTEL_DEPLOYMENT_ENVIRONMENT`: optional overrides for resource attributes.

Keep `/ingest` as browser-only first-party ingestion for both Astro and Lens. Server-side OTLP logs should go directly from the Node container to the PostHog logs endpoint, not through the public `/ingest` reverse proxy.

Do not commit secret values. Only document placeholders in [`docker/.env.example`](docker/.env.example) and rely on runtime `.env` values for the deployed container. The root Docker build does not need PostHog secrets at build time.

## Verification

After implementation, run:

- `pnpm install` from the repo root to update the workspace lockfile.
- `pnpm build:site` and `pnpm build:lens` for Astro and Lens validation.
- `docker build --build-arg GIT_HASH=$(git rev-parse --short HEAD) -t wee-forest-lens .` to verify the single image still includes Astro, Lens, and the new server logging modules.
- Start the container locally with PostHog env vars and verify one Astro frontend log, one Lens frontend log, and one `/lens/area/calculate_areas` backend log appears in PostHog Logs.
- Confirm browser events/logs from both `/` and `/lens` use `/ingest`, while server OTLP logs use `/i/v1/logs`.

## One Important Caveat

The current `/calculate_areas` SQL interpolates query parameters directly. That is separate from logging, but once we add structured logs around this endpoint, the logs may make suspicious inputs easier to see. I would keep the logging change scoped, then handle query validation/parameterization as a separate hardening task.
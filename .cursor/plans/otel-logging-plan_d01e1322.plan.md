---
name: otel-logging-plan
overview: Add PostHog Logs via OpenTelemetry for the deployed Node service, while using the PostHog browser SDK for frontend logs so session/person context is attached without adding a separate browser OTLP pipeline. Python notebook/data work is intentionally out of scope.
todos:
  - id: node-otel
    content: Add Node OTLP log exporter and a single logger wrapper for `lens`.
    status: pending
  - id: wide-event
    content: Instrument `/calculate_areas` with one request-completion wide event and error attributes.
    status: pending
  - id: frontend-logs
    content: Add frontend PostHog log helper, global error capture, and session/distinct-id request headers.
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

Use two related paths for the deployed Lens app:

- **Node/Express (`lens`)**: add a real OpenTelemetry logs exporter that sends structured logs to PostHog at `https://eu.i.posthog.com/i/v1/logs`, authenticated with the existing `POSTHOG_API_KEY` project token.
- **Frontend (`lens/src`)**: use `posthog-js` log capture (`posthog.captureLog` / `posthog.logger.*`) rather than a browser OTLP exporter. This keeps logs on the existing first-party PostHog ingestion path and automatically attaches the current PostHog distinct ID/session ID.
- **Python/data notebooks (`data`)**: intentionally do not instrument. This work is static local analysis and should stay out of the observability pipeline.

The guiding rule is the `/logging-best-practices` wide-event pattern: one structured, context-rich log at request/job completion, plus `ERROR` logs for actionable failures. Avoid noisy step-by-step logs and avoid request/response bodies.

## Node Implementation

Add dependencies in [`lens/package.json`](lens/package.json) using pnpm:

- `@opentelemetry/sdk-node`
- `@opentelemetry/sdk-logs`
- `@opentelemetry/exporter-logs-otlp-http`
- `@opentelemetry/api-logs`
- `@opentelemetry/resources`

Create a small logging layer instead of scattering OTel calls through handlers:

- [`lens/src/otel-logs.mjs`](lens/src/otel-logs.mjs): initialize `NodeSDK` only when `POSTHOG_API_KEY` and logging are enabled; set resource attributes such as `service.name=wee-forest-lens`, `service.version=GIT_HASH`, `deployment.environment=NODE_ENV`.
- [`lens/src/logger.mjs`](lens/src/logger.mjs): export a single typed-ish JS wrapper around `logs.getLogger('wee-forest-lens')` with `info`, `warn`, `error`, and `shutdownLogs()`.
- [`lens/src/server.mjs`](lens/src/server.mjs): import/init logging early, replace only meaningful `console.*` calls, and add a wide event around `/calculate_areas`.

The existing analytics capture should remain separate:

```153:163:lens/src/server.mjs
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

## Frontend Implementation

Add a browser logging helper, likely [`lens/src/browser-logs.ts`](lens/src/browser-logs.ts), that wraps PostHog logging behind a narrow API such as `logBrowserError(message, error, attributes)`. This keeps TypeScript call sites typesafe and avoids direct `console.error` as the only observable output.

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

- Global `window.onerror` and `unhandledrejection` capture.
- Existing catch blocks in [`lens/src/components/legend.ts`](lens/src/components/legend.ts) and map-related failure paths.
- Attributes like `event`, `component`, `dataset`, `map_mode`, `selected_year`, but no full URLs with sensitive query strings unless intentionally sanitized.

## Configuration And Docs

Update [`lens/README.md`](lens/README.md), [`docker/docker-compose.yml`](docker/docker-compose.yml), and possibly [`.github/workflows/docker-image.yml`](.github/workflows/docker-image.yml) with these env vars:

- `POSTHOG_API_KEY`: existing project token, reused for OTLP logs.
- `POSTHOG_HOST`: existing host, default `https://eu.i.posthog.com`.
- `POSTHOG_LOGS_ENDPOINT`: optional override, default derived as `https://eu.i.posthog.com/i/v1/logs`.
- `POSTHOG_LOGS_ENABLED`: default enabled when `POSTHOG_API_KEY` is present, disabled in tests if needed.
- `OTEL_SERVICE_NAME`, `OTEL_SERVICE_VERSION`, `OTEL_DEPLOYMENT_ENVIRONMENT`: optional overrides for resource attributes.

Do not commit secret values. Only document placeholders and wire compose/GitHub vars so deployed containers can receive runtime values.

## Verification

After implementation, run:

- `cd lens && pnpm install` to update the lockfile.
- `cd lens && pnpm run build` for frontend type/bundle validation.
- Start `lens` locally with PostHog env vars and verify one frontend log plus one `/calculate_areas` backend log appears in PostHog Logs.

## One Important Caveat

The current `/calculate_areas` SQL interpolates query parameters directly. That is separate from logging, but once we add structured logs around this endpoint, the logs may make suspicious inputs easier to see. I would keep the logging change scoped, then handle query validation/parameterization as a separate hardening task.
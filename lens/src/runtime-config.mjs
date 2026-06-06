function normalizeSegment(segment) {
    return segment?.replace(/^\/|\/$/g, '') || '';
}

function servicePath(staticServerPath, segment) {
    const base = normalizeSegment(staticServerPath);
    return base ? `/${base}/${segment}` : `/${segment}`;
}

export function buildRuntimeConfigScript(env = process.env) {
    const staticServerPath = normalizeSegment(env.STATIC_SERVER_PATH);
    const areaSegment = normalizeSegment(env.AREA_SERVER_PATH) || 'area';
    const tileSegment = normalizeSegment(env.TILE_SERVER_PATH) || 'tiles';

    const config = {
        mapboxToken: env.MAPBOX_TOKEN || '',
        posthogPublicApiKey: env.POSTHOG_PUBLIC_API_KEY || '',
        posthogHost: env.POSTHOG_HOST || 'https://eu.i.posthog.com',
        staticServerPath,
        areaServerPath: servicePath(staticServerPath, areaSegment),
        tileServerPath: servicePath(staticServerPath, tileSegment),
        posthogProxyPath: env.POSTHOG_PROXY_PATH || 'ingest',
    };

    return `window.__WEEFOREST_RUNTIME__=${JSON.stringify(config)};`;
}

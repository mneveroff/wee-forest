function servicePath(staticServerPath, segment) {
    const base = staticServerPath?.replace(/^\/|\/$/g, '');
    return base ? `/${base}/${segment}` : `/${segment}`;
}

export function buildRuntimeConfigScript(env = process.env) {
    const staticServerPath = env.STATIC_SERVER_PATH?.replace(/^\/|\/$/g, '') || 'lens';
    const areaSegment = env.AREA_SERVER_PATH || 'area';
    const tileSegment = env.TILE_SERVER_PATH || 'tiles';

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

import { expect, test } from 'vitest';
import { buildRuntimeConfigScript } from './runtime-config.mjs';

function readConfig(script) {
    const prefix = 'window.__WEEFOREST_RUNTIME__=';
    return JSON.parse(script.slice(prefix.length, -1));
}

test('builds root runtime paths without exposing undefined configuration', () => {
    const config = readConfig(buildRuntimeConfigScript({}));

    expect(config).toEqual({
        mapboxToken: '',
        posthogPublicApiKey: '',
        posthogHost: 'https://eu.i.posthog.com',
        staticServerPath: '',
        areaServerPath: '/area',
        tileServerPath: '/tiles',
        posthogProxyPath: 'weef',
    });
});

test('normalizes Lens runtime paths while preserving runtime-provided values', () => {
    const config = readConfig(buildRuntimeConfigScript({
        STATIC_SERVER_PATH: '/lens/',
        AREA_SERVER_PATH: '/calculate/',
        TILE_SERVER_PATH: '/tiles/',
        MAPBOX_TOKEN: 'map-token',
        POSTHOG_PUBLIC_API_KEY: 'public-key',
        POSTHOG_HOST: 'https://example.test',
        POSTHOG_PROXY_PATH: 'events',
    }));

    expect(config).toEqual({
        mapboxToken: 'map-token',
        posthogPublicApiKey: 'public-key',
        posthogHost: 'https://example.test',
        staticServerPath: 'lens',
        areaServerPath: '/lens/calculate',
        tileServerPath: '/lens/tiles',
        posthogProxyPath: 'events',
    });
});

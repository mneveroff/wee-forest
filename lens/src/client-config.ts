export type WeeForestRuntimeConfig = {
    mapboxToken?: string;
    posthogPublicApiKey?: string;
    posthogHost?: string;
    staticServerPath?: string;
    areaServerPath?: string;
    tileServerPath?: string;
    posthogProxyPath?: string;
};

declare global {
    interface Window {
        __WEEFOREST_RUNTIME__?: WeeForestRuntimeConfig;
    }
}

export function getRuntimeConfig(): WeeForestRuntimeConfig {
    return window.__WEEFOREST_RUNTIME__ ?? {};
}

export function getPostHogApiHost(config = getRuntimeConfig()): string {
    const ingestPath = config.posthogProxyPath ?? 'weef';
    return `${window.location.origin}/${ingestPath}`;
}

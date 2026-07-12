import 'mapbox-gl/dist/mapbox-gl.css';
import '@/assets/styles.css';
import '@/assets/colors.css';
import '@/assets/map.css';
import '@/assets/page.css';

import { createRoot } from 'react-dom/client';
import posthog from 'posthog-js';
import { getPostHogApiHost, getRuntimeConfig } from '@/client-config';
import { LensApp } from '@/components/lens-app';
import { LensStoreProvider } from '@/components/lens-store-context';
import { ActPage, LearnPage, SharePage, WelcomePage } from '@/components/page';
import { createLensStore } from '@/models/lens-store';
import { parseLensUrl } from '@/models/lens-url';

const runtimeConfig = getRuntimeConfig();

if (runtimeConfig.posthogPublicApiKey) {
    posthog.init(runtimeConfig.posthogPublicApiKey, {
        api_host: getPostHogApiHost(runtimeConfig),
        ui_host: 'https://eu.posthog.com',
    });
}

document.addEventListener('DOMContentLoaded', () => {
    new WelcomePage('page-welcome', 'page-welcome-btn');
    new LearnPage('page-learn', 'page-learn-btn');
    new ActPage('page-act', 'page-act-btn');
    new SharePage('page-share', 'page-share-btn');

    const root = document.getElementById('app-lens');
    if (!root) {
        throw new Error('Lens root element is missing');
    }

    const store = createLensStore(parseLensUrl(new URL(window.location.href)));
    createRoot(root).render(
        <LensStoreProvider store={store}>
            <LensApp runtimeConfig={runtimeConfig} />
        </LensStoreProvider>,
    );
});

import 'mapbox-gl/dist/mapbox-gl.css';
import './assets/styles.css'
import './assets/colors.css'
import './assets/map.css'
import './assets/page.css'

import posthog from 'posthog-js';
import { getRuntimeConfig, getPostHogApiHost } from './client-config';
import { WeeForestMap } from './components/map';
import { WelcomePage, LearnPage, ActPage, SharePage } from './components/page';
import { parseLensUrl } from './models/lens-url';

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

    const {
        coordinates,
        selectedMode,
        selectedDataset,
        selectedBasemap,
        selectedDatasetDataTypeId,
        selectedYear,
        compareSelectedYear,
    } = parseLensUrl(new URL(window.location.href));

    new WeeForestMap('app-lens', coordinates, selectedMode, selectedDataset, selectedBasemap, selectedDatasetDataTypeId, selectedYear, compareSelectedYear);

    if (window.innerWidth <= 575) {
        document.querySelector('.basemap-selector')?.classList.add('collapsed');
        document.querySelector('.mode-selector')?.classList.add('collapsed');
    }
}); 
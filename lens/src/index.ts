import 'mapbox-gl/dist/mapbox-gl.css';
import './assets/styles.css'
import './assets/colors.css'
import './assets/map.css'
import './assets/page.css'

import posthog from 'posthog-js';
import { getRuntimeConfig } from './client-config';
import { WeeForestMap } from './components/map';
import { WelcomePage, LearnPage, ActPage, SharePage } from './components/page';
import { DatasetTypes, DatasetDataTypes } from './models/dataset';
import { BaseMapType } from './components/basemap-selector';
import { MapModeTypes } from './components/mode-selector';

const defaultCoords = { lat: 54.577, lng: -4.16, zoom: 6.37, pitch: 25 };
const runtimeConfig = getRuntimeConfig();
const staticServerPath = runtimeConfig.staticServerPath?.replace(/^\/|\/$/g, '') ?? 'lens';
const postHogProxyPath = runtimeConfig.posthogProxyPath ?? 'ingest';
const postHogApiHostPath = [staticServerPath, postHogProxyPath].filter(Boolean).join('/');

if (runtimeConfig.posthogPublicApiKey) {
    posthog.init(runtimeConfig.posthogPublicApiKey, {
        api_host: `${window.location.origin}/${postHogApiHostPath}`,
        ui_host: 'https://eu.posthog.com',
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    new WelcomePage('page-welcome', 'page-welcome-btn');
    new LearnPage('page-learn', 'page-learn-btn');
    new ActPage('page-act', 'page-act-btn');
    new SharePage('page-share', 'page-share-btn');

    const params = new URL(window.location.href).searchParams;
    
    const [lat, lng, zoom, pitch] = params.get('c')?.split(',').map(parseFloat) || [defaultCoords.lat, defaultCoords.lng, defaultCoords.zoom, defaultCoords.pitch];
    const selectedMode = params.get('m') as MapModeTypes || MapModeTypes.Static;
    const selectedDataset = params.get('l') as DatasetTypes || DatasetTypes.NFI_AWI_Overlay;
    const selectedBasemap = params.get('b') as BaseMapType || BaseMapType.Light;

    const selectedDatasetDataTypeId = params.get('t') as DatasetDataTypes || undefined;
    const selectedYear = params.get('y') ? parseInt(params.get('y')!) : undefined;
    const compareSelectedYear = params.get('cy') ? parseInt(params.get('cy')!) : undefined;

    new WeeForestMap('app-lens', {lat, lng, zoom, pitch}, selectedMode, selectedDataset, selectedBasemap, selectedDatasetDataTypeId, selectedYear, compareSelectedYear);

    if (window.innerWidth <= 575) {
        document.querySelector('.basemap-selector')?.classList.add('collapsed');
        document.querySelector('.mode-selector')?.classList.add('collapsed');
    }
}); 
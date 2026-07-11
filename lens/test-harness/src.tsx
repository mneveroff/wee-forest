import 'mapbox-gl/dist/mapbox-gl.css';
import '@/assets/styles.css';
import '@/assets/colors.css';
import '@/assets/map.css';

import { createRoot } from 'react-dom/client';
import { LensApp } from '@/components/lens-app';
import { LensStoreProvider } from '@/components/lens-store-context';
import { createLensStore } from '@/models/lens-store';
import { parseLensUrl } from '@/models/lens-url';
import { fixtureMapStyle, fixtureSourceFactory } from './fixture-data';

const rootElement = document.getElementById('app-lens');
if (!rootElement) {
    throw new Error('Map harness root is missing');
}

const initialUrl = window.location.search
    ? new URL(window.location.href)
    : new URL('http://localhost/?c=56.000000,2.550000,6.20,0&m=tl&d=nao&t=o&b=l&y=2012&cy=2022');
const store = createLensStore(parseLensUrl(initialUrl));

createRoot(rootElement).render(
    <LensStoreProvider store={store}>
        <LensApp
            mapSourceFactory={fixtureSourceFactory}
            mapStyleOverride={fixtureMapStyle}
            runtimeConfig={{ mapboxToken: import.meta.env.MAPBOX_TOKEN }}
            showLegend={false}
        />
    </LensStoreProvider>,
);

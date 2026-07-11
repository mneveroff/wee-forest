import 'mapbox-gl/dist/mapbox-gl.css';
import '@/assets/styles.css';
import '@/assets/colors.css';
import '@/assets/map.css';

import { createRoot, type Root } from 'react-dom/client';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { LensApp } from '@/components/lens-app';
import { LensStoreProvider } from '@/components/lens-store-context';
import { createLensStore } from '@/models/lens-store';
import { parseLensUrl } from '@/models/lens-url';
import { fixtureMapStyle, fixtureSourceFactory } from './fixture-data';

const mapboxToken = import.meta.env.MAPBOX_TOKEN;

function renderHarness(onMapIdle?: (role: 'primary' | 'comparison') => void): Root {
    if (!mapboxToken) {
        throw new Error('MAPBOX_TOKEN is required for the visual map harness');
    }

    document.body.replaceChildren();
    const container = document.createElement('div');
    container.id = 'app-lens';
    container.className = 'map-container';
    document.body.appendChild(container);
    const store = createLensStore(parseLensUrl(
        new URL('http://localhost/?c=56.000000,2.550000,6.20,0&m=tl&d=nao&t=o&b=l&y=2012&cy=2022'),
    ));
    const root = createRoot(container);
    root.render(
        <LensStoreProvider store={store}>
            <LensApp
                mapSourceFactory={fixtureSourceFactory}
                mapStyleOverride={fixtureMapStyle}
                onMapIdle={onMapIdle}
                runtimeConfig={{ mapboxToken }}
                showLegend={false}
            />
        </LensStoreProvider>,
    );
    return root;
}

test('opens a popup from a fixture rectangle after changing Timeline year', async () => {
    const idle = createIdleTracker();
    const initialIdle = idle.wait();
    const root = renderHarness((role) => {
        if (role === 'primary') {
            idle.notify();
        }
    });
    await initialIdle;
    const changedYearIdle = idle.wait();
    await page.getByRole('slider', { name: 'Dataset year' }).fill('2015');
    await changedYearIdle;

    const canvas = document.querySelector('.mapboxgl-canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Map canvas did not render');
    }
    const bounds = canvas.getBoundingClientRect();
    await page.elementLocator(canvas).click({
        position: {
            x: bounds.width / 2,
            y: bounds.height / 2,
        },
    });
    await expect.element(page.getByRole('link', { name: 'See on Google Maps' })).toBeInTheDocument();
    root.unmount();
});

function createIdleTracker() {
    const waiters: Array<() => void> = [];
    return {
        notify() {
            waiters.shift()?.();
        },
        wait() {
            return new Promise<void>((resolve) => waiters.push(resolve));
        },
    };
}

test('expands both maps from Split geometry before applying Swipe clipping', async () => {
    const root = renderHarness();
    await page.getByRole('button', { name: 'Split' }).click();
    await expect.poll(() => document.querySelectorAll('.mapboxgl-canvas').length).toBe(2);

    await page.getByRole('button', { name: 'Swipe' }).click();
    await expect.element(page.getByRole('slider', { name: 'Comparison position' })).toBeInTheDocument();
    await expect.poll(() => {
        const rootWidth = document.getElementById('app-lens')?.getBoundingClientRect().width ?? 0;
        const canvasWidths = [...document.querySelectorAll<HTMLCanvasElement>('.mapboxgl-canvas')]
            .map((canvas) => canvas.getBoundingClientRect().width);
        return canvasWidths.length === 2 && canvasWidths.every((width) => width >= rootWidth * 0.95);
    }).toBe(true);
    root.unmount();
});

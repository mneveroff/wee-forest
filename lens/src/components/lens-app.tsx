import { useCallback, useEffect, useState } from 'react';
import type { WeeForestRuntimeConfig } from '@/client-config';
import { BaseMapType, MapModeTypes } from '@/models/lens-config';
import { isComparisonMode } from '@/models/lens-store';
import { serializeLensUrl } from '@/models/lens-url';
import { BaseMapSelector, DatasetSelector, ModeSelector } from '@/components/lens-controls';
import { LensLegend, type MapBounds } from '@/components/lens-legend';
import { LensMap } from '@/components/lens-map';
import { useLensStore } from '@/components/lens-store-context';

type LensAppProps = {
    runtimeConfig: WeeForestRuntimeConfig;
};

export function LensApp({ runtimeConfig }: LensAppProps) {
    const modeId = useLensStore((state) => state.modeId);
    const datasetYear = useLensStore((state) => state.datasetYear);
    const compareDatasetYear = useLensStore((state) => state.compareDatasetYear);
    const basemapId = useLensStore((state) => state.basemapId);
    const [primaryBounds, setPrimaryBounds] = useState<MapBounds>();
    const [comparisonBounds, setComparisonBounds] = useState<MapBounds>();
    const [swipePosition, setSwipePosition] = useState(50);
    const comparisonMode = isComparisonMode(modeId);
    const mapboxToken = runtimeConfig.mapboxToken ?? '';
    const tileServerPath = runtimeConfig.tileServerPath ?? '/lens/tiles';
    const areaServerPath = runtimeConfig.areaServerPath ?? '/lens/area';
    const setPrimaryMapBounds = useCallback((bounds: MapBounds) => setPrimaryBounds(bounds), []);
    const setComparisonMapBounds = useCallback((bounds: MapBounds) => setComparisonBounds(bounds), []);

    useLensUrlSync();

    useEffect(() => {
        const root = document.getElementById('app-lens');
        root?.classList.toggle('mode-split', modeId === MapModeTypes.Split);
        root?.classList.toggle('mode-swipe', modeId === MapModeTypes.Swipe);

        return () => {
            root?.classList.remove('mode-split', 'mode-swipe');
        };
    }, [modeId]);

    useEffect(() => {
        document.querySelectorAll('.nav').forEach((element) => {
            element.classList.toggle('inverse', basemapId === BaseMapType.Satellite);
        });
    }, [basemapId]);

    return (
        <>
            <div className="widget-container right-widget-container">
                <LensLegend
                    areaServerPath={areaServerPath}
                    primaryBounds={primaryBounds}
                    comparisonBounds={comparisonBounds}
                />
                <DatasetSelector />
            </div>
            <div className="widget-container left-widget-container">
                <BaseMapSelector />
                <ModeSelector />
            </div>
            <LensMap
                mapboxToken={mapboxToken}
                mapRole="primary"
                onBoundsChange={setPrimaryMapBounds}
                tileServerPath={tileServerPath}
                year={datasetYear}
            />
            {comparisonMode ? (
                <LensMap
                    clipLeft={modeId === MapModeTypes.Swipe ? swipePosition : undefined}
                    mapboxToken={mapboxToken}
                    mapRole="comparison"
                    onBoundsChange={setComparisonMapBounds}
                    tileServerPath={tileServerPath}
                    year={compareDatasetYear}
                />
            ) : null}
            {modeId === MapModeTypes.Swipe ? (
                <>
                    <div className="map-compare-line" style={{ left: `${swipePosition}%` }} />
                    <input
                        className="map-compare-slider"
                        type="range"
                        aria-label="Comparison position"
                        min={0}
                        max={100}
                        value={swipePosition}
                        onChange={(event) => setSwipePosition(event.currentTarget.valueAsNumber)}
                    />
                </>
            ) : null}
        </>
    );
}

function useLensUrlSync() {
    const modeId = useLensStore((state) => state.modeId);
    const datasetId = useLensStore((state) => state.datasetId);
    const datasetDataTypeId = useLensStore((state) => state.datasetDataTypeId);
    const basemapId = useLensStore((state) => state.basemapId);
    const datasetYear = useLensStore((state) => state.datasetYear);
    const compareDatasetYear = useLensStore((state) => state.compareDatasetYear);
    const viewState = useLensStore((state) => state.viewState);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const { query, url } = serializeLensUrl(new URL(window.location.href), {
                coordinates: {
                    lat: viewState.latitude,
                    lng: viewState.longitude,
                    zoom: viewState.zoom,
                    pitch: viewState.pitch,
                },
                modeId,
                datasetId,
                datasetDataTypeId,
                basemapId,
                datasetYear,
                compareDatasetYear,
            });

            try {
                window.history.replaceState(null, '', query);
            } catch (error) {
                console.error('Failed to update the URL:', error);
            }

            const shareInput = document.getElementById('share-url');
            if (shareInput instanceof HTMLInputElement) {
                shareInput.value = url.toString();
            }
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [
        basemapId,
        compareDatasetYear,
        datasetDataTypeId,
        datasetId,
        datasetYear,
        modeId,
        viewState,
    ]);
}

import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { WeeForestRuntimeConfig } from '@/client-config';
import { BaseMapType, MapModeTypes } from '@/models/lens-config';
import { isComparisonMode } from '@/models/lens-store';
import { BaseMapSelector, DatasetSelector, ModeSelector } from '@/components/lens-controls';
import { LensLegend, type MapBounds } from '@/components/lens-legend';
import { LensMap } from '@/components/lens-map';
import { useLensStore } from '@/components/lens-store-context';
import { useLensUrlSync } from '@/hooks/use-lens-url-sync';

type LensAppProps = {
    runtimeConfig: WeeForestRuntimeConfig;
};

export function LensApp({ runtimeConfig }: LensAppProps) {
    const { modeId, datasetYear, compareDatasetYear, basemapId } = useLensStore(useShallow((state) => ({
        modeId: state.modeId,
        datasetYear: state.datasetYear,
        compareDatasetYear: state.compareDatasetYear,
        basemapId: state.basemapId,
    })));
    // Ephemeral map UI — not Lens domain state and not URL-persisted.
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

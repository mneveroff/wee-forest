import { useCallback, useEffect, useState } from 'react';
import { MapModeTypes } from '@/models/lens-config';
import { isComparisonMode } from '@/models/lens-store';
import { BaseMapSelector, ModeSelector } from '@/components/lens-controls';
import type { MapBounds } from '@/components/lens-legend';
import { LensMap, type LensMapSource } from '@/components/lens-map';
import { useLensStore } from '@/components/lens-store-context';
import { fixtureMapStyle, fixtureSourceFactory } from './fixture-data';

type HarnessAppProps = {
    mapboxToken: string;
    onMapIdle?: (role: 'primary' | 'comparison') => void;
};

export function HarnessApp({ mapboxToken, onMapIdle }: HarnessAppProps) {
    const modeId = useLensStore((state) => state.modeId);
    const datasetYear = useLensStore((state) => state.datasetYear);
    const compareDatasetYear = useLensStore((state) => state.compareDatasetYear);
    const [swipePosition, setSwipePosition] = useState(50);
    const comparisonMode = isComparisonMode(modeId);
    const ignoreBounds = useCallback((_bounds: MapBounds) => undefined, []);
    const notifyPrimaryIdle = useCallback(() => onMapIdle?.('primary'), [onMapIdle]);
    const notifyComparisonIdle = useCallback(() => onMapIdle?.('comparison'), [onMapIdle]);

    useEffect(() => {
        const root = document.getElementById('app-lens');
        root?.classList.toggle('mode-split', modeId === MapModeTypes.Split);
        root?.classList.toggle('mode-swipe', modeId === MapModeTypes.Swipe);

        return () => {
            root?.classList.remove('mode-split', 'mode-swipe');
        };
    }, [modeId]);

    return (
        <>
            <div className="widget-container left-widget-container">
                <BaseMapSelector />
                <ModeSelector />
            </div>
            <FixtureMap
                mapboxToken={mapboxToken}
                mapRole="primary"
                onBoundsChange={ignoreBounds}
                onIdle={notifyPrimaryIdle}
                year={datasetYear}
            />
            {comparisonMode ? (
                <FixtureMap
                    clipLeft={modeId === MapModeTypes.Swipe ? swipePosition : undefined}
                    mapboxToken={mapboxToken}
                    mapRole="comparison"
                    onBoundsChange={ignoreBounds}
                    onIdle={notifyComparisonIdle}
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

function FixtureMap({
    clipLeft,
    mapboxToken,
    mapRole,
    onBoundsChange,
    onIdle,
    year,
}: {
    clipLeft?: number;
    mapboxToken: string;
    mapRole: 'primary' | 'comparison';
    onBoundsChange: (bounds: MapBounds) => void;
    onIdle?: () => void;
    year: number;
}) {
    const mapSource: LensMapSource = fixtureSourceFactory(year, mapRole);

    return (
        <LensMap
            clipLeft={clipLeft}
            mapboxToken={mapboxToken}
            mapRole={mapRole}
            mapSource={mapSource}
            mapStyleOverride={fixtureMapStyle}
            onBoundsChange={onBoundsChange}
            onIdle={onIdle}
            tileServerPath="/harness/tiles"
            year={year}
        />
    );
}

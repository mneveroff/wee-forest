import { useEffect, useMemo, useState } from 'react';
import { FeatureCharacteristic, type FeatureSetting } from '@/models/dataset';
import { MapModeTypes } from '@/models/lens-config';
import { getDataset, getDatasetDataType } from '@/models/lens-store';
import { CollapsiblePanel } from '@/components/lens-controls';
import { useLensStore } from '@/components/lens-store-context';

export type MapBounds = [west: number, south: number, east: number, north: number];

type LensLegendProps = {
    areaServerPath: string;
    primaryBounds?: MapBounds;
    comparisonBounds?: MapBounds;
};

type AreaTotals = Record<string, number>;

export function LensLegend({
    areaServerPath,
    primaryBounds,
    comparisonBounds,
}: LensLegendProps) {
    const modeId = useLensStore((state) => state.modeId);
    const datasetId = useLensStore((state) => state.datasetId);
    const datasetDataTypeId = useLensStore((state) => state.datasetDataTypeId);
    const datasetYear = useLensStore((state) => state.datasetYear);
    const compareDatasetYear = useLensStore((state) => state.compareDatasetYear);
    const features = useLensStore((state) => state.features);
    const toggleFeature = useLensStore((state) => state.toggleFeature);
    const toggleAdvancedControls = useLensStore((state) => state.toggleAdvancedControls);
    const comparisonMode = modeId === MapModeTypes.Split || modeId === MapModeTypes.Swipe;
    const dataset = getDataset(datasetId);
    const dataType = getDatasetDataType(dataset, datasetDataTypeId);
    const [areas, setAreas] = useState<AreaTotals>({});
    const [comparisonAreas, setComparisonAreas] = useState<AreaTotals>({});
    const [loading, setLoading] = useState(false);
    const visibleFeatures = useMemo(
        () => features.filter((feature) => feature.enabled),
        [features],
    );

    useEffect(() => {
        if (!primaryBounds) {
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(async () => {
            setLoading(true);
            try {
                const requests = [
                    fetchAreaTotals(
                        areaServerPath,
                        `${dataset.datasetIdPrefix}${datasetYear}`,
                        dataType.value,
                        primaryBounds,
                        controller.signal,
                    ),
                ];
                if (comparisonMode && comparisonBounds) {
                    requests.push(fetchAreaTotals(
                        areaServerPath,
                        `${dataset.datasetIdPrefix}${compareDatasetYear}`,
                        dataType.value,
                        comparisonBounds,
                        controller.signal,
                    ));
                }

                const [nextAreas, nextComparisonAreas = {}] = await Promise.all(requests);
                setAreas(nextAreas);
                setComparisonAreas(nextComparisonAreas);
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error('updateLegend error:', error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 150);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [
        areaServerPath,
        compareDatasetYear,
        comparisonBounds,
        comparisonMode,
        dataType.value,
        dataset.datasetIdPrefix,
        datasetYear,
        primaryBounds,
    ]);

    const total = useMemo(() => getAreaTotal(visibleFeatures, areas), [areas, visibleFeatures]);
    const comparisonTotal = useMemo(
        () => getAreaTotal(visibleFeatures, comparisonAreas),
        [comparisonAreas, visibleFeatures],
    );
    const totalDifference = comparisonTotal - total;
    const characteristicTotal = visibleFeatures.reduce((sum, feature) => {
        const difference = (comparisonAreas[feature.value] ?? 0) - (areas[feature.value] ?? 0);
        return sum + (feature.characteristic === FeatureCharacteristic.Desirable ? difference : -difference);
    }, 0);

    return (
        <CollapsiblePanel
            className={`legend${comparisonMode ? ' legend-compare' : ''}`}
            side="right"
        >
            <div className="legend-content-wrapper">
                <div className="legend-row header-row">
                    <div className="label">Features</div>
                    <div className="value">{datasetYear}</div>
                    {comparisonMode ? <div className="value">{compareDatasetYear}</div> : null}
                </div>
                <div className="legend-content">
                    {visibleFeatures.map((feature) => {
                        const area = areas[feature.value];
                        const comparisonArea = comparisonAreas[feature.value];
                        const difference = (comparisonArea ?? 0) - (area ?? 0);
                        return (
                            <button
                                key={feature.value}
                                type="button"
                                className={`legend-row feature-row${feature.toggled ? ' disabled' : ''}${loading ? ' loading' : ''}`}
                                onClick={() => toggleFeature(feature.value)}
                            >
                                <div className="label">
                                    <span className="status" style={{ backgroundColor: feature.color }} />
                                    <span>{feature.label}</span>
                                </div>
                                <div className="value">
                                    {formatArea(area, feature.toggled)}
                                </div>
                                {comparisonMode ? (
                                    <div className={`value ${difference > 0 ? 'value-growth' : 'value-loss'} characteristic-${feature.characteristic}`}>
                                        {feature.toggled || comparisonArea === undefined
                                            ? feature.toggled ? 'Not shown' : 'None'
                                            : <><span className="value-indicator">{difference > 0 ? '▲' : '▼'}</span> {formatNumber(Math.abs(difference))}</>}
                                    </div>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
                <div className={`legend-row total-row${loading ? ' loading' : ''}`}>
                    <div className="label">
                        <button
                            type="button"
                            className="icon icon-advanced-toggle"
                            aria-label="Toggle advanced dataset controls"
                            onClick={toggleAdvancedControls}
                        />
                        <span>Total shown</span>
                    </div>
                    <div className="value">{formatNumber(total)} ha</div>
                    {comparisonMode ? (
                        <div className={`value ${characteristicTotal > 0 ? 'characteristic-desirable' : 'characteristic-undesirable'} ${totalDifference > 0 ? 'value-growth' : 'value-loss'}`}>
                            <span className="value-indicator">{totalDifference > 0 ? '▲' : '▼'}</span>
                            {formatNumber(Math.abs(totalDifference))}
                        </div>
                    ) : null}
                </div>
            </div>
        </CollapsiblePanel>
    );
}

async function fetchAreaTotals(
    areaServerPath: string,
    datasetId: string,
    dataType: string,
    bounds: MapBounds,
    signal: AbortSignal,
): Promise<AreaTotals> {
    const url = new URL(`${areaServerPath}/calculate_areas/`, window.location.origin);
    url.searchParams.set('dataset', datasetId);
    url.searchParams.set('type', dataType);
    url.searchParams.set('bounds', bounds.join(','));
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<AreaTotals>;
}

function getAreaTotal(features: FeatureSetting[], areas: AreaTotals): number {
    return features.reduce(
        (total, feature) => total + (feature.toggled ? 0 : areas[feature.value] ?? 0),
        0,
    );
}

function formatArea(area: number | undefined, toggled: boolean): string {
    if (toggled) {
        return 'Not shown';
    }
    return area === undefined ? 'None' : `${formatNumber(area)} ha`;
}

function formatNumber(value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

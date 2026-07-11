import { useState, type ReactNode } from 'react';
import { DatasetConfigs } from '@/models/dataset';
import { BaseMaps, MapModes, MapModeTypes } from '@/models/lens-config';
import { getDataset } from '@/models/lens-store';
import { useLensStore } from '@/components/lens-store-context';

type CollapsiblePanelProps = {
    children: ReactNode;
    className: string;
    defaultCollapsed?: boolean;
    side: 'left' | 'right';
};

export function CollapsiblePanel({
    children,
    className,
    defaultCollapsed = false,
    side,
}: CollapsiblePanelProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const label = collapsed ? 'Expand panel' : 'Collapse panel';

    return (
        <div className={`surface surface-${side} elevation-100 ${className}${collapsed ? ' collapsed' : ''}`}>
            {children}
            <button
                type="button"
                className="icon widget-toggle-container"
                aria-label={label}
                onClick={() => setCollapsed((value) => !value)}
            />
        </div>
    );
}

export function BaseMapSelector() {
    const basemapId = useLensStore((state) => state.basemapId);
    const setBasemap = useLensStore((state) => state.setBasemap);

    return (
        <CollapsiblePanel
            className="basemap-selector"
            defaultCollapsed={window.innerWidth <= 575}
            side="left"
        >
            <div className="widget-selector-header">
                <div className="widget-selector-title">
                    <label htmlFor="basemap-selector">Base Map</label>
                </div>
                <div className="widget-selector-dropdown">
                    <select
                        id="basemap-selector"
                        value={basemapId}
                        onChange={(event) => setBasemap(event.currentTarget.value as typeof basemapId)}
                    >
                        {BaseMaps.map((basemap) => (
                            <option key={basemap.id} value={basemap.id}>{basemap.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </CollapsiblePanel>
    );
}

export function ModeSelector() {
    const modeId = useLensStore((state) => state.modeId);
    const datasetId = useLensStore((state) => state.datasetId);
    const datasetYear = useLensStore((state) => state.datasetYear);
    const compareDatasetYear = useLensStore((state) => state.compareDatasetYear);
    const setMode = useLensStore((state) => state.setMode);
    const setDatasetYear = useLensStore((state) => state.setDatasetYear);
    const setCompareDatasetYear = useLensStore((state) => state.setCompareDatasetYear);
    const swapYears = useLensStore((state) => state.swapYears);
    const dataset = getDataset(datasetId);
    const years = Array.from(
        { length: dataset.endingYear - dataset.startingYear + 1 },
        (_, index) => dataset.startingYear + index,
    );
    const comparisonMode = modeId === MapModeTypes.Split || modeId === MapModeTypes.Swipe;

    return (
        <CollapsiblePanel
            className="mode-selector"
            defaultCollapsed={window.innerWidth <= 575}
            side="left"
        >
            <div className={`mode-control${modeId === MapModeTypes.Timeline ? ' control-timeline' : comparisonMode ? ' control-swipe' : ''}`}>
                {modeId === MapModeTypes.Timeline ? (
                    <>
                        <span className="slider-label">{datasetYear}</span>
                        <input
                            aria-label="Dataset year"
                            type="range"
                            min={dataset.startingYear}
                            max={dataset.endingYear}
                            value={datasetYear}
                            onChange={(event) => setDatasetYear(event.currentTarget.valueAsNumber)}
                        />
                    </>
                ) : null}
                {comparisonMode ? (
                    <>
                        <select
                            aria-label="Primary year"
                            value={datasetYear}
                            onChange={(event) => setDatasetYear(Number(event.currentTarget.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year} disabled={year === compareDatasetYear}>{year}</option>
                            ))}
                        </select>
                        <button type="button" className="icon swap-years" aria-label="Swap years" onClick={swapYears} />
                        <select
                            aria-label="Comparison year"
                            value={compareDatasetYear}
                            onChange={(event) => setCompareDatasetYear(Number(event.currentTarget.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year} disabled={year === datasetYear}>{year}</option>
                            ))}
                        </select>
                    </>
                ) : null}
            </div>
            <div className="selector-row">
                {MapModes
                    .filter((mode) => dataset.modeAvailableIds.includes(mode.id))
                    .map((mode) => (
                        <button
                            key={mode.id}
                            type="button"
                            className={`selector-row-item${mode.id === modeId ? ' selected' : ''}`}
                            aria-pressed={mode.id === modeId}
                            onClick={() => setMode(mode.id)}
                        >
                            {mode.label}
                        </button>
                    ))}
            </div>
        </CollapsiblePanel>
    );
}

export function DatasetSelector() {
    const open = useLensStore((state) => state.advancedControlsOpen);
    const datasetId = useLensStore((state) => state.datasetId);
    const datasetDataTypeId = useLensStore((state) => state.datasetDataTypeId);
    const setDataset = useLensStore((state) => state.setDataset);
    const setDatasetDataType = useLensStore((state) => state.setDatasetDataType);
    const dataset = getDataset(datasetId);

    return (
        <div className={`surface surface-right elevation-100 dataset-selector${open ? '' : ' hidden'}`}>
            <div className="selector-row">
                {dataset.dataTypes.map((dataType) => (
                    <button
                        key={dataType.id}
                        type="button"
                        className={`selector-row-item${dataType.id === datasetDataTypeId ? ' selected' : ''}`}
                        aria-pressed={dataType.id === datasetDataTypeId}
                        onClick={() => setDatasetDataType(dataType.id)}
                    >
                        {dataType.label}
                    </button>
                ))}
            </div>
            <div className="widget-selector-header">
                <div className="widget-selector-title">
                    <label htmlFor="dataset-selector">Dataset</label>
                </div>
                <div className="widget-selector-dropdown">
                    <select
                        id="dataset-selector"
                        value={datasetId}
                        onChange={(event) => setDataset(event.currentTarget.value as typeof datasetId)}
                    >
                        {DatasetConfigs.map((config) => (
                            <option key={config.id} value={config.id}>{config.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

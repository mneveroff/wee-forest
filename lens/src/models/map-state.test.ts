import { expect, test, vi } from 'vitest';
import { BaseMapType } from '../components/basemap-selector';
import { MapModeTypes } from '../components/mode-selector';
import { DatasetConfigs, DatasetDataTypes, DatasetTypes } from './dataset';
import { WeeForestMapStateManager, type WeeForestMapState } from './map-state';

function createState(): WeeForestMapState {
    return {
        modeId: MapModeTypes.Timeline,
        datasetId: DatasetTypes.NFI_AWI_Overlay,
        datasetDataTypeId: DatasetDataTypes.Overlay,
        basemapId: BaseMapType.Light,
        features: DatasetConfigs[0].dataTypes[0].colorScheme,
        datasetYear: 2022,
        compareDatasetYear: 2012,
    };
}

test('publishes a selected year change to state consumers', async () => {
    const state = new WeeForestMapStateManager(createState());
    const onYearChanged = vi.fn();
    const onModeChanged = vi.fn();
    state.addListener({
        datasetYear: [onYearChanged],
        modeId: [onModeChanged],
    });

    await state.set({ datasetYear: 2020 });

    expect(state.datasetYear).toBe(2020);
    expect(onYearChanged).toHaveBeenCalledOnce();
    expect(onYearChanged).toHaveBeenCalledWith(2020, 2022);
    expect(onModeChanged).not.toHaveBeenCalled();
});

test('publishes a complete year swap before consumers react', async () => {
    const state = new WeeForestMapStateManager(createState());
    const observedSelections: Array<[number, number]> = [];
    const observeSelection = () => {
        observedSelections.push([state.datasetYear, state.compareDatasetYear]);
    };
    state.addListener({
        datasetYear: [observeSelection],
        compareDatasetYear: [observeSelection],
    });

    await state.set({
        datasetYear: state.compareDatasetYear,
        compareDatasetYear: state.datasetYear,
    });

    expect(observedSelections).toEqual([[2012, 2022]]);
});

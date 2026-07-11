import { expect, test } from 'vitest';
import { DatasetDataTypes } from '@/models/dataset';
import { MapModeTypes } from '@/models/lens-config';
import { createLensStore } from '@/models/lens-store';
import { parseLensUrl } from '@/models/lens-url';

function createStore(url = 'https://weeforest.org/lens/?m=tl&y=2022&cy=2012') {
    return createLensStore(parseLensUrl(new URL(url)));
}

test('updates the selected year through the store action', () => {
    const store = createStore();

    store.getState().setDatasetYear(2020);

    expect(store.getState().datasetYear).toBe(2020);
    expect(store.getState().modeId).toBe(MapModeTypes.Timeline);
});

test('publishes a complete year swap without an intermediate selection', () => {
    const store = createStore();
    const observedSelections: Array<[number, number]> = [];
    const unsubscribe = store.subscribe((state) => {
        observedSelections.push([state.datasetYear, state.compareDatasetYear]);
    });

    store.getState().swapYears();
    unsubscribe();

    expect(observedSelections).toEqual([[2012, 2022]]);
});

test('separates equal years when comparison mode is selected', () => {
    const store = createStore('https://weeforest.org/lens/?m=tl&y=2022&cy=2022');

    store.getState().setMode(MapModeTypes.Split);

    expect(store.getState().modeId).toBe(MapModeTypes.Split);
    expect(store.getState().datasetYear).toBe(2012);
    expect(store.getState().compareDatasetYear).toBe(2022);
});

test('replaces feature settings with the selected data type and toggles them immutably', () => {
    const store = createStore();
    const previousFeatures = store.getState().features;

    store.getState().setDatasetDataType(DatasetDataTypes.Source);
    const sourceFeatures = store.getState().features;
    const feature = sourceFeatures[0];
    store.getState().toggleFeature(feature.value);

    expect(store.getState().datasetDataTypeId).toBe(DatasetDataTypes.Source);
    expect(sourceFeatures).not.toBe(previousFeatures);
    expect(store.getState().features).not.toBe(sourceFeatures);
    expect(store.getState().features[0].toggled).toBe(true);
});

test('keeps unavailable modes out and accepts a complete controlled camera update', () => {
    const store = createStore();
    const viewState = {
        latitude: 56.2,
        longitude: -3.8,
        zoom: 9.9,
        pitch: 25,
        bearing: 0,
    };

    store.getState().setMode(MapModeTypes.Static);
    store.getState().setViewState(viewState);

    expect(store.getState().modeId).toBe(MapModeTypes.Timeline);
    expect(store.getState().viewState).toEqual(viewState);
});

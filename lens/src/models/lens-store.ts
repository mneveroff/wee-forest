import { createStore, type StoreApi } from 'zustand/vanilla';
import {
    DatasetConfigs,
    type DatasetConfig,
    type DatasetDataType,
    type DatasetDataTypes,
    type DatasetTypes,
    type FeatureSetting,
} from '@/models/dataset';
import { BaseMapType, MapModeTypes } from '@/models/lens-config';
import type { ParsedLensUrl } from '@/models/lens-url';

export type LensViewState = {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
};

export type LensState = {
    modeId: MapModeTypes;
    datasetId: DatasetTypes;
    datasetDataTypeId: DatasetDataTypes;
    basemapId: BaseMapType;
    features: FeatureSetting[];
    datasetYear: number;
    compareDatasetYear: number;
    viewState: LensViewState;
    advancedControlsOpen: boolean;
};

export type LensActions = {
    setMode: (modeId: MapModeTypes) => void;
    setDataset: (datasetId: DatasetTypes) => void;
    setDatasetDataType: (datasetDataTypeId: DatasetDataTypes) => void;
    setBasemap: (basemapId: BaseMapType) => void;
    setDatasetYear: (year: number) => void;
    setCompareDatasetYear: (year: number) => void;
    swapYears: () => void;
    toggleFeature: (value: string) => void;
    setViewState: (viewState: LensViewState) => void;
    toggleAdvancedControls: () => void;
};

export type LensStore = LensState & LensActions;
export type LensStoreApi = StoreApi<LensStore>;

export function createLensStore(parsedUrl: ParsedLensUrl): LensStoreApi {
    const initialState = createInitialState(parsedUrl);

    return createStore<LensStore>()((set, get) => ({
        ...initialState,
        setMode: (modeId) => {
            const state = get();
            const dataset = getDataset(state.datasetId);
            if (!dataset.modeAvailableIds.includes(modeId) || state.modeId === modeId) {
                return;
            }

            if (isComparisonMode(modeId) && state.datasetYear === state.compareDatasetYear) {
                set({
                    modeId,
                    datasetYear: dataset.startingYear,
                    compareDatasetYear: dataset.endingYear,
                });
                return;
            }

            set({ modeId });
        },
        setDataset: (datasetId) => {
            const dataset = getDataset(datasetId);
            const dataType = dataset.dataTypes[0];
            const modeId = dataset.modeAvailableIds.includes(get().modeId)
                ? get().modeId
                : dataset.modeAvailableIds[0];
            set({
                datasetId: dataset.id,
                datasetDataTypeId: dataType.id,
                features: createFeatureSettings(dataType),
                modeId,
            });
        },
        setDatasetDataType: (datasetDataTypeId) => {
            const dataset = getDataset(get().datasetId);
            const dataType = getDatasetDataType(dataset, datasetDataTypeId);
            set({
                datasetDataTypeId: dataType.id,
                features: createFeatureSettings(dataType),
            });
        },
        setBasemap: (basemapId) => set({ basemapId }),
        setDatasetYear: (datasetYear) => set({ datasetYear }),
        setCompareDatasetYear: (compareDatasetYear) => set({ compareDatasetYear }),
        swapYears: () => {
            const { datasetYear, compareDatasetYear } = get();
            set({
                datasetYear: compareDatasetYear,
                compareDatasetYear: datasetYear,
            });
        },
        toggleFeature: (value) => {
            set((state) => ({
                features: state.features.map((feature) => (
                    feature.value === value
                        ? { ...feature, toggled: !feature.toggled }
                        : feature
                )),
            }));
        },
        setViewState: (viewState) => set({ viewState }),
        toggleAdvancedControls: () => set((state) => ({
            advancedControlsOpen: !state.advancedControlsOpen,
        })),
    }));
}

export function getDataset(datasetId: DatasetTypes): DatasetConfig {
    return DatasetConfigs.find((dataset) => dataset.id === datasetId) ?? DatasetConfigs[0];
}

export function getDatasetDataType(
    dataset: DatasetConfig,
    datasetDataTypeId: DatasetDataTypes,
): DatasetDataType {
    return dataset.dataTypes.find((dataType) => dataType.id === datasetDataTypeId) ?? dataset.dataTypes[0];
}

function createInitialState(parsedUrl: ParsedLensUrl): LensState {
    const dataset = getDataset(parsedUrl.selectedDataset);
    const dataType = getDatasetDataType(dataset, parsedUrl.selectedDatasetDataTypeId ?? dataset.dataTypes[0].id);
    const modeId = dataset.modeAvailableIds.includes(parsedUrl.selectedMode)
        ? parsedUrl.selectedMode
        : dataset.modeAvailableIds[0];

    return {
        modeId,
        datasetId: dataset.id,
        datasetDataTypeId: dataType.id,
        basemapId: parsedUrl.selectedBasemap,
        features: createFeatureSettings(dataType),
        datasetYear: parsedUrl.selectedYear ?? dataset.endingYear,
        compareDatasetYear: parsedUrl.compareSelectedYear ?? dataset.endingYear,
        viewState: {
            latitude: parsedUrl.coordinates.lat,
            longitude: parsedUrl.coordinates.lng,
            zoom: parsedUrl.coordinates.zoom,
            pitch: parsedUrl.coordinates.pitch,
            bearing: 0,
        },
        advancedControlsOpen: false,
    };
}

function createFeatureSettings(dataType: DatasetDataType): FeatureSetting[] {
    return dataType.colorScheme.map((feature) => ({
        ...feature,
        toggled: false,
    }));
}

export function isComparisonMode(modeId: MapModeTypes): boolean {
    return modeId === MapModeTypes.Split || modeId === MapModeTypes.Swipe;
}

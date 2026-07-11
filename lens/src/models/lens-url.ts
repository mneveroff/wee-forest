import { BaseMapType } from '../components/basemap-selector';
import { MapModeTypes } from '../components/mode-selector';
import { DatasetDataTypes, DatasetTypes } from './dataset';

export type LensCoordinates = {
    lat: number;
    lng: number;
    zoom: number;
    pitch: number;
};

export type ParsedLensUrl = {
    coordinates: LensCoordinates;
    selectedMode: MapModeTypes;
    selectedDataset: DatasetTypes;
    selectedBasemap: BaseMapType;
    selectedDatasetDataTypeId?: DatasetDataTypes;
    selectedYear?: number;
    compareSelectedYear?: number;
};

export type PersistedLensView = {
    coordinates: LensCoordinates;
    modeId: MapModeTypes;
    datasetId: DatasetTypes;
    datasetDataTypeId: DatasetDataTypes;
    basemapId: BaseMapType;
    datasetYear: number;
    compareDatasetYear: number;
};

export const defaultLensCoordinates: LensCoordinates = {
    lat: 54.577,
    lng: -4.16,
    zoom: 6.37,
    pitch: 25,
};

export function parseLensUrl(url: URL): ParsedLensUrl {
    const params = url.searchParams;
    const [lat, lng, zoom, pitch] = params.get('c')?.split(',').map(Number.parseFloat) ?? [
        defaultLensCoordinates.lat,
        defaultLensCoordinates.lng,
        defaultLensCoordinates.zoom,
        defaultLensCoordinates.pitch,
    ];

    return {
        coordinates: { lat, lng, zoom, pitch },
        selectedMode: (params.get('m') as MapModeTypes | null) ?? MapModeTypes.Static,
        selectedDataset: ((params.get('l') ?? params.get('d')) as DatasetTypes | null) ?? DatasetTypes.NFI_AWI_Overlay,
        selectedBasemap: (params.get('b') as BaseMapType | null) ?? BaseMapType.Light,
        selectedDatasetDataTypeId: (params.get('t') as DatasetDataTypes | null) ?? undefined,
        selectedYear: parseOptionalInteger(params.get('y')),
        compareSelectedYear: parseOptionalInteger(params.get('cy')),
    };
}

export function serializeLensUrl(baseUrl: URL, view: PersistedLensView): { query: string; url: URL } {
    const query = `?c=${view.coordinates.lat.toFixed(6)},${view.coordinates.lng.toFixed(6)},${view.coordinates.zoom.toFixed(2)},${view.coordinates.pitch.toFixed(0)}&m=${view.modeId}&d=${view.datasetId}&t=${view.datasetDataTypeId}&b=${view.basemapId}&y=${view.datasetYear}&cy=${view.compareDatasetYear}`;
    const url = new URL(baseUrl.origin + baseUrl.pathname);
    url.search = query;

    return { query, url };
}

function parseOptionalInteger(value: string | null): number | undefined {
    return value === null ? undefined : Number.parseInt(value, 10);
}

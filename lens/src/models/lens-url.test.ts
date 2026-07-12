import { expect, test } from 'vitest';
import { DatasetDataTypes, DatasetTypes } from '@/models/dataset';
import { BaseMapType, MapModeTypes } from '@/models/lens-config';
import { defaultLensCoordinates, parseLensUrl, serializeLensUrl } from '@/models/lens-url';

test('uses the established Lens defaults when a shared view has no settings', () => {
    const parsed = parseLensUrl(new URL('https://weeforest.org/lens/'));

    expect(parsed).toEqual({
        coordinates: defaultLensCoordinates,
        selectedMode: MapModeTypes.Static,
        selectedDataset: DatasetTypes.NFI_AWI_Overlay,
        selectedBasemap: BaseMapType.Light,
        selectedDatasetDataTypeId: undefined,
        selectedYear: undefined,
        compareSelectedYear: undefined,
    });
});

test('keeps legacy shared links compatible while preferring their legacy dataset value', () => {
    const parsed = parseLensUrl(new URL('https://weeforest.org/lens/?c=56.2,-3.8,9.9,25&m=sp&l=nfi&d=nao&t=s&b=s&y=2019&cy=2022'));

    expect(parsed).toEqual({
        coordinates: { lat: 56.2, lng: -3.8, zoom: 9.9, pitch: 25 },
        selectedMode: MapModeTypes.Split,
        selectedDataset: DatasetTypes.NFI_Dataset,
        selectedBasemap: BaseMapType.Satellite,
        selectedDatasetDataTypeId: DatasetDataTypes.Source,
        selectedYear: 2019,
        compareSelectedYear: 2022,
    });
});

test('serializes a shareable view with stable precision and parameter names', () => {
    const { query, url } = serializeLensUrl(new URL('https://weeforest.org/lens/?ignored=true'), {
        coordinates: { lat: 56.2226684, lng: -3.8389306, zoom: 9.944, pitch: 24.8 },
        modeId: MapModeTypes.Timeline,
        datasetId: DatasetTypes.NFI_AWI_Overlay,
        datasetDataTypeId: DatasetDataTypes.Overlay,
        basemapId: BaseMapType.Light,
        datasetYear: 2022,
        compareDatasetYear: 2022,
    });

    expect(query).toBe('?c=56.222668,-3.838931,9.94,25&m=tl&d=nao&t=o&b=l&y=2022&cy=2022');
    expect(url.toString()).toBe(`https://weeforest.org/lens${query}`);
});

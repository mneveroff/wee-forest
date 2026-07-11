import type { GeoJSONSourceSpecification, StyleSpecification } from 'mapbox-gl';
import type { LensMapSource } from '@/components/lens-map';

export const fixtureMapStyle: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [
        {
            id: 'ocean',
            type: 'background',
            paint: {
                'background-color': '#b8dce8',
            },
        },
    ],
};

const primaryData: GeoJSONSourceSpecification['data'] = {
    type: 'FeatureCollection',
    features: [
        rectangle('native-west', [1.1, 55.6, 1.9, 56.2], 'Native Trees', 120),
        rectangle('timber-center', [1.6, 55.4, 3.5, 56.7], 'Non-Native Trees', 240),
        rectangle('felled-east', [3.3, 55.5, 4.0, 56.1], 'Other Felled Trees', 80),
    ],
};

const comparisonData: GeoJSONSourceSpecification['data'] = {
    type: 'FeatureCollection',
    features: [
        rectangle('native-west-new', [1.0, 55.5, 2.1, 56.3], 'Native Trees', 180),
        rectangle('timber-center-new', [1.7, 55.5, 3.4, 56.6], 'Non-Native Trees', 160),
        rectangle('felled-east-new', [3.1, 55.4, 4.1, 56.2], 'Felled Native Trees', 110),
    ],
};

export function fixtureSourceFactory(
    year: number,
    _role: 'primary' | 'comparison',
): LensMapSource {
    return {
        type: 'geojson',
        data: year >= 2018 ? comparisonData : primaryData,
    };
}

function rectangle(
    id: string,
    [west, south, east, north]: [number, number, number, number],
    overlayType: string,
    area: number,
) {
    return {
        type: 'Feature' as const,
        id,
        properties: {
            area_ha: area,
            type_overlay: overlayType,
            type_combined: overlayType,
            type_aggregate: overlayType,
            type_source: overlayType,
            debug_label: id,
        },
        geometry: {
            type: 'Polygon' as const,
            coordinates: [[
                [west, south],
                [east, south],
                [east, north],
                [west, north],
                [west, south],
            ]],
        },
    };
}

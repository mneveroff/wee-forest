export enum MapModeTypes {
    Static = 'st',
    Timeline = 'tl',
    Split = 'sp',
    Swipe = 'sw',
}

export const MapModes = [
    { id: MapModeTypes.Static, label: 'Static' },
    { id: MapModeTypes.Timeline, label: 'Timeline' },
    { id: MapModeTypes.Split, label: 'Split' },
    { id: MapModeTypes.Swipe, label: 'Swipe' },
] as const;

export enum BaseMapType {
    Light = 'l',
    Satellite = 's',
    Fallback = 'mapbox://styles/mapbox/standard',
}

export const BaseMaps = [
    {
        id: BaseMapType.Light,
        label: 'Light',
        style: 'mapbox://styles/mneveroff/clu0msrla003d01p638f182dv',
    },
    {
        id: BaseMapType.Satellite,
        label: 'Satellite',
        style: 'mapbox://styles/mapbox/satellite-v9',
    },
] as const;

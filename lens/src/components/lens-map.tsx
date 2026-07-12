import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMap, {
    AttributionControl,
    Layer,
    Popup as ReactMapPopup,
    Source,
    type MapMouseEvent,
    type MapRef,
    type ViewStateChangeEvent,
} from 'react-map-gl/mapbox';
import type {
    ExpressionSpecification,
    FilterSpecification,
    GeoJSONSourceSpecification,
    MapboxGeoJSONFeature,
    StyleSpecification,
} from 'mapbox-gl';
import { ExtendedDatasetDataTypes } from '@/models/dataset';
import { BaseMaps, BaseMapType } from '@/models/lens-config';
import { getDataset, getDatasetDataType } from '@/models/lens-store';
import { useLensStore } from '@/components/lens-store-context';
import type { MapBounds } from '@/components/lens-legend';

type LensMapProps = {
    clipLeft?: number;
    mapSource?: LensMapSource;
    mapStyleOverride?: StyleSpecification;
    mapRole: 'primary' | 'comparison';
    mapboxToken: string;
    onBoundsChange: (bounds: MapBounds) => void;
    onIdle?: () => void;
    tileServerPath: string;
    year: number;
};

export type LensMapSource =
    | {
        type: 'geojson';
        data: GeoJSONSourceSpecification['data'];
    }
    | {
        type: 'vector';
        sourceLayer: string;
        url: string;
    };

type PopupState = {
    feature: MapboxGeoJSONFeature;
    latitude: number;
    longitude: number;
    mode: 'hover' | 'click';
};

const maxBounds: [[number, number], [number, number]] = [[-12, 48], [7, 61]];

export function LensMap({
    clipLeft,
    mapSource,
    mapStyleOverride,
    mapRole,
    mapboxToken,
    onBoundsChange,
    onIdle,
    tileServerPath,
    year,
}: LensMapProps) {
    const mapRef = useRef<MapRef>(null);
    const modeId = useLensStore((state) => state.modeId);
    const datasetId = useLensStore((state) => state.datasetId);
    const datasetDataTypeId = useLensStore((state) => state.datasetDataTypeId);
    const basemapId = useLensStore((state) => state.basemapId);
    const features = useLensStore((state) => state.features);
    const viewState = useLensStore((state) => state.viewState);
    const setViewState = useLensStore((state) => state.setViewState);
    const dataset = getDataset(datasetId);
    const dataType = getDatasetDataType(dataset, datasetDataTypeId);
    const sourceId = `${dataset.id}_${year}_${mapRole}`;
    const layerId = `${sourceId}_fill`;
    const [popup, setPopup] = useState<PopupState | null>(null);
    const [mapIdle, setMapIdle] = useState(false);
    const mapStyle = mapStyleOverride
        ?? BaseMaps.find((basemap) => basemap.id === basemapId)?.style
        ?? BaseMapType.Fallback;
    const source: LensMapSource = mapSource ?? {
        type: 'vector',
        sourceLayer: dataset.datasetLayerId,
        url: `${tileServerPath}/data/${dataset.datasetIdPrefix}${year}.json`,
    };
    const fillColor = useMemo(() => [
        'match',
        ['get', dataType.value],
        ...features.flatMap((feature) => [feature.value, feature.color]),
        '#000',
    ] as ExpressionSpecification, [dataType.value, features]);
    const filter = useMemo(() => {
        const hiddenFeatures = features
            .filter((feature) => feature.toggled || !feature.enabled)
            .map((feature) => feature.value);
        return hiddenFeatures.length
            ? ['!in', dataType.value, ...hiddenFeatures] as FilterSpecification
            : undefined;
    }, [dataType.value, features]);

    const publishBounds = useCallback(() => {
        const bounds = mapRef.current?.getBounds();
        if (bounds) {
            onBoundsChange([
                bounds.getWest(),
                bounds.getSouth(),
                bounds.getEast(),
                bounds.getNorth(),
            ]);
        }
    }, [onBoundsChange]);

    const handleMove = useCallback((event: ViewStateChangeEvent) => {
        const { latitude, longitude, zoom, pitch, bearing } = event.viewState;
        setPopup(null);
        setViewState({ latitude, longitude, zoom, pitch, bearing });
    }, [setViewState]);

    const showPopup = useCallback((event: MapMouseEvent, popupMode: PopupState['mode']) => {
        const feature = event.features?.[0];
        if (!feature) {
            if (popupMode === 'click') {
                setPopup(null);
            }
            return;
        }

        setPopup({
            feature,
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng,
            mode: popupMode,
        });
    }, []);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            mapRef.current?.resize();
        });
        return () => window.cancelAnimationFrame(frame);
    }, [modeId]);

    useEffect(() => {
        setMapIdle(false);
        setPopup(null);
    }, [mapStyle, sourceId]);

    const handleIdle = useCallback(() => {
        setMapIdle(true);
        onIdle?.();
    }, [onIdle]);

    return (
        <div
            id={mapRole === 'primary' ? 'map-main' : 'map-compare'}
            className="map"
            style={clipLeft === undefined ? undefined : { clipPath: `inset(0 0 0 ${clipLeft}%)` }}
        >
            <ReactMap
                key={`${mapRole}-${basemapId}`}
                ref={mapRef}
                {...viewState}
                attributionControl={false}
                fadeDuration={500}
                interactiveLayerIds={[layerId]}
                mapboxAccessToken={mapboxToken}
                mapStyle={mapStyle}
                maxBounds={maxBounds}
                onClick={(event) => showPopup(event, 'click')}
                onIdle={handleIdle}
                onLoad={publishBounds}
                onMouseLeave={() => {
                    setPopup((current) => current?.mode === 'hover' ? null : current);
                }}
                onMouseMove={(event) => {
                    if (popup?.mode !== 'click') {
                        showPopup(event, 'hover');
                    }
                }}
                onMove={handleMove}
                onMoveEnd={publishBounds}
                style={{ height: '100%', width: '100%' }}
            >
                <AttributionControl compact={window.innerWidth <= 1340} />
                {source.type === 'vector' ? (
                    <Source key={sourceId} id={sourceId} type="vector" url={source.url}>
                        <Layer
                            id={layerId}
                            type="fill"
                            source-layer={source.sourceLayer}
                            filter={filter}
                            paint={{
                                'fill-color': fillColor,
                                'fill-opacity': 0.5,
                                'fill-opacity-transition': { duration: 1000 },
                            }}
                        />
                    </Source>
                ) : (
                    <Source key={sourceId} id={sourceId} type="geojson" data={source.data}>
                        <Layer
                            id={layerId}
                            type="fill"
                            filter={filter}
                            paint={{
                                'fill-color': fillColor,
                                'fill-opacity': 0.5,
                                'fill-opacity-transition': { duration: 1000 },
                            }}
                        />
                    </Source>
                )}
                {popup && mapIdle ? (
                    <ReactMapPopup
                        className="wee-map-popup"
                        closeButton
                        closeOnClick={false}
                        closeOnMove={false}
                        latitude={popup.latitude}
                        longitude={popup.longitude}
                        maxWidth="320px"
                        onClose={() => setPopup(null)}
                    >
                        <PopupContent popup={popup} zoom={viewState.zoom} />
                    </ReactMapPopup>
                ) : null}
            </ReactMap>
        </div>
    );
}

function PopupContent({ popup, zoom }: { popup: PopupState; zoom: number }) {
    const properties = popup.feature.properties ?? {};
    const area = Number(properties.area_ha ?? 0);
    const altitude = getAltitude(zoom);
    const googleMapsUrl = `https://www.google.com/maps/@${popup.latitude},${popup.longitude},${altitude}m/data=!3m1!1e3`;
    const rows = Object.entries(properties).slice(1, -1);

    return (
        <div>
            <span className="popup-title">
                Area ({popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)})
            </span>
            <div className="popup-row">
                <div className="row-label"><span>Area</span></div>
                <div className="row-value">
                    <span>{area.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha</span>
                </div>
            </div>
            {rows.map(([key, value]) => (
                <div className="popup-row" key={key}>
                    <div className="row-label">
                        <span>{getDataTypeLabel(key)} type</span>
                    </div>
                    <div className="row-value"><span>{String(value)}</span></div>
                </div>
            ))}
            <hr />
            {popup.mode === 'hover' ? (
                <div className="popup-row">
                    <span>Click on the area for more actions</span>
                </div>
            ) : (
                <div className="popup-row">
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer">See on Google Maps</a>
                </div>
            )}
        </div>
    );
}

function getAltitude(zoom: number): number {
    const scale = 0.05 * (591657550.5 / 2 ** (zoom - 1));
    const angle = 85.362;
    const radians = angle / 2 * Math.PI / 180;
    return scale * Math.cos(radians) / Math.sin(radians);
}

function getDataTypeLabel(value: string): string | undefined {
    return Object.keys(ExtendedDatasetDataTypes).find(
        (key) => ExtendedDatasetDataTypes[key as keyof typeof ExtendedDatasetDataTypes] === value,
    );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
import { lensOverlaySourceId } from '@/models/lens-overlay-source';
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
    const {
        modeId,
        datasetId,
        datasetDataTypeId,
        basemapId,
        features,
        viewState,
        setViewState,
    } = useLensStore(useShallow((state) => ({
        modeId: state.modeId,
        datasetId: state.datasetId,
        datasetDataTypeId: state.datasetDataTypeId,
        basemapId: state.basemapId,
        features: state.features,
        viewState: state.viewState,
        setViewState: state.setViewState,
    })));
    const dataset = getDataset(datasetId);
    const dataType = getDatasetDataType(dataset, datasetDataTypeId);
    const sourceId = lensOverlaySourceId(dataset.id, mapRole);
    const layerId = `${sourceId}_fill`;
    const pendingSourceId = `${sourceId}_pending`;
    const [popup, setPopup] = useState<PopupState | null>(null);
    const [mapIdle, setMapIdle] = useState(false);
    const mapStyle = mapStyleOverride
        ?? BaseMaps.find((basemap) => basemap.id === basemapId)?.style
        ?? BaseMapType.Fallback;
    const desiredSource: LensMapSource = mapSource ?? {
        type: 'vector',
        sourceLayer: dataset.datasetLayerId,
        url: `${tileServerPath}/data/${dataset.datasetIdPrefix}${year}.json`,
    };
    const desiredSourceKey = lensMapSourceKey(desiredSource);
    const [visibleSource, setVisibleSource] = useState(desiredSource);
    const [pendingSource, setPendingSource] = useState<LensMapSource | null>(null);
    const visibleSourceKey = lensMapSourceKey(visibleSource);
    const desiredSourceRef = useRef(desiredSource);
    const visibleSourceRef = useRef(visibleSource);
    const pendingSourceRef = useRef(pendingSource);
    desiredSourceRef.current = desiredSource;
    visibleSourceRef.current = visibleSource;
    pendingSourceRef.current = pendingSource;
    const fillColor = useMemo(() => [
        'match',
        ['get', dataType.value],
        ...features.flatMap((feature) => [feature.value, feature.color]),
        '#000',
    ] as ExpressionSpecification, [dataType.value, features]);
    const fillPaint = useMemo(() => ({
        'fill-color': fillColor,
        'fill-opacity': 0.5,
        'fill-opacity-transition': { duration: 1000 },
    }), [fillColor]);
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
        if (desiredSourceKey === visibleSourceKey) {
            setPendingSource(null);
            return;
        }

        const desired = desiredSourceRef.current;
        const visible = visibleSourceRef.current;

        // Dataset / source-layer identity changed — swap immediately.
        if (!sameSourceIdentity(desired, visible)) {
            setVisibleSource(desired);
            setPendingSource(null);
            setMapIdle(false);
            setPopup(null);
            return;
        }

        // Year / tile URL change — keep the painted layer until the replacement is loaded.
        setPendingSource(desired);
        setPopup(null);
    }, [desiredSourceKey, visibleSourceKey]);

    useEffect(() => {
        setMapIdle(false);
        setPopup(null);
    }, [mapStyle]);

    const promotePendingIfReady = useCallback(() => {
        const pending = pendingSourceRef.current;
        if (!pending) {
            return;
        }

        const map = mapRef.current?.getMap();
        if (!map?.getSource(pendingSourceId) || !map.isSourceLoaded(pendingSourceId)) {
            return;
        }

        setVisibleSource(pending);
        setPendingSource(null);
    }, [pendingSourceId]);

    const handleIdle = useCallback(() => {
        promotePendingIfReady();
        setMapIdle(true);
        onIdle?.();
    }, [onIdle, promotePendingIfReady]);

    useEffect(() => {
        if (!pendingSource) {
            return;
        }

        // GeoJSON (and already-cached vector) can be ready before the next idle.
        const frame = window.requestAnimationFrame(() => {
            promotePendingIfReady();
        });
        return () => window.cancelAnimationFrame(frame);
    }, [pendingSource, promotePendingIfReady]);

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
                <LensMapSourceLayers
                    fillPaint={fillPaint}
                    filter={filter}
                    layerId={layerId}
                    source={visibleSource}
                    sourceId={sourceId}
                />
                {pendingSource ? (
                    <LensMapSourceLayers
                        fillPaint={{
                            ...fillPaint,
                            'fill-opacity': 0,
                            'fill-opacity-transition': { duration: 0 },
                        }}
                        filter={filter}
                        layerId={`${layerId}_pending`}
                        source={pendingSource}
                        sourceId={pendingSourceId}
                    />
                ) : null}
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

function LensMapSourceLayers({
    fillPaint,
    filter,
    layerId,
    source,
    sourceId,
}: {
    fillPaint: {
        'fill-color': ExpressionSpecification;
        'fill-opacity': number;
        'fill-opacity-transition': { duration: number };
    };
    filter: FilterSpecification | undefined;
    layerId: string;
    source: LensMapSource;
    sourceId: string;
}) {
    if (source.type === 'vector') {
        return (
            <Source id={sourceId} type="vector" url={source.url}>
                <Layer
                    id={layerId}
                    type="fill"
                    source-layer={source.sourceLayer}
                    filter={filter}
                    paint={fillPaint}
                />
            </Source>
        );
    }

    return (
        <Source id={sourceId} type="geojson" data={source.data}>
            <Layer
                id={layerId}
                type="fill"
                filter={filter}
                paint={fillPaint}
            />
        </Source>
    );
}

function lensMapSourceKey(source: LensMapSource): string {
    if (source.type === 'vector') {
        return `vector:${source.sourceLayer}:${source.url}`;
    }
    return `geojson:${JSON.stringify(source.data)}`;
}

function sameSourceIdentity(left: LensMapSource, right: LensMapSource): boolean {
    if (left.type !== right.type) {
        return false;
    }
    if (left.type === 'vector' && right.type === 'vector') {
        return left.sourceLayer === right.sourceLayer;
    }
    return true;
}

const datasetTypePropertyKeys = new Set<string>(Object.values(ExtendedDatasetDataTypes));

function PopupContent({ popup, zoom }: { popup: PopupState; zoom: number }) {
    const properties = popup.feature.properties ?? {};
    const area = Number(properties.area_ha ?? 0);
    const altitude = getAltitude(zoom);
    const googleMapsUrl = `https://www.google.com/maps/@${popup.latitude},${popup.longitude},${altitude}m/data=!3m1!1e3`;
    const rows = Object.entries(properties).filter(([key]) => datasetTypePropertyKeys.has(key));

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

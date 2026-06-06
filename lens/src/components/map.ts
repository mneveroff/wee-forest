import mapboxgl from 'mapbox-gl';
declare const require: any; // Doesn't have typings so will have to do
const mapboxglCompare: any = require('mapbox-gl-compare');

import { Popup } from './popup';
import { Legend } from './legend';
import { BaseMapSelector, BaseMapType, BaseMaps } from './basemap-selector';
import { ModeSelector, MapModeTypes, MapModes } from './mode-selector';
import { DatasetSelector } from './dataset-selector';
import { DatasetTypes, DatasetDataTypes, DatasetConfigs, DatasetConfig, DatasetDataType, FeatureSetting } from '../models/dataset';
import { getRuntimeConfig } from '../client-config';

// Default for the UK&I to be visible in the middle
const defaultBounds = [ -12, 48, 7, 61 ];
const updateTimeout = 250;

type MapDataSource = {
    id: string;
    label: string;
    type: string;
    url: string;
}

class UpdateQueue {
    private queue: Array<() => void> = [];
    private timeout: number | null = null;

    enqueue(task: () => void) {
        // Add the new task to the queue
        this.queue.push(task);

        // If a previous timeout is still waiting, clear it
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        // Start a new timeout
        this.timeout = window.setTimeout(() => {
            // Take the last task from the queue and execute it
            const updateTask = this.queue.pop();
            if (updateTask) {
                updateTask();
            }

            this.queue = [];
            this.timeout = null;
        }, updateTimeout);
    }
}

type WeeForestMapState = {
    modeId: MapModeTypes;
    datasetId: DatasetTypes;
    datasetDataTypeId: DatasetDataTypes;
    basemapId: BaseMapType;
    features: FeatureSetting[];
    datasetYear: number;
    compareDatasetYear: number;
}

class WeeForestMapStateManager {
    private _state: WeeForestMapState;
    private _listeners: { [K in keyof WeeForestMapState]?: Array<(state: WeeForestMapState[K], oldState: WeeForestMapState[K]) => void> } = {};

    constructor(initialState: WeeForestMapState) {
        this._state = initialState;
    }

    get modeId(): MapModeTypes {
        return this._state.modeId;
    }

    get datasetId(): DatasetTypes {
        return this._state.datasetId;
    }

    get datasetDataTypeId(): DatasetDataTypes {
        return this._state.datasetDataTypeId;
    }

    get basemapId(): BaseMapType {
        return this._state.basemapId;
    }

    get features(): FeatureSetting[] {
        return this._state.features;
    }

    get datasetYear(): number {
        return this._state.datasetYear;
    }

    get compareDatasetYear(): number {
        return this._state.compareDatasetYear;
    }

    addListener<K extends keyof WeeForestMapState>(listeners: { [P in K]?: ((state: WeeForestMapState[P], oldState: WeeForestMapState[P]) => void)[] }): void {
        for (const prop in listeners) {
            const propListeners = listeners[prop as K];
            if (propListeners) {
                if (!this._listeners[prop as K]) {
                    this._listeners[prop as K] = [];
                }
                this._listeners[prop as K]!.push(...propListeners);
            }
        }
    }

    set(newState: Partial<WeeForestMapState>): Promise<void> {
        return new Promise(resolve => {
            const oldState = { ...this._state };
            this._state = { ...this._state, ...newState };
    
            // Collect the listeners for each updated property
            const listenersToCall: { [K in keyof WeeForestMapState]?: Array<(state: WeeForestMapState[K], oldState: WeeForestMapState[K]) => void> } = {};
            for (const prop in newState) {
                const listeners = this._listeners[prop as keyof WeeForestMapState];
                if (listeners) {
                    listenersToCall[prop as keyof WeeForestMapState] = listeners as any;
                }
            }
    
            const flattenedListeners = Object.entries(listenersToCall).reduce((acc, [prop, listeners]) => acc.concat(listeners.map(listener => ({ listener, prop }))), [] as any[]);
            let uniqueListeners: any[] = [];
            for (let i = flattenedListeners.length - 1; i >= 0; i--) {
                if (!uniqueListeners.find(obj => obj.listener.toString() === flattenedListeners[i].listener.toString())) {
                    uniqueListeners.unshift(flattenedListeners[i]);
                }
            }
    
            for (const { listener, prop } of uniqueListeners) {
                const newValue = this._state[prop as keyof WeeForestMapState];
                const oldValue = oldState[prop as keyof WeeForestMapState];
                listener(newValue, oldValue);
            }
    
            resolve();
        });
    }
}

export class WeeForestMap {
    private _map: mapboxgl.Map;

    // HTML Containers
    private _mapContainer: HTMLElement;
    private _rightWidgetContainer: HTMLElement;
    private _leftWidgetContainer: HTMLElement;

    // Config
    private _accessToken: string;
    private _tileServerPath: string;
    private _areaServerPath: string;
    private _bounds = defaultBounds;

    // State
    private _state: WeeForestMapStateManager;
    private _updateQueue: UpdateQueue = new UpdateQueue();
    
    // Widgets: general, left, right
    private _layer!: mapboxgl.FillLayer;
    private _popup: Popup;
    private _legend: Legend;
    private _modeSelector: ModeSelector;
    private _baseMapSelector: BaseMapSelector;
    private _datasetSelector: DatasetSelector;

    // Linked map
    private _compareContainer?: typeof mapboxglCompare;
    private _linkedMapContainer?: HTMLElement;
    private _linkedMap?: mapboxgl.Map;
    private _linkedLayer?: mapboxgl.FillLayer;
    private _linkedPopup?: Popup;
    private _linkedSyncing: boolean = false;

    constructor(
        containerId: string, 
        coordinates: { lat: number, lng: number, zoom: number, pitch: number}, selectedMode: MapModeTypes, selectedDataset: DatasetTypes, selectedBasemap: BaseMapType, selectedDatasetDataType?: DatasetDataTypes, datasetYear?: number, compareDatasetYear?: number) {

        const config = getRuntimeConfig();
        this._accessToken = config.mapboxToken ?? '';
        this._tileServerPath = config.tileServerPath ?? 'tiles';
        this._areaServerPath = config.areaServerPath ?? 'area';

        // Setting state on load
        mapboxgl.accessToken = this._accessToken;
        this._state = this.initState(selectedMode, selectedDataset, selectedBasemap, selectedDatasetDataType, datasetYear, compareDatasetYear);
        
        // Creating the widget containers
        this._rightWidgetContainer = document.createElement('div');
        this._rightWidgetContainer.className = 'widget-container right-widget-container';
        document.getElementById(containerId)?.appendChild(this._rightWidgetContainer);

        this._leftWidgetContainer = document.createElement('div');
        this._leftWidgetContainer.className = 'widget-container left-widget-container';
        document.getElementById(containerId)?.appendChild(this._leftWidgetContainer);

        // Initialising the main map
        const { container, map, popup } = this.initMap(containerId, coordinates);
        this._mapContainer = container;
        this._map = map;
        this._popup = popup;
        
        // Creating the widgets
        this._baseMapSelector = new BaseMapSelector(this._leftWidgetContainer, this._state.basemapId, this.updateBaseMap.bind(this));
        this._modeSelector = new ModeSelector(this._leftWidgetContainer, this.getDataset(), this._state.modeId, this._state.datasetYear, this._state.compareDatasetYear, this.updateMapMode.bind(this), this.updateDatasetYear.bind(this), this.updateDatasetCompareYear.bind(this), this.swapYears.bind(this));
        
        this._legend = new Legend(this._rightWidgetContainer, this._areaServerPath, this.toggleType.bind(this), this.toggleAdvancedControls.bind(this), this.getDatasetId(),this._state.datasetYear!, undefined, undefined, this.getDatasetDataType(), this._state.features.filter(f => f.enabled), [this._map.getBounds()]);
        this._datasetSelector = new DatasetSelector(this._rightWidgetContainer, this.getDataset(), this._state.datasetId, this._state.datasetDataTypeId, this.updateDataset.bind(this), this.updateDatasetDataType.bind(this));

        // Setting the current map mode
        this._map.once('load', () => {
            this.applyMapMode();
        })
    }

    initState(selectedMode: MapModeTypes, selectedDataset: DatasetTypes, selectedBasemap: BaseMapType, selectedDatasetDataType?: DatasetDataTypes, datasetYear?: number, compareDatasetYear?: number) {
        let dataset = DatasetConfigs.find(ds => ds.id === selectedDataset) || DatasetConfigs[0];
        let datasetDataType = dataset.dataTypes.find(dt => dt.id === selectedDatasetDataType) || dataset.dataTypes[0];
        let modeId = MapModes.find(m => m.id === selectedMode && dataset.modeAvailableIds.includes(m.id))?.id || dataset.modeAvailableIds[0];

        let state = new WeeForestMapStateManager({
            modeId: modeId,
            datasetId: selectedDataset,
            datasetDataTypeId: datasetDataType.id,
            basemapId: selectedBasemap,
            features: datasetDataType.colorScheme,
            datasetYear: datasetYear || dataset.endingYear,
            compareDatasetYear: compareDatasetYear || dataset.endingYear
        } as WeeForestMapState);

        state.addListener({
            modeId: [
                (newState, oldState) => this.applyMapMode(newState, oldState),
                () => this.toggleNavInverse(),
                () => this.updateModeSelector(),
                () => this.updateCoordinateURL(),
            ],
            datasetId: [], // Since it's always accompanied by datatype change as well
            datasetDataTypeId: [],
            features: [
                () => this.applyLayer(this._map, this._popup),
                () => this._linkedMap ? this.applyLayer(this._linkedMap, this._linkedPopup!, false) : null,
                () => this._datasetSelector.update(this._state.datasetId, this._state.datasetDataTypeId),
                () => this.updateLegend(),
                () => this.updateCoordinateURL(),
            ],
            basemapId: [
                () => this.applyBaseMap(),
                () => this._linkedMap ? this.applyLayer(this._linkedMap, this._linkedPopup!, false) : null,
                () => this.toggleNavInverse(),
                () => this.updateLegend(),
                () => this.updateCoordinateURL(),
            ],
            datasetYear: [
                () => this.applyLayer(this._map, this._popup),
                () => this.updateModeSelector(),
                () => this.updateLegend(),
                () => this.updateCoordinateURL(),
            ],
            compareDatasetYear: [
                () => this.applyLayer(this._linkedMap!, this._linkedPopup!, false),
                () => this.updateModeSelector(),
                () => this.updateLegend(),
                () => this.updateCoordinateURL(),
            ]
        });

        return state;
    }

    initMap(containerId: string, coordinates: { lat: number, lng: number, zoom: number, pitch: number}, mainMap: boolean = true): { container: HTMLElement, map: mapboxgl.Map, popup: Popup } {
        // Creating the map container HTML element
        let container = document.createElement('div');
        container.id = mainMap? 'map-main' : 'map-compare';
        container.classList.add('map');
        document.getElementById(containerId)?.appendChild(container);

        let map = new mapboxgl.Map({
            container: container,
            style: this.getBaseMapStyle(),
            center: [coordinates.lng, coordinates.lat],
            zoom: coordinates.zoom,
            pitch: coordinates.pitch,
            maxBounds: this._bounds as [number, number, number, number],
            fadeDuration: 500,
            attributionControl: false,
        });

        let attributionControl = new mapboxgl.AttributionControl({
            compact: window.innerWidth <= 1340
        });
        map.addControl(attributionControl);

        let popup = new Popup(map);
        
        map.on('load', () => {    
            this.setSource(mainMap, map);
            this.applyLayer(map, popup, mainMap);
            this.updateCoordinateURL();

            map.on('moveend', this.handleMoveEnd);
        });

        window.addEventListener('resize', () => {
            // Remove the existing control
            map.removeControl(attributionControl);
        
            // Create a new control with the updated compact option
            attributionControl = new mapboxgl.AttributionControl({
                compact: window.innerWidth <= 1340
            });
        
            // Add the new control to the map
            map.addControl(attributionControl);
        });

        return { container, map, popup };
    }

    applyBaseMap() {
        this._map.setStyle(this.getBaseMapStyle());
        this._map.once('style.load', () => {
            this.setSource(true, this._map);
            this.applyLayer(this._map, this._popup);
        });
        
        if (this._state.modeId == MapModeTypes.Swipe || this._state.modeId == MapModeTypes.Split) {
            if (this._linkedMap) {
                this._linkedMap.setStyle(this.getBaseMapStyle());
                this._linkedMap.once('style.load', () => {
                    if (this._linkedMap && this._linkedPopup) {
                        this.setSource(false, this._linkedMap);
                        this.applyLayer(this._linkedMap, this._linkedPopup, false);
                    }
                });
            }
        }
    }

    applyMapMode(newMapMode?: MapModeTypes, previousMapMode?: MapModeTypes) {
        switch (this._state.modeId) {
            case MapModeTypes.Static, MapModeTypes.Timeline: {
                try {
                    this._mapContainer.parentElement?.classList.remove('mode-swipe');
                    this._mapContainer.parentElement?.classList.remove('mode-split');
                    this._map.off('move', this.handleMainMapMove);
                    this._compareContainer.remove();
                } catch (e) {}

                if (this._linkedMapContainer) { 
                    this._linkedMapContainer.remove(); 
                    this._linkedMapContainer = undefined;
                }
                if (this._linkedMap) { 
                    this._linkedMap.remove();
                    this._linkedMap = undefined;
                }
                this._linkedPopup = undefined;
                this._linkedLayer = undefined;
                this._linkedSyncing = false;
                
                this._legend.updateLegendData(this.getDatasetId(), this._state.datasetYear!, this.getDatasetDataType());
                this._legend.updateLegend([this._map.getBounds()], this._state.features.filter(f => f.enabled));
                this._map.resize();
            } break;
            case MapModeTypes.Split: {
                this.separateStartingYears();
                this._mapContainer.parentElement?.classList.add('mode-split');

                if (previousMapMode && previousMapMode == MapModeTypes.Swipe) {
                    this._linkedSyncing = false;
                    this._mapContainer.parentElement?.classList.remove('mode-swipe');
                    this._compareContainer.remove();
                    this._map.resize();
                    this._linkedMap!.resize();
                    this._map.on('move', this.handleMainMapMove);
                    this._linkedMap!.on('move', this.handleLinkedMapMove);
                }
                else {
                    let containerId = this._mapContainer.parentElement?.id || 'app-lens';
                    let coordinates = { lat: this._map.getCenter().lat, lng: this._map.getCenter().lng, zoom: this._map.getZoom(), pitch: this._map.getPitch() };

                    const { container, map, popup } = this.initMap(containerId, coordinates, false);
                    this._linkedMapContainer = container;
                    this._linkedMap = map;
                    this._linkedPopup = popup;

                    this._map.resize();
                    this._map.on('move', this.handleMainMapMove);
                    this._linkedMap.on('move', this.handleLinkedMapMove);
                }

                this._legend.updateLegendData(this.getDatasetId(), this._state.datasetYear!, this.getDatasetDataType(), this.getDatasetId(true), this._state.compareDatasetYear!);
                this._legend.updateLegend([this._map.getBounds(), this._linkedMap!.getBounds()], this._state.features.filter(f => f.enabled));
            } break;
            case MapModeTypes.Swipe: {
                this._mapContainer.parentElement?.classList.add('mode-swipe');
                this.separateStartingYears();
                
                if (previousMapMode && previousMapMode == MapModeTypes.Split) {
                    this._map.off('move', this.handleMainMapMove);
                    this._linkedMap!.off('move', this.handleMainMapMove);
                    this._linkedSyncing = true;

                    this._mapContainer.parentElement?.classList.remove('mode-split');
                    this._map.resize();
                    this._linkedMap!.resize();
                }
                else {
                    let containerId = this._mapContainer.parentElement?.id || 'app-lens';
                    let coordinates = { lat: this._map.getCenter().lat, lng: this._map.getCenter().lng, zoom: this._map.getZoom(), pitch: this._map.getPitch() };

                    const { container, map, popup } = this.initMap(containerId, coordinates, false);
                    this._linkedMapContainer = container;
                    this._linkedMap = map;
                    this._linkedPopup = popup;
                }

                this._legend.updateLegendData(this.getDatasetId(), this._state.datasetYear!,this.getDatasetDataType(), this.getDatasetId(true), this._state.compareDatasetYear!);
                this._legend.updateLegend([this._map.getBounds(), this._linkedMap!.getBounds()], this._state.features.filter(f => f.enabled));
                this._compareContainer = new mapboxglCompare(this._map, this._linkedMap, this._mapContainer.parentElement || 'app-lens', {
                    // Set the initial position of the slider
                    position: 0.5
                });

                // Working around the issue with the slider selecting underlying text when dragged
                this._compareContainer._swiper?.addEventListener('mousedown', () => {
                    document.body.classList.add('no-select');
                });
                
                this._compareContainer._swiper?.addEventListener('touchstart', () => {
                    document.body.classList.add('no-select');
                });

                this._compareContainer.on('slideend', () => {
                    document.body.classList.remove('no-select')
                });
            } break;
        }
    }

    // Callbacks for components

    updateDatasetYear(year: number) {
        this._state.set({ datasetYear: year });
    }

    updateDatasetCompareYear(year: number) {
        this._state.set({ compareDatasetYear: year });
    }

    updateDataset(datasetId: DatasetTypes) {
        this._state.set({ datasetId: datasetId });
        this._state.set({ datasetDataTypeId: this.getDataset().dataTypes[0].id });
        this._state.set({ features: this.getDatasetFeatures() });
    }
    
    updateDatasetDataType(datasetDataTypeId: DatasetDataTypes) {
        this._state.set({ datasetDataTypeId: datasetDataTypeId });
        this._state.set({ features: this.getDatasetFeatures() });
    }

    updateBaseMap(baseMapId: BaseMapType) {
        this._state.set({ basemapId: baseMapId });
    }

    updateMapMode(mapModeId: MapModeTypes) {
        if (this._state.modeId === mapModeId) return;
        this._state.set({ modeId: mapModeId });
    }

    toggleAdvancedControls() {
        this._datasetSelector.toggle();
    }

    toggleType(type: string) {
        let toggledFeature = this._state.features.find(f => f.value === type);
        if (toggledFeature) {
            if (toggledFeature.toggled) {
                toggledFeature.toggled = false;
            } else {
                toggledFeature.toggled = true;
            }
        }
        
        this._map.setPaintProperty(this._layer.id, 'fill-color', this.getFillColor());
        this.filterLayerFeatures(this._map, this._layer);

        if (this._state.modeId == MapModeTypes.Swipe || this._state.modeId == MapModeTypes.Split) {
            if (this._linkedMap && this._linkedLayer) {
                this._linkedMap.setPaintProperty(this._linkedLayer.id, 'fill-color', this.getFillColor());
                this.filterLayerFeatures(this._linkedMap, this._linkedLayer);
            }
        }

        this.updateLegend(false);
    }

    // State-related getters

    getDataset(): DatasetConfig {
        return DatasetConfigs.find(ds => ds.id === this._state.datasetId) || DatasetConfigs[0];
    }
    
    getDatasetId(linked: boolean = false): string {
        const dataset = this.getDataset();
        return linked ? dataset.datasetIdPrefix + this._state.compareDatasetYear : dataset.datasetIdPrefix + this._state.datasetYear;
    }

    getDatasetDataType(): DatasetDataType {
        return this.getDataset().dataTypes.find(dt => dt.id === this._state.datasetDataTypeId) || DatasetConfigs[0].dataTypes[0];
    }

    getDatasetFeatures(): FeatureSetting[] {
        return this.getDatasetDataType().colorScheme;
    }

    getBaseMapStyle(): string {
        return BaseMaps.find(bm => bm.id === this._state.basemapId)?.style || BaseMapType.Fallback;
    }

    // External

    toggleNavInverse() {
        if (this._state.basemapId === BaseMapType.Satellite) {
            document.querySelectorAll('.nav').forEach(el => el.classList.add('inverse'));
        } else {
            document.querySelectorAll('.nav').forEach(el => el.classList.remove('inverse'));
        }
    }

    updateModeSelector() {
        const dataset = this.getDataset();
        this._modeSelector.update(this.getDataset(), this._state.modeId, this._state.datasetYear || dataset.startingYear, this._state.compareDatasetYear || dataset.endingYear);
    }

    updateLegend(recalculate: boolean = true) {
        if (this._state.modeId === MapModeTypes.Swipe || this._state.modeId === MapModeTypes.Split) {
            this._legend.updateLegendData(this.getDatasetId(), this._state.datasetYear!, this.getDatasetDataType(), this.getDatasetId(true), this._state.compareDatasetYear!);
            this._legend.updateLegend([this._map.getBounds(), this._linkedMap!.getBounds()], this._state.features.filter(f => f.enabled), recalculate);
        }
        else {
            this._legend.updateLegendData(this.getDatasetId(), this._state.datasetYear!, this.getDatasetDataType());
            this._legend.updateLegend([this._map.getBounds()], this._state.features.filter(f => f.enabled), recalculate);
        }
    }

    updateCoordinateURL() {
        const url = new URL(window.location.origin + window.location.pathname);
        const query = `?c=${this._map.getCenter().lat.toFixed(6)},${this._map.getCenter().lng.toFixed(6)},${this._map.getZoom().toFixed(2)},${this._map.getPitch().toFixed(0)}&m=${this._state.modeId}&d=${this._state.datasetId}&t=${this._state.datasetDataTypeId}&b=${this._state.basemapId}&y=${this._state.datasetYear}&cy=${this._state.compareDatasetYear}`;
        url.href = url.origin + url.pathname + url.search + url.hash + query;

        try {
            window.history.replaceState(
                null,
                '',
                query
            );
        } catch (error) {
            console.error('Failed to update the URL:', error);
        }

        const shareInput = document.getElementById('share-url') as HTMLInputElement;
        shareInput.value = url.toString();
    }

    // Mapbox-related functions

    setSource(mainMap: boolean, map: mapboxgl.Map): void {
        let dataset = this.getDataset();
        const years = Array.from({length: dataset.endingYear - dataset.startingYear + 1}, (_, i) => dataset.startingYear + i);
    
        years.forEach(year => {
            let datasetId = dataset.datasetIdPrefix + year;
            let source: MapDataSource = {
                id: this.getCurrentSourceId(mainMap, year),
                label: dataset.label,
                type: 'vector',
                url: `${this._tileServerPath}/data/${datasetId}.json`
            }

            map.addSource(source.id, {
                'type': 'vector',
                'url': source.url
            });
        })
    }

    getCurrentSourceId(mainMap: boolean, year?: number): string {
        year = year ? year : (mainMap ? this._state.datasetYear : this._state.compareDatasetYear);
        return this._state.datasetId + '_' + year;
    }

    applyLayer(map: mapboxgl.Map, popup: Popup, mainMap: boolean = true): void {
        let dataset = this.getDataset();
        let layer: mapboxgl.FillLayer = {
            'id': this.getCurrentSourceId(mainMap)+Math.random().toString(36).substring(2, 15), // Necessary to be able to safely fade & remove them & not crash if they're switched back to
            'type': 'fill',
            'source': this.getCurrentSourceId(mainMap),
            'source-layer': dataset.datasetLayerId,
            'layout': {},
            'paint': {
                'fill-color': this.getFillColor(),
                'fill-opacity': 0
            }
        };

        map.addLayer(layer);
        this.filterLayerFeatures(map, layer);
        // Set the transition duration for the fill-opacity property
        map.setPaintProperty(layer.id, 'fill-opacity-transition', { duration: 1000 });
        map.setPaintProperty(layer.id, 'fill-opacity', 0.5);

        const style = map.getStyle();
        
        if (style && style.layers) {
            map.getStyle().layers.filter(l => l.id.startsWith('nao_') && l.id != layer.id).forEach(l => {
                this.fadeLayer(map, l.id);
            })
        }

        map.on('click', layer.id, (e) => {
            this.handleClick(e, popup);
        });

        map.on('mousemove', layer.id, (e) => {  
            this.handleMouseMove(e, popup); 
        });
        map.on('mouseleave', layer.id, () => {  
            this.handleMouseLeave(popup); 
        });

        mainMap ? this._layer = layer : this._linkedLayer = layer;
    }

    fadeLayer(map: mapboxgl.Map, layerId: string, duration: number = 1000) {
        map.setPaintProperty(layerId, 'fill-opacity-transition', { duration });
        map.setPaintProperty(layerId, 'fill-opacity', 0);
    
        setTimeout(() => {
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
        }, duration);
    }

    getFillColor(): mapboxgl.Expression {
        return [
            'match', ['get', this.getDatasetDataType().value],
            ...this._state.features.map(fs => [fs.value, fs.color]).flat(),
            '#000' // default color 
        ];
    }

    filterLayerFeatures(map: mapboxgl.Map, layer: mapboxgl.FillLayer): void {
        const dataType = this.getDatasetDataType();
        const filterOut = this._state.features
            .filter(feature => feature.toggled || !feature.enabled)
            .map(feature => feature.value);
    
        map.setFilter(layer.id, filterOut.length ? ['!in', dataType.value, ...filterOut] : null);
    }

    // Mapbox handlers
    handleClick(e: mapboxgl.MapMouseEvent & mapboxgl.EventData, popup: Popup) {
        // Check if there are features under the mouse pointer
        if (e.features && e.features.length > 0) {
            // Show the popup with the first feature
            popup.show(e.features[0], e.lngLat, 'click', this._map.getZoom());
        } else {
            // Hide the popup if it's in click mode
            if (popup.mode === 'click') {
                popup.hide();
            }
        }
    }

    handleMouseMove(e: mapboxgl.MapMouseEvent & mapboxgl.EventData, popup: Popup) {
        // Check if there are features under the mouse pointer
        if (e.features && e.features.length > 0) {
            // Only show the popup in hover mode if it's not already in click mode
            if (popup.mode !== 'click') {
                popup.show(e.features[0], e.lngLat, 'hover', this._map.getZoom());
            }
        } else {
            // Hide the popup if it's in hover mode
            if (popup.mode === 'hover') {
                popup.hide();
            }
        }
    }
    
    handleMouseLeave(popup: Popup) {
        // Hide the popup if it's in hover mode
        if (popup.mode === 'hover') {
            popup.hide();
        }
    }

    handleMainMapMove = () => {
        if (this._linkedMap) {
            if (this._linkedSyncing) return;
            this._linkedSyncing = true;
            this._linkedMap.jumpTo({
                center: this._map.getCenter(),
                zoom: this._map.getZoom(),
                bearing: this._map.getBearing(),
                pitch: this._map.getPitch()
            });
            this._linkedSyncing = false;
        }
    }

    handleLinkedMapMove = () => {
        if (this._linkedMap) {
            if (this._linkedSyncing) return;
            this._linkedSyncing = true;
            this._map.jumpTo({
                center: this._linkedMap.getCenter(),
                zoom: this._linkedMap.getZoom(),
                bearing: this._linkedMap.getBearing(),
                pitch: this._linkedMap.getPitch()
            });
            this._linkedSyncing = false;
        }
    }

    handleMoveEnd = () => {
        // Legend updater has it's own separate queue
        this.updateLegend();
        this._updateQueue.enqueue(() => {
            this.updateCoordinateURL();
        });
    }

    // Auxiliary

    swapYears() {
        const temp = this._state.datasetYear;
        this._state.set({
            datasetYear: this._state.compareDatasetYear,
            compareDatasetYear: temp
        });
    }

    separateStartingYears() {
        if (this._state.datasetYear == this._state.compareDatasetYear) {
            this._state.set({
                datasetYear: this.getDataset().startingYear,
                compareDatasetYear: this.getDataset().endingYear
            });
        }
    }
}
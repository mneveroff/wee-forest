import type { BaseMapType } from '../components/basemap-selector';
import type { MapModeTypes } from '../components/mode-selector';
import type { DatasetDataTypes, DatasetTypes, FeatureSetting } from './dataset';

export type WeeForestMapState = {
    modeId: MapModeTypes;
    datasetId: DatasetTypes;
    datasetDataTypeId: DatasetDataTypes;
    basemapId: BaseMapType;
    features: FeatureSetting[];
    datasetYear: number;
    compareDatasetYear: number;
};

type MapStateListener<K extends keyof WeeForestMapState> = (
    state: WeeForestMapState[K],
    oldState: WeeForestMapState[K],
) => void;

type MapStateListeners = {
    [K in keyof WeeForestMapState]?: Array<MapStateListener<K>>;
};

export class WeeForestMapStateManager {
    private _state: WeeForestMapState;
    private _listeners: MapStateListeners = {};

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

    addListener(listeners: MapStateListeners): void {
        for (const key of Object.keys(listeners) as Array<keyof WeeForestMapState>) {
            this.addPropertyListeners(key, listeners);
        }
    }

    async set(newState: Partial<WeeForestMapState>): Promise<void> {
        const oldState = { ...this._state };
        this._state = { ...this._state, ...newState };
        const calledListeners = new Set<string>();

        for (const key of Object.keys(newState) as Array<keyof WeeForestMapState>) {
            this.notifyPropertyListeners(key, oldState, calledListeners);
        }
    }

    private addPropertyListeners<K extends keyof WeeForestMapState>(
        key: K,
        listeners: MapStateListeners,
    ): void {
        const propertyListeners = listeners[key] as Array<MapStateListener<K>> | undefined;
        if (!propertyListeners) {
            return;
        }

        const currentListeners = (this._listeners[key] ?? []) as Array<MapStateListener<K>>;
        this._listeners[key] = [...currentListeners, ...propertyListeners] as MapStateListeners[K];
    }

    private notifyPropertyListeners<K extends keyof WeeForestMapState>(
        key: K,
        oldState: WeeForestMapState,
        calledListeners: Set<string>,
    ): void {
        const listeners = this._listeners[key] as Array<MapStateListener<K>> | undefined;
        for (const listener of listeners ?? []) {
            const identity = listener.toString();
            if (calledListeners.has(identity)) {
                continue;
            }

            calledListeners.add(identity);
            listener(this._state[key], oldState[key]);
        }
    }
}

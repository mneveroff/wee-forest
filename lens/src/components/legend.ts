import { html, render } from 'lit-html';
import { CollapsibleWidget } from './collapsible-widget';
import { DatasetDataType, FeatureSetting, FeatureCharacteristic } from '../models/dataset';

const areaFetchTimeout = 150;

export class Legend {
    private _fetchAreaTimeout: number | null = null;
    private _fetchQueue: Array<() => Promise<Array<{ [key: string]: number }>>> = [];
    
    private _areas: { [key: string]: number } = {};
    private _linkedAreas: { [key: string]: number } = {};

    private _container: HTMLElement;
    private _collapsibleWidget: CollapsibleWidget;

    constructor(
        private _parent: HTMLElement,
        private _areaServerPath: string,
        private _toggleType: (type: string) => void,
        private _toggleAdvancedControls: () => void,
        private _datasetId: string,
        private _datasetYear: number,
        private _linkedDatasetId: string | undefined, // A different year (potentially)
        private _linkedDatasetYear: number | undefined,
        private _datasetDataType: DatasetDataType,
        features: FeatureSetting[],
        bounds: mapboxgl.LngLatBounds[],
        ) {
            this._container = document.createElement('div');
            this._container.className = 'surface surface-right elevation-100 legend';
            this._parent.appendChild(this._container);

            this._collapsibleWidget = new CollapsibleWidget(this._container);
            
            this.updateLegend(bounds, features, true);
    }

    updateLegendData(datasetId: string, datasetYear: number, datasetDataType: DatasetDataType, linkedDatasetId?: string, linkedDatasetYear?: number) {
        this._datasetId = datasetId;
        this._datasetYear = datasetYear;
        if (linkedDatasetId) {
            this._linkedDatasetId = linkedDatasetId;
            this._linkedDatasetYear = linkedDatasetYear;
        }
        else {
            this._linkedDatasetId = undefined
            this._linkedDatasetYear = undefined
        }

        this._datasetDataType = datasetDataType;
    }

    getAreasTotal(features: FeatureSetting[]) {
        let total = 0;
        
        features.filter(f => !f.toggled).forEach(f => {
            total += this._areas[f.value] || 0;
        });
    
        return total;
    }

    getLinkedAreasTotal(features: FeatureSetting[]) {
        let total = 0;
        
        features.filter(f => !f.toggled).forEach(f => {
            total += this._linkedAreas[f.value] || 0;
        });
    
        return total;
    }

    async updateLegend(bounds: mapboxgl.LngLatBounds[], features: FeatureSetting[], recalculate: boolean = true) {
        // Skipping loading indicators if toggling legend.
        let loading = recalculate;
        let linkedData = this._linkedDatasetId !== undefined;

        const updateLegendElement = () => {
            let legendTemplate, characteristicTotal = 0;

            this._container.classList.remove('legend-compare');
            if (linkedData) {
                this._container.classList.add('legend-compare');
            }

            const colorSchemeRows = features
                .map(f => {
                const total = this._areas[f.value] !== undefined ? this._areas[f.value] : -1;
                let linkedTotal, difference, arrow, differenceClass;
                
                if (linkedData) {
                    linkedTotal = this._linkedAreas[f.value] !== undefined ? this._linkedAreas[f.value] : -1;
                    difference = linkedTotal - total;
                    arrow = difference > 0 ? 
                    html`<span class="value-indicator">▲</span>` : 
                    html`<span class="value-indicator">▼</span>`;
                    differenceClass = difference > 0 ? 'value-growth' : 'value-loss';

                    characteristicTotal += f.characteristic === FeatureCharacteristic.Desirable ? difference : -difference;
                }
                
                return html`
                    <div class="legend-row feature-row${f.toggled ? ' disabled' : ''}${loading ? ' loading' : ''}" @click=${() => this._toggleType(f.value)}>
                        <div class="label">
                            <span class="status" style='background-color: ${f.color};'></span>
                            <span>${f.label}</span>
                        </div>
                        <div class="value">
                            ${f.toggled ? 'Not shown' : (total === -1 ? 'None' : total.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' ha')}
                        </div>
                        ${this._linkedDatasetId ? 
                            html`<div class="value ${differenceClass} characteristic-${f.characteristic}">
                                    ${f.toggled ? 'Not shown' : (linkedTotal === -1 ? 'None' : html`${arrow} ${Math.abs(difference!).toLocaleString(undefined, {maximumFractionDigits: 0})}`)}
                                </div>` 
                        : ''}
                    </div>
                `;
            });

            let total = this.getAreasTotal(features);
            let linkedTotal, totalDifference, arrow, differenceClass;

            if (linkedData) {
                linkedTotal = this.getLinkedAreasTotal(features);
                totalDifference = linkedTotal - total;
                arrow = totalDifference > 0 ? 
                html`<span class="value-indicator">▲</span>` : 
                html`<span class="value-indicator">▼</span>`;
                differenceClass = totalDifference > 0 ? 'value-growth' : 'value-loss';
            }

            const totalRow = html`
                <div class="legend-row total-row${loading ? ' loading' : ''}">
                    <div class="label">
                        <span class="icon icon-advanced-toggle" @click=${() => this._toggleAdvancedControls()}></span>
                        <span>Total shown</span>
                    </div>
                    <div class="value">
                            ${total.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' ha'}
                    </div>
                    ${this._linkedDatasetId ? 
                        html`<div class="value${characteristicTotal > 0 ? '  characteristic-desirable ' : ' characteristic-undesirable '}${differenceClass}">
                            ${arrow} ${Math.abs(totalDifference!).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>` 
                    : ''}
                </div>
            `;

            const headerRow = html`
                <div class="legend-row header-row">
                    <div class="label">Features</div>
                    <div class="value">
                        ${this._datasetYear}
                    </div>
                    ${this._linkedDatasetYear ? 
                        html`<div class="value">
                            ${this._linkedDatasetYear}
                        </div>` 
                    : ''}
                </div>
            `;
            
            legendTemplate = html`
                <div class="legend-content-wrapper">
                    ${headerRow}
                    <div class="legend-content">
                        ${colorSchemeRows}
                    </div>
                    ${totalRow}
                </div>
                ${this._collapsibleWidget.render()}`;

            render(legendTemplate, this._container);
        };
    
        updateLegendElement();
    
        if (recalculate) {
            try {
                if (this._linkedDatasetId) {
                    [this._areas, this._linkedAreas] = await this.fetchAreaData([
                        { bounds: bounds[0], datasetId: this._datasetId },
                        { bounds: bounds[1], datasetId: this._linkedDatasetId }
                    ]);
                }   
                else {
                    [this._areas] = await this.fetchAreaData([{ bounds: bounds[0], datasetId: this._datasetId }]);
                    this._linkedAreas = {};
                }
                loading = false;
                updateLegendElement();
            } catch (error) {
                console.error('updateLegend error:', error);
            }
        }
    }

    async fetchAreaData(boundsAndDataTypes: { bounds: mapboxgl.LngLatBounds, datasetId: string }[]): Promise<Array<{ [key: string]: number }>> {
        return new Promise((resolve, reject) => {
            // Add the new fetch requests to the queue
            this._fetchQueue.push(async (): Promise<Array<{ [key: string]: number }>> => {
                const fetchPromises = boundsAndDataTypes.map(({ bounds, datasetId }) => {
                    // Trailing slash before query avoids Astro dev treating /lens/area/calculate_areas as a page route.
                    const url = new URL(`${this._areaServerPath}/calculate_areas/`, window.location.origin);
                    url.searchParams.set('dataset', datasetId);
                    url.searchParams.set('type', this._datasetDataType.value);
                    url.searchParams.set('bounds', bounds.toArray().flat().join(','));

                    return fetch(url)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        });
                });
    
                const results = await Promise.all(fetchPromises);
                return results;
            });
    
            // If a previous timeout is still waiting, clear it
            if (this._fetchAreaTimeout) {
                clearTimeout(this._fetchAreaTimeout);
            }
    
            // Start a new timeout
            this._fetchAreaTimeout = window.setTimeout(() => {
                // Take the last request from the queue and execute it
                const fetchRequest = this._fetchQueue.pop();
                if (fetchRequest) {
                    fetchRequest().then(resolve).catch(reject);
                }
            
                this._fetchQueue = [];
                this._fetchAreaTimeout = null;
            }, areaFetchTimeout);
        });
    }
}
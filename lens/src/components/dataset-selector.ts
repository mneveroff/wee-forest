
import { html, render } from 'lit-html';
import { CollapsibleWidget } from './collapsible-widget';
import { DatasetTypes, DatasetDataTypes, DatasetConfigs, DatasetConfig } from '../models/dataset';

export class DatasetSelector {
    private _container: HTMLElement;
    private _hidden: boolean = true;

    private _collapsibleWidget: CollapsibleWidget;

    constructor(
        private _parent: HTMLElement,
        private _datasetConfig: DatasetConfig,
        private _selectedDatasetId: DatasetTypes,
        private _datasetDataTypeId: DatasetDataTypes,
        private _setDataset: (type: DatasetTypes) => void,
        private _setDatasetDataType: (type: DatasetDataTypes) => void,
        ) {
        this._container = document.createElement('div');
        this._container.className = 'surface surface-right elevation-100 dataset-selector hidden';
        this._parent.appendChild(this._container);

        this._collapsibleWidget = new CollapsibleWidget(this._container);

        this.render();
    }

    update(selectedDatasetId: DatasetTypes, datasetDataTypeId: DatasetDataTypes) {
        this._selectedDatasetId = selectedDatasetId;
        this._datasetDataTypeId = datasetDataTypeId;
        this.render();
    }

    render() {
        const datasets = DatasetConfigs.map(dc => {
            const isSelected = dc.id === this._selectedDatasetId;
            return html`<option value="${dc.id}" ?selected=${isSelected}>${dc.label}</option>`;
        });
        
        const dataTypeRows = this._datasetConfig.dataTypes.map(dt => {
            const isSelected = this._datasetDataTypeId === dt.id;
            return html`
                <button type="button" class="selector-row-item${isSelected ? ' selected' : ''}" data-type="${dt.id}" aria-pressed="${isSelected}" @click=${(e: Event) => this.onToggleChange(e)}>
                    ${dt.label}
                </button>
            `;
        });
    
        render(html`
            <div class="selector-row">
                ${dataTypeRows}
            </div>
            <div class="widget-selector-header">
                <div class="widget-selector-title">
                    <span>Dataset</span>
                </div>
                <div class="widget-selector-dropdown">
                    <select aria-label="Dataset" @change=${(e: Event) => this.onSelectChange(e)}>
                        ${datasets}
                    </select>
                </div>
            </div>
            ${this._collapsibleWidget.render()}
        `, this._container);
    }

    onToggleChange(event: Event) {
        const element = event.currentTarget as HTMLButtonElement;
        this._setDatasetDataType(element.dataset.type as DatasetDataTypes);
        this.render();
    }

    onSelectChange(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this._setDataset(selectElement.value as DatasetTypes);
        this.render();
    }

    toggle() {
        this._hidden = !this._hidden;
        this._container.classList.toggle('hidden', this._hidden);
        this.render();
    }
}
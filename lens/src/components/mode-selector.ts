import { html, render } from 'lit-html';
import { live } from 'lit/directives/live.js';
import { CollapsibleWidget } from './collapsible-widget';
import { DatasetConfig } from '../models/dataset';

export enum MapModeTypes {
    Static = 'st',
    Timeline = 'tl',
    Split = 'sp',
    Swipe = 'sw'
}

export const MapModes = [
    { id: MapModeTypes.Static, label: 'Static' },
    { id: MapModeTypes.Timeline, label: 'Timeline' },
    { id: MapModeTypes.Split, label: 'Split' },
    { id: MapModeTypes.Swipe, label: 'Swipe' }
];

export class ModeSelector {
    private _container: HTMLElement;
    private _collapsibleWidget: CollapsibleWidget;

    constructor(
        private _parent: HTMLElement,
        private _datasetConfig: DatasetConfig,
        private _selectedMode: MapModeTypes,
        private _selectedYear: number,
        private _selectedCompareYear: number,
        private _updateMapMode: (type: MapModeTypes) => void,
        private _setDatasetYear: (year: number, leftMap?: boolean) => void,
        private _setDatasetCompareYear: (year: number, leftMap?: boolean) => void,
        private _swapYears: () => void,
        ) {
        this._container = document.createElement('div');
        this._container.className = 'surface surface-left elevation-100 mode-selector';
        this._parent.appendChild(this._container);

        this._collapsibleWidget = new CollapsibleWidget(this._container, window.innerWidth <= 575);

        this.render();
    }

    update(datasetConfig: DatasetConfig, selectedMode: MapModeTypes, selectedYear: number, selectedCompareYear: number) {
        this._datasetConfig = datasetConfig;
        this._selectedMode = selectedMode;
        this._selectedYear = selectedYear;
        this._selectedCompareYear = selectedCompareYear;
        this.render();
    }

    render() {
        const mapModes = MapModes.filter(m => this._datasetConfig.modeAvailableIds.includes(m.id)).map(m => {
            const isSelected = m.id === this._selectedMode;
            return html`
                <button type="button" class="selector-row-item${isSelected ? ' selected' : ''}" data-type="${m.id}" aria-pressed="${isSelected}" @click=${(e: Event) => this.onToggleChange(e)}>
                    ${m.label}
                </button>
            `;
        });

        const timelineSelected = this._selectedMode === MapModeTypes.Timeline;
        const swipeSelected = this._selectedMode === MapModeTypes.Swipe || this._selectedMode === MapModeTypes.Split;

        const control = 
        timelineSelected ? this.getSliderControl(this._datasetConfig.startingYear, this._datasetConfig.endingYear) :
        swipeSelected ? this.getPickerControl(this._datasetConfig.startingYear, this._datasetConfig.endingYear) :
        null;

        render(html`
            <div class="mode-control${timelineSelected ? ' control-timeline' : swipeSelected ? ' control-swipe' : ''}">
                    ${control}
            </div>
            <div class="selector-row">
                    ${mapModes}
            </div>
            ${this._collapsibleWidget.render()}`, 
        this._container);
    }

    getSliderControl(startYear: number, endYear: number) {
        return html`
            <span class="slider-label">${this._selectedYear}</span>
            <input aria-label="Dataset year" type="range" min="${startYear}" max="${endYear}" value="${this._selectedYear}" @input=${(e: Event) => this._setDatasetYear((e.target as HTMLInputElement).valueAsNumber)} />
        `;
    }
    
    // Live directive is necessary, otherwise it gets reset to the first value in the select after an HTML input (i.e. one year change) followed by a swap
    getPickerControl(startYear: number, endYear: number) {
        const years = Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);
        return html`
            <select aria-label="Primary year" @change=${(e: Event) => this.onYearChange(e, false)}>
                ${years.map(year => html`<option value="${year}" .selected=${live(year === this._selectedYear)} ?disabled=${year === this._selectedCompareYear}>${year}</option>`)}
            </select>
            <button type="button" class="icon swap-years" aria-label="Swap years" @click=${() => this._swapYears()}></button>
            <select aria-label="Comparison year" @change=${(e: Event) => this.onYearChange(e, true)}>
                ${years.map(year => html`<option value="${year}" .selected=${live(year === this._selectedCompareYear)} ?disabled=${year === this._selectedYear}>${year}</option>`)}
            </select>
        `;
    }
    
    onYearChange(event: Event, isCompare: boolean) {
        const element = event.target as HTMLSelectElement;
        const value = Number(element.value);
    
        if (isCompare) {
            this._selectedCompareYear = value;
            this._setDatasetCompareYear(value, false);
        } else {
            this._selectedYear = value;
            this._setDatasetYear(value);
        }
    }

    onToggleChange(event: Event) {
        const element = event.currentTarget as HTMLButtonElement;
        this._updateMapMode(element.dataset.type as MapModeTypes);
    }
}
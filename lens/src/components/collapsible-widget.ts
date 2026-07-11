import { html } from 'lit-html';

export class CollapsibleWidget {
    constructor(
        private _parent: HTMLElement, 
        private _isCollapsed: boolean = false) {

    }

    toggleCollapse(button?: HTMLButtonElement) {
        this._isCollapsed = !this._isCollapsed;
        this._parent.classList.toggle('collapsed', this._isCollapsed);
        button?.setAttribute('aria-label', this.getToggleLabel());
    }

    render() {
        return html`
            <button type="button" class="icon widget-toggle-container" aria-label="${this.getToggleLabel()}" @click=${(event: Event) => this.toggleCollapse(event.currentTarget as HTMLButtonElement)}></button>
        `;
    }

    private getToggleLabel(): string {
        return this._isCollapsed ? 'Expand panel' : 'Collapse panel';
    }
}
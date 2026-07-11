import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { BaseMapSelector, BaseMapType } from './basemap-selector';
import { DatasetSelector } from './dataset-selector';
import { MapModeTypes, ModeSelector } from './mode-selector';
import { DatasetConfigs, DatasetDataTypes, DatasetTypes } from '../models/dataset';

function createParent(): HTMLElement {
    document.body.replaceChildren();
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    return parent;
}

test('changes the displayed year and comparison mode through the Lens controls', async () => {
    const dataset = DatasetConfigs[0];
    let selectedMode = MapModeTypes.Timeline;
    let selectedYear = 2022;
    let comparisonYear = 2012;
    let selector: ModeSelector;

    const updateSelector = () => {
        selector.update(dataset, selectedMode, selectedYear, comparisonYear);
    };
    selector = new ModeSelector(
        createParent(),
        dataset,
        selectedMode,
        selectedYear,
        comparisonYear,
        (mode) => {
            selectedMode = mode;
            updateSelector();
        },
        (year) => {
            selectedYear = year;
            updateSelector();
        },
        (year) => {
            comparisonYear = year;
            updateSelector();
        },
        () => {
            [selectedYear, comparisonYear] = [comparisonYear, selectedYear];
            updateSelector();
        },
    );

    await page.getByRole('slider', { name: 'Dataset year' }).fill('2020');
    await expect.element(page.getByText('2020')).toBeInTheDocument();

    await page.getByRole('button', { name: 'Split' }).click();
    await expect.element(page.getByRole('button', { name: 'Split' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('combobox', { name: 'Primary year' })).toHaveValue('2020');
    await expect.element(page.getByRole('combobox', { name: 'Comparison year' })).toHaveValue('2012');

    await page.getByRole('button', { name: 'Swap years' }).click();
    await expect.element(page.getByRole('combobox', { name: 'Primary year' })).toHaveValue('2012');
    await expect.element(page.getByRole('combobox', { name: 'Comparison year' })).toHaveValue('2020');
});

test('changes the dataset data type through named controls', async () => {
    const dataset = DatasetConfigs[0];
    let selectedDataType = DatasetDataTypes.Overlay;
    let selector: DatasetSelector;
    selector = new DatasetSelector(
        createParent(),
        dataset,
        DatasetTypes.NFI_AWI_Overlay,
        selectedDataType,
        vi.fn(),
        (dataType) => {
            selectedDataType = dataType;
            selector.update(DatasetTypes.NFI_AWI_Overlay, selectedDataType);
        },
    );

    await page.getByRole('button', { name: 'Source' }).click();

    await expect.element(page.getByRole('button', { name: 'Source' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('combobox', { name: 'Dataset' })).toHaveValue(DatasetTypes.NFI_AWI_Overlay);
});

test('changes the base map and expands its compact panel', async () => {
    const setBaseMap = vi.fn();
    new BaseMapSelector(createParent(), BaseMapType.Light, setBaseMap);

    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Base Map' }), BaseMapType.Satellite);
    expect(setBaseMap).toHaveBeenCalledWith(BaseMapType.Satellite);

    await page.getByRole('button', { name: 'Expand panel' }).click();
    await expect.element(page.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument();
});

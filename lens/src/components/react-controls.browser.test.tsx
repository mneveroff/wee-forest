import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { DatasetDataTypes, DatasetTypes } from '@/models/dataset';
import { BaseMapType } from '@/models/lens-config';
import { createLensStore, type LensStoreApi } from '@/models/lens-store';
import { parseLensUrl } from '@/models/lens-url';
import { BaseMapSelector, DatasetSelector, ModeSelector } from '@/components/lens-controls';
import { LensStoreProvider } from '@/components/lens-store-context';

function renderWithStore(
    children: ReactNode,
    url = 'https://weeforest.org/lens/?m=tl&y=2022&cy=2012',
): { root: Root; store: LensStoreApi } {
    document.body.replaceChildren();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const store = createLensStore(parseLensUrl(new URL(url)));
    const root = createRoot(container);
    root.render(
        <LensStoreProvider store={store}>
            {children}
        </LensStoreProvider>,
    );
    return { root, store };
}

test('changes the displayed year and comparison mode through the Lens controls', async () => {
    const { root } = renderWithStore(<ModeSelector />);

    await page.getByRole('slider', { name: 'Dataset year' }).fill('2020');
    await expect.element(page.getByText('2020')).toBeInTheDocument();

    await page.getByRole('button', { name: 'Split' }).click();
    await expect.element(page.getByRole('button', { name: 'Split' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('combobox', { name: 'Primary year' })).toHaveValue('2020');
    await expect.element(page.getByRole('combobox', { name: 'Comparison year' })).toHaveValue('2012');

    await page.getByRole('button', { name: 'Swap years' }).click();
    await expect.element(page.getByRole('combobox', { name: 'Primary year' })).toHaveValue('2012');
    await expect.element(page.getByRole('combobox', { name: 'Comparison year' })).toHaveValue('2020');
    root.unmount();
});

test('changes the dataset data type through named controls', async () => {
    const { root, store } = renderWithStore(<DatasetSelector />);
    store.getState().toggleAdvancedControls();

    await page.getByRole('button', { name: 'Source' }).click();

    await expect.element(page.getByRole('button', { name: 'Source' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('combobox', { name: 'Dataset' })).toHaveValue(DatasetTypes.NFI_AWI_Overlay);
    expect(store.getState().datasetDataTypeId).toBe(DatasetDataTypes.Source);
    root.unmount();
});

test('changes the base map and expands its compact panel', async () => {
    const { root, store } = renderWithStore(<BaseMapSelector />);

    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Base Map' }), BaseMapType.Satellite);
    expect(store.getState().basemapId).toBe(BaseMapType.Satellite);

    await page.getByRole('button', { name: 'Expand panel' }).click();
    await expect.element(page.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument();
    root.unmount();
});

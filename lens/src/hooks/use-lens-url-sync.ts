import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { serializeLensUrl } from '@/models/lens-url';
import { useLensStore } from '@/components/lens-store-context';

export function useLensUrlSync() {
    const {
        modeId,
        datasetId,
        datasetDataTypeId,
        basemapId,
        datasetYear,
        compareDatasetYear,
        viewState,
    } = useLensStore(useShallow((state) => ({
        modeId: state.modeId,
        datasetId: state.datasetId,
        datasetDataTypeId: state.datasetDataTypeId,
        basemapId: state.basemapId,
        datasetYear: state.datasetYear,
        compareDatasetYear: state.compareDatasetYear,
        viewState: state.viewState,
    })));

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const { query, url } = serializeLensUrl(new URL(window.location.href), {
                coordinates: {
                    lat: viewState.latitude,
                    lng: viewState.longitude,
                    zoom: viewState.zoom,
                    pitch: viewState.pitch,
                },
                modeId,
                datasetId,
                datasetDataTypeId,
                basemapId,
                datasetYear,
                compareDatasetYear,
            });

            try {
                window.history.replaceState(null, '', query);
            } catch (error) {
                console.error('Failed to update the URL:', error);
            }

            const shareInput = document.getElementById('share-url');
            if (shareInput instanceof HTMLInputElement) {
                shareInput.value = url.toString();
            }
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [
        basemapId,
        compareDatasetYear,
        datasetDataTypeId,
        datasetId,
        datasetYear,
        modeId,
        viewState,
    ]);
}

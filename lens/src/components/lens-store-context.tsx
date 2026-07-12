import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { LensStore, LensStoreApi } from '@/models/lens-store';

const LensStoreContext = createContext<LensStoreApi | null>(null);

type LensStoreProviderProps = {
    children: ReactNode;
    store: LensStoreApi;
};

export function LensStoreProvider({ children, store }: LensStoreProviderProps) {
    return (
        <LensStoreContext value={store}>
            {children}
        </LensStoreContext>
    );
}

export function useLensStore<T>(selector: (store: LensStore) => T): T {
    const store = useContext(LensStoreContext);
    if (!store) {
        throw new Error('LensStoreProvider is missing');
    }

    return useStore(store, selector);
}

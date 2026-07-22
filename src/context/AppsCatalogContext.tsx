"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { useGetAppsCatalog } from "@/api/hooks/useGetAppsCatalog";
import type { AppsCatalog } from "@/config/apps-catalog";

type AppsCatalogContextValue = {
    catalog: AppsCatalog | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};

const AppsCatalogContext = createContext<AppsCatalogContextValue | null>(null);

export function AppsCatalogProvider({ children }: { children: ReactNode }) {
    const { data, loading, error, refetch } = useGetAppsCatalog();
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            void refetch();
        }
    }, [refetch]);

    return (
        <AppsCatalogContext.Provider
            value={{
                catalog: data,
                loading,
                error,
                refetch,
            }}
        >
            {children}
        </AppsCatalogContext.Provider>
    );
}

export function useAppsCatalogContext(): AppsCatalogContextValue {
    const ctx = useContext(AppsCatalogContext);
    if (!ctx) {
        throw new Error(
            "useAppsCatalogContext debe usarse dentro de AppsCatalogProvider"
        );
    }
    return ctx;
}

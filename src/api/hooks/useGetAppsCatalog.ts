"use client";

/**
 * Hook useGetAppsCatalog
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/apps-catalog')
 * 2. Route handler ejecuta getAppsCatalog() en servidor (AHORITA ESTÁ DUMMY - CAMBIAR)
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { apiFetch } from "@/api/graphql/client";
import type { AppsCatalog } from "@/config/apps-catalog";

export function useGetAppsCatalog() {
    const [data, setData] = useState<AppsCatalog | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ appsCatalog: AppsCatalog }>("/api/apps-catalog");
            setData(response.appsCatalog ?? null);
        } catch (err) {
            const nextError = err instanceof Error ? err : new Error(String(err));
            setError(nextError);
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        refetch,
    };
}

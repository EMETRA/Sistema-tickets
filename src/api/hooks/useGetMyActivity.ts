'use client';

/**
 * Hook useGetMyActivity
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/my-activity?limit=...')
 * 2. Route handler ejecuta GET_MY_ACTIVITY_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "@/api/graphql/client";
import { type ActivityRow } from "@/api/graphql/technician";

interface MyActivityFilters {
    limit?: number;
}

/**
 * Hook para obtener la actividad reciente del técnico autenticado
 * @param filters Filtro opcional de limit
 * @returns { data, loading, error, refetch }
 */
export function useGetMyActivity(filters?: MyActivityFilters) {
    const [data, setData] = useState<ActivityRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.limit) params.append("limit", String(filters.limit));

            const url = `/api/my-activity${params.toString() ? `?${params.toString()}` : ""}`;
            const response = await apiFetch<{ myActivity: ActivityRow[] }>(url);

            setData(response.myActivity || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [filters?.limit]);

    // Auto-fetch cuando los filtros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        data,
        loading,
        error,
        refetch,
    };
}

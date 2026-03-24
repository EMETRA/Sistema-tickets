'use client';

/**
 * Hook useGetTechnicianStats
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/technician-stats?rango=...')
 * 2. Route handler ejecuta GET_TECHNICIAN_STATS_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { type TechnicianStats } from "@/api/graphql/technician";

interface TechnicianStatsFilters {
    rango?: string;
}

/**
 * Hook para obtener estadísticas de desempeño del técnico
 * Incluye: tickets, asignados, resueltos, pendientes, gráfico rendimiento
 * @param filters Filtro opcional de rango
 * @returns { data, loading, error, refetch }
 */
export function useGetTechnicianStats(filters?: TechnicianStatsFilters) {
    const [data, setData] = useState<TechnicianStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.rango) params.append("rango", filters.rango);

            const url = `/api/technician-stats${params.toString() ? `?${params.toString()}` : ""}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.technicianStats || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
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

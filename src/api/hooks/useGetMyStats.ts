'use client';

/**
 * Hook useGetMyStats
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/my-stats')
 * 2. Route handler ejecuta GET_MY_STATS_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { type MyStats } from "@/api/graphql/home";

/**
 * Hook para obtener las estadísticas del usuario autenticado
 * Incluye: tickets, vacaciones, zonas a cargo, gráfico mensual
 * @returns { data, loading, error, refetch }
 */
export function useGetMyStats() {
    const [data, setData] = useState<MyStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/my-stats");

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.myStats || null);
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

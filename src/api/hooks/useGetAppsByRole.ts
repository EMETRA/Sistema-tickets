'use client';

/**
 * Hook useGetAppsByRole
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/apps')
 * 2. Route handler ejecuta GET_APPS_BY_ROLE_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { type AppLink } from "@/api/graphql/home";

/**
 * Hook para obtener las aplicaciones disponibles según el rol del usuario
 * @returns { data, loading, error, refetch }
 */
export function useGetAppsByRole() {
    const [data, setData] = useState<AppLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/apps");

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.appsByRole || []);
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

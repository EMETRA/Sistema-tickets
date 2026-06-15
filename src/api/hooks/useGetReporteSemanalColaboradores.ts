'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ColaboradorReporte } from '@/api/graphql/MOD01';

/**
 * Hook useGetReporteSemanalColaboradores
 * 
 * Obtiene la lista de colaboradores disponibles para el formulario de reportes
 * 
 * @returns { data, loading, error, refetch }
 * 
 * Ejemplo:
 * ```ts
 * const { data: colaboradores, loading } = useGetReporteSemanalColaboradores();
 * ```
 */
export function useGetReporteSemanalColaboradores() {
    const [data, setData] = useState<ColaboradorReporte[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ reporteSemanalColaboradores: ColaboradorReporte[] }>(
                '/api/MOD01/reporteSemanalColaboradores'
            );
            
            setData(response.reporteSemanalColaboradores || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch al montar el componente
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

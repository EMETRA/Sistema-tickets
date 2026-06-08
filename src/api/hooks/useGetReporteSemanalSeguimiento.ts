'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type {
    SeguimientoColaboradorReporte,
} from '@/api/graphql/MOD01';

/**
 * Hook useGetReporteSemanalSeguimiento
 * 
 * Obtiene el seguimiento histórico de un colaborador
 * 
 * @param idColaborador ID del colaborador (requerido)
 * @param limit Cantidad máxima de reportes (opcional)
 * @returns { data, loading, error, refetch }
 * 
 * Ejemplo:
 * ```ts
 * const { data: seguimiento, loading } = useGetReporteSemanalSeguimiento(5);
 * const { data: limited } = useGetReporteSemanalSeguimiento(5, 10);
 * ```
 */
export function useGetReporteSemanalSeguimiento(
    idColaborador: number | null | undefined,
    limit?: number
) {
    const [data, setData] = useState<SeguimientoColaboradorReporte | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        if (!idColaborador) {
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construir query params
            const params = new URLSearchParams();
            params.append('idColaborador', String(idColaborador));

            if (limit !== undefined) {
                params.append('limit', String(limit));
            }

            const response = await apiFetch<{ reporteSemanalSeguimientoColaborador: SeguimientoColaboradorReporte }>(
                `/api/MOD01/reporteSemanalSeguimiento?${params.toString()}`
            );

            setData(response.reporteSemanalSeguimientoColaborador || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [idColaborador, limit]);

    // Auto-fetch cuando los parámetros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ReporteSemanalDetalle } from '@/api/graphql/MOD01';

/**
 * Hook useGetReporteSemanal
 * 
 * Obtiene el detalle completo de un reporte semanal por ID
 * 
 * @param id ID del reporte a obtener (requerido)
 * @returns { data, loading, error, refetch }
 * 
 * Ejemplo:
 * ```ts
 * const { data: reporte, loading } = useGetReporteSemanal('123');
 * ```
 */
export function useGetReporteSemanal(id: string | null | undefined) {
    const [data, setData] = useState<ReporteSemanalDetalle | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        if (!id) {
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ reporteSemanal: ReporteSemanalDetalle}>(
                `/api/MOD01/reporteSemanal?id=${encodeURIComponent(id)}`
            );

            setData(response.reporteSemanal || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Auto-fetch cuando el ID cambie
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

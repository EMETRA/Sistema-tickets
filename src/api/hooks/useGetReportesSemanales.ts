'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type {
    ReporteSemanalResumen,
    ReporteSemanalFilterInput,
} from '@/api/graphql/MOD01';

/**
 * Hook useGetReportesSemanales
 * 
 * Obtiene la lista de reportes semanales con soporte de filtros
 * 
 * @param filters Filtros opcionales para buscar reportes
 * @returns { data, loading, error, refetch }
 * 
 * Ejemplo:
 * ```ts
 * const { data, loading } = useGetReportesSemanales();
 * const { data: filtered } = useGetReportesSemanales({ 
 *   idColaborador: 5, 
 *   proyecto: 'ProyectoX' 
 * });
 * ```
 */
export function useGetReportesSemanales(filters?: ReporteSemanalFilterInput) {
    const [data, setData] = useState<ReporteSemanalResumen[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Construir query params de filtros
            const params = new URLSearchParams();

            if (filters) {
                if (filters.idColaborador) {
                    params.append('idColaborador', String(filters.idColaborador));
                }
                if (filters.proyecto) {
                    params.append('proyecto', filters.proyecto);
                }
                if (filters.fechaDesde) {
                    params.append('fechaDesde', filters.fechaDesde);
                }
                if (filters.fechaHasta) {
                    params.append('fechaHasta', filters.fechaHasta);
                }
                if (filters.limit) {
                    params.append('limit', String(filters.limit));
                }
            }

            // Construir URL
            const url = `/api/MOD01/reportesSemanales${params.toString() ? `?${params.toString()}` : ''}`;

            // Hacer request
            const response = await apiFetch<{ reportesSemanales: ReporteSemanalResumen[] }>(url);

            setData(response.reportesSemanales || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Auto-fetch cuando los filtros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

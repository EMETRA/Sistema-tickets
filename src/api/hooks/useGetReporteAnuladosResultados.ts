/**
 * Hook para obtener resultados de reportes anulados
 *
 * Comportamiento:
 * - Auto-fetch cuando cambian los parámetros
 * - Retorna: [data, loading, error, refetch]
 * - Requiere: fechaInicio, fechaFin, tipoReporte (opcionales para lazy loading)
 *
 * Uso:
 * const filters = { fechaInicio: "2026-05-01", fechaFin: "2026-05-29", tipoReporte: "RECIBOS_PAGO" };
 * const [resultado, loading, error, refetch] = useGetReporteAnuladosResultados(filters);
 * 
 * // Si algún filtro es null/undefined, no hace fetch automático
 * if (resultado) {
 *   console.log(resultado.total, resultado.columnas, resultado.filas);
 * }
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ReporteAnuladosResultado, TipoReporteAnulado } from '@/api/graphql/MOD08';

interface UseGetReporteAnuladosResultadosReturn {
  data: ReporteAnuladosResultado | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface Filters {
  fechaInicio?: string | null;
  fechaFin?: string | null;
  tipoReporte?: TipoReporteAnulado | null;
}

export function useGetReporteAnuladosResultados(
    filters: Filters,
): UseGetReporteAnuladosResultadosReturn {
    const [data, setData] = useState<ReporteAnuladosResultado | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
    // Validar que tenemos todos los parámetros requeridos
        if (!filters.fechaInicio || !filters.fechaFin || !filters.tipoReporte) {
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('fechaInicio', filters.fechaInicio);
            params.set('fechaFin', filters.fechaFin);
            params.set('tipoReporte', filters.tipoReporte);

            const response = await fetch(`/api/MOD08/reporteAnuladosResultados?${params.toString()}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const result = await response.json();
            setData(result.data);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [filters.fechaInicio, filters.fechaFin, filters.tipoReporte]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}

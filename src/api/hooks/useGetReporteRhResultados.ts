'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ReporteRhResultados } from '@/api/graphql/MOD05';

interface Filters {
  estatus?: string | null;
  fechaIngresoDesde?: string | null;
  fechaIngresoHasta?: string | null;
  campos?: string[];
}

interface UseGetReporteRhResultadosReturn {
  data: ReporteRhResultados | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGetReporteRhResultados(filters: Filters): UseGetReporteRhResultadosReturn {
    const [data, setData] = useState<ReporteRhResultados | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!filters.estatus || !filters.campos?.length) {
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('estatus', filters.estatus);

            if (filters.fechaIngresoDesde) {
                params.set('fechaIngresoDesde', filters.fechaIngresoDesde);
            }

            if (filters.fechaIngresoHasta) {
                params.set('fechaIngresoHasta', filters.fechaIngresoHasta);
            }

            filters.campos.forEach((campo) => params.append('campos', campo));

            const response = await apiFetch<{ data: ReporteRhResultados }>(
                `/api/MOD05/reporteRhResultados?${params.toString()}`,
            );

            setData(response.data || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [filters.estatus, filters.fechaIngresoDesde, filters.fechaIngresoHasta, filters.campos]);

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

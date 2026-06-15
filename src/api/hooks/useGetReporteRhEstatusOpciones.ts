'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ReporteRhEstatusInfo } from '@/api/graphql/MOD05';

interface UseGetReporteRhEstatusOpcionesReturn {
  data: ReporteRhEstatusInfo[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGetReporteRhEstatusOpciones(): UseGetReporteRhEstatusOpcionesReturn {
    const [data, setData] = useState<ReporteRhEstatusInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: ReporteRhEstatusInfo[] }>(
                '/api/MOD05/reporteRhEstatusOpciones',
            );

            setData(response.data || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

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

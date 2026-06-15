'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ManualesPorCategoria, ManualesFilterInput } from '@/api/graphql/MOD07';

interface UseGetManualesAgrupadosReturn {
  data: ManualesPorCategoria[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGetManualesAgrupados(filters?: ManualesFilterInput): UseGetManualesAgrupadosReturn {
    const [data, setData] = useState<ManualesPorCategoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            if (filters?.busqueda) {
                params.set('busqueda', filters.busqueda);
            }

            if (filters?.categoria) {
                params.set('categoria', filters.categoria);
            }

            const url = `/api/MOD07/manualesAgrupados${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiFetch<{ data: ManualesPorCategoria[] }>(url);

            setData(response.data || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

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

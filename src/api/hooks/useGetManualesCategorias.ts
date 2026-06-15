'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ManualCategoriaResumen } from '@/api/graphql/MOD07';

interface UseGetManualesCategoriasReturn {
  data: ManualCategoriaResumen[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGetManualesCategorias(): UseGetManualesCategoriasReturn {
    const [data, setData] = useState<ManualCategoriaResumen[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: ManualCategoriaResumen[] }>(
                '/api/MOD07/manualesCategorias'
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

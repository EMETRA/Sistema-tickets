'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ManualInfo } from '@/api/graphql/MOD07';

interface UseGetManualReturn {
  data: ManualInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGetManual(manualId: number | null | undefined): UseGetManualReturn {
    const [data, setData] = useState<ManualInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (manualId == null) {
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: ManualInfo }>(
                `/api/MOD07/manual?id=${encodeURIComponent(String(manualId))}`
            );

            setData(response.data || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [manualId]);

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

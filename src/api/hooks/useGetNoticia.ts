'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { NoticiaDetalle } from '@/api/graphql/COM03';

interface UseGetNoticiaReturn {
  data: NoticiaDetalle | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Obtiene el detalle de una noticia (COM03, modo edición).
 * Si `id` es null no hace la petición (modo creación).
 */
export function useGetNoticia(id: string | null): UseGetNoticiaReturn {
    const [data, setData] = useState<NoticiaDetalle | null>(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) {
            setData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: NoticiaDetalle }>(`/api/COM03/noticia/${encodeURIComponent(id)}`);
            setData(response.data ?? null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

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

'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { EtiquetaNoticia } from '@/api/graphql/COM03';

interface UseGetEtiquetasNoticiaReturn {
  data: EtiquetaNoticia[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Obtiene el catálogo de etiquetas de noticias (COM03).
 */
export function useGetEtiquetasNoticia(): UseGetEtiquetasNoticiaReturn {
    const [data, setData] = useState<EtiquetaNoticia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: EtiquetaNoticia[] }>('/api/COM03/etiquetas');
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

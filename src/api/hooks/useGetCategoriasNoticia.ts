'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { CategoriaNoticia } from '@/api/graphql/COM03';

interface UseGetCategoriasNoticiaReturn {
  data: CategoriaNoticia[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Obtiene el árbol de categorías de noticias (COM03).
 */
export function useGetCategoriasNoticia(): UseGetCategoriasNoticiaReturn {
    const [data, setData] = useState<CategoriaNoticia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: CategoriaNoticia[] }>('/api/COM03/categorias');
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

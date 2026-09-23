'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { NoticiaListItem, NoticiasFilterInput } from '@/api/graphql/COM03';

interface UseGetNoticiasReturn {
  data: NoticiaListItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Obtiene el listado de noticias (COM03).
 *
 * TODO [COM03-BACKEND]: hoy la vista llama sin filtros y filtra en cliente por tab y búsqueda
 * (no hay paginación). Si backend pagina o filtra, pasar `filters` desde la vista.
 */
export function useGetNoticias(filters?: NoticiasFilterInput): UseGetNoticiasReturn {
    const [data, setData] = useState<NoticiaListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            if (filters?.estado) {
                params.set('estado', filters.estado);
            }

            if (filters?.busqueda) {
                params.set('busqueda', filters.busqueda);
            }

            const url = `/api/COM03/noticias${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiFetch<{ data: NoticiaListItem[] }>(url);

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

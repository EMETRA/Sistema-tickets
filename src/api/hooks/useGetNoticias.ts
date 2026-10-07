'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { NoticiaListItem, NoticiasFilterInput } from '@/api/graphql/COM03';

export function useGetNoticias(filters?: NoticiasFilterInput) {
    const [data, setData] = useState<NoticiaListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const seq = useRef(0);
    const estado = filters?.estado || '', busqueda = filters?.busqueda || '';
    const page = filters?.page || 1, limit = filters?.limit || 20;
    const fetchData = useCallback(async () => {
        const current = ++seq.current;
        setLoading(true); setError(null);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (estado) params.set('estado', estado);
            if (busqueda) params.set('busqueda', busqueda);
            const response = await apiFetch<{ data: NoticiaListItem[]; total: number }>(`/api/COM03/noticias?${params}`);
            if (current !== seq.current) return;
            setData(response.data || []); setTotal(response.total);
        } catch (err) {
            if (current !== seq.current) return;
            setError(err instanceof Error ? err : new Error(String(err))); setData([]); setTotal(0);
        } finally { if (current === seq.current) setLoading(false); }
    }, [estado, busqueda, page, limit]);
    useEffect(() => { void fetchData(); return () => { seq.current++; }; }, [fetchData]);
    return { data, total, loading, error, refetch: fetchData };
}

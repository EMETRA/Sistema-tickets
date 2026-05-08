import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { TicketCategoria } from '@/api/graphql/catalogs';

export function useGetCategories() {
    const [data, setData] = useState<TicketCategoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ categories: TicketCategoria[] }>('/api/catalogs/categories');
            setData(response.categories || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

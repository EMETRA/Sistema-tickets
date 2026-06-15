import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { TicketPrioridad } from '@/api/graphql/catalogs';

export function useGetPriorities() {
    const [data, setData] = useState<TicketPrioridad[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ priorities: TicketPrioridad[] }>('/api/catalogs/priorities');
            setData(response.priorities || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

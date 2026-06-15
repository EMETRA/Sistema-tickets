import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { TicketEstado } from '@/api/graphql/catalogs';

export function useGetStatuses() {
    const [data, setData] = useState<TicketEstado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ statuses: TicketEstado[] }>('/api/catalogs/statuses');
            console.log("API response for statuses 😂:", response);
            setData(response.statuses || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

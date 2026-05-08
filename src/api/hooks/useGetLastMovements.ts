import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { MovementRow } from '@/api/graphql/admin-dashboard';

export function useGetLastMovements() {
    const [data, setData] = useState<MovementRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch('/api/admin-dashboard/last-movements') as unknown as MovementRow[];
            console.log('Respuesta de last-movements:', response);
            setData(response || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

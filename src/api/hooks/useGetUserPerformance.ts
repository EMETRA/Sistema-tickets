import { useState, useCallback } from 'react';
import { UserPerformanceResponse } from '@/api/graphql/admin-dashboard';

export function useGetUserPerformance() {
    const [data, setData] = useState<UserPerformanceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin-dashboard/user-performance');
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const result = await response.json();
            setData(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

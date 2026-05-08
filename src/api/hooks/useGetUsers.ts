'use client';

import { useState, useCallback, useEffect } from 'react';
import type { User, GetUsersResponse } from '@/api/graphql/users';

export function useGetUsers() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const result: GetUsersResponse = await response.json();
            setData(result.users || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

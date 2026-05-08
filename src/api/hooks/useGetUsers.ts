'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { User, GetUsersResponse } from '@/api/graphql/users';

export function useGetUsers() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ usersResponse: GetUsersResponse }>('/api/users');
            setData(response.usersResponse.users || []);
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

'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { RoleRow } from '@/api/graphql/rbac';

export function useGetRoles() {
    const [data, setData] = useState<RoleRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ roles: RoleRow[] }>('/api/rbac/roles');
            setData(response.roles || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

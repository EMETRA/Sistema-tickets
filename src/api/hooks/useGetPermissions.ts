'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { PermissionRow } from '@/api/graphql/configuration';

export function useGetPermissions() {
    const [data, setData] = useState<PermissionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ permissions: PermissionRow[] }>('/api/configuration/permissions');
            setData(response.permissions || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

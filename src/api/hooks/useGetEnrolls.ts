'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { EnrollRow } from '@/api/graphql/configuration';

export function useGetEnrolls() {
    const [data, setData] = useState<EnrollRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ enrolls: EnrollRow[] }>('/api/configuration/enrolls');
            setData(response.enrolls || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

'use client';

import { useState, useCallback } from 'react';
import type { EnrollRow } from '@/api/graphql/configuration';

export function useGetEnrolls() {
    const [data, setData] = useState<EnrollRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/configuration/enrolls');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
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

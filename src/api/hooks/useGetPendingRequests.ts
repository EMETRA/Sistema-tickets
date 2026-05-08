'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { PendingRequestRow } from '@/api/graphql/configuration';

export interface PendingRequestsFilters {
    limit?: number;
}

export function useGetPendingRequests(filters?: PendingRequestsFilters) {
    const [data, setData] = useState<PendingRequestRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (filters?.limit) params.append('limit', String(filters.limit));

            const url = `/api/configuration/pending-requests${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiFetch<{ pendingRequests: PendingRequestRow[] }>(url);
            setData(response.pendingRequests || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [filters?.limit]);

    // Auto-fetch cuando los filtros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

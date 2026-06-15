import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { TicketSummaryRow } from '@/api/graphql/admin-dashboard';

export interface LastTicketFilters {
    limit?: number;
}

export function useGetLastTicket(filters?: LastTicketFilters) {
    const [data, setData] = useState<TicketSummaryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (filters?.limit) params.append('limit', String(filters.limit));

            const url = `/api/admin-dashboard/last-ticket${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiFetch(url) as unknown as TicketSummaryRow[];
            setData(response || []);
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

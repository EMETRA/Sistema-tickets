'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { GetTicketStatusesResponse, TicketEstado } from '@/api/graphql/tickets';

export function useGetTicketStatuses() {
    const [data, setData] = useState<TicketEstado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ ticketStatusesResponse: GetTicketStatusesResponse }>('/api/ticket-statuses');
            setData(response.ticketStatusesResponse.ticketStatuses || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

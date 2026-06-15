'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { GetTicketPrioritiesResponse, TicketPrioridad } from '@/api/graphql/tickets';

export function useGetTicketPriorities() {
    const [data, setData] = useState<TicketPrioridad[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ ticketPrioritiesResponse: GetTicketPrioritiesResponse }>('/api/ticket-priorities');
            
            setData(response.ticketPrioritiesResponse.ticketPriorities || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

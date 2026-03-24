'use client';

import { useState, useCallback } from 'react';
import type { GetTicketPrioritiesResponse, TicketPrioridad } from '@/api/graphql/tickets';

export function useGetTicketPriorities() {
    const [data, setData] = useState<TicketPrioridad[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/ticket-priorities');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result: GetTicketPrioritiesResponse = await response.json();
            setData(result.ticketPriorities || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

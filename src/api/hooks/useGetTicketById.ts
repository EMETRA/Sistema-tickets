'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GetTicketByIdResponse, Ticket } from '@/api/graphql/tickets';

export function useGetTicketById(initialId?: string) {
    const [data, setData] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(
        async (id?: string) => {
            const ticketId = id || initialId;
            if (!ticketId) {
                setError(new Error('ID de ticket requerido'));
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/ticket/${ticketId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: GetTicketByIdResponse = await response.json();
                setData(result.ticket);
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
            } finally {
                setLoading(false);
            }
        },
        [initialId]
    );

    // Auto-fetch cuando el ID cambie
    useEffect(() => {
        if (initialId) {
            refetch();
        }
    }, [initialId, refetch]);

    return { data, loading, error, refetch };
}

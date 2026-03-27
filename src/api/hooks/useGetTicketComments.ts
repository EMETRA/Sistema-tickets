'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GetTicketCommentsResponse, TicketComentario } from '@/api/graphql/tickets';

export function useGetTicketComments(initialTicketId?: string) {
    const [data, setData] = useState<TicketComentario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(
        async (ticketId?: string) => {
            const id = ticketId || initialTicketId;
            if (!id) {
                setError(new Error('ID de ticket requerido'));
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/ticket-comments/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: GetTicketCommentsResponse = await response.json();
                setData(result.ticketComments || []);
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
            } finally {
                setLoading(false);
            }
        },
        [initialTicketId]
    );

    // Auto-fetch cuando el ID del ticket cambie
    useEffect(() => {
        if (initialTicketId) {
            refetch();
        }
    }, [initialTicketId, refetch]);

    return { data, loading, error, refetch };
}

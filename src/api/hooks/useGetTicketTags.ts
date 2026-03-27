'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GetTicketTagsResponse, TicketTag } from '@/api/graphql/tickets';

export function useGetTicketTags(initialTicketId?: string) {
    const [data, setData] = useState<TicketTag[]>([]);
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
                const response = await fetch(`/api/ticket-tags/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: GetTicketTagsResponse = await response.json();
                setData(result.ticketTags || []);
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

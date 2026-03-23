'use client';

import { useState, useCallback } from 'react';
import type { GetTicketAttachmentsResponse, TicketAdjunto } from '@/api/graphql/tickets';

export function useGetTicketAttachments(initialTicketId?: string) {
    const [data, setData] = useState<TicketAdjunto[]>([]);
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
                const response = await fetch(`/api/ticket-attachments/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: GetTicketAttachmentsResponse = await response.json();
                setData(result.ticketAttachments || []);
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
            } finally {
                setLoading(false);
            }
        },
        [initialTicketId]
    );

    return { data, loading, error, refetch };
}

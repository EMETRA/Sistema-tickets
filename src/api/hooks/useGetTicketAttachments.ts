'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { TicketAdjunto } from '@/api/graphql/tickets';

export function useGetTicketAttachments(initialTicketId?: string) {
    const [data, setData] = useState<TicketAdjunto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        // No hacer nada si no hay ticket ID
        if (!initialTicketId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ ticketAttachments: TicketAdjunto[] }>(`/api/ticket/${initialTicketId}/attachments`);

            setData(response.ticketAttachments || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [initialTicketId]);

    // Auto-fetch cuando el ID del ticket cambie
    useEffect(() => {
        if (initialTicketId) {
            refetch();
        }
    }, [initialTicketId, refetch]);

    return { data, loading, error, refetch };
}

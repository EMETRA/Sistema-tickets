'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { Ticket } from '@/api/graphql/tickets';

export function useGetTicketById(initialId?: string) {
    const [data, setData] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        // No hacer nada si no hay ticket ID
        if (!initialId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ ticket: Ticket | null }>(`/api/ticket/${initialId}`);

            setData(response.ticket || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [initialId]);

    // Auto-fetch cuando el ID cambie
    useEffect(() => {
        if (initialId) {
            refetch();
        }
    }, [initialId, refetch]);

    return { data, loading, error, refetch };
}

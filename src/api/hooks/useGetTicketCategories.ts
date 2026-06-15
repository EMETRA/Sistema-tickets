'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { GetTicketCategoriesResponse, TicketCategoria } from '@/api/graphql/tickets';

export function useGetTicketCategories() {
    const [data, setData] = useState<TicketCategoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ responseTicketCategories: GetTicketCategoriesResponse }>('/api/ticket-categories');

            setData(response.responseTicketCategories.ticketCategories || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

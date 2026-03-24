'use client';

import { useState, useCallback } from 'react';
import type { GetTicketCategoriesResponse, TicketCategoria } from '@/api/graphql/tickets';

export function useGetTicketCategories() {
    const [data, setData] = useState<TicketCategoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/ticket-categories');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result: GetTicketCategoriesResponse = await response.json();
            setData(result.ticketCategories || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}

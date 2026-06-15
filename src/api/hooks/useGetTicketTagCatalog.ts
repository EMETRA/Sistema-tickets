'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import type { TicketTag } from '@/api/graphql/tickets';

export function useGetTicketTagCatalog() {
    const [data, setData] = useState<TicketTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<Record<string, unknown>>('/api/ticket-tag-catalog');
            setData((response.ticketTagCatalog as TicketTag[]) || []);        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

'use client';

/**
 * Hook useGetTicketMessages
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/ticket/{id}/messages')
 * 2. Route handler ejecuta GET_TICKET_MESSAGES_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState, useCallback, useEffect } from 'react';
import { type TicketChatMessage } from '@/api/graphql/tickets';

/**
 * Hook para obtener los mensajes del chat de un ticket específico
 * @param initialTicketId ID del ticket (string)
 * @returns { data, loading, error, refetch }
 */
export function useGetTicketMessages(initialTicketId?: string) {
    const [data, setData] = useState<TicketChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        // No hacer nada si no hay ticket ID
        if (!initialTicketId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/ticket/${initialTicketId}/messages`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.ticketMessages || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [initialTicketId]);

    // Auto-fetch cuando el ID del ticket cambia
    useEffect(() => {
        if (initialTicketId) {
            refetch();
        }
    }, [refetch, initialTicketId]);

    return { data, loading, error, refetch };
}

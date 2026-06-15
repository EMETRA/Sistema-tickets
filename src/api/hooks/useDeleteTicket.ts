'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { DELETE_TICKET_MUTATION } from '@/api/graphql/tickets/deleteTicket';
import { type DeleteTicketResponse } from '@/api/graphql/tickets/types';

export function useDeleteTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteTicket = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<DeleteTicketResponse>(
                DELETE_TICKET_MUTATION,
                { variables: { id } }
            );
            return result.deleteTicket;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteTicket, loading, error };
}
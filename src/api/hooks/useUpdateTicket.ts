'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { UPDATE_TICKET_MUTATION } from '@/api/graphql/tickets/updateTicket';
import { type UpdateTicketInput, type UpdateTicketResponse } from '@/api/graphql/tickets/types';

export function useUpdateTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateTicket = useCallback(async (id: string, input: UpdateTicketInput) => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<UpdateTicketResponse>(
                UPDATE_TICKET_MUTATION,
                { variables: { id, input } }
            );
            return result.updateTicket;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateTicket, loading, error };
}
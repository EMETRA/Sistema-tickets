'use client';

import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_TICKET_MUTATION } from '@/api/graphql/tickets/createTicket';
import { 
    type CreateTicketInput, 
    type CreateTicketResponse 
} from '@/api/graphql/tickets/types';

export function useCreateTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

        
    const createTicket = useCallback(
        async (input: CreateTicketInput) => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequest<CreateTicketResponse>(
                    CREATE_TICKET_MUTATION,
                    { variables: { input } }
                );
                setLoading(false);
                return result.createTicket;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { createTicket, loading, error };
}
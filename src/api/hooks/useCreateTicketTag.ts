'use client';

import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_TICKET_TAG_MUTATION } from '@/api/graphql/tickets/createTicketTag';
import { 
    type TicketTag, 
    type CreateTicketTagResponse 
} from '@/api/graphql/tickets/types';

export function useCreateTicketTag() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createTag = useCallback(
        async (nombre: string, color?: string): Promise<TicketTag> => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequest<Record<string, unknown>>(
                    CREATE_TICKET_TAG_MUTATION,
                    { variables: { nombre, color } }
                );
                
                const typedResult = result as unknown as CreateTicketTagResponse;
                setLoading(false);
                return typedResult.createTicketTag;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { createTag, loading, error };
}
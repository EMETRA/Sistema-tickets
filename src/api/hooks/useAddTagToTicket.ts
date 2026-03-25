'use client';

import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { ADD_TAG_TO_TICKET_MUTATION } from '@/api/graphql/tickets/addTagToTicket';
import { type AddTagToTicketResponse } from '@/api/graphql/tickets/types';

export function useAddTagToTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const addTag = useCallback(
        async (ticketId: string, tagId: number) => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequest<Record<string, unknown>>(
                    ADD_TAG_TO_TICKET_MUTATION,
                    { variables: { ticketId, tagId } }
                );
                
                const typedResult = result as unknown as AddTagToTicketResponse;
                setLoading(false);
                return typedResult.addTagToTicket;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { addTag, loading, error };
}
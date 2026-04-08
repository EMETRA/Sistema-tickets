'use client';

import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { REMOVE_TAG_FROM_TICKET_MUTATION } from '@/api/graphql/tickets/removeTagFromTicket';
import { type RemoveTagFromTicketResponse } from '@/api/graphql/tickets/types';

export function useRemoveTagFromTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const removeTag = useCallback(
        async (ticketId: string, tagId: number): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                // Patrón de la guía: Record -> unknown -> Response
                const result = await graphqlRequest<Record<string, unknown>>(
                    REMOVE_TAG_FROM_TICKET_MUTATION,
                    { variables: { ticketId, tagId } }
                );
                
                const typedResult = result as unknown as RemoveTagFromTicketResponse;
                setLoading(false);
                
                // Retorna true si fue exitoso según el schema
                return typedResult.removeTagFromTicket;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { removeTag, loading, error };
}
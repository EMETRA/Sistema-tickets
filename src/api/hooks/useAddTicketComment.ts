'use client';

import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { ADD_TICKET_COMMENT_MUTATION } from '@/api/graphql/tickets/addTicketComment';
import { 
    type AddTicketCommentInput, 
    type AddTicketCommentResponse,
    type TicketComentario
} from '@/api/graphql/tickets/types';

export function useAddTicketComment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const addComment = useCallback(
        async (input: AddTicketCommentInput): Promise<TicketComentario> => {
            setLoading(true);
            setError(null);

            try {
                // Aplicamos la técnica de la guía: Record -> unknown -> Response
                const result = await graphqlRequest<Record<string, unknown>>(
                    ADD_TICKET_COMMENT_MUTATION,
                    { variables: { input } }
                );
                
                const typedResult = result as unknown as AddTicketCommentResponse;
                setLoading(false);
                return typedResult.addTicketComment;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { addComment, loading, error };
}
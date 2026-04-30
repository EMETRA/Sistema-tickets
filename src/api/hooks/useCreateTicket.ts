'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import { CREATE_TICKET_MUTATION } from '@/api/graphql/tickets/createTicket';
import {
    type CreateTicketInput,
    type CreateTicketResponse,
} from '@/api/graphql/tickets/types';

export function useCreateTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const createTicket = useCallback(
        async (input: CreateTicketInput, files?: File[]) => {
            setLoading(true);
            setError(null);
            setUploadProgress(0);

            try {
                const result = await graphqlRequestClient<CreateTicketResponse>(
                    CREATE_TICKET_MUTATION,
                    {
                        variables: { input },
                        files: files ?? [],
                        onProgress: (percent) => setUploadProgress(percent),
                    }
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

    return { createTicket, loading, error, uploadProgress };
}
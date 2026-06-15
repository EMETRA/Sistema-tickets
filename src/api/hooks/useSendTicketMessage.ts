'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import { SEND_TICKET_MESSAGE_MUTATION } from '@/api/graphql/tickets/sendTicketMessage';
import {
    type SendTicketMessageInput,
    type SendTicketMessageResponse,
    type TicketChatMessage
} from '@/api/graphql/tickets/types';

export function useSendTicketMessage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const sendMessage = useCallback(
        async (input: SendTicketMessageInput, files?: File[]): Promise<TicketChatMessage> => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequestClient<Record<string, unknown>>(
                    SEND_TICKET_MESSAGE_MUTATION,
                    {
                        variables: { 
                            input, 
                            files: files && files.length > 0 ? files.map(() => null) : undefined 
                        },
                        files: files && files.length > 0 ? files : undefined,
                    }
                );

                const typedResult = result as unknown as SendTicketMessageResponse;
                setLoading(false);
                return typedResult.sendTicketMessage;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { sendMessage, loading, error };
}
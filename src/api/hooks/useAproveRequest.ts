'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { APROVE_REQUEST_MUTATION } from '@/api/graphql/configuration/aproveRequest';
import { type AproveRequestResponse, type OperationResponse } from '@/api/graphql/configuration/types';

export function useAproveRequest() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const aproveRequest = useCallback(async (ids: number[]): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            // Patrón: Record -> unknown -> Response para evitar el error de ts(2344)
            const result = await graphqlRequest<Record<string, unknown>>(
                APROVE_REQUEST_MUTATION,
                { variables: { ids } }
            );
            const typedResult = result as unknown as AproveRequestResponse;
            return typedResult.aproveRequest;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { aproveRequest, loading, error };
}
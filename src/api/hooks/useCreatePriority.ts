'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_PRIORITY_MUTATION } from '@/api/graphql/catalogs/createPriority';
import { type CreatePriorityInput, type CreatePriorityResponse, type OperationResponse } from '@/api/graphql/catalogs/types';

export function useCreatePriority() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createPriority = useCallback(async (input: CreatePriorityInput): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                CREATE_PRIORITY_MUTATION,
                { variables: { input } }
            );
            const typedResult = result as unknown as CreatePriorityResponse;
            return typedResult.createPriority;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createPriority, loading, error };
}
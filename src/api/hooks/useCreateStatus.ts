'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_STATUS_MUTATION } from '@/api/graphql/catalogs/createStatus';
import { type CreateStatusInput, type CreateStatusResponse, type OperationResponse } from '@/api/graphql/catalogs/types';

export function useCreateStatus() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createStatus = useCallback(async (input: CreateStatusInput): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                CREATE_STATUS_MUTATION,
                { variables: { input } }
            );
            const typedResult = result as unknown as CreateStatusResponse;
            return typedResult.createStatus;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createStatus, loading, error };
}
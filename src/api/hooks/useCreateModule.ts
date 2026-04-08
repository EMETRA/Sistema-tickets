'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_MODULE_MUTATION } from '@/api/graphql/rbac/createModule';
import { type CreateModuleInput, type CreateModuleResponse, type OperationResponse } from '@/api/graphql/rbac/types';

export function useCreateModule() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createModule = useCallback(async (input: CreateModuleInput): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                CREATE_MODULE_MUTATION,
                { variables: { ...input } }
            );
            const typedResult = result as unknown as CreateModuleResponse;
            return typedResult.createModule;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createModule, loading, error };
}
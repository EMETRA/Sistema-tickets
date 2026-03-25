'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_CATEGORY_MUTATION } from '@/api/graphql/catalogs/createCategory';
import { type CreateCategoryInput, type CreateCategoryResponse, type OperationResponse } from '@/api/graphql/catalogs/types';

export function useCreateCategory() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createCategory = useCallback(async (input: CreateCategoryInput): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                CREATE_CATEGORY_MUTATION,
                { variables: { input } }
            );
            const typedResult = result as unknown as CreateCategoryResponse;
            return typedResult.createCategory;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createCategory, loading, error };
}
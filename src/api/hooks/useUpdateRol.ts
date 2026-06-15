'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { UPDATE_ROL_MUTATION } from '@/api/graphql/rbac/updateRol';
import { type UpdateRolResponse, type UpdateRolInput, type OperationResponse } from '@/api/graphql/rbac/types';

export function useUpdateRol() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateRol = useCallback(async (id_rol: number, input: UpdateRolInput): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                UPDATE_ROL_MUTATION,
                { variables: { id_rol, ...input } }
            );
            const typedResult = result as unknown as UpdateRolResponse;
            return typedResult.updateRol;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateRol, loading, error };
}
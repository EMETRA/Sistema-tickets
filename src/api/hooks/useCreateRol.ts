'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { CREATE_ROL_MUTATION } from '@/api/graphql/rbac/createRol';
import { type CreateRolResponse, type OperationResponse } from '@/api/graphql/rbac/types';

export function useCreateRol() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createRol = useCallback(async (nombre_rol: string, descripcion?: string): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                CREATE_ROL_MUTATION,
                { variables: { nombre_rol, descripcion } }
            );
            const typedResult = result as unknown as CreateRolResponse;
            return typedResult.createRol;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createRol, loading, error };
}
'use client';
import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { REQUEST_PERMISSION_MUTATION } from '@/api/graphql/configuration/requestPermission';
import { type RequestPermissionResponse, type OperationResponse } from '@/api/graphql/configuration/types';

export function useRequestPermission() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const requestPermission = useCallback(async (id_usuario: number, id_modulo: number, motivo: string): Promise<OperationResponse> => {
        setLoading(true);
        setError(null);
        try {
            const result = await graphqlRequest<Record<string, unknown>>(
                REQUEST_PERMISSION_MUTATION,
                { variables: { id_usuario, id_modulo, motivo } }
            );
            const typedResult = result as unknown as RequestPermissionResponse;
            return typedResult.requestPermission;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { requestPermission, loading, error };
}
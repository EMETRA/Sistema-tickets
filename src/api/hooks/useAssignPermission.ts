'use client';

import { useCallback, useState } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { ASSIGN_PERMISSION_MUTATION } from '@/api/graphql/rbac/assignPermission';
import { type AssignPermissionResponse, type OperationResponse } from '@/api/graphql/rbac/types';

export function useAssignPermission() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const assignPermission = useCallback(
        async (id_usuario: number, permisos: string[]): Promise<OperationResponse> => {
            setLoading(true);
            setError(null);

            try {
                // Aplicamos el patrón Record -> unknown -> Response para evitar errores de TS
                const result = await graphqlRequest<Record<string, unknown>>(
                    ASSIGN_PERMISSION_MUTATION,
                    { variables: { id_usuario, permisos } }
                );
                
                const typedResult = result as unknown as AssignPermissionResponse;
                setLoading(false);
                return typedResult.assignPermission;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { assignPermission, loading, error };
}
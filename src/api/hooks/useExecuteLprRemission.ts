'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import type {
    ExecuteLprRemissionInput,
    ExecuteLprRemissionResponse,
} from '@/api/graphql/apps/types';
import { EXECUTE_LPR_REMISSION_MUTATION } from '../graphql/apps/executeLprRemissionMutation';

export function useExecuteLprRemission() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const executeLprRemission = useCallback(
        async (input: ExecuteLprRemissionInput) => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequestClient<ExecuteLprRemissionResponse>(
                    EXECUTE_LPR_REMISSION_MUTATION,
                    { variables: { input } }
                );
                setLoading(false);
                return result.ejecutarGrabacionRemisionLpr;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { executeLprRemission, loading, error };
}
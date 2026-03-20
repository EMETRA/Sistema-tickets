'use client';

import { useState, useCallback } from 'react';
import { graphqlRequest } from '@/api/graphql/client';
import { ErrorHandler } from '@/api/graphql/errors';

/**
 * Estado de una mutation
 */
export interface MutationState<TData extends Record<string, unknown>> {
  data: TData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Opciones del hook
 */
export interface UseMutationOptions<TData extends Record<string, unknown>> {
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: string) => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
}

/**
 * Hook useMutation
 */
export function useMutation<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TVariables extends Record<string, unknown> = Record<string, unknown>
>(
    mutation: string,
    options?: UseMutationOptions<TData>
) {
    const [state, setState] = useState<MutationState<TData>>({
        data: null,
        loading: false,
        error: null,
    });

    /**
     * Ejecutar mutation
     */
    const execute = useCallback(
        async (variables?: TVariables) => {
            setState({
                data: null,
                loading: true,
                error: null,
            });

            try {
                const result = await graphqlRequest<TData>(
                    mutation,
                    {
                        variables,
                    }
                );

                setState({
                    data: result,
                    loading: false,
                    error: null,
                });

                // Callback de éxito
                if (options?.onSuccess) {
                    await options.onSuccess(result);
                }

                return result;
            } catch (err: unknown) {
                const errorMessage = ErrorHandler.getUserMessage(err);

                setState({
                    data: null,
                    loading: false,
                    error: errorMessage,
                });

                // Callback de error
                if (options?.onError) {
                    await options.onError(errorMessage);
                }

                throw err;
            } finally {
                // Callback de finalización
                if (options?.onSettled) {
                    await options.onSettled();
                }
            }
        },
        [mutation, options]
    );

    /**
   * Resetear estado
   */
    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

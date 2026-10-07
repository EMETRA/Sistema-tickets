'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import {
    GUARDAR_NOTICIA_CMS_MUTATION,
    toNoticiaCmsError,
    type GuardarNoticiaCmsResponse,
    type GuardarNoticiaCmsResult,
    type GuardarNoticiaCmsVariables,
    type NoticiaCmsError,
} from '@/api/graphql/COM03';
import { USAR_SIMULACION, simularGuardarNoticiaCms } from '@/api/graphql/COM03/mutations.dummy';

/**
 * Crea o actualiza una noticia con `guardarNoticiaCms` (README "Noticias CMS", 2026-10-06).
 * Devuelve el resultado ("guardada" | "publicada", idempotente). Si falla, lanza NoticiaCmsError
 * con el código o el estado del README.
 * Con USAR_SIMULACION = true usa la simulación (mutations.dummy.ts) en lugar de la API.
 */
export function useGuardarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<NoticiaCmsError | null>(null);

    const guardarNoticia = useCallback(
        async (variables: GuardarNoticiaCmsVariables): Promise<GuardarNoticiaCmsResult> => {
            setLoading(true);
            setError(null);

            try {
                const result = USAR_SIMULACION
                    ? await simularGuardarNoticiaCms(variables)
                    : await graphqlRequestClient<GuardarNoticiaCmsResponse>(
                        GUARDAR_NOTICIA_CMS_MUTATION,
                        { variables: { input: variables.input } }
                    );
                setLoading(false);
                return result.guardarNoticiaCms;
            } catch (err) {
                const cmsError = toNoticiaCmsError(err);
                setError(cmsError);
                setLoading(false);
                throw cmsError;
            }
        },
        []
    );

    return { guardarNoticia, loading, error };
}

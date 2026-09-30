'use client';

import { useCallback, useState } from 'react';
// TODO [COM03-BACKEND]: descomentar cuando `guardarNoticiaCms` esté disponible en api-tickets.
// import { graphqlRequestClient } from '@/api/graphql/client';
// import { GUARDAR_NOTICIA_CMS_MUTATION } from '@/api/graphql/COM03';
import {
    toNoticiaCmsError,
    type GuardarNoticiaCmsResult,
    type GuardarNoticiaCmsVariables,
    type NoticiaCmsError,
} from '@/api/graphql/COM03';
import { simularGuardarNoticiaCms } from '@/api/graphql/COM03/mutations.dummy';

/**
 * Crea o actualiza una noticia con `guardarNoticiaCms` (README de backend).
 * Devuelve el resultado ("guardada" | "publicada", idempotente). Si falla, lanza NoticiaCmsError
 * con el código del README cuando se reconoce.
 */
export function useGuardarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<NoticiaCmsError | null>(null);

    const guardarNoticia = useCallback(
        async (variables: GuardarNoticiaCmsVariables): Promise<GuardarNoticiaCmsResult> => {
            setLoading(true);
            setError(null);

            try {
                // TODO [COM03-BACKEND]: reemplazar la simulación por la llamada real:
                // const result = await graphqlRequestClient<GuardarNoticiaCmsResponse>(
                //     GUARDAR_NOTICIA_CMS_MUTATION,
                //     { variables }
                // );
                const result = await simularGuardarNoticiaCms(variables);
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

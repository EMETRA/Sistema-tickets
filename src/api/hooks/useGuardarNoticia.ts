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

/**
 * Crea o actualiza una noticia con `guardarNoticiaCms` (README "Noticias CMS", 2026-10-06).
 * Devuelve el resultado ("guardada" | "publicada", idempotente). Si falla, lanza NoticiaCmsError
 * con el código o el estado del README.
 * Las respuestas y errores siempre provienen de la API real.
 */
export function useGuardarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<NoticiaCmsError | null>(null);

    const guardarNoticia = useCallback(
        async (variables: GuardarNoticiaCmsVariables): Promise<GuardarNoticiaCmsResult> => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequestClient<GuardarNoticiaCmsResponse>(
                        GUARDAR_NOTICIA_CMS_MUTATION,
                        { variables: { input: {
                            ...variables.input,
                            estado: variables.input.estado.toUpperCase(),
                            visibilidad: variables.input.visibilidad.toUpperCase(),
                        } } }
                    );
                result.guardarNoticiaCms.noticia.estado = result.guardarNoticiaCms.noticia.estado.toLowerCase() as typeof variables.input.estado;
                result.guardarNoticiaCms.noticia.visibilidad = result.guardarNoticiaCms.noticia.visibilidad.toLowerCase() as typeof variables.input.visibilidad;
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

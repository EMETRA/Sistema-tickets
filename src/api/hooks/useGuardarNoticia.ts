'use client';

import { useCallback, useState } from 'react';
// TODO [COM03-BACKEND]: descomentar cuando exista la mutación `guardarNoticia` en backend.
// import { graphqlRequestClient } from '@/api/graphql/client';
// import { GUARDAR_NOTICIA_MUTATION } from '@/api/graphql/COM03';
import {
    AccionNoticia,
    EstadoNoticia,
    type GuardarNoticiaInput,
    type GuardarNoticiaResponse,
} from '@/api/graphql/COM03';
import { simularMutacion } from '@/api/graphql/COM03/mutations.dummy';

const ESTADO_POR_ACCION: Record<AccionNoticia, EstadoNoticia> = {
    [AccionNoticia.BORRADOR]: EstadoNoticia.BORRADOR,
    [AccionNoticia.PUBLICAR]: EstadoNoticia.PUBLICADA,
    [AccionNoticia.PROGRAMAR]: EstadoNoticia.PROGRAMADA,
};

/**
 * Crea o actualiza una noticia (borrador, publicar o programar) con sus archivos.
 * Va directo a GraphQL desde el cliente (multipart por XHR con fileMap), igual que la creación de tickets.
 */
export function useGuardarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const guardarNoticia = useCallback(
        async (input: GuardarNoticiaInput, files: File[], fileMap: Record<string, string[]>) => {
            setLoading(true);
            setError(null);
            setUploadProgress(0);

            try {
                // TODO [COM03-BACKEND]: reemplazar la simulación por la llamada real:
                // const result = await graphqlRequestClient<GuardarNoticiaResponse>(
                //     GUARDAR_NOTICIA_MUTATION,
                //     {
                //         variables: { input },
                //         files,
                //         fileMap,
                //         onProgress: (percent) => setUploadProgress(percent),
                //     }
                // );
                void files;
                void fileMap;
                const result = await simularMutacion<GuardarNoticiaResponse>({
                    guardarNoticia: {
                        id: input.id ?? `nueva-${Date.now()}`,
                        estado: ESTADO_POR_ACCION[input.accion],
                    },
                });
                setLoading(false);
                return result.guardarNoticia;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { guardarNoticia, loading, error, uploadProgress };
}

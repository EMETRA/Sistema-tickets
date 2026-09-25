'use client';

import { useCallback, useState } from 'react';
// TODO [COM03-BACKEND]: descomentar cuando exista la mutación `archivarNoticia` en backend.
// import { graphqlRequestClient } from '@/api/graphql/client';
// import { ARCHIVAR_NOTICIA_MUTATION } from '@/api/graphql/COM03';
import { EstadoNoticia, type ArchivarNoticiaResponse } from '@/api/graphql/COM03';
import { simularMutacion } from '@/api/graphql/COM03/mutations.dummy';

/**
 * Archiva una noticia publicada o programada.
 */
export function useArchivarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const archivarNoticia = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            // TODO [COM03-BACKEND]: reemplazar la simulación por la llamada real:
            // const result = await graphqlRequestClient<ArchivarNoticiaResponse>(
            //     ARCHIVAR_NOTICIA_MUTATION,
            //     { variables: { id } }
            // );
            const result = await simularMutacion<ArchivarNoticiaResponse>({
                archivarNoticia: { id, estado: EstadoNoticia.ARCHIVADA },
            });
            return result.archivarNoticia;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { archivarNoticia, loading, error };
}

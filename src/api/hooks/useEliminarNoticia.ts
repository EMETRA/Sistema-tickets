'use client';

import { useCallback, useState } from 'react';
// TODO [COM03-BACKEND]: descomentar cuando exista la mutación `eliminarNoticia` en backend.
// import { graphqlRequestClient } from '@/api/graphql/client';
// import { ELIMINAR_NOTICIA_MUTATION } from '@/api/graphql/COM03';
import type { EliminarNoticiaResponse } from '@/api/graphql/COM03';
import { simularMutacion } from '@/api/graphql/COM03/mutations.dummy';

/**
 * Elimina un borrador.
 */
export function useEliminarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const eliminarNoticia = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            // TODO [COM03-BACKEND]: reemplazar la simulación por la llamada real:
            // const result = await graphqlRequestClient<EliminarNoticiaResponse>(
            //     ELIMINAR_NOTICIA_MUTATION,
            //     { variables: { id } }
            // );
            void id;
            const result = await simularMutacion<EliminarNoticiaResponse>({ eliminarNoticia: true });
            return result.eliminarNoticia;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { eliminarNoticia, loading, error };
}

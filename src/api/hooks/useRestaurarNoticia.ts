'use client';

import { useCallback, useState } from 'react';
// TODO [COM03-BACKEND]: descomentar cuando exista la mutación `restaurarNoticia` en backend.
// import { graphqlRequestClient } from '@/api/graphql/client';
// import { RESTAURAR_NOTICIA_MUTATION } from '@/api/graphql/COM03';
import { EstadoNoticia, type RestaurarNoticiaResponse } from '@/api/graphql/COM03';
import { simularMutacion } from '@/api/graphql/COM03/mutations.dummy';

/**
 * Restaura una noticia archivada; vuelve a BORRADOR.
 */
export function useRestaurarNoticia() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const restaurarNoticia = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            // TODO [COM03-BACKEND]: reemplazar la simulación por la llamada real:
            // const result = await graphqlRequestClient<RestaurarNoticiaResponse>(
            //     RESTAURAR_NOTICIA_MUTATION,
            //     { variables: { id } }
            // );
            const result = await simularMutacion<RestaurarNoticiaResponse>({
                restaurarNoticia: { id, estado: EstadoNoticia.BORRADOR },
            });
            return result.restaurarNoticia;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { restaurarNoticia, loading, error };
}

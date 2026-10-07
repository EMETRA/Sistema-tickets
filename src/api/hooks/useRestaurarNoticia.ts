'use client';

import { useCallback } from 'react';
import { createIdempotencyKey } from '@/helpers/createIdempotencyKey';
import { cambioEstadoInput, type NoticiaListItem } from '@/api/graphql/COM03';
import { useGuardarNoticia } from './useGuardarNoticia';

/**
 * Restaura una noticia archivada: `guardarNoticiaCms` con estado "borrador" (decisión del front:
 * así se puede editar y volver a publicar). README sección 3: no deshace un push ya enviado.
 * Cada confirmación es un intento nuevo: clave nueva. Si falla, lanza NoticiaCmsError.
 */
export function useRestaurarNoticia() {
    const { guardarNoticia, loading, error } = useGuardarNoticia();

    const restaurarNoticia = useCallback(
        (noticia: NoticiaListItem) => guardarNoticia({
            input: cambioEstadoInput(noticia, 'borrador', createIdempotencyKey()),
        }),
        [guardarNoticia]
    );

    return { restaurarNoticia, loading, error };
}

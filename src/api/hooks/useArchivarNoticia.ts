'use client';

import { useCallback } from 'react';
import { createIdempotencyKey } from '@/helpers/createIdempotencyKey';
import { cambioEstadoInput, type NoticiaListItem } from '@/api/graphql/COM03';
import { useGuardarNoticia } from './useGuardarNoticia';

/**
 * Archiva una noticia publicada o programada: `guardarNoticiaCms` con estado "archivada"
 * (README "Noticias CMS", 2026-10-06). Deja de mostrarse en el Portal.
 * Cada confirmación es un intento nuevo: clave nueva. Si falla, lanza NoticiaCmsError.
 */
export function useArchivarNoticia() {
    const { guardarNoticia, loading, error } = useGuardarNoticia();

    const archivarNoticia = useCallback(
        (noticia: NoticiaListItem) => guardarNoticia({
            input: cambioEstadoInput(noticia, 'archivada', createIdempotencyKey()),
        }),
        [guardarNoticia]
    );

    return { archivarNoticia, loading, error };
}

import { VisibilidadNoticia, type GuardarNoticiaCmsInput, type NoticiaListItem } from './types';

/**
 * Input de `guardarNoticiaCms` para cambiar solo el estado de una noticia ya guardada
 * (archivar → "archivada", restaurar → "borrador"), desde una fila del listado.
 * README "Noticias CMS" (2026-10-06): con `id` se actualiza. Se envían los campos obligatorios
 * (slug, titulo, estado, visibilidad, idioma) y nada más: los que no se envían no cambian
 * (sin `secciones` se conservan las secciones).
 * TODO [COM03-BACKEND]: confirmar con backend que un update parcial conserva el resto de campos
 * y que "archivada" → "borrador" está permitido.
 */
export function cambioEstadoInput(
    noticia: Pick<NoticiaListItem, 'id' | 'slug' | 'titulo' | 'idioma' | 'visibilidad'>,
    estado: 'archivada' | 'borrador',
    claveIdempotente: string,
): GuardarNoticiaCmsInput {
    return {
        claveIdempotente,
        id: Number(noticia.id),
        slug: noticia.slug,
        titulo: noticia.titulo,
        estado,
        visibilidad: noticia.visibilidad === VisibilidadNoticia.PRIVADA ? 'privada' : 'publica',
        idioma: noticia.idioma,
    };
}

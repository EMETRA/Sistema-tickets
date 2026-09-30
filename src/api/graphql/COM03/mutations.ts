/**
 * Mutaciones GraphQL de COM03 - Comunicación / Noticias
 *
 * `guardarNoticiaCms` sigue el README de backend. Archivar, restaurar y eliminar siguen siendo
 * propuestas: TODO [COM03-BACKEND] hoy solo existen en REST de Portal con la key interna
 * (archivar y eliminar) y restaurar no existe; consultado con backend.
 */

/**
 * Crea (sin `noticia.id`) o actualiza una noticia en api-tickets (README de backend, 2026-09-30).
 * El `estado` del input define si queda como borrador, programada o publicada.
 * Una mutación = una sola llamada interna a Portal.
 */
export const GUARDAR_NOTICIA_CMS_MUTATION = `
  mutation GuardarNoticia($claveIdempotente: String!, $noticia: NoticiaCmsInput!) {
    guardarNoticiaCms(claveIdempotente: $claveIdempotente, noticia: $noticia) {
      resultado
      idempotente
      noticia {
        id
        slug
        idioma
        estado
        visibilidad
        fecha_publicacion
      }
      publicacion {
        idNoticia
        version
        claveIdempotente
        idEvento
        idUsuario
      }
    }
  }
`;

/**
 * Archiva una noticia publicada o programada (deja de mostrarse en el Portal).
 */
export const ARCHIVAR_NOTICIA_MUTATION = `
  mutation ArchivarNoticia($id: ID!) {
    archivarNoticia(id: $id) {
      id
      estado
    }
  }
`;

/**
 * Restaura una noticia archivada. Vuelve a BORRADOR (decisión del front): así se puede
 * editar y volver a publicar, o eliminar (solo se eliminan borradores).
 */
export const RESTAURAR_NOTICIA_MUTATION = `
  mutation RestaurarNoticia($id: ID!) {
    restaurarNoticia(id: $id) {
      id
      estado
    }
  }
`;

/**
 * Elimina un borrador. No se puede deshacer.
 */
export const ELIMINAR_NOTICIA_MUTATION = `
  mutation EliminarNoticia($id: ID!) {
    eliminarNoticia(id: $id)
  }
`;

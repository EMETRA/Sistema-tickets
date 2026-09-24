/**
 * Mutaciones GraphQL de COM03 - Comunicación / Noticias
 *
 * TODO [COM03-BACKEND]: mutaciones propuestas, confirmar nombres, inputs y respuestas.
 */

/**
 * Crea o actualiza una noticia y la deja como borrador, publicada o programada según `accion`.
 * Los archivos nuevos se envían por multipart (fileMap apunta a los campos `archivo`).
 */
export const GUARDAR_NOTICIA_MUTATION = `
  mutation GuardarNoticia($input: GuardarNoticiaInput!) {
    guardarNoticia(input: $input) {
      id
      estado
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

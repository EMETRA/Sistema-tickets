/**
 * Mutaciones GraphQL de COM03 - Comunicación / Noticias
 *
 * `guardarNoticiaCms` sigue el README de backend. Archivar y restaurar también usan
 * `guardarNoticiaCms` (cambian el `estado`; ver cambioEstado.ts). No hay eliminar: el Panel
 * archiva, no borra (README "Noticias CMS" sección 3).
 */

/**
 * Crea (sin `input.id`) o actualiza una noticia en api-tickets.
 * README "Noticias CMS — contrato para frontend" (2026-10-06), sección 3.
 * El `estado` del input define si queda como borrador, programada, publicada o archivada.
 * Una llamada = un intento de guardado.
 */
export const GUARDAR_NOTICIA_CMS_MUTATION = `
  mutation GuardarNoticia($input: GuardarNoticiaCmsInput!) {
    guardarNoticiaCms(input: $input) {
      resultado
      idempotente
      noticia {
        id
        slug
        idioma
        estado
        visibilidad
        fechaPublicacion
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

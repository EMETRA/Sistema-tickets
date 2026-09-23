/**
 * Query GraphQL para obtener el detalle de una noticia (modo edición)
 *
 * TODO [COM03-BACKEND]: query propuesta a partir del modelo de datos, confirmar nombre y campos.
 *
 * Parámetros:
 * - id: ID!
 *
 * Retorna:
 * - datos generales, categoría/subcategoría, etiquetas, recurso principal, secciones, galería y adjuntos
 */
const RECURSO_FIELDS = `
  id
  tipo
  url
  tipoMime
  ancho
  alto
  duracionSegundos
  textoAlternativo
  pieImagen
  creditos
`;

export const GET_NOTICIA_QUERY = `
  query Noticia($id: ID!) {
    noticia(id: $id) {
      id
      estado
      titulo
      resumen
      autor
      categoriaId
      subcategoriaId
      etiquetaIds
      idioma
      visibilidad
      fechaPublicacion
      slug
      tiempoLectura
      recursoPrincipal { ${RECURSO_FIELDS} }
      secciones {
        id
        orden
        encabezado
        contenidoHtml
        recurso { ${RECURSO_FIELDS} }
      }
      galeria { ${RECURSO_FIELDS} }
      adjuntos { ${RECURSO_FIELDS} }
    }
  }
`;

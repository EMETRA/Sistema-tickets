/**
 * Queries GraphQL de catálogos del formulario de noticias
 *
 * TODO [COM03-BACKEND]: queries propuestas a partir de TB_CATEGORIA y TB_ETIQUETA,
 * confirmar nombres de las operaciones y campos.
 */

/**
 * Árbol de categorías (TB_CATEGORIA). Las raíces tienen categoriaPadreId = null.
 */
export const GET_CATEGORIAS_NOTICIA_QUERY = `
  query CategoriasNoticia {
    categoriasNoticia {
      id
      nombre
      slug
      categoriaPadreId
    }
  }
`;

/**
 * Catálogo de etiquetas (TB_ETIQUETA).
 */
export const GET_ETIQUETAS_NOTICIA_QUERY = `
  query EtiquetasNoticia {
    etiquetasNoticia {
      id
      nombre
      slug
    }
  }
`;

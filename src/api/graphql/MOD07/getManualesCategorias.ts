/**
 * Query GraphQL para obtener categorías de manuales
 *
 */
export const GET_MANUALES_CATEGORIAS_QUERY = `
  query ManualesCategorias {
    manualesCategorias {
      codigo
      etiqueta
      total
    }
  }
`;
